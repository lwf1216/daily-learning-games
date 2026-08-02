import { useMemo, useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { buildChoices, checkAnswer, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";

export function BossMode({
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
  const hpMax = Number(item.meta?.hp ?? 5);
  const qs = item.questions;
  const [hp, setHp] = useState(hpMax);
  const [hearts, setHearts] = useState(3);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [msg, setMsg] = useState("");
  const [locked, setLocked] = useState(false);
  const [start] = useState(() => Date.now());

  const q = qs[idx % Math.max(qs.length, 1)];
  const choices = useMemo(() => (q ? buildChoices(q, 4) : []), [q]);

  function end(won: boolean, c: number, cMax: number) {
    Sfx.win(sound);
    onFinish({
      mode: "boss",
      correct: c,
      total: hpMax,
      comboMax: cMax,
      coins: c * 3 + (won ? 15 : 0),
      stars: won ? 3 : c >= hpMax * 0.5 ? 2 : c > 0 ? 1 : 0,
      durationMs: Date.now() - start,
    });
  }

  function pick(val: string, flagCorrect?: boolean) {
    if (!q || locked) return;
    setLocked(true);
    const ok = Boolean(flagCorrect) || checkAnswer(q, val);
    if (ok) {
      Sfx.ok(sound);
      const nh = hp - 1;
      const nc = correct + 1;
      const nCombo = combo + 1;
      const nMax = Math.max(comboMax, nCombo);
      setHp(nh);
      setCorrect(nc);
      setCombo(nCombo);
      setComboMax(nMax);
      setMsg("轰！大树怪掉叶子了！🌳");
      if (nCombo >= 3) Sfx.combo(sound);
      if (nh <= 0) {
        setTimeout(() => end(true, nc, nMax), 500);
        return;
      }
    } else {
      Sfx.bad(sound);
      const nh = hearts - 1;
      setHearts(nh);
      setCombo(0);
      setMsg(`哎唷！参考：${formatAnswer(q)}`);
      addMistake({ day, questionId: q.id, prompt: q.prompt, answer: formatAnswer(q), raw: q, type: q.type });
      if (nh <= 0) {
        setTimeout(() => end(false, correct, comboMax), 400);
        return;
      }
    }
    setTimeout(() => {
      setIdx((i) => i + 1);
      setMsg("");
      setLocked(false);
    }, 280);
  }

  if (!q) return null;

  return (
    <div className="mode boss">
      <div className="boss-head">
        <div className="boss-emoji">🌳😤</div>
        <div className="boss-hp">
          <div className="bar">
            <div className="fill bad" style={{ width: `${(hp / hpMax) * 100}%` }} />
          </div>
          <span>
            大树力气 {hp}/{hpMax}
          </span>
        </div>
        <div className="hearts">{"❤️".repeat(hearts)}{"🖤".repeat(3 - hearts)}</div>
      </div>
      <div className="q-panel">
        <p className="big-prompt">{q.prompt}</p>
        {q.visual && <p className="visual">{q.visual}</p>}
      </div>
      <div className="choice-grid">
        {choices.map((c) => (
          <button
            key={c.value + c.label}
            type="button"
            disabled={locked}
            className="choice-pill"
            onClick={() => pick(c.value, c.correct)}
          >
            {c.label}
          </button>
        ))}
      </div>
      {msg && <div className={`feedback ${msg.includes("参考") || msg.includes("哎唷") ? "bad" : "ok"}`}>{msg}</div>}
      <HintPanel q={q} />
    </div>
  );
}
