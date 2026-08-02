import { useMemo, useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { buildChoices, checkAnswer, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake, recordCorrectAnswer } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";
import { wrongFeedbackInline } from "../engine/feedback";

export function TreasureMode({
  item,
  day,
  sound,
  onFinish,
}: {
  item: PlaylistItem;
  day: number;
  sound: boolean;
  onFinish: (r: ModeResult) => void;
}) {
  const qs = item.questions;
  const tiles = useMemo(() => Math.min(6, qs.length || 6), [qs.length]);
  const [pos, setPos] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [input, setInput] = useState("");
  const [fb, setFb] = useState("");
  const [lock, setLock] = useState(false);
  const [start] = useState(() => Date.now());
  const [chests, setChests] = useState(() => Array.from({ length: tiles }, () => "📦"));

  const q = qs.length ? qs[pos % qs.length] : undefined;
  const choices = useMemo(() => (q ? buildChoices(q) : []), [q]);
  const useChoices = q && (q.type === "compare" || q.type === "choice" || q.type === "true_false" || q.type === "calc");

  if (!qs.length || !q) {
    return (
      <div className="mode treasure">
        <p className="center muted">这一关暂时没有题目，请换一天或换一关。</p>
        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            onFinish({
              mode: "treasure",
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

  const cur = q;

  function finish(finalCorrect: number) {
    const stars = finalCorrect >= tiles ? 3 : finalCorrect >= tiles * 0.6 ? 2 : 1;
    Sfx.win(sound);
    onFinish({
      mode: "treasure",
      correct: finalCorrect,
      total: tiles,
      comboMax,
      coins: finalCorrect * 5 + 10,
      stars,
      durationMs: Date.now() - start,
    });
  }

  function advance(ok: boolean) {
    setLock(true);
    if (ok) {
      Sfx.ok(sound);
      recordCorrectAnswer(cur.id, day);
      const nc = correct + 1;
      setCorrect(nc);
      setCombo((c) => {
        const n = c + 1;
        setComboMax((m) => Math.max(m, n));
        if (n >= 3) Sfx.combo(sound);
        return n;
      });
      setChests((arr) => {
        const copy = [...arr];
        copy[pos] = "💎";
        return copy;
      });
      setFb("宝箱打开了！");
      setTimeout(() => {
        setFb("");
        setInput("");
        if (pos + 1 >= tiles) finish(nc);
        else {
          setPos((p) => p + 1);
          setLock(false);
        }
      }, 600);
    } else {
      Sfx.bad(sound);
      setCombo(0);
      setFb(wrongFeedbackInline(cur));
      addMistake({
        day,
        questionId: cur.id,
        prompt: cur.prompt,
        answer: formatAnswer(cur),
        raw: cur,
        type: cur.type,
      });
      setTimeout(() => {
        setFb("");
        setInput("");
        if (pos + 1 >= tiles) finish(correct);
        else {
          setPos((p) => p + 1);
          setLock(false);
        }
      }, 1600);
    }
  }

  function submitText() {
    if (lock || !input.trim()) return;
    advance(checkAnswer(cur, input.trim()));
  }

  return (
    <div className="mode treasure">
      <div className="mode-hud compact">
        <span>
          格子 {pos + 1}/{tiles}
        </span>
        <span>🔥{combo}</span>
        <span>💎{correct}</span>
      </div>
      <div className="path">
        {chests.map((c, i) => (
          <div key={i} className={`tile ${i === pos ? "here" : ""} ${i < pos ? "done" : ""}`}>
            <span>{i === pos ? "🧒" : c}</span>
            <small>{i + 1}</small>
          </div>
        ))}
        <div className="tile goal">🏁</div>
      </div>
      <div className="card-q">
        <p className="big-prompt">{cur.prompt}</p>
        {useChoices && choices.length <= 4 && cur.type !== "word" ? (
          <div className="choice-grid">
            {choices.map((c) => (
              <button
                key={c.value + c.label}
                type="button"
                className="choice-pill"
                disabled={lock}
                onClick={() => advance(c.correct)}
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            <input
              className="big-input"
              value={input}
              disabled={lock}
              placeholder="写出答案"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitText()}
            />
            <button type="button" className="primary-btn" disabled={lock} onClick={submitText}>
              开宝箱
            </button>
          </>
        )}
        {fb && <p className="float-msg">{fb}</p>}
        <HintPanel question={cur} />
      </div>
    </div>
  );
}
