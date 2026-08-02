import type { Question } from "./types";
import { formatAnswer } from "./check";
import { getHint } from "./hints";

/** 答错：先给思路，再给答案（一步展示时合并两行） */
export function wrongFeedbackLines(q: Question): { tip: string; answer: string; full: string } {
  const tip = getHint(q);
  const answer = formatAnswer(q);
  return {
    tip: `先想方法：${tip}`,
    answer: `参考答案：${answer}`,
    full: `先想方法：${tip}\n参考答案：${answer}`,
  };
}

/** One-line feedback for modes that cannot show an interactive reveal. */
export function wrongFeedbackInline(q: Question): string {
  const { tip, answer } = wrongFeedbackLines(q);
  return `${tip} ｜ ${answer}`;
}
