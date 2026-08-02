import { useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { checkAnswer, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake } from "../engine/progress";
import { QuestionBoard, type BoardValue } from "../components/QuestionBoard";
import { HintPanel } from "../components/HintPanel";

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
  const [opened, setOpened] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [value, setValue] = useState<BoardValue>(null);
  const [correct, setCorrect] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [combo, setCombo] = useState(0);
  const [fb, setFb] = useState<string | null>(null);
  const [start] = useState(() => Date.now());

  function openTile(i: number) {
    if (done.has(i) || opened != null) return;
    Sfx.tap(sound);
    setOpened(i);
    setValue(null);
    setFb(null);
  }

  function submit() {
    if (opened == null) return;
    const q = qs[opened];
    const ok = checkAnswer(q, value);
    if (ok) {
      Sfx.ok(sound);
      const nCombo = combo + 1;
      setCombo(nCombo);
      setComboMax((m) => Math.max(m, nCombo));
      setCorrect((c) => c + 1);
      setFb("宝箱打开啦！✨");
    } else {
      Sfx.bad(sound);
      setCombo(0);
      setFb(`不对哦～ ${formatAnswer(q)}`);
      addMistake({ day, questionId: q.id, prompt: q.prompt, answer: formatAnswer(q), raw: q, type: q.type });
    }
    const nd = new Set(done);
    nd.add(opened);
    setTimeout(() => {
      setDone(nd);
      setOpened(null);
      setValue(null);
      setFb(null);
      if (nd.size >= qs.length) {
        const c = correct + (ok ? 1 : 0);
        const stars = c >= qs.length ? 3 : c >= qs.length * 0.6 ? 2 : c > 0 ? 1 : 0;
        Sfx.win(sound);
        onFinish({
          mode: "treasure",
          correct: c,
          total: qs.length,
          comboMax: ok ? Math.max(comboMax, combo + 1) : comboMax,
          coins: c * 3,
          stars,
          durationMs: Date.now() - start,
        });
      }
    }, 650);
  }

  const q = opened != null ? qs[opened] : null;

  return (
    <div className="mode treasure">
      <div className="mode-hud compact">
        <span>
          宝箱 {done.size}/{qs.length}
        </span>
        <span>🔥{combo}</span>
      </div>
      <div className="treasure-grid">
        {qs.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`tile ${done.has(i) ? "done" : ""} ${opened === i ? "open" : ""}`}
            onClick={() => openTile(i)}
          >
            {done.has(i) ? "📦" : "🗺️"}
          </button>
        ))}
      </div>
      {q && (
        <div className="card-q">
          <p className="big-prompt">{q.prompt}</p>
          {q.visual && <p className="visual">{q.visual}</p>}
          <QuestionBoard q={q} value={value} onChange={setValue} />
          <HintPanel q={q} />
          <button type="button" className="primary-btn" onClick={submit}>
            打开宝箱
          </button>
          {fb && <div className="feedback ok">{fb}</div>}
        </div>
      )}
    </div>
  );
}
