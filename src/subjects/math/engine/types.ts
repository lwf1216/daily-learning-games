export type QuestionType =
  | "calc"
  | "multi_blank"
  | "compare"
  | "choice"
  | "true_false"
  | "match"
  | "order"
  | "chain"
  | "pattern"
  | "word"
  | "expression"
  | "table";

export type ModeId =
  | "sprint"
  | "balloon"
  | "race"
  | "memory"
  | "train"
  | "treasure"
  | "boss"
  | "story"
  | "classic"
  | "review";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  answer?: unknown;
  accept?: unknown[];
  hint?: string;
  visual?: string;
  options?: Array<string | { label: string; value: string | number }>;
  blanks?: number;
  labels?: string[];
  start?: number;
  ops?: string[];
  left?: Array<{ id: string; text: string }>;
  right?: Array<{ id: string; text: string }>;
  items?: Array<{ id: string; text: string }>;
  headers?: string[];
  rows?: unknown[][];
  showAnswer?: string;
}

export interface Section {
  id: string;
  name: string;
  icon?: string;
  questions: Question[];
}

export interface DayPack {
  day: number;
  title: string;
  sections: Section[];
}

export interface PlaylistItem {
  id: string;
  mode: ModeId;
  title: string;
  emoji: string;
  blurb: string;
  questions: Question[];
  /** sprint seconds, race target, etc */
  meta?: Record<string, number | string>;
}

export interface ModeResult {
  mode: ModeId;
  correct: number;
  total: number;
  comboMax: number;
  coins: number;
  stars: number; // 0-3
  durationMs: number;
}

export interface DayProgress {
  stars: number;
  bestStars: number;
  modesDone: string[];
  /** Entered but not finished */
  modesStarted?: string[];
  coinsEarned: number;
}

export interface ProgressState {
  coins: number;
  freeMode: boolean;
  sound: boolean;
  focusMode: boolean;
  days: Record<number, DayProgress>;
  mistakes: Array<{
    day: number;
    questionId: string;
    prompt: string;
    answer: string;
    type?: string;
    raw?: Question;
    /** consecutive correct answers while reviewing; remove at 2 */
    correctStreak?: number;
  }>;
  outfit: string;
  lastPlayedDay?: number;
}

export interface AppConfig {
  sprintSeconds: number;
  sprintTarget: number;
  raceSteps: number;
  balloonRounds: number;
  classicBatch: number;
  memoryPairs: number;
  treasureTiles: number;
  bossHp: number;
  modeEnabled: Record<ModeId, boolean>;
  dailyGoalMinutes: number;
}
