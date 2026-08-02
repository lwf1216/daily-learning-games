import { useState } from "react";
import type { ModeResult, PlaylistItem, Question } from "../engine/types";
import { checkAnswer, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake, recordCorrectAnswer } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";
import { WrongFeedback } from "../components/WrongFeedback";

function collect(q: Question, draft: Record<string, string>): unknown {
  if (q.type === "multi_blank" || q.type === "pattern" || q.type === "chain" || q.type === "table") {
    const n = q.blanks || q.ops?.length || (Array.isArray(q.answer) ? (q.answer as unknown[]).length : 1);
    return Array.from({ length: n }, (_, i) => draft[`b${i}`] ?? "");
  }
  if (q.type === "true_false") return draft.main === "true";
  if (q.type === "compare") return draft.main;
  if (q.type === "choice") {
    const v = draft.main;
    if (v != null && /^-?\d+$/.test(v)) return Number(v);
    return v;
  }
  return draft.main ?? "";
}

export function ClassicMode({
  item,
  day,
  sound,
  onFinish,
  storySkin = false,
}: {
  item: PlaylistItem;
  day: number;
  sound: boolean;
  onFinish: (r: ModeResult) => void;
  storySkin?: boolean;
}) {
  const qs = item.questions;
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [fb, setFb] = useState<{ ok: boolean; text?: string; showWrong?: boolean } | null>(null);
  const [start] = useState(() => Date.now());

  const q = qs[idx];

  if (!qs.length || !q) {
    return (
      <div className="mode classic">
        <p className="center muted">这一关暂时没有题目，请换一天或换一关。</p>
        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            onFinish({
              mode: storySkin ? "story" : item.mode,
              correct: 0,
              total: 0,
              comboMax: 0,
              coins: 0,
              stars: 0,
              durationMs: 0,
            })
          }
        >
          返回
        </button>
      </div>
    );
  }

  function check() {
    const user = collect(q, draft);
    if (
      user === "" ||
      user == null ||
      (Array.isArray(user) && user.some((x) => x === "")) ||
      ((q.type === "compare" || q.type === "choice" || q.type === "true_false") && draft.main == null)
    ) {
      setFb({ ok: false, text: "先把答案填完哦～" });
      return;
    }
    const ok = checkAnswer(q, user);
    if (ok) {
      Sfx.ok(sound);
      recordCorrectAnswer(q.id, day);
      setCorrect((c) => c + 1);
      setCombo((c) => {
        const n = c + 1;
        setComboMax((m) => Math.max(m, n));
        if (n >= 3) Sfx.combo(sound);
        return n;
      });
      setFb({ ok: true, text: "太棒了！" });
    } else {
      Sfx.bad(sound);
      setCombo(0);
      // 先思路、后答案（WrongFeedback 内点开才显示答案）
      setFb({ ok: false, showWrong: true });
      addMistake({ day, questionId: q.id, prompt: q.prompt, answer: formatAnswer(q), raw: q, type: q.type });
    }
  }

  function next() {
    if (idx + 1 >= qs.length) {
      const stars = correct >= qs.length ? 3 : correct >= qs.length * 0.6 ? 2 : correct > 0 ? 1 : 0;
      Sfx.win(sound);
      onFinish({
        mode: storySkin ? "story" : item.mode,
        correct,
        total: qs.length,
        comboMax,
        coins: correct * 2 + (storySkin ? 5 : 0),
        stars,
        durationMs: Date.now() - start,
      });
      return;
    }
    setIdx((i) => i + 1);
    setDraft({});
    setFb(null);
  }

  const blanks =
    q.type === "multi_blank" || q.type === "pattern" || q.type === "chain" || q.type === "table"
      ? q.blanks || q.ops?.length || (Array.isArray(q.answer) ? (q.answer as unknown[]).length : 1)
      : 0;

  return (
    <div className={`mode classic ${storySkin ? "story" : ""}`}>
      {storySkin && (
        <div className="story-banner">
          <span className="story-mascot">🧒</span>
          <div>
            <strong>故事时间</strong>
            <p>读一读，再帮主角算一算～</p>
          </div>
        </div>
      )}
      <div className="mode-hud compact">
        <span>
          {idx + 1}/{qs.length}
        </span>
        <span>🔥{combo}</span>
      </div>
      <div className="card-q">
        <p className="big-prompt">{q.prompt}</p>
        {q.visual && <p className="visual">{q.visual}</p>}

        {q.type === "compare" && (
          <div className="choice-grid">
            {([">", "<", "="] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`choice-pill ${draft.main === s ? "on" : ""}`}
                onClick={() => setDraft({ main: s })}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {q.type === "true_false" && (
          <div className="choice-grid">
            {[
              { l: "✓ 对", v: "true" },
              { l: "✗ 错", v: "false" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                className={`choice-pill ${draft.main === o.v ? "on" : ""}`}
                onClick={() => setDraft({ main: o.v === "true" ? "true" : "false" })}
              >
                {o.l}
              </button>
            ))}
          </div>
        )}

        {q.type === "choice" && q.options && (
          <div className="choice-grid">
            {q.options.map((opt, i) => {
              const label = typeof opt === "object" ? opt.label : String(opt);
              const value = String(typeof opt === "object" ? opt.value : i);
              return (
                <button
                  key={value}
                  type="button"
                  className={`choice-pill ${draft.main === value ? "on" : ""}`}
                  onClick={() => setDraft({ main: value })}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "chain" && (
          <div className="chain-row">
            <span className="chip">{q.start}</span>
            {q.ops?.map((op, i) => (
              <span key={op + i} className="chain-step">
                <span>{op}→</span>
                <input
                  value={draft[`b${i}`] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [`b${i}`]: e.target.value }))}
                />
              </span>
            ))}
          </div>
        )}

        {(q.type === "multi_blank" || q.type === "pattern" || q.type === "table") && (
          <div className="blank-row">
            {Array.from({ length: blanks }, (_, i) => (
              <input
                key={i}
                className="blank"
                placeholder={`${i + 1}`}
                value={draft[`b${i}`] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [`b${i}`]: e.target.value }))}
              />
            ))}
          </div>
        )}

        {(q.type === "calc" || q.type === "word" || q.type === "expression") && (
          <input
            className="big-input"
            value={draft.main ?? ""}
            placeholder="写出答案"
            inputMode="decimal"
            onChange={(e) => setDraft({ main: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && (fb ? next() : check())}
          />
        )}

        {fb?.ok && <div className="fb ok">{fb.text}</div>}
        {fb && !fb.ok && fb.showWrong && <WrongFeedback key={q.id} question={q} />}
        {fb && !fb.ok && !fb.showWrong && fb.text && <div className="fb bad">{fb.text}</div>}

        <div className="actions">
          {!fb ? (
            <button type="button" className="primary-btn" onClick={check}>
              检查
            </button>
          ) : (
            <button type="button" className="primary-btn" onClick={next}>
              {idx + 1 >= qs.length ? "完成本关" : "下一题"}
            </button>
          )}
        </div>
        <HintPanel question={q} />
      </div>
    </div>
  );
}
