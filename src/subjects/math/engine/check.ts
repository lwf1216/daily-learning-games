import type { Question } from "./types";

function normalizeText(v: unknown): string {
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/＝/g, "=")
    .replace(/－/g, "-")
    .replace(/＋/g, "+")
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

function sameArray(userArr: unknown, answerArr: unknown): boolean {
  if (!Array.isArray(userArr) || !Array.isArray(answerArr)) return false;
  if (userArr.length !== answerArr.length) return false;
  return userArr.every((u, i) => sameValue(u, answerArr[i]));
}

function matchesAccepted(user: unknown, answer: unknown, accept?: unknown[]): boolean {
  return sameValue(user, answer) || Boolean(accept?.some((candidate) => sameValue(user, candidate)));
}

export function checkAnswer(question: Question, userAnswer: unknown): boolean {
  const { type, answer, accept } = question;

  if (type === "calc" || type === "word" || type === "expression") {
    return matchesAccepted(userAnswer, answer, accept);
  }

  if (type === "multi_blank" || type === "pattern" || type === "chain" || type === "table") {
    const ans = accept || answer;
    if (Array.isArray(ans) && Array.isArray(ans[0])) {
      return (ans as unknown[][]).some((a) => sameArray(userAnswer, a));
    }
    return sameArray(userAnswer, ans);
  }

  if (type === "compare" || type === "choice" || type === "true_false") {
    return matchesAccepted(userAnswer, answer, accept);
  }

  if (type === "match") {
    const pairs = (Array.isArray(userAnswer) ? userAnswer : [])
      .map((p: unknown) => {
        const [a, b] = p as [string, string];
        return `${a}>${b}`;
      })
      .sort();
    const expected = (Array.isArray(answer) ? answer : [])
      .map((p: unknown) => {
        const [a, b] = p as [string, string];
        return `${a}>${b}`;
      })
      .sort();
    return pairs.length === expected.length && pairs.every((p, i) => p === expected[i]);
  }

  if (type === "order") return sameArray(userAnswer, answer);
  return sameValue(userAnswer, answer);
}

export function formatAnswer(question: Question): string {
  if (question.showAnswer != null) return String(question.showAnswer);
  const a = question.answer;
  if (Array.isArray(a)) {
    if (Array.isArray(a[0])) return (a as unknown[][]).map((x) => x.join(",")).join(" 或 ");
    return a.join("，");
  }
  if (typeof a === "boolean") return a ? "对 ✓" : "错 ✗";
  return String(a ?? "");
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function numericChoices(correctNum: number, count = 4): Array<{ label: string; value: string; correct: boolean }> {
  const set = new Set<number>([correctNum]);
  const deltas = [1, -1, 2, -2, 10, -10, 5, -5, 3, -3, 4, -4, 20, -20, 11, -11];
  for (const d of deltas) {
    if (set.size >= count) break;
    const v = correctNum + d;
    if (v >= 0) set.add(v);
  }
  let n = 1;
  while (set.size < count) {
    set.add(Math.max(0, correctNum + n * 7 + 1));
    n += 1;
  }
  return shuffleInPlace([...set].slice(0, count)).map((v) => ({
    label: String(v),
    value: String(v),
    correct: v === correctNum,
  }));
}

/** Always try to produce multiple balloons (default 4). */
export function buildChoices(
  question: Question,
  count = 4
): Array<{ label: string; value: string; correct: boolean }> {
  if (question.type === "choice" && question.options?.length) {
    const opts = question.options.map((opt, i) => {
      const label = typeof opt === "object" ? opt.label : String(opt);
      const value = String(typeof opt === "object" ? opt.value : i);
      const optionValue = typeof opt === "object" ? opt.value : i;
      const correct = matchesAccepted(optionValue, question.answer, question.accept);
      return { label, value, correct };
    });
    // pad if fewer than 2
    if (opts.length === 1) {
      return numericChoices(Number(opts[0].value) || 0, count).map((o, i) =>
        i === 0
          ? { ...opts[0], correct: true }
          : { ...o, correct: false, label: o.label, value: `d${o.value}` }
      );
    }
    return shuffleInPlace(opts);
  }

  if (question.type === "compare") {
    return shuffleInPlace(
      [">", "<", "="].map((s) => ({
        label: s,
        value: s,
        correct: s === question.answer,
      }))
    );
  }

  if (question.type === "true_false") {
    return [
      { label: "✓ 对", value: "true", correct: question.answer === true },
      { label: "✗ 错", value: "false", correct: question.answer === false },
    ];
  }

  const correctRaw = Array.isArray(question.answer) ? question.answer[0] : question.answer;
  const correctNum = Number(String(correctRaw ?? "").trim());
  if (correctRaw !== "" && correctRaw != null && !Number.isNaN(correctNum) && String(correctRaw).trim() !== "") {
    // pure number or numeric string
    if (/^-?\d+(\.\d+)?$/.test(String(correctRaw).trim()) || typeof correctRaw === "number") {
      return numericChoices(correctNum, count);
    }
  }

  // extract first number from text answer (e.g. "1元2角", "6楼")
  const text = formatAnswer(question);
  const m = String(text).match(/-?\d+/);
  if (m) {
    const n = Number(m[0]);
    const variants = numericChoices(n, count);
    // keep first as the full correct text once
    return shuffleInPlace(
      variants.map((v, i) =>
        v.correct
          ? { label: text, value: String(correctRaw), correct: true }
          : { label: String(v.label), value: `w${v.value}_${i}`, correct: false }
      )
    );
  }

  // pure text: build plausible distractors so balloons never show only 1
  const correctLabel = text || "？";
  const pool = [
    correctLabel,
    "0",
    "1",
    "10",
    "100",
    "不对",
    "一样多",
    "更多",
    "更少",
    "不知道",
  ];
  const uniq = Array.from(new Set(pool)).filter(Boolean);
  while (uniq.length < count) uniq.push(`选项${uniq.length + 1}`);
  const picked = shuffleInPlace(uniq).slice(0, count);
  if (!picked.includes(correctLabel)) {
    picked[0] = correctLabel;
    shuffleInPlace(picked);
  }
  return picked.map((label) => ({
    label,
    value: label === correctLabel ? String(correctRaw) : `x_${label}`,
    correct: label === correctLabel,
  }));
}

/** Suitable for multi-option games (balloon / race / boss). Prefer numeric & MC. */
export function isChoiceFriendly(q: Question): boolean {
  if (q.type === "compare" || q.type === "true_false" || q.type === "choice" || q.type === "calc") {
    return true;
  }
  if (q.type === "word" || q.type === "expression") {
    const a = Array.isArray(q.answer) ? q.answer[0] : q.answer;
    if (typeof a === "number") return true;
    if (typeof a === "string" && /^-?\d+(\.\d+)?$/.test(a.trim())) return true;
    // still ok if contains a number — buildChoices can make distractors
    if (typeof a === "string" && /\d/.test(a)) return true;
  }
  return false;
}

export function isSprintFriendly(q: Question): boolean {
  return q.type === "calc" || q.type === "compare" || (q.type === "word" && typeof q.answer === "number");
}
