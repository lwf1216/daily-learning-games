import type { DayProgress, ProgressState, Question } from "./types";

const KEY = "chinese-bookworm-v1-progress";

const defaultState = (): ProgressState => ({
  coins: 0,
  freeMode: true,
  sound: true,
  focusMode: false,
  days: {},
  mistakes: [],
  outfit: "default",
});

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = defaultState();
      saveProgress(s);
      return s;
    }
    const stored = JSON.parse(raw) as Partial<ProgressState>;
    return { ...defaultState(), ...stored } as ProgressState;
  } catch {
    return defaultState();
  }
}

export function saveProgress(state: ProgressState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getDayProgress(state: ProgressState, day: number): DayProgress {
  const d = state.days[day];
  if (!d) return { stars: 0, bestStars: 0, modesDone: [], modesStarted: [], coinsEarned: 0 };
  return {
    stars: d.stars || 0,
    bestStars: d.bestStars || 0,
    modesDone: d.modesDone || [],
    modesStarted: d.modesStarted || [],
    coinsEarned: d.coinsEarned || 0,
  };
}

export type ModeStatus = "not_started" | "incomplete" | "done";

export function getModeStatus(state: ProgressState, day: number, modeId: string): ModeStatus {
  const d = getDayProgress(state, day);
  if (d.modesDone.includes(modeId)) return "done";
  if ((d.modesStarted || []).includes(modeId)) return "incomplete";
  return "not_started";
}

export function getDayStatus(state: ProgressState, day: number, totalModes?: number): ModeStatus {
  const d = getDayProgress(state, day);
  const done = d.modesDone.length;
  const started = (d.modesStarted || []).length;
  if (totalModes != null && totalModes > 0) {
    if (done >= totalModes) return "done";
    if (done > 0 || started > 0) return "incomplete";
    return "not_started";
  }
  if (done === 0 && started === 0) return "not_started";
  if (done >= started && done >= 3) return "done";
  return "incomplete";
}

export function markModeStarted(day: number, modeId: string): ProgressState {
  const state = loadProgress();
  const d = getDayProgress(state, day);
  if (!d.modesStarted) d.modesStarted = [];
  if (!d.modesStarted.includes(modeId) && !d.modesDone.includes(modeId)) {
    d.modesStarted.push(modeId);
  }
  state.days[day] = d;
  state.lastPlayedDay = day;
  saveProgress(state);
  return state;
}

export function markModeDone(day: number, modeId: string, stars: number, coins: number): ProgressState {
  const state = loadProgress();
  const d = getDayProgress(state, day);
  if (!d.modesDone.includes(modeId)) d.modesDone.push(modeId);
  if (!d.modesStarted) d.modesStarted = [];
  if (!d.modesStarted.includes(modeId)) d.modesStarted.push(modeId);
  d.stars = Math.min(5, d.modesDone.length);
  d.bestStars = Math.max(d.bestStars || 0, d.stars, stars);
  d.coinsEarned = (d.coinsEarned || 0) + coins;
  state.days[day] = d;
  state.coins = (state.coins || 0) + coins;
  state.lastPlayedDay = day;
  saveProgress(state);
  return state;
}

export function addMistake(item: {
  day: number;
  questionId: string;
  prompt: string;
  answer: string;
  raw?: Question;
  type?: string;
}) {
  const state = loadProgress();
  if (!state.mistakes.some((m) => m.questionId === item.questionId && m.day === item.day)) {
    state.mistakes.unshift({
      day: item.day,
      questionId: item.questionId,
      prompt: item.prompt,
      answer: item.answer,
      raw: item.raw,
      type: item.type,
    });
    state.mistakes = state.mistakes.slice(0, 80);
    saveProgress(state);
  }
}

export function clearMistakes() {
  const state = loadProgress();
  state.mistakes = [];
  saveProgress(state);
  return state;
}

export function removeMistake(questionId: string, day: number) {
  const state = loadProgress();
  state.mistakes = state.mistakes.filter((m) => !(m.questionId === questionId && m.day === day));
  saveProgress(state);
  return state;
}

export function setPrefs(partial: Partial<ProgressState>) {
  const state = { ...loadProgress(), ...partial };
  saveProgress(state);
  return state;
}

export function resetProgress() {
  const s = defaultState();
  saveProgress(s);
  return s;
}

export function completedDaysCount(state: ProgressState): number {
  return Object.values(state.days).filter(
    (d) => (d.bestStars || 0) >= 2 || (d.modesDone?.length || 0) >= 3
  ).length;
}

export function statsSummary(state: ProgressState) {
  const days = Object.entries(state.days);
  let modes = 0;
  days.forEach(([, d]) => {
    modes += d.modesDone?.length || 0;
  });
  return {
    completedDays: completedDaysCount(state),
    modesPlayed: modes,
    coins: state.coins,
    mistakes: state.mistakes.length,
    lastPlayedDay: state.lastPlayedDay ?? null,
  };
}

export function exportBackup() {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: loadProgress(),
      config: localStorage.getItem("chinese-bookworm-v1-config"),
    },
    null,
    2
  );
}

export function importBackup(json: string): ProgressState {
  const data = JSON.parse(json) as {
    progress?: ProgressState;
    config?: string | null;
  };
  if (data.progress) {
    saveProgress({ ...defaultState(), ...data.progress });
  }
  if (data.config) {
    localStorage.setItem("chinese-bookworm-v1-config", data.config);
  }
  return loadProgress();
}
