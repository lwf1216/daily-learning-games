import { useState } from "react";
import type { Question } from "../engine/types";
import { wrongFeedbackLines } from "../engine/feedback";

/**
 * 答错反馈：默认先思路，再点开参考答案。
 * compact=true 用于竞速/气球等短反馈场景（两行叠放，答案稍迟展开）。
 */
export function WrongFeedback({
  question,
  compact = false,
  className = "",
}: {
  question: Question;
  compact?: boolean;
  className?: string;
}) {
  const lines = wrongFeedbackLines(question);
  const [showAnswer, setShowAnswer] = useState(false);

  if (compact) {
    return (
      <div className={`wrong-fb compact ${className}`.trim()}>
        <div className="wrong-tip">{lines.tip}</div>
        {showAnswer ? (
          <div className="wrong-ans">{lines.answer}</div>
        ) : (
          <button type="button" className="wrong-reveal" onClick={() => setShowAnswer(true)}>
            再看参考答案 ▸
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`wrong-fb staged ${className}`.trim()}>
      <div className="wrong-tip">{lines.tip}</div>
      {showAnswer ? (
        <div className="wrong-ans">{lines.answer}</div>
      ) : (
        <button type="button" className="wrong-reveal" onClick={() => setShowAnswer(true)}>
          想好了，再看参考答案
        </button>
      )}
    </div>
  );
}
