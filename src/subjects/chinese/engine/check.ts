import type { Question } from "./types";

function normalizeText(v: unknown): string {
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/，/g, ",")
    .replace(/。/g, ".")
    .toLowerCase();
}

function sameValue(user: unknown, answer: unknown): boolean {
  if (Array.isArray(answer)) return answer.some((a) => sameValue(user, a));
  if (typeof answer === "boolean") return Boolean(user) === answer;
  if (typeof answer === "number") {
    const n = Number(String(user).trim());
    return !Number.isNaN(n) && n === answer;
  }
  return normalizeText(user) === normalizeText(answer);
}

function sameArray(userArr: unknown, answerArr: unknown, unordered = false): boolean {
  if (!Array.isArray(userArr) || !Array.isArray(answerArr)) return false;
  if (userArr.length !== answerArr.length) return false;
  if (unordered) {
    const a = userArr.map(normalizeText).sort();
    const b = answerArr.map(normalizeText).sort();
    return a.every((x, i) => x === b[i]);
  }
  return userArr.every((u, i) => sameValue(u, answerArr[i]));
}

function sameMatch(user: unknown, answer: unknown): boolean {
  const pairs = (Array.isArray(user) ? user : [])
    .map((p: unknown) => {
      const [a, b] = p as [string, string];
      return `${normalizeText(a)}>${normalizeText(b)}`;
    })
    .sort();
  const expected = (Array.isArray(answer) ? answer : [])
    .map((p: unknown) => {
      const [a, b] = p as [string, string];
      return `${normalizeText(a)}>${normalizeText(b)}`;
    })
    .sort();
  return pairs.length === expected.length && pairs.every((p, i) => p === expected[i]);
}

/** 单选题的唯一正确答案（数组题只取第一个，避免多正确答案） */
export function primaryAnswer(question: Question): string {
  const a = question.answer;
  if (Array.isArray(a)) return String(a[0] ?? "");
  return String(a ?? "");
}

export function checkAnswer(question: Question, userAnswer: unknown): boolean {
  const { type, answer, accept } = question;

  if (accept?.length) {
    for (const a of accept) {
      if (Array.isArray(a)) {
        // 组词不计选择顺序；多空题必须与每个空的位置一致
        if (sameArray(userAnswer, a, type === "make_word")) return true;
      } else if (sameValue(userAnswer, a)) {
        return true;
      }
    }
  }

  switch (type) {
    case "pinyin_pick":
    case "tone_pick":
    case "char_fill":
    case "char_math":
    case "choice":
    case "sentence":
      // 单选：若 answer 是数组（误配），只认主答案，避免“两个都对”
      if (Array.isArray(answer) && !Array.isArray(userAnswer)) {
        return normalizeText(userAnswer) === normalizeText(answer[0]);
      }
      return sameValue(userAnswer, answer);

    case "multi_fill":
    case "poem_fill":
      // 主答案有序；另允许与 answer 无序全同（仿写词序灵活时用 accept 更稳）
      if (sameArray(userAnswer, answer)) return true;
      return false;
    case "order":
      return sameArray(userAnswer, answer);

    case "make_word":
      // 必须选齐全部正确词语，单个词不算对
      return sameArray(userAnswer, answer, true);

    case "match":
      return sameMatch(userAnswer, answer);

    case "sort_group": {
      if (!question.groups) return false;
      if (userAnswer && typeof userAnswer === "object" && !Array.isArray(userAnswer)) {
        const map = userAnswer as Record<string, string[]>;
        return question.groups.every((g) => sameArray(map[g.id] || [], g.items, true));
      }
      return false;
    }

    default:
      return sameValue(userAnswer, answer);
  }
}

