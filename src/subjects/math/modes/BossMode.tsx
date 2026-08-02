import { useMemo, useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { buildChoices, checkAnswer, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake, recordCorrectAnswer } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";
import { wrongFeedbackInline } from "../engine/feedback";

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
  const qs = item.questions;
  const BOSS_HP = Math.max(1, Number(item.meta?.hp ?? 5) || 5);
  const [idx, setIdx] = useState(0);
  const [hp, setHp] = useState(BOSS_HP);
  const [hearts, setHearts] = useState(3);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("大魔王挡住了去路！");
  const [lock, setLock] = useState(false);
  const [start] = useState(() => Date.now());
  const [shake, setShake] = useState(false);

  const q = qs.length ? qs[idx % qs.length] : undefined;
  const choices = useMemo(() => (q ? buildChoices(q) : []), [q]);
  const choiceMode =
    q &&
    (q.type === "calc" || q.type === "compare" || q.type === "choice" || q.type === "true_false");

  if (!qs.length || !q) {
    return (
      <div className="mode boss">
        <p className="center muted">这一关暂时没有题目，请换一天或换一关。</p>
        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            onFinish({
              mode: "boss",
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

  function end(win: boolean, finalCorrect: number) {
    const stars = win ? (hearts >= 2 ? 3 : 2) : finalCorrect > 0 ? 1 : 0;
    Sfx.win(sound);
    onFinish({
      mode: "boss",
      correct: finalCorrect,
      total: BOSS_HP,
      comboMax,
      coins: finalCorrect * 6 + (win ? 20 : 0),
      stars,
      durationMs: Date.now() - start,
    });
  }

  function hit(ok: boolean) {
    if (lock) return;
    setLock(true);
    if (ok) {
      Sfx.ok(sound);
      recordCorrectAnswer(cur.id, day);
      const nc = correct + 1;
      setCorrect(nc);
      const nhp = hp - 1;
      setHp(nhp);
      setShake(true);
      setCombo((c) => {
        const n = c + 1;
        setComboMax((m) => Math.max(m, n));
        if (n >= 3) Sfx.combo(sound);
        return n;
      });
      setMsg(nhp <= 0 ? "魔王倒下了！🏆" : "命中！魔王血量 -1");
      setTimeout(() => {
        setShake(false);
        setInput("");
        if (nhp <= 0) end(true, nc);
        else {
          setIdx((i) => i + 1);
          setLock(false);
          setMsg("魔王还在咆哮…");
        }
      }, 650);
    } else {
      Sfx.bad(sound);
      setCombo(0);
      const nh = hearts - 1;
      setHearts(nh);
      setMsg(`被反击了！${wrongFeedbackInline(cur)}`);
      addMistake({
        day,
        questionId: cur.id,
        prompt: cur.prompt,
        answer: formatAnswer(cur),
        raw: cur,
        type: cur.type,
      });
      setTimeout(() => {
        setInput("");
        if (nh <= 0) end(false, correct);
        else {
          setIdx((i) => i + 1);
          setLock(false);
          setMsg("小心！还有机会");
        }
      }, 1600);
    }
  }

  return (
    <div className="mode boss">
      <div className="mode-hud">
        <div>{"❤️".repeat(hearts)}{"🖤".repeat(3 - hearts)}</div>
        <div>连击 🔥{combo}</div>
        <div>
          击倒 {correct}/{BOSS_HP}
        </div>
      </div>
      <div className={`boss-stage ${shake ? "hit" : ""}`}>
        <div className="boss-emoji">👾</div>
        <div className="boss-hp">
          <div className="progress-bar">
            <div className="bar-fill bad" style={{ width: `${(hp / BOSS_HP) * 100}%` }} />
          </div>
          <span>
            BOSS HP {hp}/{BOSS_HP}
          </span>
        </div>
        <p className="float-msg">{msg}</p>
      </div>
      <div className="card-q">
        <p className="big-prompt">{cur.prompt}</p>
        {choiceMode ? (
          <div className="choice-grid">
            {choices.map((c) => (
              <button
                key={c.label + c.value}
                type="button"
                className="choice-pill"
                disabled={lock}
                onClick={() => hit(c.correct)}
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
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && hit(checkAnswer(cur, input.trim()))}
            />
            <button
              type="button"
              className="primary-btn"
              disabled={lock}
              onClick={() => hit(checkAnswer(cur, input.trim()))}
            >
              攻击！
            </button>
          </>
        )}
        <HintPanel question={cur} />
      </div>
    </div>
  );
}
