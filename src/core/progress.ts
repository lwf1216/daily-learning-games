import type {
  HubProgress,
  ProgramDayProgress,
  SubjectCompletion,
  SubjectId,
} from "./types";

export const HUB_PROGRESS_KEY = "class1-daily-hub-v1-progress";
export const PROGRAM_DAYS = 30;
export const SUBJECTS: SubjectId[] = ["math", "chinese", "english"];

const defaultProgress = (): HubProgress => ({
  version: 1,
  currentDay: 1,
  coins: 0,
  streak: 0,
  bestStreak: 0,
  days: {},
  preferences: {
    sound: true,
    focusMode: false,
  },
});

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeProgress(raw: Partial<HubProgress>): HubProgress {
  const base = defaultProgress();
  return {
    ...base,
    ...raw,
    version: 1,
    currentDay: Math.min(PROGRAM_DAYS, Math.max(1, Number(raw.currentDay) || 1)),
    days: raw.days || {},
    preferences: {
      ...base.preferences,
      ...(raw.preferences || {}),
    },
  };
}

export function loadHubProgress(): HubProgress {
  try {
    const raw = localStorage.getItem(HUB_PROGRESS_KEY);
    return raw ? normalizeProgress(JSON.parse(raw) as Partial<HubProgress>) : defaultProgress();
  } catch {
    return defaultProgress();
  }
}

export function saveHubProgress(progress: HubProgress): HubProgress {
  localStorage.setItem(HUB_PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent("hub-progress-changed"));
  return progress;
}

export function dayProgress(progress: HubProgress, programDay: number): ProgramDayProgress {
  return progress.days[programDay] || { subjects: {} };
}

export function isSubjectComplete(
  progress: HubProgress,
  programDay: number,
  subject: SubjectId
): boolean {
  return Boolean(dayProgress(progress, programDay).subjects[subject]?.completedAt);
}

export function isDayComplete(progress: HubProgress, programDay: number): boolean {
  return SUBJECTS.every((subject) => isSubjectComplete(progress, programDay, subject));
}

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dayDistance(a: string, b: string): number {
  const ms = parseDateKey(a).getTime() - parseDateKey(b).getTime();
  return Math.round(ms / 86_400_000);
}

function calculateCalendarStreak(days: Record<number, ProgramDayProgress>): number {
  const completedDates = Array.from(
    new Set(
      Object.values(days)
        .filter((day) => day.completedAt && day.dateKey)
        .map((day) => day.dateKey as string)
    )
  ).sort();

  if (!completedDates.length) return 0;

  let streak = 1;
  for (let i = completedDates.length - 1; i > 0; i -= 1) {
    if (dayDistance(completedDates[i], completedDates[i - 1]) === 1) streak += 1;
    else break;
  }
  return streak;
}

export function markSubjectComplete(
  subject: SubjectId,
  programDay: number,
  sourceDay: number,
  score?: number
): HubProgress {
  const progress = loadHubProgress();
  const day = dayProgress(progress, programDay);
  const wasComplete = Boolean(day.subjects[subject]?.completedAt);
  const completion: SubjectCompletion = {
    completedAt: new Date().toISOString(),
    sourceDay,
    score,
  };

  day.subjects = {
    ...day.subjects,
    [subject]: completion,
  };

  const allDone = SUBJECTS.every((id) => Boolean(day.subjects[id]?.completedAt));
  if (allDone && !day.completedAt) {
    day.completedAt = new Date().toISOString();
    day.dateKey = localDateKey();
    progress.coins += 30;
    if (programDay === progress.currentDay && programDay < PROGRAM_DAYS) {
      progress.currentDay = programDay + 1;
    }
  } else if (!wasComplete) {
    progress.coins += 5;
  }

  progress.days[programDay] = day;
  progress.streak = calculateCalendarStreak(progress.days);
  progress.bestStreak = Math.max(progress.bestStreak, progress.streak);
  return saveHubProgress(progress);
}

export function setCurrentDay(programDay: number): HubProgress {
  const progress = loadHubProgress();
  progress.currentDay = Math.min(PROGRAM_DAYS, Math.max(1, programDay));
  return saveHubProgress(progress);
}

export function setHubPreferences(
  partial: Partial<HubProgress["preferences"]>
): HubProgress {
  const progress = loadHubProgress();
  progress.preferences = { ...progress.preferences, ...partial };
  return saveHubProgress(progress);
}

export function resetHubProgress(): HubProgress {
  return saveHubProgress(defaultProgress());
}

export function completedDaysCount(progress: HubProgress): number {
  return Object.keys(progress.days).filter((key) => isDayComplete(progress, Number(key))).length;
}

export function subjectCompletedCount(progress: HubProgress, subject: SubjectId): number {
  return Object.values(progress.days).filter((day) => Boolean(day.subjects[subject]?.completedAt))
    .length;
}

export function exportAllProgress(): string {
  return JSON.stringify(
    {
      format: "class1-daily-hub-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      hub: loadHubProgress(),
      subjects: {
        math: {
          progress: localStorage.getItem("math-island-v2-progress"),
          config: localStorage.getItem("math-island-v2-config"),
        },
        chinese: {
          progress: localStorage.getItem("chinese-bookworm-v1-progress"),
          config: localStorage.getItem("chinese-bookworm-v1-config"),
        },
        english: {
          progress: localStorage.getItem("wordCarnivalProgress"),
        },
      },
    },
    null,
    2
  );
}

export function importAllProgress(json: string): HubProgress {
  const data = JSON.parse(json) as {
    format?: string;
    hub?: Partial<HubProgress>;
    subjects?: Record<string, { progress?: string | null; config?: string | null }>;
  };
  if (data.format !== "class1-daily-hub-backup" || !data.hub) {
    throw new Error("这不是语数英每日打卡的完整备份。");
  }

  const hub = normalizeProgress(data.hub);
  const math = data.subjects?.math;
  const chinese = data.subjects?.chinese;
  const english = data.subjects?.english;
  if (math?.progress) localStorage.setItem("math-island-v2-progress", math.progress);
  if (math?.config) localStorage.setItem("math-island-v2-config", math.config);
  if (chinese?.progress) localStorage.setItem("chinese-bookworm-v1-progress", chinese.progress);
  if (chinese?.config) localStorage.setItem("chinese-bookworm-v1-config", chinese.config);
  if (english?.progress) localStorage.setItem("wordCarnivalProgress", english.progress);
  return saveHubProgress(hub);
}

export function importLegacySubject(subject: SubjectId, json: string): void {
  const data = JSON.parse(json) as {
    progress?: unknown;
    config?: unknown;
    stars?: number;
    learned?: Record<string, number>;
  };

  if (subject === "math") {
    if (!data.progress) throw new Error("数学备份缺少 progress。");
    localStorage.setItem("math-island-v2-progress", JSON.stringify(data.progress));
    if (data.config) localStorage.setItem("math-island-v2-config", JSON.stringify(data.config));
  } else if (subject === "chinese") {
    if (!data.progress) throw new Error("语文备份缺少 progress。");
    localStorage.setItem("chinese-bookworm-v1-progress", JSON.stringify(data.progress));
    if (typeof data.config === "string") {
      localStorage.setItem("chinese-bookworm-v1-config", data.config);
    } else if (data.config) {
      localStorage.setItem("chinese-bookworm-v1-config", JSON.stringify(data.config));
    }
  } else {
    const englishProgress = data.progress || data;
    localStorage.setItem("wordCarnivalProgress", JSON.stringify(englishProgress));
  }
  window.dispatchEvent(new CustomEvent("hub-progress-changed"));
}
