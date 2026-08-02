import { useEffect, useState } from "react";
import type { Question } from "../engine/types";
import { getHint } from "../engine/hints";

/**
 * Closed: small but visible ▼ (CSS triangle, not emoji).
 * Open: previous classic yellow hint UI.
 */
export function HintPanel({
  question,
  defaultOpen = false,
}: {
  question: Question;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hint = getHint(question);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [question.id, defaultOpen]);

  return (
    <div className={`hint-panel ${open ? "open" : ""}`}>
      {!open ? (
        <button
          type="button"
          className="hint-toggle-min"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label="展开解题提示"
          title="解题提示"
        >
          {/* CSS triangle — works even if font missing glyphs */}
          <span className="hint-tri" aria-hidden />
          <span className="hint-min-label">提示</span>
        </button>
      ) : (
        <>
          <button
            type="button"
            className="hint-toggle-classic"
            onClick={() => setOpen(false)}
            aria-expanded={true}
          >
            <span className="hint-ico" aria-hidden>
              💡
            </span>
            <span>收起方法</span>
            <span className="hint-chevron-classic" aria-hidden>
              ▲
            </span>
          </button>
          <div className="hint-body-classic">
            <p className="hint-title-classic">解题思路</p>
            <p className="hint-text-classic">{hint}</p>
            <p className="hint-note-classic">先自己想一想再看提示哦～ 想出来更棒！</p>
          </div>
        </>
      )}
    </div>
  );
}
