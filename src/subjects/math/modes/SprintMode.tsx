import { useEffect, useMemo, useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { checkAnswer, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake, recordCorrectAnswer } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";
import { wrongFeedbackInline } from "../engine/feedback";

export function SprintMode({
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
  const seconds = Number(item.meta?.seconds ?? 60);
  const target = Number(item.meta?.target ?? 10);
  const qs = useMemo(() => item.questions, [item.questions]);
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(seconds);
  const [input, setInput] = useState("");
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [wrongTip, setWrongTip] = useState("");
  const [start] = useState(() => Date.now());
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [ended]);

  useEffect(() => {
    if (left === 0 && !ended) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  function finish() {
    if (ended) return;
    setEnded(true);
    const stars = correct >= target ? 3 : correct >= target * 0.6 ? 2 : correct > 0 ? 1 : 0;
    const coins = correct * 2 + (comboMax >= 5 ? 10 : 0);
    Sfx.win(sound);
    onFinish({
      mode: "sprint",
      correct,
      total,
      comboMax,
      coins,
      stars,
      durationMs: Date.now() - start,
    });
  }

  function submit() {
    if (ended || !input.trim()) return;
    const q = qs[idx % qs.length];
    const ok = checkAnswer(q, input.trim());
    setTotal((t) => t + 1);
    if (ok) {
      Sfx.ok(sound);
      recordCorrectAnswer(q.id, day);
      setFlash("ok");
      setWrongTip("");
      setCorrect((c) => c + 1);
      setCombo((c) => {
        const n = c + 1;
        setComboMax((m) => Math.max(m, n));
        if (n >= 3) Sfx.combo(sound);
        return n;
      });
    } else {
      Sfx.bad(sound);
      setFlash("bad");
      setCombo(0);
      setWrongTip(wrongFeedbackInline(q));
      addMistake({ day, questionId: q.id, prompt: q.prompt, answer: formatAnswer(q), raw: q, type: q.type });
      setTimeout(() => setWrongTip(""), 2200);
    }
    setInput("");
    setIdx((i) => i + 1);
    setTimeout(() => setFlash(null), 250);
    if (correct + (ok ? 1 : 0) >= target && ok) {
      // soft complete — can keep going until time ends, or finish early for stars
    }
  }

  if (!qs.length) {
    return (
      <div className="mode sprint">
        <p className="center muted">这一关暂时没有题目，请换一天或换一关。</p>
        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            onFinish({
              mode: "sprint",
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

  const q = qs[idx % qs.length];
  const pct = Math.min(100, (correct / target) * 100);

  return (
    <div className={`mode sprint ${flash ?? ""}`}>
      <div className="mode-hud">
        <div className={`timer ${left <= 10 ? "urgent" : ""}`}>⏱ {left}s</div>
        <div className="hud-mid">
          <div className="progress-bar">
            <div className="bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="hud-label">
            目标 {correct}/{target} · 连击 🔥{combo}
          </div>
        </div>
        <button type="button" className="ghost-btn" onClick={finish}>
          结束
        </button>
      </div>

      <div className="sprint-stage">
        <p className="big-prompt">{q?.prompt}</p>
        <input
          className="big-input"
          value={input}
          autoFocus
          inputMode="decimal"
          placeholder="答案"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button type="button" className="primary-btn lg" onClick={submit}>
          冲！
        </button>
        <p className="hint-line">答对越多、连击越高，金币越多</p>
        {wrongTip && <p className="wrong-inline">{wrongTip}</p>}
        {q && <HintPanel question={q} />}
      </div>
    </div>
  );
}
