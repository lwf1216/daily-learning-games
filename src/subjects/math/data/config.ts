import type { AppConfig, ModeId } from "../engine/types";

export const DEFAULT_CONFIG: AppConfig = {
  sprintSeconds: 60,
  sprintTarget: 10,
  raceSteps: 8,
  balloonRounds: 8,
  classicBatch: 6,
  memoryPairs: 6,
  treasureTiles: 6,
  bossHp: 5,
  dailyGoalMinutes: 15,
  modeEnabled: {
    sprint: true,
    balloon: true,
    race: true,
    memory: true,
    train: true,
    treasure: true,
    boss: true,
    story: true,
    classic: true,
    review: true,
  },
};

export const MODE_META: Record<
  ModeId,
  { title: string; emoji: string; blurb: string; color: string }
> = {
  sprint: {
    title: "闪电口算",
    emoji: "⚡",
    blurb: "限时连击，越快越强！",
    color: "#ffc53d",
  },
  balloon: {
    title: "戳气球",
    emoji: "🎈",
    blurb: "点破正确答案的气球",
    color: "#ff6b9d",
  },
  race: {
    title: "小车竞速",
    emoji: "🏎️",
    blurb: "答对就超车 AI 小车",
    color: "#4fc3f7",
  },
  memory: {
    title: "记忆翻牌",
    emoji: "🃏",
    blurb: "算式和得数配对",
    color: "#a78bfa",
  },
  train: {
    title: "开火车",
    emoji: "🚂",
    blurb: "一节节填对车厢前进",
    color: "#3ecf8e",
  },
  treasure: {
    title: "寻宝地图",
    emoji: "🗺️",
    blurb: "踩格子开宝箱",
    color: "#ff8a5c",
  },
  boss: {
    title: "关底 Boss",
    emoji: "👾",
    blurb: "三颗心挑战大魔王",
    color: "#ff6b6b",
  },
  story: {
    title: "故事冒险",
    emoji: "📖",
    blurb: "听故事、解难题",
    color: "#7bdff2",
  },
  classic: {
    title: "智慧答题卡",
    emoji: "✏️",
    blurb: "沉稳作答拿满星",
    color: "#94a3b8",
  },
  review: {
    title: "错题小怪物",
    emoji: "🐛",
    blurb: "复习错题，巩固记忆",
    color: "#f6ad55",
  },
};

const CONFIG_KEY = "math-island-v2-config";

export function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG, modeEnabled: { ...DEFAULT_CONFIG.modeEnabled } };
    const parsed = JSON.parse(raw) as Partial<AppConfig> & { parentPin?: unknown };
    delete parsed.parentPin;
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      modeEnabled: { ...DEFAULT_CONFIG.modeEnabled, ...(parsed.modeEnabled || {}) },
    };
  } catch {
    return { ...DEFAULT_CONFIG, modeEnabled: { ...DEFAULT_CONFIG.modeEnabled } };
  }
}

export function saveConfig(cfg: AppConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}
