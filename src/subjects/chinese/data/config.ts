import type { AppConfig, ModeId } from "../engine/types";

export const DEFAULT_CONFIG: AppConfig = {
  leafSeconds: 75,
  leafTarget: 8,
  raceSteps: 8,
  balloonRounds: 8,
  classicBatch: 8,
  memoryPairs: 6,
  treasureTiles: 6,
  bossHp: 5,
  dailyGoalMinutes: 15,
  modeEnabled: {
    leaf: true,
    balloon: false, // 已下线
    race: false,
    memory: true,
    train: true,
    treasure: false, // 已下线
    boss: true,
    story: false,
    classic: true,
    review: false, // 不进每日列表，只在错题本启动
  },
};

export const MODE_META: Record<ModeId, { title: string; emoji: string; blurb: string; color: string }> = {
  leaf: {
    title: "吃树叶冲刺",
    emoji: "🍃",
    blurb: "限时点选 + 赛道竞速，树叶时间条在变短！",
    color: "#68d391",
  },
  balloon: {
    title: "戳叶子气球（已下线）",
    emoji: "🎈",
    blurb: "已从每日关卡移除",
    color: "#fc8181",
  },
  race: {
    title: "书虫竞速（已合并）",
    emoji: "🐛",
    blurb: "已并入「吃树叶冲刺」",
    color: "#63b3ed",
  },
  memory: {
    title: "拼音翻牌",
    emoji: "🃏",
    blurb: "拼音 ↔ 字/词 配对",
    color: "#b794f4",
  },
  train: {
    title: "词语小火车",
    emoji: "🚂",
    blurb: "一节节填对车厢前进",
    color: "#48bb78",
  },
  treasure: {
    title: "森林寻宝（已下线）",
    emoji: "🗺️",
    blurb: "已从每日关卡移除",
    color: "#ed8936",
  },
  boss: {
    title: "大树怪 Boss",
    emoji: "🌳",
    blurb: "三颗心挑战大树怪",
    color: "#e53e3e",
  },
  story: {
    title: "课文故事园（已合并）",
    emoji: "📖",
    blurb: "已并入「智慧答题卡」",
    color: "#38b2ac",
  },
  classic: {
    title: "智慧答题卡",
    emoji: "✏️",
    blurb: "组词、填空、课文、古诗一网打尽",
    color: "#718096",
  },
  review: {
    title: "错题小毛虫",
    emoji: "🐛",
    blurb: "在错题本里积累，想练再开",
    color: "#dd6b20",
  },
};

const CONFIG_KEY = "chinese-bookworm-v1-config";

export function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG, modeEnabled: { ...DEFAULT_CONFIG.modeEnabled } };
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      modeEnabled: {
        ...DEFAULT_CONFIG.modeEnabled,
        ...(parsed.modeEnabled || {}),
        // 强制下线玩法，避免旧本地配置又打开
        balloon: false,
        treasure: false,
        race: false,
        story: false,
        review: false,
      },
    };
  } catch {
    return { ...DEFAULT_CONFIG, modeEnabled: { ...DEFAULT_CONFIG.modeEnabled } };
  }
}

export function saveConfig(cfg: AppConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}
