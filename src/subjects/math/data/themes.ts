export interface IslandTheme {
  id: string;
  name: string;
  emoji: string;
  days: [number, number]; // inclusive range
  bg: string;
  card: string;
  accent: string;
  accent2: string;
  mascot: string;
  tagline: string;
}

export const THEMES: IslandTheme[] = [
  {
    id: "beach",
    name: "阳光沙滩岛",
    emoji: "🏖️",
    days: [1, 5],
    bg: "linear-gradient(160deg,#fff7d6 0%,#c8f0ff 45%,#7fd3ff 100%)",
    card: "#ffffff",
    accent: "#2bb0ed",
    accent2: "#ff8a5c",
    mascot: "🐢",
    tagline: "在海浪声里练口算",
  },
  {
    id: "dino",
    name: "恐龙森林岛",
    emoji: "🦕",
    days: [6, 10],
    bg: "linear-gradient(160deg,#e8ffe8 0%,#c6f6d5 40%,#68d391 100%)",
    card: "#f0fff4",
    accent: "#38a169",
    accent2: "#dd6b20",
    mascot: "🦖",
    tagline: "和恐龙赛跑算得更快",
  },
  {
    id: "space",
    name: "星际太空站",
    emoji: "🚀",
    days: [11, 15],
    bg: "linear-gradient(160deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)",
    card: "#1f2a44",
    accent: "#a78bfa",
    accent2: "#f6ad55",
    mascot: "👽",
    tagline: "在星空里收集能量星",
  },
  {
    id: "candy",
    name: "糖果乐园",
    emoji: "🍬",
    days: [16, 20],
    bg: "linear-gradient(160deg,#ffe4f1 0%,#ffd6e8 40%,#ff9ecd 100%)",
    card: "#fff5fb",
    accent: "#ed64a6",
    accent2: "#9f7aea",
    mascot: "🦄",
    tagline: "答对就掉落彩虹糖",
  },
  {
    id: "pirate",
    name: "海盗宝藏湾",
    emoji: "🏴‍☠️",
    days: [21, 25],
    bg: "linear-gradient(160deg,#fff3cd 0%,#f6d365 40%,#c05621 100%)",
    card: "#fffaf0",
    accent: "#c05621",
    accent2: "#2b6cb0",
    mascot: "🦜",
    tagline: "找到藏在数字里的宝藏",
  },
  {
    id: "snow",
    name: "冰雪节岛",
    emoji: "❄️",
    days: [26, 30],
    bg: "linear-gradient(160deg,#ebf8ff 0%,#bee3f8 45%,#90cdf4 100%)",
    card: "#ffffff",
    accent: "#3182ce",
    accent2: "#ed8936",
    mascot: "🐧",
    tagline: "滑过冰面完成今日挑战",
  },
];

export function themeForDay(day: number): IslandTheme {
  return THEMES.find((t) => day >= t.days[0] && day <= t.days[1]) ?? THEMES[0];
}

export function islandForDay(day: number): number {
  return THEMES.findIndex((t) => day >= t.days[0] && day <= t.days[1]);
}
