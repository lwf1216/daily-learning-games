import { useMemo, useState } from "react";
import type { ModeResult, PlaylistItem, Question } from "../engine/types";
import { Sfx } from "../engine/audio";

type Card = { id: string; text: string; pair: string; kind: "pinyin" | "word" };

/** 只做 拼音 ↔ 字/词 配对 */
function pairFromQuestion(q: Question): { pinyin: string; word: string } | null {
  if (q.type === "pinyin_pick" && q.visual) {
    return { pinyin: q.visual, word: String(q.answer ?? "") };
  }
  // tone_pick: 从选项里取正确读音，正面取加点字/词
  if (q.type === "tone_pick") {
    const word =
      (q.visual && q.visual.length <= 6 ? q.visual : null) ||
      (q.prompt.match(/「(.+?)」/) || [])[1] ||
      (q.prompt.match(/“(.+?)”/) || [])[1] ||
      "";
    const py = String(q.answer ?? "");
    if (word && py) return { pinyin: py, word };
  }
  // match 题：若 left/right 像拼音-字
  if (q.type === "match" && q.left && q.right && Array.isArray(q.answer)) {
    // 不在翻牌里展开多对，跳过
    return null;
  }
  // 兜底：有 visual 拼音样式 + answer 字词
  if (q.visual && /^[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü\s]+$/i.test(q.visual.trim())) {
    const word = String(Array.isArray(q.answer) ? q.answer[0] : (q.answer ?? ""));
    if (word && word.length <= 6) return { pinyin: q.visual.trim(), word };
  }
  return null;
}

function buildCards(item: PlaylistItem): Card[] {
  const cards: Card[] = [];
  for (const q of item.questions) {
    if (cards.length >= 12) break; // 最多 6 对
    const pair = pairFromQuestion(q);
    if (!pair || !pair.pinyin || !pair.word) continue;
    // 避免重复字词
    if (cards.some((c) => c.kind === "word" && c.text === pair.word)) continue;
    const pairId = q.id;
    cards.push({ id: `${pairId}-py`, text: pair.pinyin, pair: pairId, kind: "pinyin" });
    cards.push({ id: `${pairId}-wd`, text: pair.word, pair: pairId, kind: "word" });
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

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
  const cards = useMemo(() => buildCards(item), [item]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [start] = useState(() => Date.now());
  const pairs = cards.length / 2;

  function flip(id: string) {
    if (open.length >= 2 || open.includes(id) || matched.has(id)) return;
    Sfx.tap(sound);
    const next = [...open, id];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((x) => cards.find((c) => c.id === x)!);
    if (a.pair === b.pair && a.kind !== b.kind) {
      Sfx.ok(sound);
      const nm = new Set(matched);
      nm.add(a.id);
      nm.add(b.id);
      setMatched(nm);
      setOpen([]);
      if (nm.size >= cards.length) {
        const stars = moves + 1 <= pairs + 2 ? 3 : moves + 1 <= pairs * 2 ? 2 : 1;
        Sfx.win(sound);
        onFinish({
          mode: "memory",
          correct: pairs,
          total: pairs,
          comboMax: pairs,
          coins: pairs * 3,
          stars,
          durationMs: Date.now() - start,
        });
      }
    } else {
      Sfx.bad(sound);
      setTimeout(() => setOpen([]), 700);
    }
  }

  if (!cards.length) {
    return (
      <div className="mode">
        <p className="center muted">今天的拼音配对题还不够，请换一天或先做「看拼音选词语」～</p>
        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            onFinish({ mode: "memory", correct: 0, total: 0, comboMax: 0, coins: 0, stars: 0, durationMs: 0 })
          }
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="mode memory">
      <div className="mode-hud compact">
        <span>
          配对 {matched.size / 2}/{pairs}
        </span>
        <span>步数 {moves}</span>
      </div>
      <p className="muted tiny center">翻开卡片：把拼音和对应的字/词配对</p>
      <div className="memory-grid">
        {cards.map((c) => {
          const show = open.includes(c.id) || matched.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              className={`mem-card hi-contrast ${c.kind} ${show ? "open" : ""} ${matched.has(c.id) ? "matched" : ""}`}
              onClick={() => flip(c.id)}
            >
              {show ? (
                <span className={`mem-text ${c.kind === "pinyin" ? "is-py" : "is-wd"}`}>{c.text}</span>
              ) : (
                <span className="mem-back-face">🍃</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
