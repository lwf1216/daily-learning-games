import { useEffect, useMemo, useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { buildChoices, checkAnswer, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";

/**
 * 吃树叶冲刺：
 * - 限时 + 时间条
 * - 赛道进度
 * - 每题前短暂「先读题」缓冲，减少乱点
 */
export function LeafMode({
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
  const seconds = Number(item.meta?.seconds ?? 75);
  const target = Number(item.meta?.target ?? 8);
  // 默认几乎不锁，避免点选发闷；仍可在 meta 里调大
  const readBufferMs = Number(item.meta?.readBufferMs ?? 150);
  const qs = useMemo(
    () => item.questions.filter((q) => q.type !== "make_word" && q.type !== "multi_fill" && q.type !== "poem_fill"),
    [item.questions]
  );
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(seconds);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [msg, setMsg] = useState("");
  const [locked, setLocked] = useState(false);
  const [reading, setReading] = useState(true);
  const [start] = useState(() => Date.now());
  const [ended, setEnded] = useState(false);

  const q = qs[idx % Math.max(qs.length, 1)];
  const choices = useMemo(() => (q ? buildChoices(q, 4) : []), [q]);
  const timePct = Math.max(0, Math.min(100, (left / seconds) * 100));
  const urgent = left <= 10;
  const youPct = Math.min(100, (correct / Math.max(target, 1)) * 100);
  const aiSteps = Math.min(target, Math.floor(total * 0.55 + (seconds - left) * 0.08));
  const aiPct = Math.min(100, (aiSteps / Math.max(target, 1)) * 100);

  // 每题先读题缓冲
  useEffect(() => {
    if (ended) return;
    setReading(true);
    setLocked(true);
    const t = setTimeout(() => {
      setReading(false);
      setLocked(false);
    }, readBufferMs);
    return () => clearTimeout(t);
  }, [idx, ended, readBufferMs]);

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
    if (left === 0 && !ended) finish(correct, total, comboMax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  function finish(c: number, t: number, cMax: number) {
    if (ended) return;
    setEnded(true);
    const stars = c >= target ? 3 : c >= target * 0.6 ? 2 : c > 0 ? 1 : 0;
    const coins = c * 2 + (cMax >= 5 ? 10 : 0) + (c >= target ? 5 : 0);
    Sfx.win(sound);
    onFinish({
      mode: "leaf",
      correct: c,
      total: t,
      comboMax: cMax,
      coins,
      stars,
      durationMs: Date.now() - start,
    });
  }

  function pick(val: string, flagCorrect?: boolean) {
    if (ended || !q || locked || reading) return;
    setLocked(true);
    setTotal((t) => t + 1);
    let nextCorrect = correct;
    let nextCombo = combo;
    let nextMax = comboMax;
    const isCorrect = Boolean(flagCorrect) || checkAnswer(q, val);

    if (isCorrect) {
      Sfx.ok(sound);
      setFlash("ok");
      nextCorrect = correct + 1;
      nextCombo = combo + 1;
      nextMax = Math.max(comboMax, nextCombo);
      setCorrect(nextCorrect);
      setCombo(nextCombo);
      setComboMax(nextMax);
      if (nextCombo >= 3) Sfx.combo(sound);
      setMsg("答对啦！吃到一片树叶 🍃");
    } else {
      Sfx.bad(sound);
      setFlash("bad");
      nextCombo = 0;
      setCombo(0);
      setMsg(`不对哦～ 答案：${formatAnswer(q)}`);
      addMistake({ day, questionId: q.id, prompt: q.prompt, answer: formatAnswer(q), raw: q, type: q.type });
    }

    const doneTarget = isCorrect && nextCorrect >= target;
    setTimeout(() => {
      if (doneTarget) {
        finish(nextCorrect, total + 1, nextMax);
        return;
      }
      setIdx((i) => i + 1);
      setFlash(null);
      setMsg("");
      // locked 会在下一题 reading 缓冲里重新管理
    }, isCorrect ? 220 : 650);
  }

  if (!qs.length) {
    return (
      <div className="mode">
        <p className="center muted">暂无适合冲刺的单选题</p>
      </div>
    );
  }

  return (
    <div className={`mode leaf ${flash || ""}`}>
      <div className="mode-hud">
        <span className={`timer-label ${urgent ? "urgent" : ""}`}>⏱ {left}s</span>
        <span>
          目标 {correct}/{target}
        </span>
        <span>🔥{combo}</span>
      </div>

      <div className={`time-bar-wrap ${urgent ? "urgent" : ""}`} aria-label={`剩余 ${left} 秒`}>
        <div className="time-bar-fill" style={{ width: `${timePct}%` }} />
        <div className="time-bar-leaves" style={{ width: `${timePct}%` }}>
          {left > 0 && "🍃"}
        </div>
      </div>
      <p className="muted tiny center time-hint">
        {reading ? "先读题，再点答案～" : urgent ? "时间不多啦！想清楚再选～" : "树叶在变少，看清再选！"}
      </p>

      <div className="track compact-track">
        <div className="lane">
          <span>🐛 你</span>
          <div className="bar">
            <div className="fill you" style={{ width: `${youPct}%` }} />
          </div>
        </div>
        <div className="lane">
          <span>🦌 小鹿</span>
          <div className="bar">
            <div className="fill ai" style={{ width: `${aiPct}%` }} />
          </div>
        </div>
      </div>

      <div className="leaf-stage">
        <div className="leaf-pile" aria-hidden>
          {"🍃".repeat(Math.min(correct, 12)) || "🌱"}
        </div>
        <div className="q-panel">
          <p className="big-prompt">{q.prompt}</p>
          {q.visual && <p className="visual">{q.visual}</p>}
        </div>
        <div className={`choice-grid ${reading ? "is-reading" : ""}`}>
          {choices.map((c) => (
            <button
              key={c.value + c.label}
              type="button"
              disabled={locked || ended || reading}
              className={`choice-pill leaf-btn ${locked && c.correct ? "reveal-ok" : ""} ${locked && !c.correct && flash === "bad" ? "reveal-dim" : ""}`}
              onClick={() => pick(c.value, c.correct)}
            >
              {c.label}
            </button>
          ))}
        </div>
        {msg && !reading && <div className={`feedback ${flash === "ok" ? "ok" : "bad"}`}>{msg}</div>}
        <HintPanel q={q} />
      </div>
      {correct >= target && !ended && (
        <button type="button" className="primary-btn" onClick={() => finish(correct, total, comboMax)}>
          达成目标，收工！
        </button>
      )}
    </div>
  );
}