export function formatAnswer(question: Question): string {
  if (question.showAnswer != null) return String(question.showAnswer);
  const a = question.answer;
  if (question.type === "match" && Array.isArray(a)) {
    return (a as [string, string][]).map(([x, y]) => `${x}→${y}`).join("；");
  }
  if (question.type === "sort_group" && question.groups) {
    return question.groups.map((g) => `${g.name}：${g.items.join("、")}`).join("；");
  }
  if (Array.isArray(a)) {
    if (Array.isArray(a[0])) return (a as unknown[][]).map((x) => x.join("→")).join(" 或 ");
    return a.join("，");
  }
  return String(a ?? "");
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 单选题选项。多答案题型（组词/多空）不会出现多个 correct。
 * make_word 若被拉进快答模式，降级为「选出一个可用词」。
 */
export function buildChoices(
  question: Question,
  count = 4
): Array<{ label: string; value: string; correct: boolean }> {
  // 组词：快答里改成「选出带这个字的一个词」，只保留一个正确项
  if (question.type === "make_word") {
    const answers = Array.isArray(question.answer) ? question.answer.map(String) : [String(question.answer ?? "")];
    const one = answers[Math.floor(Math.random() * answers.length)] || answers[0];
    const wrongPool = (question.bank || []).filter((x) => !answers.some((a) => normalizeText(a) === normalizeText(x)));
    const distractors = shuffleInPlace([...wrongPool]).slice(0, count - 1);
    while (distractors.length < count - 1) distractors.push(`词${distractors.length + 1}`);
    return shuffleInPlace([
      { label: one, value: one, correct: true },
      ...distractors.map((d) => ({ label: d, value: d, correct: false })),
    ]);
  }

  if (question.options?.length) {
    const primary = primaryAnswer(question);
    // 先按文案去重，避免「跳绳」出现两次导致其中一个 correct:false
    const deduped: Array<{ label: string; value: string }> = [];
    const seenLabel = new Set<string>();
    question.options.forEach((opt, i) => {
      const label = typeof opt === "object" ? opt.label : String(opt);
      const value = String(typeof opt === "object" ? opt.value : opt);
      const key = normalizeText(label);
      if (seenLabel.has(key)) return;
      seenLabel.add(key);
      deduped.push({ label, value: value || String(i) });
    });
    const opts = deduped.map((o) => {
      const correct =
        normalizeText(o.value) === normalizeText(primary) ||
        normalizeText(o.label) === normalizeText(primary) ||
        (typeof question.answer !== "object" && sameValue(o.value, question.answer));
      return { label: o.label, value: o.value, correct };
    });
    if (!opts.some((o) => o.correct)) {
      const ans = String(question.answer ?? "");
      const hit = opts.find(
        (o) => o.label === ans || o.value === ans || normalizeText(o.label) === normalizeText(primary)
      );
      if (hit) hit.correct = true;
      else if (opts.length) opts[0].correct = true;
    }
    // 至多一个 correct 标记（文案已去重，不会误伤重复正确项）
    let seen = false;
    for (const o of opts) {
      if (o.correct) {
        if (seen) o.correct = false;
        else seen = true;
      }
    }
    // 选项不足时补像真词的干扰项，不要「选项1」
    const pads = ["小猫", "白云", "春天", "大树", "学校", "花朵", "小鸟", "河水"];
    let pi = 0;
    while (opts.length < Math.min(count, 4) && pi < pads.length) {
      const p = pads[pi++];
      if (opts.some((o) => normalizeText(o.label) === normalizeText(p))) continue;
      if (normalizeText(p) === normalizeText(primary)) continue;
      opts.push({ label: p, value: p, correct: false });
    }
    return shuffleInPlace(opts).slice(0, Math.max(count, opts.length));
  }

  const correct = primaryAnswer(question);
  const bank = question.bank?.filter((x) => normalizeText(x) !== normalizeText(correct)) ?? [];
  const distractors = shuffleInPlace([...bank]).slice(0, count - 1);
  const pads = ["小猫", "白云", "春天", "大树", "学校", "花朵"];
  let pi = 0;
  while (distractors.length < count - 1 && pi < pads.length) {
    const p = pads[pi++];
    if (normalizeText(p) === normalizeText(correct)) continue;
    if (distractors.some((d) => normalizeText(d) === normalizeText(p))) continue;
    distractors.push(p);
  }
  return shuffleInPlace([
    { label: correct, value: correct, correct: true },
    ...distractors.map((d) => ({ label: d, value: d, correct: false })),
  ]);
}

export function isChoiceFriendly(q: Question): boolean {
  return (
    q.type === "pinyin_pick" ||
    q.type === "tone_pick" ||
    q.type === "char_fill" ||
    q.type === "char_math" ||
    q.type === "choice" ||
    q.type === "sentence" ||
    (Boolean(q.options?.length) && q.type !== "make_word" && q.type !== "multi_fill")
  );
}

/** 快答玩法：仅单选，不要组词/多空 */
export function isFastFriendly(q: Question): boolean {
  return isChoiceFriendly(q);
}
