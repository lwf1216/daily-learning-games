import { useState } from "react";
import type { Question } from "../engine/types";

export function HintPanel({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  if (!q.hint) return null;
  return (
    <div className="hint-panel">
      <button type="button" className="link-btn" onClick={() => setOpen((v) => !v)}>
        {open ? "收起提示" : "💡 需要提示？"}
      </button>
      {open && <p className="hint-text">{q.hint}</p>}
    </div>
  );
}
