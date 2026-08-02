import { useMemo, useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { buildChoices, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake, recordCorrectAnswer } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";
import { wrongFeedbackInline } from "../engine/feedback";

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
  const qs = item.questions;
  const steps = qs.length
    ? Math.min(Number(item.meta?.steps ?? 8), qs.length)
    : 0;
  const [idx, setIdx] = useState(0);
  const [you, setYou] = useState(0);
  const [ai, setAi] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lock, setLock] = useState(false);
  const [start] = useState(() => Date.now());
  const [feedback, setFeedback] = useState("");
  const [feedbackBad, setFeedbackBad] = useState(false);
  const [boost, setBoost] = useState<"you" | "ai" | null>(null);

  const choices = useMemo(() => {
    const q = qs[idx];
    return q ? buildChoices(q) : [];
  }, [idx, qs]);

  function end(finalYou: number, finalAi: number, finalCorrect: number) {
    const win = finalYou >= finalAi;
    const stars = win && finalCorrect === steps ? 3 : win ? 2 : finalCorrect > 0 ? 1 : 0;
    Sfx.win(sound);
    onFinish({
      mode: "race",
      correct: finalCorrect,
      total: steps,
      comboMax,
      coins: finalCorrect * 3 + (win ? 15 : 0),
      stars,
      durationMs: Date.now() - start,
    });
  }

  function choose(_value: string, isCorrect: boolean) {
    if (lock) return;
    setLock(true);
    const q = qs[idx];
    let nextYou = you;
    let nextAi = ai;
    let nextCorrect = correct;

    if (isCorrect) {
      Sfx.ok(sound);
      recordCorrectAnswer(q.id, day);
      nextYou = you + 1;
      setYou(nextYou);
      nextCorrect = correct + 1;
      setCorrect(nextCorrect);
      const nc = combo + 1;
      setCombo(nc);
      setComboMax((m) => Math.max(m, nc));
      if (nc >= 3) Sfx.combo(sound);
      setBoost("you");
      setFeedbackBad(false);
      setFeedback("加速！冲冲冲！");
      if (Math.random() > 0.45) {
        nextAi = Math.min(steps, ai + 1);
        setAi(nextAi);
      }
    } else {
      Sfx.bad(sound);
      setCombo(0);
      setBoost("ai");
      setFeedbackBad(true);
      setFeedback(wrongFeedbackInline(q));
      addMistake({ day, questionId: q.id, prompt: q.prompt, answer: formatAnswer(q), raw: q, type: q.type });
      nextAi = Math.min(steps, ai + 1);
      setAi(nextAi);
    }

    setTimeout(() => {
      setFeedback("");
      setFeedbackBad(false);
      setBoost(null);
      if (nextYou >= steps || nextAi >= steps || idx + 1 >= steps) {
        end(nextYou, nextAi, nextCorrect);
      } else {
        setIdx((i) => i + 1);
        setLock(false);
      }
    }, isCorrect ? 750 : 1600);
  }

  const q = qs[idx];
  // leave room for car width so it never clips off the end
  const youPct = steps ? Math.min(92, (you / steps) * 92) : 0;
  const aiPct = steps ? Math.min(92, (ai / steps) * 92) : 0;

  if (!qs.length || steps <= 0) {
    return (
      <div className="mode race race-xl">
        <p className="center muted">这一关暂时没有题目，请换一天或换一关。</p>
        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            onFinish({
              mode: "race",
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
    <div className="mode race race-xl">
      <div className="race-scoreboard">
        <div className="race-score you-score">
          <span className="race-avatar">🏎️</span>
          <div>
            <strong>我</strong>
            <span>
              {you} / {steps} 格
            </span>
          </div>
        </div>
        <div className="race-vs">VS</div>
        <div className="race-score ai-score">
          <span className="race-avatar">🚙</span>
          <div>
            <strong>小电脑</strong>
            <span>
              {ai} / {steps} 格
            </span>
          </div>
        </div>
      </div>

      <div className="track track-xl">
        <div className="lane lane-xl">
          <span className="lane-label lane-label-xl">我</span>
          <div className="road road-xl">
            <div className="road-marks" aria-hidden />
            {Array.from({ length: steps + 1 }, (_, i) => (
              <span key={i} className={`mile ${i <= you ? "passed" : ""}`} style={{ left: `${(i / steps) * 92}%` }} />
            ))}
            <div
              className={`car car-xl you ${boost === "you" ? "boost" : ""}`}
              style={{ left: `${youPct}%` }}
            >
              <span className="car-emoji">🏎️</span>
              <span className="car-tag">我</span>
            </div>
          </div>
          <span className="flag flag-xl">🏁</span>
        </div>
        <div className="lane lane-xl">
          <span className="lane-label lane-label-xl">电脑</span>
          <div className="road road-xl">
            <div className="road-marks" aria-hidden />
            {Array.from({ length: steps + 1 }, (_, i) => (
              <span key={i} className={`mile ${i <= ai ? "passed ai" : ""}`} style={{ left: `${(i / steps) * 92}%` }} />
            ))}
            <div
              className={`car car-xl ai ${boost === "ai" ? "boost" : ""}`}
              style={{ left: `${aiPct}%` }}
            >
              <span className="car-emoji">🚙</span>
              <span className="car-tag">电脑</span>
            </div>
          </div>
          <span className="flag flag-xl">🏁</span>
        </div>
      </div>

      <div className="mode-hud race-hud">
        <span className="race-hud-item">
          第 <b>{idx + 1}</b> / {steps} 题
        </span>
        <span className="race-hud-item combo">🔥 连击 {combo}</span>
      </div>

      <div className="race-q-card">
        <p className="race-q-label">算一算，点答案让小车前进！</p>
        <p className="race-prompt">{q?.prompt}</p>
        <div className="race-choices">
          {choices.map((c) => (
            <button
              key={c.value + c.label}
              type="button"
              className="race-choice-btn"
              disabled={lock}
              onClick={() => choose(c.value, c.correct)}
            >
              {c.label}
            </button>
          ))}
        </div>
        {feedback && (
          <p className={`race-fb ${boost === "you" ? "ok" : "bad"} ${feedbackBad ? "long" : ""}`}>
            {feedback}
          </p>
        )}
        {q && <HintPanel question={q} />}
      </div>
    </div>
  );
}
