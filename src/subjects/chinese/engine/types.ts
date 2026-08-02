export type QuestionType =
  | "pinyin_pick" // 看拼音选词语
  | "tone_pick" // 加点字选读音
  | "char_fill" // 选字填空（单空）
  | "multi_fill" // 多空选词
  | "make_word" // 生字组词
  | "match" // 连一连 / 配对
  | "sort_group" // 按偏旁/类别分组
  | "char_math" // 加一加/减一减变新字
  | "choice" // 通用选择
  | "order" // 排序
  | "sentence" // 仿写/补句（选完整答案）
  | "poem_fill"; // 古诗/日积月累填空

export type ModeId =
  | "leaf" // 吃树叶限时
  | "balloon" // 戳叶子气球
  | "race" // 书虫竞速
  | "memory" // 拼音翻牌
  | "train" // 词语小火车
  | "treasure" // 森林寻宝
  | "boss" // 大树怪 Boss
  | "story" // 课文故事园
  | "classic" // 智慧答题卡
  | "review"; // 错题复习

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  /** 正确答案：string | number | string[] | [string,string][] 等 */
  answer?: unknown;
  /** 额外可接受答案 */
  accept?: unknown[];
  hint?: string;
  visual?: string;
  /** 点选选项 */
  options?: Array<string | { label: string; value: string | number }>;
  blanks?: number;
  /** multi_fill / make_word 词库 */
  bank?: string[];
  labels?: string[];
  left?: Array<{ id: string; text: string }>;
  right?: Array<{ id: string; text: string }>;
  /** sort_group: 组别名 -> 应归属项 */
  groups?: Array<{ id: string; name: string; items: string[] }>;
  items?: Array<{ id: string; text: string }>;
  showAnswer?: string;
  section?: string;
  /** multi_fill 是否允许同一词语填多个空（如诗中两个「明」） */
  allowReuse?: boolean;
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
  meta?: Record<string, number | string>;
}

export interface ModeResult {
  mode: ModeId;
  correct: number;
  total: number;
  comboMax: number;
  coins: number;
  stars: number;
  durationMs: number;
}

export interface DayProgress {
  stars: number;
  bestStars: number;
  modesDone: string[];
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
    raw?: Question;
    type?: string;
  }>;
  outfit?: string;
  lastPlayedDay?: number;
}

export interface AppConfig {
  leafSeconds: number;
  leafTarget: number;
  raceSteps: number;
  balloonRounds: number;
  classicBatch: number;
  memoryPairs: number;
  treasureTiles: number;
  bossHp: number;
  dailyGoalMinutes: number;
  modeEnabled: Record<ModeId, boolean>;
}
