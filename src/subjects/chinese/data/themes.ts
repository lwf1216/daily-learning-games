export interface GroveTheme {
  id: string;
  name: string;
  emoji: string;
  days: [number, number];
  bg: string;
  card: string;
  accent: string;
  accent2: string;
  mascot: string;
  tagline: string;
}

export const THEMES: GroveTheme[] = [
  {
    id: "spring",
    name: "春芽谷",
    emoji: "🌱",
    days: [1, 5],
    bg: "linear-gradient(160deg,#f0fff4 0%,#c6f6d5 45%,#9ae6b4 100%)",
    card: "#ffffff",
    accent: "#38a169",
    accent2: "#dd6b20",
    mascot: "🐛",
    tagline: "小书虫醒来，啃第一片新叶",
  },
  {
    id: "stream",
    name: "溪语林",
    emoji: "🏞️",
    days: [6, 10],
    bg: "linear-gradient(160deg,#ebf8ff 0%,#bee3f8 40%,#90cdf4 100%)",
    card: "#f7fcff",
    accent: "#3182ce",
    accent2: "#38a169",
    mascot: "🐸",
    tagline: "跟着流水声拼拼音、读词语",
  },
  {
    id: "poem",
    name: "古诗亭",
    emoji: "🏯",
    days: [11, 15],
    bg: "linear-gradient(160deg,#fffaf0 0%,#feebc8 40%,#f6ad55 100%)",
    card: "#fffaf0",
    accent: "#c05621",
    accent2: "#805ad5",
    mascot: "📜",
    tagline: "亭子里藏着会开花的诗句",
  },
  {
    id: "starlit",
    name: "星语林",
    emoji: "✨",
    days: [16, 21],
    // 浅色系：淡薰衣草 + 浅薄荷，保证题目文字清晰
    bg: "linear-gradient(160deg,#faf5ff 0%,#f3e8ff 45%,#ecfdf5 100%)",
    card: "#ffffff",
    accent: "#7c3aed",
    accent2: "#059669",
    mascot: "🦉",
    tagline: "在浅紫星光里认字、组词",
  },
];

export function themeForDay(day: number): GroveTheme {
  return THEMES.find((t) => day >= t.days[0] && day <= t.days[1]) || THEMES[0];
}
