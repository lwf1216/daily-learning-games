import { DEFAULT_CONFIG, MODE_META } from "../data/config";
import type { AppConfig, DayPack, ModeId, PlaylistItem, ProgressState, Question } from "./types";
import { isChoiceFriendly, isSprintFriendly } from "./check";

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
  return day.sections.flatMap((s) => s.questions);
}

function isWordish(q: Question): boolean {
  return q.type === "word" || q.type === "expression" || q.type === "multi_blank" || q.type === "table";
}

/** 按天数分层：前中后 + 第 30 天毕业验收 */
export type DayTier = "early" | "mid" | "late" | "graduation";

export function dayTier(day: number): DayTier {
  if (day >= 30) return "graduation";
  if (day >= 21) return "late";
  if (day >= 11) return "mid";
  return "early";
}

/** 后 10 天与第 30 天：题量↑、时限↓、应用题占比↑ */
export function scaleConfigForDay(day: number, config: AppConfig): AppConfig {
  const c = { ...config, modeEnabled: { ...config.modeEnabled } };
  const tier = dayTier(day);
  if (tier === "mid") {
    return {
      ...c,
      sprintTarget: c.sprintTarget + 1,
      raceSteps: c.raceSteps + 1,
      classicBatch: c.classicBatch + 1,
    };
  }
  if (tier === "late") {
    return {
      ...c,
      sprintSeconds: Math.max(40, c.sprintSeconds - 12),
      sprintTarget: c.sprintTarget + 4,
      raceSteps: c.raceSteps + 3,
      balloonRounds: c.balloonRounds + 2,
      classicBatch: c.classicBatch + 3,
      treasureTiles: c.treasureTiles + 2,
      memoryPairs: Math.min(10, c.memoryPairs + 2),
      bossHp: c.bossHp + 2,
    };
  }
  if (tier === "graduation") {
    return {
      ...c,
      sprintSeconds: Math.max(45, c.sprintSeconds - 8),
      sprintTarget: c.sprintTarget + 6,
      raceSteps: c.raceSteps + 4,
      balloonRounds: c.balloonRounds + 3,
      classicBatch: Math.max(10, c.classicBatch + 5),
      treasureTiles: c.treasureTiles + 3,
      memoryPairs: Math.min(12, c.memoryPairs + 3),
      bossHp: c.bossHp + 3,
    };
  }
  return c;
}

/** 应用题/综合题目标占比（按关卡题量） */
function wordishTargetRatio(day: number): number {
  const tier = dayTier(day);
  if (tier === "graduation") return 0.55;
  if (tier === "late") return 0.4;
  if (tier === "mid") return 0.28;
  return 0.18;
}

