import { DEFAULT_CONFIG, MODE_META } from "../data/config";
import type { AppConfig, DayPack, ModeId, PlaylistItem, ProgressState, Question } from "./types";
import { isChoiceFriendly, isFastFriendly } from "./check";

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function allQuestions(day: DayPack): Question[] {
  return day.sections.flatMap((s) => s.questions.map((q) => ({ ...q, section: q.section || s.id })));
}

function pick(qs: Question[], n: number, rand: () => number, pred?: (q: Question) => boolean): Question[] {
  const pool = shuffle(pred ? qs.filter(pred) : qs, rand);
  if (pool.length >= n) return pool.slice(0, n);
  const extra = shuffle(qs, rand);
  return [...pool, ...extra].slice(0, Math.max(n, 1));
}

function item(
  day: number,
  mode: ModeId,
  questions: Question[],
  meta?: Record<string, number | string>
): PlaylistItem {
  const m = MODE_META[mode];
  return {
    id: `d${day}-${mode}-${meta?.suffix ?? "main"}`,
    mode,
    title: m.title,
    emoji: m.emoji,
    blurb: m.blurb,
    questions,
    meta,
  };
}

/** 古诗 / 日积月累 / 重点课文空 */
function isMustRecite(q: Question): boolean {
  if (q.type === "poem_fill") return true;
  const sec = (q.section || "").toLowerCase();
  if (["poem", "idiom", "text", "text2"].includes(sec)) return true;
  if (/古诗|日积月累|默写|春晓|静夜思|汪伦|画鸡/.test(q.prompt)) return true;
  return false;
}

function isWordCore(q: Question): boolean {
  return q.type === "make_word" || q.type === "char_fill" || q.type === "pinyin_pick" || q.type === "tone_pick";
}

/**
 * 智慧答题卡保底：
 * - 至少 1 道古诗/积累/课文重点
 * - 至少 2 道组词/选字/拼音类
 * - 其余随机补足，去重
 */
function pickClassicGuaranteed(qs: Question[], n: number, rand: () => number): Question[] {
  const need = Math.max(n, 6);
  const seen = new Set<string>();
  const out: Question[] = [];

  const take = (pool: Question[], count: number) => {
    for (const q of shuffle(pool, rand)) {
      if (out.length >= need) break;
      if (count <= 0) break;
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      out.push(q);
      count -= 1;
    }
  };

  const recite = qs.filter(isMustRecite);
  const words = qs.filter(isWordCore);
  const rest = qs;

  take(recite, Math.min(1, recite.length || 0));
  // 若没有古诗积累，用课文/多空顶上
  if (!out.some(isMustRecite)) {
    take(
      qs.filter((q) => q.type === "multi_fill" || q.type === "sentence"),
      1
    );
  }
  take(words, 2);
  take(rest, need - out.length);

  return out.slice(0, need);
}

function buildModeItem(day: DayPack, mode: ModeId, config: AppConfig, rand: () => number): PlaylistItem | null {
  const qs = allQuestions(day);
  const fast = qs.filter(isFastFriendly);
  const choice = qs.filter(isChoiceFriendly);
  const multi = qs.filter((q) => q.type === "multi_fill" || q.type === "poem_fill" || q.type === "make_word");
  const pinyin = qs.filter((q) => q.type === "pinyin_pick");

  switch (mode) {
    case "leaf":
      return item(day.day, "leaf", pick(fast.length ? fast : choice, config.leafTarget + 4, rand, isFastFriendly), {
        seconds: config.leafSeconds,
        target: config.leafTarget,
        readBufferMs: 150,
      });
    case "balloon":
    case "treasure":
    case "race":
    case "story":
    case "review":
      return null;
    case "memory":
      return item(day.day, "memory", pick(pinyin.length ? pinyin : choice, config.memoryPairs, rand));
    case "train":
      return item(day.day, "train", pick(multi.length ? multi : qs, Math.min(4, qs.length), rand));
    case "boss":
      return item(
        day.day,
        "boss",
        pick(choice.length ? choice : qs, Math.max(config.bossHp + 3, 8), rand, isChoiceFriendly),
        { hp: config.bossHp }
      );
    case "classic":
      return item(day.day, "classic", pickClassicGuaranteed(qs, Math.max(config.classicBatch, 8), rand));
    default:
      return null;
  }
}

const DAY_MODE_ORDER: ModeId[] = ["leaf", "memory", "train", "classic", "boss"];

export function buildPlaylist(
  day: DayPack,
  config: AppConfig = DEFAULT_CONFIG,
  _progress?: ProgressState,
  _allDays?: DayPack[]
): PlaylistItem[] {
  const rand = mulberry32(day.day * 9973 + 42);
  const list: PlaylistItem[] = [];

  for (const mode of DAY_MODE_ORDER) {
    if (config.modeEnabled[mode] === false) continue;
    if (mode === "boss" && day.day % 3 !== 0) continue;
    // 奇数日翻牌（拼音），偶数日火车（多空/组词）
    if (mode === "memory" && day.day % 2 === 0) continue;
    if (mode === "train" && day.day % 2 === 1) continue;
    const it = buildModeItem(day, mode, config, rand);
    if (it && it.questions.length) list.push(it);
  }

  if (list.length < 3) {
    for (const mode of ["classic", "leaf", "memory", "train"] as ModeId[]) {
      if (list.some((x) => x.mode === mode)) continue;
      const it = buildModeItem(day, mode, config, rand);
      if (it) list.push(it);
      if (list.length >= 3) break;
    }
  }

  return list;
}

export function buildReviewFromMistakes(
  mistakes: Array<{ raw?: Question; day: number; questionId: string; prompt: string; answer: string; type?: string }>
): PlaylistItem | null {
  const raws = mistakes
    .map((m) => {
      if (m.raw) return m.raw;
      // 旧备份无 raw：降级为「看提示选参考答案」选择题，仍可练
      if (!m.prompt) return null;
      const ans = String(m.answer ?? "");
      return {
        id: m.questionId || `salvage-${m.day}`,
        type: "choice" as const,
        prompt: m.prompt + (ans ? `（提示：想想参考答案）` : ""),
        answer: ans,
        showAnswer: ans,
        options: ans ? [ans, "再读一读", "问问大人", "跳过"] : ["再读一读", "问问大人"],
        section: "review",
      } satisfies Question;
    })
    .filter((q): q is Question => Boolean(q))
    .slice(0, 12);
  if (!raws.length) return null;
  return {
    id: `review-book-${Date.now()}`,
    mode: "review",
    title: MODE_META.review.title,
    emoji: MODE_META.review.emoji,
    blurb: "从错题本里挑出来练一练",
    questions: raws,
  };
}
