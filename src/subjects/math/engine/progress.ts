import type { DayProgress, ProgressState, Question } from "./types";

const KEY = "math-island-v2-progress";

const defaultState = (): ProgressState => ({
  coins: 0,
  freeMode: false,
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
    const stored = JSON.parse(raw) as Partial<ProgressState> & {
      parentPin?: unknown;
      deviceId?: unknown;
      lastSyncAt?: unknown;
    };
    delete stored.parentPin;
    delete stored.deviceId;
    delete stored.lastSyncAt;
    const parsed = { ...defaultState(), ...stored } as ProgressState;
    return parsed;
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

/** Free pick any day (unlock gate kept only for optional "adventure" scoring). */
export function isDayUnlocked(_state: ProgressState, _day: number): boolean {
  return true;
}

export type ModeStatus = "not_started" | "incomplete" | "done";

export function getModeStatus(state: ProgressState, day: number, modeId: string): ModeStatus {
  const d = getDayProgress(state, day);
  if (d.modesDone.includes(modeId)) return "done";
  if ((d.modesStarted || []).includes(modeId)) return "incomplete";
  return "not_started";
}

export function getDayStatus(
  state: ProgressState,
  day: number,
  totalModes?: number
): ModeStatus {
  const d = getDayProgress(state, day);
  const done = d.modesDone.length;
  const started = (d.modesStarted || []).length;
  // Prefer exact playlist length when provided
  if (totalModes != null && totalModes > 0) {
    if (done >= totalModes) return "done";
    if (done > 0 || started > 0) return "incomplete";
    return "not_started";
  }
  // Fallback without totalModes: finished if something was completed and
  // nothing remains only-started (all started are done), and at least 3 modes done
  // (typical day has 4–5 modes; avoids "done" after a single practice-like mark)
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

export function markModeDone(
  day: number,
  modeId: string,
  stars: number,
  coins: number
): ProgressState {
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

/** 同一错题需连续做对这么多次才移出（中间再错则 streak 归零） */
export const CORRECT_STREAK_TO_CLEAR = 2;

export function addMistake(item: {
  day: number;
  questionId: string;
  prompt: string;
  answer: string;
  raw?: Question;
  type?: string;
}) {
  const state = loadProgress();
  // match by questionId first (review may run under a different day number)
  const existing =
    state.mistakes.find((m) => m.questionId === item.questionId && m.day === item.day) ||
    state.mistakes.find((m) => m.questionId === item.questionId);
  if (existing) {
    // wrong again → reset streak
    existing.correctStreak = 0;
    existing.prompt = item.prompt;
    existing.answer = item.answer;
    if (item.raw) existing.raw = item.raw;
    if (item.type) existing.type = item.type;
    existing.day = item.day;
    saveProgress(state);
    return;
  }
  state.mistakes.unshift({
    day: item.day,
    questionId: item.questionId,
    prompt: item.prompt,
    answer: item.answer,
    raw: item.raw,
    type: item.type,
    correctStreak: 0,
  });
  state.mistakes = state.mistakes.slice(0, 80);
  saveProgress(state);
}

/**
 * 做对时调用：若在错题本中，累计连续做对次数；
 * 达到 CORRECT_STREAK_TO_CLEAR 后移出。
 * day 可选：优先精确匹配，否则按 questionId 匹配（复习关）。
 */
export function recordCorrectAnswer(questionId: string, day?: number): ProgressState {
  const state = loadProgress();
  let idx =
    day != null
      ? state.mistakes.findIndex((m) => m.questionId === questionId && m.day === day)
      : -1;
  if (idx < 0) {
    idx = state.mistakes.findIndex((m) => m.questionId === questionId);
  }
  if (idx < 0) return state;
  const m = state.mistakes[idx];
  const streak = (m.correctStreak || 0) + 1;
  if (streak >= CORRECT_STREAK_TO_CLEAR) {
    state.mistakes.splice(idx, 1);
  } else {
    m.correctStreak = streak;
  }
  saveProgress(state);
  return state;
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

export function mistakeClearRule(): string {
  return `同一错题需连续做对 ${CORRECT_STREAK_TO_CLEAR} 次才会移出；中途再错会重新计数`;
}

/** 0..CORRECT_STREAK_TO_CLEAR 的进度文案 */
export function mistakeStreakLabel(streak = 0): string {
  const s = Math.max(0, streak || 0);
  if (s <= 0) return `还需连续做对 ${CORRECT_STREAK_TO_CLEAR} 次`;
  if (s >= CORRECT_STREAK_TO_CLEAR) return "即将移出";
  return `已连对 ${s}/${CORRECT_STREAK_TO_CLEAR}，再对 ${CORRECT_STREAK_TO_CLEAR - s} 次移出`;
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
  let coins = state.coins;
  days.forEach(([, d]) => {
    modes += d.modesDone?.length || 0;
  });
  return {
    completedDays: completedDaysCount(state),
    modesPlayed: modes,
    coins,
    mistakes: state.mistakes.length,
    lastPlayedDay: state.lastPlayedDay ?? null,
  };
}
