import { useMemo, useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { buildChoices, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";

export function RaceMode({
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
  const steps = Number(item.meta?.steps ?? item.questions.length);
  const qs = item.questions;
  const [step, setStep] = useState(0);
  const [you, setYou] = useState(0);
  const [ai, setAi] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [msg, setMsg] = useState("");
  const [start] = useState(() => Date.now());

  const q = qs[step % Math.max(qs.length, 1)];
  const choices = useMemo(() => (q ? buildChoices(q, 4) : []), [q]);

  function finish(finalCorrect: number, finalYou: number, finalAi: number, cMax: number) {
    const stars = finalYou > finalAi ? 3 : finalYou === finalAi ? 2 : finalCorrect > 0 ? 1 : 0;
    Sfx.win(sound);
    onFinish({
      mode: "race",
      correct: finalCorrect,
      total: steps,
      comboMax: cMax,
      coins: finalCorrect * 2 + (finalYou > finalAi ? 8 : 0),
      stars,
      durationMs: Date.now() - start,
    });
  }

  function pick(_val: string, isCorrect: boolean) {
    if (!q) return;
    let nextYou = you;
    let nextAi = ai;
    let nextCorrect = correct;
    let nextCombo = combo;
    let nextMax = comboMax;

    if (isCorrect) {
      Sfx.ok(sound);
      nextYou += 1;
      nextCorrect += 1;
      nextCombo += 1;
      nextMax = Math.max(comboMax, nextCombo);
      if (nextCombo >= 3) Sfx.combo(sound);
      setMsg("冲！小书虫加速 🐛💨");
    } else {
      Sfx.bad(sound);
      nextAi += 1;
      nextCombo = 0;
      setMsg(`小鹿领先了～ 答案：${formatAnswer(q)}`);
      addMistake({ day, questionId: q.id, prompt: q.prompt, answer: formatAnswer(q), raw: q, type: q.type });
    }
    // AI 偶尔前进
    if (Math.random() < 0.45) nextAi += 1;

    setYou(nextYou);
    setAi(Math.min(nextAi, steps));
    setCorrect(nextCorrect);
    setCombo(nextCombo);
    setComboMax(nextMax);

    if (step + 1 >= steps || nextYou >= steps || nextAi >= steps) {
      setTimeout(() => finish(nextCorrect, nextYou, Math.min(nextAi, steps), nextMax), 500);
    } else {
      setTimeout(() => {
        setStep((s) => s + 1);
        setMsg("");
      }, 450);
    }
  }

  if (!q) return null;
  const youPct = Math.min(100, (you / steps) * 100);
  const aiPct = Math.min(100, (ai / steps) * 100);

  return (
    <div className="mode race">
      <div className="mode-hud compact">
        <span>
          {step + 1}/{steps}
        </span>
        <span>🔥{combo}</span>
      </div>
      <div className="track">
        <div className="lane">
          <span>🐛 你</span>
          <div className="bar">
            <div className="fill you" style={{ width: `${youPct}%` }} />
          </div>
        </div>
        <div className="lane">
          <span>🦌 AI</span>
          <div className="bar">
            <div className="fill ai" style={{ width: `${aiPct}%` }} />
          </div>
        </div>
      </div>
      <p className="big-prompt">{q.prompt}</p>
      {q.visual && <p className="visual">{q.visual}</p>}
      <div className="choice-grid">
        {choices.map((c) => (
          <button key={c.value} type="button" className="choice-pill" onClick={() => pick(c.value, c.correct)}>
            {c.label}
          </button>
        ))}
      </div>
      {msg && <div className="feedback ok">{msg}</div>}
      <HintPanel q={q} />
    </div>
  );
}
