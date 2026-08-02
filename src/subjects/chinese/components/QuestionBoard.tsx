import { useEffect, useMemo, useState } from "react";
import type { Question } from "../engine/types";
import { buildChoices } from "../engine/check";

export type BoardValue = unknown;

interface Props {
  q: Question;
  value: BoardValue;
  onChange: (v: BoardValue) => void;
  disabled?: boolean;
}

function asStringArray(v: BoardValue): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

export function QuestionBoard({ q, value, onChange, disabled }: Props) {
  const choices = useMemo(() => {
    if (q.options?.length || ["pinyin_pick", "tone_pick", "char_fill", "char_math", "choice", "sentence"].includes(q.type)) {
      return buildChoices(q, 6);
    }
    return [];
  }, [q]);

  // 用 q.id 强制重置子组件内部 state（避免空2残留）
  if (q.type === "match" && q.left && q.right) {
    return <MatchBoard key={q.id} q={q} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (q.type === "sort_group" && q.groups) {
    return <SortGroupBoard key={q.id} q={q} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (q.type === "make_word") {
    return <MakeWordBoard key={q.id} q={q} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (q.type === "multi_fill" || q.type === "poem_fill" || q.type === "order") {
    return <MultiFillBoard key={q.id} q={q} value={value} onChange={onChange} disabled={disabled} />;
  }

  return (
    <div className="choice-grid">
      {choices.map((c) => {
        const selected = String(value ?? "") === c.value || String(value ?? "") === c.label;
        return (
          <button
            key={c.value + c.label}
            type="button"
            disabled={disabled}
            className={`choice-pill ${selected ? "on" : ""}`}
            onClick={() => onChange(c.value)}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function MultiFillBoard({ q, value, onChange, disabled }: Props) {
  const blanks = q.blanks || (Array.isArray(q.answer) ? q.answer.length : 1);
  const bank = q.bank || q.options?.map((o) => (typeof o === "object" ? o.label : String(o))) || [];
  const selected = asStringArray(value);
  // 始终从空1开始；换题时 active 归零
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [q.id]);

  // 当前应填的空：优先第一个空位，而不是卡在空2
  useEffect(() => {
    if (selected.length === 0) {
      setActive(0);
      return;
    }
    const firstEmpty = selected.findIndex((x) => !x);
    if (firstEmpty >= 0 && (active >= blanks || selected[active])) {
      // 若当前 active 已填满或越界，跳到第一个空
      if (selected[active]) setActive(firstEmpty === -1 ? 0 : firstEmpty);
    }
    if (active === 0 && !selected[0]) return;
    // 初始无值时保证在 0
    if (!selected.some(Boolean) && active !== 0) setActive(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id, blanks]);

  function pick(word: string) {
    if (disabled) return;
    const next = [...selected];
    while (next.length < blanks) next.push("");
    // 写入当前 active；若 active 异常则落到第一个空
    let slot = active;
    if (slot < 0 || slot >= blanks || next[slot]) {
      const fe = next.findIndex((x) => !x);
      slot = fe >= 0 ? fe : 0;
    }
    // 默认一词一空；古诗等同词复用时允许同一词填多空
    if (!q.allowReuse) {
      const usedAt = next.indexOf(word);
      if (usedAt >= 0) next[usedAt] = "";
    }
    next[slot] = word;
    onChange(next);
    const ni = next.findIndex((x, i) => i > slot && !x);
    if (ni >= 0) setActive(ni);
    else {
      const anyEmpty = next.findIndex((x) => !x);
      setActive(anyEmpty >= 0 ? anyEmpty : Math.min(slot + 1, blanks - 1));
    }
  }

  function clearBlank(i: number) {
    if (disabled) return;
    const next = [...selected];
    while (next.length < blanks) next.push("");
    next[i] = "";
    onChange(next);
    setActive(i);
  }

  function focusBlank(i: number) {
    if (disabled) return;
    if (selected[i]) clearBlank(i);
    else setActive(i);
  }

  return (
    <div className="multi-fill">
      <div className="blank-row">
        {Array.from({ length: blanks }, (_, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            className={`blank-slot ${active === i ? "active" : ""} ${selected[i] ? "filled" : ""}`}
            onClick={() => focusBlank(i)}
          >
            {selected[i] || `空${i + 1}`}
          </button>
        ))}
      </div>
      <p className="muted tiny center">先点「空1」开始，再点词语卡片（当前：空{active + 1}）</p>
      <div className="choice-grid">
        {bank.map((w, bi) => {
          const used = !q.allowReuse && selected.includes(w);
          return (
            <button
              key={`${w}-${bi}`}
              type="button"
              disabled={disabled || used}
              className={`choice-pill ${used ? "used" : ""}`}
              onClick={() => pick(w)}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MakeWordBoard({ q, value, onChange, disabled }: Props) {
  const bank = q.bank || [];
  const selected = asStringArray(value);
  const need = q.blanks || (Array.isArray(q.answer) ? q.answer.length : 2);

  function toggle(word: string) {
    if (disabled) return;
    if (selected.includes(word)) {
      onChange(selected.filter((x) => x !== word));
      return;
    }
    if (selected.length >= need) return;
    onChange([...selected, word]);
  }

  return (
    <div>
      <p className="muted tiny center">
        为「{q.visual || "生字"}」选出 {need} 个词语（已选 {selected.length}/{need}）
      </p>
      <div className="choice-grid">
        {bank.map((w) => (
          <button
            key={w}
            type="button"
            disabled={disabled}
            className={`choice-pill ${selected.includes(w) ? "on" : ""}`}
            onClick={() => toggle(w)}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchBoard({ q, value, onChange, disabled }: Props) {
  const left = q.left || [];
  const right = q.right || [];
  const pairs = (Array.isArray(value) ? value : []) as [string, string][];
  const [selLeft, setSelLeft] = useState<string | null>(null);

  const usedLeft = new Set(pairs.map((p) => p[0]));
  const usedRight = new Set(pairs.map((p) => p[1]));

  function clickLeft(id: string) {
    if (disabled || usedLeft.has(id)) return;
    setSelLeft(id);
  }

  function clickRight(id: string) {
    if (disabled || usedRight.has(id) || !selLeft) return;
    const next = [...pairs, [selLeft, id] as [string, string]];
    onChange(next);
    setSelLeft(null);
  }

  function undo() {
    if (disabled || !pairs.length) return;
    onChange(pairs.slice(0, -1));
  }

  return (
    <div className="match-board">
      <div className="match-cols">
        <div className="match-col">
          {left.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled || usedLeft.has(item.id)}
              className={`choice-pill ${selLeft === item.id ? "on" : ""} ${usedLeft.has(item.id) ? "used" : ""}`}
              onClick={() => clickLeft(item.id)}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="match-col">
          {right.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled || usedRight.has(item.id) || !selLeft}
              className={`choice-pill ${usedRight.has(item.id) ? "used" : ""}`}
              onClick={() => clickRight(item.id)}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
      <div className="match-pairs">
        {pairs.map(([a, b]) => {
          const la = left.find((x) => x.id === a)?.text || a;
          const rb = right.find((x) => x.id === b)?.text || b;
          return (
            <span key={`${a}-${b}`} className="pair-chip">
              {la} ↔ {rb}
            </span>
          );
        })}
      </div>
      <button type="button" className="ghost-btn sm" disabled={disabled || !pairs.length} onClick={undo}>
        撤销上一对
      </button>
    </div>
  );
}

function SortGroupBoard({ q, value, onChange, disabled }: Props) {
  const groups = useMemo(() => q.groups || [], [q.groups]);
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const map = (value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, string[]>)
    : {}) as Record<string, string[]>;
  const assigned = new Set(Object.values(map).flat());
  const [activeGroup, setActiveGroup] = useState(groups[0]?.id || "");

  function place(item: string) {
    if (disabled || !activeGroup) return;
    const next: Record<string, string[]> = {};
    for (const g of groups) {
      next[g.id] = (map[g.id] || []).filter((x) => x !== item);
    }
    next[activeGroup] = [...(next[activeGroup] || []), item];
    onChange(next);
  }

  function remove(gid: string, item: string) {
    if (disabled) return;
    const next = { ...map, [gid]: (map[gid] || []).filter((x) => x !== item) };
    onChange(next);
  }

  return (
    <div className="sort-group">
      <div className="group-tabs">
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`choice-pill sm ${activeGroup === g.id ? "on" : ""}`}
            onClick={() => setActiveGroup(g.id)}
          >
            {g.name}（{(map[g.id] || []).length}）
          </button>
        ))}
      </div>
      <div className="choice-grid">
        {allItems.map((item) => {
          const used = assigned.has(item);
          return (
            <button
              key={item}
              type="button"
              disabled={disabled || used}
              className={`choice-pill ${used ? "used" : ""}`}
              onClick={() => place(item)}
            >
              {item}
            </button>
          );
        })}
      </div>
      <div className="group-buckets">
        {groups.map((g) => (
          <div key={g.id} className="bucket">
            <strong>{g.name}</strong>
            <div className="bucket-items">
              {(map[g.id] || []).map((it) => (
                <button key={it} type="button" className="pair-chip" onClick={() => remove(g.id, it)}>
                  {it} ×
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
