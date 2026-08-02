import { useMemo, useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { buildChoices, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake, recordCorrectAnswer } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";
import { wrongFeedbackInline } from "../engine/feedback";

type Balloon = { id: string; label: string; value: string; correct: boolean; x: number; delay: number; color: string };

const COLORS = ["#ff6b9d", "#4fc3f7", "#ffc53d", "#3ecf8e", "#a78bfa", "#ff8a5c"];

export function BalloonMode({
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
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [popped, setPopped] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [start] = useState(() => Date.now());
  const total = qs.length;

  const balloons: Balloon[] = useMemo(() => {
    const q = qs[round];
    if (!q) return [];
    // Always aim for 4 balloons so kids never see a single lonely option
    let choices = buildChoices(q, 4);
    if (choices.length < 2) {
      choices = buildChoices(
        { ...q, type: "calc", answer: Number(String(q.answer).match(/-?\d+/)?.[0] ?? 10) },
        4
      );
    }
    // ensure exactly one correct
    if (!choices.some((c) => c.correct) && choices.length) choices[0].correct = true;
    return choices.slice(0, 4).map((c, i) => ({
      id: `${round}-${i}`,
      label: c.label,
      value: c.value,
      correct: c.correct,
      x: 0,
      delay: i * 0.12,
      color: COLORS[i % COLORS.length],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, qs]);

  function pick(b: Balloon) {
    if (popped) return;
    setPopped(b.id);
    Sfx.tap(sound);
    const q = qs[round];
    if (b.correct) {
      Sfx.ok(sound);
      recordCorrectAnswer(q.id, day);
      setCorrect((c) => c + 1);
      setCombo((c) => {
        const n = c + 1;
        setComboMax((m) => Math.max(m, n));
        if (n >= 3) Sfx.combo(sound);
        return n;
      });
      setMsg("砰！戳对啦 🎉");
    } else {
      Sfx.bad(sound);
      setCombo(0);
      setMsg(wrongFeedbackInline(q));
      addMistake({ day, questionId: q.id, prompt: q.prompt, answer: formatAnswer(q), raw: q, type: q.type });
    }
    setTimeout(() => {
      if (round + 1 >= total) {
        const stars = correct + (b.correct ? 1 : 0) >= total * 0.8 ? 3 : correct + (b.correct ? 1 : 0) >= total * 0.5 ? 2 : 1;
        const c = correct + (b.correct ? 1 : 0);
        Sfx.win(sound);
        onFinish({
          mode: "balloon",
          correct: c,
          total,
          comboMax: Math.max(comboMax, b.correct ? combo + 1 : comboMax),
          coins: c * 3,
          stars,
          durationMs: Date.now() - start,
        });
      } else {
        setRound((r) => r + 1);
        setPopped(null);
        setMsg("");
      }
    }, b.correct ? 700 : 1600);
  }

  const q = qs[round];

  if (!qs.length) {
    return (
      <div className="mode balloon">
        <p className="center muted">这一关暂时没有题目，请换一天或换一关。</p>
        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            onFinish({
              mode: "balloon",
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

  return (
    <div className="mode balloon">
      <div className="mode-hud">
        <div>
          🎈 {round + 1}/{total}
        </div>
        <div>连击 🔥{combo}</div>
        <div>正确 {correct}</div>
      </div>
      <p className="big-prompt center">{q?.prompt}</p>
      {q?.visual && <p className="visual">{q.visual}</p>}
      <div className="sky">
        {balloons.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`balloon-btn ${popped === b.id ? (b.correct ? "pop-ok" : "pop-bad") : ""} ${
              popped && popped !== b.id ? "dim" : ""
            }`}
            style={{
              animationDelay: `${b.delay}s`,
            }}
            onClick={() => pick(b)}
          >
            <span className="balloon-body" style={{ background: b.color }}>
              {b.label}
            </span>
            <span className="balloon-string" />
          </button>
        ))}
      </div>
      {msg && <p className="float-msg">{msg}</p>}
      {q && <HintPanel question={q} />}
    </div>
  );
}
