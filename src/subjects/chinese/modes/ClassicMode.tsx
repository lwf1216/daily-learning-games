import { useRef, useState } from "react";
import type { ModeResult, PlaylistItem } from "../engine/types";
import { checkAnswer, formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { addMistake } from "../engine/progress";
import { HintPanel } from "../components/HintPanel";
import { QuestionBoard, type BoardValue } from "../components/QuestionBoard";

export function ClassicMode({
  item,
  day,
  sound,
  onFinish,
  storySkin = false,
}: {
  item: PlaylistItem;
  day: number;
  sound: boolean;
  onFinish: (r: ModeResult) => void;
  storySkin?: boolean;
}) {
  const qs = item.questions;
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState<BoardValue>(null);
  const [correct, setCorrect] = useState(0);
  const correctRef = useRef(0);
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);
  const [comboMax, setComboMax] = useState(0);
  const comboMaxRef = useRef(0);
  const [fb, setFb] = useState<{ ok: boolean; text: string } | null>(null);
  const [locked, setLocked] = useState(false);
  const [start] = useState(() => Date.now());
  const q = qs[idx];

  if (!qs.length || !q) {
    return (
      <div className="mode classic">
        <p className="center muted">这一关暂时没有题目。</p>
        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            onFinish({
              mode: storySkin ? "story" : item.mode,
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

  function isEmpty(v: BoardValue): boolean {
    if (v == null || v === "") return true;
    if (Array.isArray(v)) return v.length === 0 || v.some((x) => x === "" || x == null);
    if (typeof v === "object") {
      const vals = Object.values(v as Record<string, string[]>);
      return vals.every((arr) => !arr?.length);
    }
    return false;
  }

  function check() {
    if (locked) return;
    if (isEmpty(value)) {
      setFb({ ok: false, text: "先选好答案再提交哦～" });
      return;
    }
    if (q.type === "make_word") {
      const need = q.blanks || (Array.isArray(q.answer) ? q.answer.length : 2);
      if (!Array.isArray(value) || value.filter(Boolean).length < need) {
        setFb({ ok: false, text: `请选出 ${need} 个词语再提交～` });
        return;
      }
    }
    if (q.type === "match" && q.left && Array.isArray(value) && value.length < q.left.length) {
      setFb({ ok: false, text: "把所有连线都配对完再提交～" });
      return;
    }
    const ok = checkAnswer(q, value);
    setLocked(true);
    if (ok) {
      Sfx.ok(sound);
      const nCorrect = correctRef.current + 1;
      correctRef.current = nCorrect;
      setCorrect(nCorrect);
      const nCombo = comboRef.current + 1;
      comboRef.current = nCombo;
      setCombo(nCombo);
      const nMax = Math.max(comboMaxRef.current, nCombo);
      comboMaxRef.current = nMax;
      setComboMax(nMax);
      if (nCombo >= 3) Sfx.combo(sound);
      setFb({ ok: true, text: `答对啦！✅ ${formatAnswer(q)}` });
    } else {
      Sfx.bad(sound);
      comboRef.current = 0;
      setCombo(0);
      setFb({ ok: false, text: `答错了～ 参考答案：${formatAnswer(q)}` });
      addMistake({ day, questionId: q.id, prompt: q.prompt, answer: formatAnswer(q), raw: q, type: q.type });
    }
  }

  function next() {
    if (idx + 1 >= qs.length) {
      const finalCorrect = correctRef.current;
      const finalComboMax = comboMaxRef.current;
      const stars =
        finalCorrect >= qs.length ? 3 : finalCorrect >= qs.length * 0.6 ? 2 : finalCorrect > 0 ? 1 : 0;
      Sfx.win(sound);
      onFinish({
        mode: storySkin ? "story" : item.mode,
        correct: finalCorrect,
        total: qs.length,
        comboMax: finalComboMax,
        coins: finalCorrect * 2 + (storySkin ? 5 : 0),
        stars,
        durationMs: Date.now() - start,
      });
      return;
    }
    setIdx((i) => i + 1);
    setValue(null);
    setFb(null);
    setLocked(false);
  }

  return (
    <div className={`mode classic ${storySkin ? "story" : ""}`}>
      {storySkin && (
        <div className="story-banner">
          <span className="story-mascot">📖</span>
          <div>
            <strong>课文故事园</strong>
            <p>读一读，点一点，帮小书虫找到正确的字词～</p>
          </div>
        </div>
      )}
      <div className="mode-hud compact">
        <span>
          {idx + 1}/{qs.length}
        </span>
        <span>
          🔥{combo}
          {comboMax > 1 ? `/${comboMax}` : ""}
        </span>
        <span className="muted tiny">对 {correct}</span>
      </div>
      <div className="card-q">
        {q.section && <div className="section-tag">{q.section}</div>}
        <p className="big-prompt">{q.prompt}</p>
        {q.visual && <p className="visual">{q.visual}</p>}
        <QuestionBoard q={q} value={value} onChange={setValue} disabled={locked} />
        <HintPanel q={q} />
      </div>
      {fb && <div className={`feedback ${fb.ok ? "ok" : "bad"}`}>{fb.text}</div>}
      <div className="action-row">
        {!locked ? (
          <button type="button" className="primary-btn" onClick={check}>
            提交
          </button>
        ) : (
          <button type="button" className="primary-btn" onClick={next}>
            {idx + 1 >= qs.length ? "完成" : "下一题"}
          </button>
        )}
      </div>
    </div>
  );
}
