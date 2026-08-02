import { useMemo, useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { buildChoices, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";

type Balloon = {
  id: string;
  label: string;
  value: string;
  correct: boolean;
  delay: number;
  /** 气球外壳色（偏亮） */
  shell: string;
  /** 高光色 */
  shine: string;
};

/** 浅色气球 + 深色字，避免白字看不清、也避免糊进绿色底 */
const COLORS: Array<{ shell: string; shine: string }> = [
  { shell: "#fecdd3", shine: "#fff1f2" }, // 粉
  { shell: "#bfdbfe", shine: "#eff6ff" }, // 蓝
  { shell: "#fde68a", shine: "#fffbeb" }, // 黄
  { shell: "#ddd6fe", shine: "#f5f3ff" }, // 紫
  { shell: "#a7f3d0", shine: "#ecfdf5" }, // 薄荷绿
  { shell: "#fdba74", shine: "#fff7ed" }, // 橙
];

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
  const qs = item.questions.filter((q) => q.type !== "make_word" && q.type !== "multi_fill");
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [popped, setPopped] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);
  const [start] = useState(() => Date.now());
  const total = Math.max(qs.length, 1);

  const balloons: Balloon[] = useMemo(() => {
    const q = qs[round];
    if (!q) return [];
    let choices = buildChoices(q, 4);
    const corrects = choices.filter((c) => c.correct);
    if (corrects.length === 0 && choices.length) choices[0].correct = true;
    if (corrects.length > 1) {
      let kept = false;
      choices = choices.map((c) => {
        if (!c.correct) return c;
        if (!kept) {
          kept = true;
          return c;
        }
        return { ...c, correct: false };
      });
    }
    return choices.slice(0, 4).map((c, i) => ({
      id: `${round}-${i}`,
      label: c.label,
      value: c.value,
      correct: c.correct,
      delay: i * 0.12,
      shell: COLORS[i % COLORS.length].shell,
      shine: COLORS[i % COLORS.length].shine,
    }));
  }, [round, qs]);

  function pick(b: Balloon) {
    if (popped) return;
    setPopped(b.id);
    Sfx.tap(sound);
    const q = qs[round];
    if (!q) return;
    if (b.correct) {
      Sfx.ok(sound);
      setCorrect((c) => c + 1);
      setCombo((c) => {
        const n = c + 1;
        setComboMax((m) => Math.max(m, n));
        if (n >= 3) Sfx.combo(sound);
        return n;
      });
      setMsgOk(true);
      setMsg("砰！戳对啦 🎈");
    } else {
      Sfx.bad(sound);
      setCombo(0);
      setMsgOk(false);
      setMsg(`哎呀，正确答案是：${formatAnswer(q)}`);
      addMistake({ day, questionId: q.id, prompt: q.prompt, answer: formatAnswer(q), raw: q, type: q.type });
    }
    setTimeout(() => {
      if (round + 1 >= qs.length) {
        const finalC = correct + (b.correct ? 1 : 0);
        const stars = finalC >= qs.length ? 3 : finalC >= qs.length * 0.6 ? 2 : finalC > 0 ? 1 : 0;
        Sfx.win(sound);
        onFinish({
          mode: "balloon",
          correct: finalC,
          total: qs.length,
          comboMax: b.correct ? Math.max(comboMax, combo + 1) : comboMax,
          coins: finalC * 2,
          stars,
          durationMs: Date.now() - start,
        });
      } else {
        setRound((r) => r + 1);
        setPopped(null);
        setMsg("");
      }
    }, 850);
  }

  const q = qs[round];
  if (!q) {
    return (
      <div className="mode">
        <p className="center muted">暂无题目</p>
      </div>
    );
  }

  return (
    <div className="mode balloon">
      <div className="mode-hud compact">
        <span>
          {round + 1}/{total}
        </span>
        <span>🔥{combo}</span>
      </div>

      <div className="q-panel">
        <p className="big-prompt">{q.prompt}</p>
        {q.visual && <p className="visual">{q.visual}</p>}
      </div>

      <div className="balloon-sky">
        {balloons.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`balloon-item ${popped === b.id ? (b.correct ? "pop-ok" : "pop-bad") : ""} ${popped && popped !== b.id ? "dim" : ""}`}
            style={{ animationDelay: `${b.delay}s` }}
            onClick={() => pick(b)}
          >
            <span
              className="balloon-body"
              style={{
                background: `radial-gradient(circle at 30% 28%, ${b.shine} 0%, ${b.shell} 55%, color-mix(in srgb, ${b.shell} 70%, #64748b) 100%)`,
              }}
            >
              <span className="balloon-shine" aria-hidden />
              <span className="balloon-label">{b.label}</span>
            </span>
            <span className="balloon-knot" aria-hidden />
            <span className="balloon-string" aria-hidden />
          </button>
        ))}
      </div>
      {msg && <div className={`feedback ${msgOk ? "ok" : "bad"}`}>{msg}</div>}
      <HintPanel q={q} />
    </div>
  );
}