function pick(
  qs: Question[],
  n: number,
  rand: () => number,
  pred?: (q: Question) => boolean,
  preferWordish = false,
  wordRatio = 0
): Question[] {
  const base = pred ? qs.filter(pred) : qs;
  const pool = base.length ? base : qs;
  if (!pool.length) return [];

  if (!preferWordish || wordRatio <= 0) {
    const shuffled = shuffle(pool, rand);
    if (shuffled.length >= n) return shuffled.slice(0, n);
    return [...shuffled, ...shuffle(qs, rand)].slice(0, Math.max(n, 1));
  }

  const wantWord = Math.max(1, Math.round(n * wordRatio));
  const wordPool = shuffle(
    pool.filter(isWordish),
    rand
  );
  const otherPool = shuffle(
    pool.filter((q) => !isWordish(q)),
    rand
  );
  // 应用题不够时从全日 wordish 补
  const allWord = wordPool.length ? wordPool : shuffle(qs.filter(isWordish), rand);
  const picked: Question[] = [];
  for (const q of allWord) {
    if (picked.length >= wantWord) break;
    picked.push(q);
  }
  for (const q of otherPool) {
    if (picked.length >= n) break;
    if (!picked.some((x) => x.id === q.id)) picked.push(q);
  }
  // 仍不足则从全库补
  if (picked.length < n) {
    for (const q of shuffle(qs, rand)) {
      if (picked.length >= n) break;
      if (!picked.some((x) => x.id === q.id)) picked.push(q);
    }
  }
  return shuffle(picked, rand).slice(0, Math.max(n, 1));
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

function buildModeItem(
  day: DayPack,
  mode: ModeId,
  config: AppConfig,
  rand: () => number,
  wordRatio: number
): PlaylistItem | null {
  const qs = allQuestions(day);
  const oral = day.sections[0]?.questions ?? qs.filter((q) => q.type === "calc");
  const wordish = qs.filter(isWordish);
  const fun = qs.filter(
    (q) =>
      q.type === "compare" ||
      q.type === "chain" ||
      q.type === "pattern" ||
      q.type === "choice" ||
      q.type === "true_false" ||
      q.type === "multi_blank" ||
      q.type === "calc" ||
      q.type === "word" ||
      q.type === "expression"
  );
  const chains = qs.filter((q) => q.type === "chain");
  const calcish = qs.filter((q) => q.type === "calc" || typeof q.answer === "number");
  const boostWord = wordRatio >= 0.28;

  switch (mode) {
    case "sprint":
      return item(
        day.day,
        "sprint",
        pick(oral.length ? oral : qs, config.sprintTarget + 4, rand, isSprintFriendly),
        { seconds: config.sprintSeconds, target: config.sprintTarget }
      );
    case "balloon": {
      const balloonPool = qs.filter(
        (q) =>
          q.type === "calc" ||
          q.type === "compare" ||
          q.type === "true_false" ||
          q.type === "choice" ||
          (isChoiceFriendly(q) && (typeof q.answer === "number" || /\d/.test(String(q.answer ?? ""))))
      );
      return item(
        day.day,
        "balloon",
        pick(balloonPool.length ? balloonPool : qs.filter(isChoiceFriendly), config.balloonRounds, rand),
        { rounds: config.balloonRounds }
      );
    }
    case "race":
      return item(
        day.day,
        "race",
        pick(oral.length ? oral : qs, config.raceSteps, rand, isSprintFriendly),
        { steps: config.raceSteps }
      );
    case "memory":
      return item(day.day, "memory", pick(calcish.length ? calcish : oral, config.memoryPairs, rand));
    case "train":
      return item(day.day, "train", chains.length ? chains : pick(oral, 3, rand));
    case "treasure":
      return item(
        day.day,
        "treasure",
        pick(
          wordish.length ? [...wordish, ...oral] : qs,
          config.treasureTiles,
          rand,
          undefined,
          boostWord,
          Math.max(wordRatio, 0.35)
        )
      );
    case "boss":
      return item(
        day.day,
        "boss",
        pick(qs, Math.max(config.bossHp + 3, 8), rand, isChoiceFriendly, boostWord, wordRatio * 0.5),
        { hp: config.bossHp }
      );
    case "story": {
      const n = boostWord ? Math.min(Math.max(3, Math.ceil(4 * wordRatio * 2)), Math.max(3, wordish.length || 3)) : 3;
      const storyQs = wordish.length
        ? pick(wordish, Math.min(n, wordish.length), rand)
        : pick(qs, 2, rand);
      return item(day.day, "story", storyQs);
    }
    case "classic":
      return item(
        day.day,
        "classic",
        pick(fun.length ? fun : qs, config.classicBatch, rand, undefined, boostWord, wordRatio)
      );
    default:
      return null;
  }
}

/**
 * Build a varied playlist for a day so adjacent days feel different.
 * 后 10 天加难；第 30 天「毕业验收」专项编排。
 */
export function buildPlaylist(
  day: DayPack,
  config: AppConfig = DEFAULT_CONFIG,
  progress?: ProgressState,
  allDays?: DayPack[]
): PlaylistItem[] {
  const rand = mulberry32(day.day * 9973 + 42);
  const qs = allQuestions(day);
  const tier = dayTier(day.day);
  const scaled = scaleConfigForDay(day.day, config);
  const wordRatio = wordishTargetRatio(day.day);

  // 第 30 天：毕业验收固定关卡结构
  if (tier === "graduation") {
    return buildGraduationPlaylist(day, scaled, progress, allDays, rand, wordRatio);
  }

  let rotations: ModeId[][];
  if (tier === "late") {
    // 后 10 天：更多故事/经典/Boss，少纯记忆
    rotations = [
      ["sprint", "story", "treasure", "boss"],
      ["race", "classic", "story", "boss"],
      ["balloon", "treasure", "classic", "boss"],
      ["sprint", "story", "race", "classic"],
      ["train", "treasure", "story", "boss"],
      ["race", "classic", "balloon", "story"],
      ["sprint", "treasure", "classic", "boss"],
      ["story", "race", "classic", "boss"],
    ];
  } else {
    rotations = [
      ["sprint", "balloon", "memory", "boss"],
      ["race", "treasure", "story", "classic"],
      ["balloon", "memory", "train", "boss"],
      ["race", "story", "sprint", "treasure"],
      ["sprint", "race", "balloon", "boss"],
      ["memory", "treasure", "story", "classic"],
      ["train", "balloon", "race", "boss"],
      ["sprint", "memory", "story", "treasure"],
    ];
  }

  let modes = rotations[day.day % rotations.length].filter((m) => scaled.modeEnabled[m] !== false);

  const chains = qs.filter((q) => q.type === "chain");
  if (chains.length && day.day % 3 === 0 && scaled.modeEnabled.train !== false) {
    if (!modes.includes("train")) {
      modes = (["train", ...modes.filter((m) => m !== "classic")] as ModeId[]).slice(0, 4);
    }
  }

  // 后 10 天确保至少一关偏应用（story 或 classic）
  if (tier === "late") {
    if (!modes.includes("story") && !modes.includes("classic") && scaled.modeEnabled.story !== false) {
      modes = [...modes.slice(0, 3), "story"];
    }
    if (modes.length < 5 && scaled.modeEnabled.classic !== false && !modes.includes("classic")) {
      modes.push("classic");
    }
  }

  const playlist: PlaylistItem[] = [];

  if (scaled.modeEnabled.review !== false && progress?.mistakes?.length) {
    const reviewQs = mistakesToQuestions(progress.mistakes, allDays, tier === "late" ? 6 : 5);
    if (reviewQs.length) {
      playlist.push({
        id: `d${day.day}-review`,
        mode: "review",
        title: MODE_META.review.title,
        emoji: MODE_META.review.emoji,
        blurb: MODE_META.review.blurb,
        questions: reviewQs,
      });
    }
  }

  for (const mode of modes) {
    const it = buildModeItem(day, mode, scaled, rand, wordRatio);
    if (it && it.questions.length) playlist.push(it);
  }

  const wordish = qs.filter((q) => q.type === "word" || q.type === "expression");
  const hasWord = playlist.some((p) => p.questions.some((q) => q.type === "word" || q.type === "expression"));
  if (!hasWord && wordish.length && scaled.modeEnabled.story !== false) {
    const it = buildModeItem(day, "story", scaled, rand, wordRatio);
    if (it) playlist.push(it);
  }

  // 后 10 天与逢 5：保证有 Boss
  if (
    (day.day % 5 === 0 || tier === "late") &&
    scaled.modeEnabled.boss !== false &&
    !playlist.some((p) => p.mode === "boss")
  ) {
    const it = buildModeItem(day, "boss", scaled, rand, wordRatio);
    if (it) playlist.push(it);
  }

  return playlist;
}

/** 第 30 天毕业验收：错题 + 闪电 + 应用故事 + 智慧卷 + 竞速 + 终极大 Boss */
function buildGraduationPlaylist(
  day: DayPack,
  config: AppConfig,
  progress: ProgressState | undefined,
  allDays: DayPack[] | undefined,
  rand: () => number,
  wordRatio: number
): PlaylistItem[] {
  const playlist: PlaylistItem[] = [];

  if (config.modeEnabled.review !== false && progress?.mistakes?.length) {
    const reviewQs = mistakesToQuestions(progress.mistakes, allDays, 8);
    if (reviewQs.length) {
      playlist.push({
        id: `d${day.day}-review-grad`,
        mode: "review",
        title: "错题清零站",
        emoji: "🐛",
        blurb: "毕业前先收拾掉错题小怪物",
        questions: reviewQs,
      });
    }
  }

  const order: ModeId[] = ["sprint", "story", "classic", "race", "treasure", "boss"];
  const titles: Partial<Record<ModeId, { title: string; blurb: string }>> = {
    sprint: { title: "毕业闪电测", blurb: "限时口算验收" },
    story: { title: "应用大闯关", blurb: "生活情境应用题" },
    classic: { title: "毕业智慧卷", blurb: "综合题，认真作答" },
    race: { title: "终局竞速", blurb: "最后一圈小车赛" },
    treasure: { title: "宝藏综合岛", blurb: "应用 + 综合混合" },
    boss: { title: "毕业大魔王", blurb: "通关即毕业！" },
  };

  for (const mode of order) {
    if (config.modeEnabled[mode] === false) continue;
    const it = buildModeItem(day, mode, config, rand, wordRatio);
    if (!it || !it.questions.length) continue;
    const override = titles[mode];
    if (override) {
      it.title = override.title;
      it.blurb = override.blurb;
    }
    it.id = `d${day.day}-grad-${mode}`;
    playlist.push(it);
  }

  return playlist;
}

function mistakesToQuestions(
  mistakes: ProgressState["mistakes"],
  allDays: DayPack[] | undefined,
  n: number
): Question[] {
  const out: Question[] = [];
  for (const m of mistakes.slice(0, n * 2)) {
    if (m.raw) {
      out.push(m.raw);
      continue;
    }
    if (allDays) {
      const day = allDays.find((d) => d.day === m.day);
      const q = day?.sections.flatMap((s) => s.questions).find((x) => x.id === m.questionId);
      if (q) {
        out.push(q);
        continue;
      }
    }
    out.push({
      id: m.questionId || `rev-${out.length}`,
      type: "word",
      prompt: m.prompt,
      answer: m.answer,
      accept: [m.answer],
      hint: "这是之前错过的题",
    });
  }
  const seen = new Set<string>();
  return out
    .filter((q) => {
      if (seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    })
    .slice(0, n);
}
