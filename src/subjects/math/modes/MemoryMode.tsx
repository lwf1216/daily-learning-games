import { useMemo, useState } from "react";
import type { ModeResult, PlaylistItem, Question } from "../engine/types";
import { formatAnswer } from "../engine/check";
import { Sfx } from "../engine/audio";
import { HintPanel } from "../components/HintPanel";

type Card = {
  id: string;
  pairId: string;
  text: string;
  face: "expr" | "ans";
};

export function MemoryMode({
  item,
  sound,
  onFinish,
}: {
  item: PlaylistItem;
  day: number;
  sound: boolean;
  onFinish: (r: ModeResult) => void;
}) {
  const cards = useMemo(() => {
    const qs = item.questions.filter((q) => q.type === "calc" || typeof q.answer === "number").slice(0, 6);
    const list: Card[] = [];
    qs.forEach((q, i) => {
      const pairId = `p${i}`;
      list.push({ id: `${pairId}-a`, pairId, text: q.prompt.replace(/\s*=\s*$/, ""), face: "expr" });
      list.push({
        id: `${pairId}-b`,
        pairId,
        text: formatAnswer(q),
        face: "ans",
      });
    });
    // shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [item.questions]);

  const pairsTotal = cards.length / 2;
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [start] = useState(() => Date.now());

  if (!cards.length || pairsTotal <= 0) {
    return (
      <div className="mode memory">
        <p className="center muted">这一关暂时没有可配对的题目，请换一天或换一关。</p>
        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            onFinish({
              mode: "memory",
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

  function flip(id: string) {
    if (lock || flipped.includes(id) || matched.has(id)) return;
    Sfx.tap(sound);
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length < 2) return;

    setMoves((m) => m + 1);
    setLock(true);
    const [a, b] = next.map((fid) => cards.find((c) => c.id === fid)!);
    if (a.pairId === b.pairId) {
      Sfx.ok(sound);
      const nm = new Set(matched);
      nm.add(a.id);
      nm.add(b.id);
      setMatched(nm);
      const nc = correct + 1;
      setCorrect(nc);
      setFlipped([]);
      setLock(false);
      if (nm.size >= cards.length) {
        const stars = moves + 1 <= pairsTotal + 2 ? 3 : moves + 1 <= pairsTotal * 2 ? 2 : 1;
        Sfx.win(sound);
        onFinish({
          mode: "memory",
          correct: nc,
          total: pairsTotal,
          comboMax: nc,
          coins: nc * 4,
          stars,
          durationMs: Date.now() - start,
        });
      }
    } else {
      Sfx.bad(sound);
      setTimeout(() => {
        setFlipped([]);
        setLock(false);
      }, 700);
    }
  }

  return (
    <div className="mode memory">
      <div className="mode-hud compact">
        <span>
          配对 {correct}/{pairsTotal}
        </span>
        <span>步数 {moves}</span>
      </div>
      <p className="center muted">翻开两张牌，让算式和得数配对！</p>
      <div className="memory-grid">
        {cards.map((c) => {
          const open = flipped.includes(c.id) || matched.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              className={`mem-card ${open ? "open" : ""} ${matched.has(c.id) ? "matched" : ""} ${c.face}`}
              onClick={() => flip(c.id)}
            >
              <span className="mem-front">?</span>
              <span className="mem-back">{c.text}</span>
            </button>
          );
        })}
      </div>
      <HintPanel
        question={
          {
            id: "memory-tip",
            type: "match",
            prompt: "记忆翻牌配对",
            hint: "先翻开一张算式，心里算出得数，再去找对应数字；也可以先翻数字，再找算式。",
          } as Question
        }
      />
    </div>
  );
}
