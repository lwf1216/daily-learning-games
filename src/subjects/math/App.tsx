import { useMemo, useState, type CSSProperties } from "react";
import daysData from "./data/days.json";
import { DEFAULT_CONFIG, MODE_META, loadConfig, saveConfig } from "./data/config";
import { themeForDay, THEMES } from "./data/themes";
import { buildPlaylist, dayTier } from "./engine/playlist";
import {
  clearMistakes,
  completedDaysCount,
  getDayProgress,
  getDayStatus,
  getModeStatus,
  loadProgress,
  markModeDone,
  markModeStarted,
  mistakeClearRule,
  mistakeStreakLabel,
  resetProgress,
  setPrefs,
  statsSummary,
  type ModeStatus,
} from "./engine/progress";
import type { AppConfig, DayPack, ModeId, ModeResult, PlaylistItem, ProgressState } from "./engine/types";
import { SprintMode } from "./modes/SprintMode";
import { BalloonMode } from "./modes/BalloonMode";
import { RaceMode } from "./modes/RaceMode";
import { ClassicMode } from "./modes/ClassicMode";
import { TrainMode } from "./modes/TrainMode";
import { MemoryMode } from "./modes/MemoryMode";
import { TreasureMode } from "./modes/TreasureMode";
import { BossMode } from "./modes/BossMode";
import { ReviewMode } from "./modes/ReviewMode";

type Screen = "home" | "map" | "day" | "play" | "result" | "practice" | "mistakes" | "parent";

const DAYS = daysData as DayPack[];

export interface MathSubjectAppProps {
  initialDay?: number;
  onDayComplete?: (subjectDay: number) => void;
}

export default function App({ initialDay = 1, onDayComplete }: MathSubjectAppProps) {
  const startDay = Math.min(DAYS.length, Math.max(1, initialDay));
  const [screen, setScreen] = useState<Screen>("day");
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [config, setConfig] = useState<AppConfig>(() => loadConfig());
  const [dayNum, setDayNum] = useState(startDay);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(() => {
    const pack = DAYS.find((d) => d.day === startDay) ?? DAYS[0];
    return buildPlaylist(pack, loadConfig(), loadProgress(), DAYS);
  });
  const [playIndex, setPlayIndex] = useState(0);
  const [lastResult, setLastResult] = useState<ModeResult | null>(null);
  const [dayCoins, setDayCoins] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);

  const dayPack = useMemo(() => DAYS.find((d) => d.day === dayNum)!, [dayNum]);
  const theme = themeForDay(dayNum);
  const currentItem = playlist[playIndex];
  const focus = progress.focusMode;

  function refresh() {
    setProgress(loadProgress());
    setConfig(loadConfig());
  }

  function openMap() {
    refresh();
    setScreen("map");
  }

  function openDay(n: number) {
    const pack = DAYS.find((d) => d.day === n)!;
    const cfg = loadConfig();
    const prog = loadProgress();
    const pl = buildPlaylist(pack, cfg, prog, DAYS);
    setConfig(cfg);
    setDayNum(n);
    setPlaylist(pl);
    setPlayIndex(0);
    setDayCoins(0);
    setPracticeMode(false);
    setScreen("day");
  }

  function startMode(i: number) {
    const item = playlist[i];
    if (item && !practiceMode) {
      setProgress(markModeStarted(dayNum, item.id));
    }
    setPlayIndex(i);
    setScreen("play");
  }

  function statusLabel(s: ModeStatus): string {
    if (s === "done") return "已完成";
    if (s === "incomplete") return "未完成";
    return "未开始";
  }

  function statusClass(s: ModeStatus): string {
    if (s === "done") return "st-done";
    if (s === "incomplete") return "st-incomplete";
    return "st-new";
  }

  function onModeFinish(r: ModeResult) {
    setLastResult(r);
    if (!practiceMode) {
      const item = playlist[playIndex];
      const st = markModeDone(dayNum, item.id, r.stars, r.coins);
      setProgress(st);
      setDayCoins((c) => c + r.coins);
      if (playlist.length > 0 && getDayProgress(st, dayNum).modesDone.length >= playlist.length) {
        onDayComplete?.(dayNum);
      }
    }
    setScreen("result");
  }

  function continueAfterResult() {
    if (practiceMode) {
      setScreen("practice");
      return;
    }
    const fresh = loadProgress();
    setProgress(fresh);
    setScreen("day");
  }

  function startPractice(mode: ModeId) {
    const meta = MODE_META[mode];
    const pool = DAYS.flatMap((d) => d.sections.flatMap((s) => s.questions)).slice(0, 120);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 12);
    const oral = DAYS.flatMap((d) => d.sections[0]?.questions ?? []).sort(() => Math.random() - 0.5);
    const wordish = DAYS.flatMap((d) =>
      d.sections.flatMap((s) => s.questions.filter((q) => q.type === "word" || q.type === "expression"))
    ).sort(() => Math.random() - 0.5);
    const qs =
      mode === "memory"
        ? oral.filter((q) => q.type === "calc").slice(0, 6)
        : mode === "sprint" || mode === "race"
          ? oral.slice(0, 12)
          : mode === "treasure" || mode === "boss"
            ? [...wordish.slice(0, 4), ...shuffled].slice(0, 10)
            : shuffled;
    const item: PlaylistItem = {
      id: `practice-${mode}`,
      mode,
      title: meta.title,
      emoji: meta.emoji,
      blurb: `练习场 · ${meta.blurb}`,
      questions: qs.length ? qs : shuffled,
      meta:
        mode === "sprint"
          ? { seconds: 45, target: 8 }
          : mode === "race"
            ? { steps: 8 }
            : mode === "balloon"
              ? { rounds: 8 }
              : mode === "boss"
                ? { hp: 5 }
                : {},
    };
    setPlaylist([item]);
    setPlayIndex(0);
    setPracticeMode(true);
    setDayNum(progress.lastPlayedDay || 1);
    setScreen("play");
  }

  function updateConfig(partial: Partial<AppConfig>) {
    const next = { ...config, ...partial, modeEnabled: { ...config.modeEnabled, ...(partial.modeEnabled || {}) } };
    saveConfig(next);
    setConfig(next);
  }

  const darkTheme = theme.id === "space" && !focus;
  const stats = statsSummary(progress);

  return (
    <div
      className={`app ${darkTheme ? "dark" : ""} ${focus ? "focus" : ""}`}
      style={
        {
          background: focus ? "linear-gradient(180deg,#f0f4f8,#e2e8f0)" : theme.bg,
          ["--accent" as string]: focus ? "#3182ce" : theme.accent,
          ["--accent2" as string]: focus ? "#dd6b20" : theme.accent2,
          ["--card" as string]: focus ? "#ffffff" : theme.card,
        } as CSSProperties
      }
    >
      {screen === "home" && (
        <section className={`screen home cartoon-home ${focus ? "no-fx" : ""}`}>
          {!focus && (
            <div className="home-sky" aria-hidden>
              <span className="cloud c1">☁️</span>
              <span className="cloud c2">☁️</span>
              <span className="cloud c3">☁</span>
              <span className="sun">🌞</span>
              <span className="spark s1">✨</span>
              <span className="spark s2">⭐</span>
              <span className="spark s3">✨</span>
              <span className="float-num n1">7</span>
              <span className="float-num n2">+</span>
              <span className="float-num n3">3</span>
              <span className="float-num n4">=</span>
              <span className="float-num n5">10</span>
              <span className="float-num n6">🎈</span>
              <span className="bird b1">✈️</span>
              <span className="bird b2">🚀</span>
            </div>
          )}

          <div className="home-card">
            <div className="badge pop-in">一升二 · 暑假每日一练 · 30 天</div>
            <h1 className="title-anime">
              <span className="title-line">数学冒险</span>
              <span className="title-line accent">岛屿</span>
            </h1>
            <p className="sub pop-in delay-1">
              {focus ? "专注模式已开 · 动画已关闭" : "闪电口算 · 小车竞速 · 戳气球 · 主题岛屿"}
            </p>

            {!focus && (
              <div className="home-marquee" aria-hidden>
                <div className="home-marquee-track">
                  {[
                    "⚡ 闪电口算",
                    "🎈 戳气球",
                    "🏎️ 小车竞速",
                    "🃏 记忆翻牌",
                    "🗺️ 寻宝地图",
                    "👾 关底 Boss",
                    "📖 故事冒险",
                    "🐛 错题小怪物",
                    "🏖️ 阳光沙滩",
                    "🦕 恐龙森林",
                    "🚀 星际太空",
                    "🍬 糖果乐园",
                  ]
                    .concat([
                      "⚡ 闪电口算",
                      "🎈 戳气球",
                      "🏎️ 小车竞速",
                      "🃏 记忆翻牌",
                      "🗺️ 寻宝地图",
                      "👾 关底 Boss",
                      "📖 故事冒险",
                      "🐛 错题小怪物",
                      "🏖️ 阳光沙滩",
                      "🦕 恐龙森林",
                      "🚀 星际太空",
                      "🍬 糖果乐园",
                    ])
                    .map((t, i) => (
                      <span key={`${t}-${i}`} className="marquee-item">
                        {t}
                      </span>
                    ))}
                </div>
              </div>
            )}

            <div className={`mascot-stage ${focus ? "still" : ""}`}>
              <div className="mascot-shadow" />
              <div className="mascot-body">
                <span className="mascot-face">{focus ? "🧮" : theme.mascot}</span>
                <span className="mascot-leaf">⭐</span>
                <span className="mascot-book">🔢</span>
              </div>
              {!focus && (
                <div className="speech-bubble">
                  嗨！一起去数字岛屿探险吧～
                  <span className="bubble-tail" />
                </div>
              )}
            </div>

            <div className="stat-row pop-in delay-2">
              <div className="chip bounce-chip">🪙 {progress.coins}</div>
              <div className="chip bounce-chip d1">🏝️ {completedDaysCount(progress)}/30</div>
              <div className="chip bounce-chip d2">🐛 {progress.mistakes.length}</div>
            </div>

            <button type="button" className="primary-btn lg cta-pulse" onClick={openMap}>
              <span className="cta-icon">🏝️</span> 出发冒险
            </button>
            <button type="button" className="ghost-btn lg fun-ghost" onClick={() => setScreen("practice")}>
              🎮 练习场
            </button>

            <div className="home-links">
              <button type="button" className="link-pill" onClick={() => setScreen("mistakes")}>
                📝 错题本 ({progress.mistakes.length})
              </button>
              <button type="button" className="link-pill" onClick={() => setScreen("parent")}>
                👨‍👩‍👧 家长角
              </button>
            </div>

            <div className="pref-row">
              <label className="pref">
                <input
                  type="checkbox"
                  checked={progress.sound}
                  onChange={(e) => setProgress(setPrefs({ sound: e.target.checked }))}
                />
                音效
              </label>
              <label className="pref">
                <input
                  type="checkbox"
                  checked={progress.focusMode}
                  onChange={(e) => setProgress(setPrefs({ focusMode: e.target.checked }))}
                />
                专注模式
              </label>
            </div>
          </div>

          {!focus && (
            <div className="home-ground" aria-hidden>
              <span>🏖️</span>
              <span>🦕</span>
              <span>🚀</span>
              <span>🍬</span>
              <span>🏴‍☠️</span>
              <span>❄️</span>
            </div>
          )}
        </section>
      )}

      {screen === "map" && (
        <section className="screen map">
          <header className="bar">
            <button type="button" className="icon-btn" onClick={() => setScreen("home")}>
              🏠
            </button>
            <h2>主题岛屿</h2>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                if (confirm("重置所有进度？")) {
                  setProgress(resetProgress());
                }
              }}
            >
              ♻️
            </button>
          </header>
          <p className="map-tip">可任意点选日期 · 不强制按顺序</p>
          <div className="status-legend">
            <span className="st-new">未开始</span>
            <span className="st-incomplete">未完成</span>
            <span className="st-done">已完成</span>
          </div>
          {THEMES.map((isl) => (
            <div key={isl.id} className="island-block" style={{ borderColor: isl.accent }}>
              <div className="island-head">
                <span className="island-emoji">{focus ? "📍" : isl.emoji}</span>
                <div>
                  <strong>{isl.name}</strong>
                  <div className="muted">{isl.tagline}</div>
                </div>
              </div>
              <div className="day-row">
                {DAYS.filter((d) => d.day >= isl.days[0] && d.day <= isl.days[1]).map((d) => {
                  const plLen = buildPlaylist(d, config, progress, DAYS).length;
                  const st = getDayStatus(progress, d.day, plLen);
                  const dp = getDayProgress(progress, d.day);
                  return (
                    <button
                      key={d.day}
                      type="button"
                      className={`day-dot free ${statusClass(st)}`}
                      onClick={() => openDay(d.day)}
                      title={`${statusLabel(st)}（${dp.modesDone.length}/${plLen} 关）`}
                    >
                      <span className="n">{d.day}</span>
                      <span className={`s badge-st ${statusClass(st)}`}>{statusLabel(st)}</span>
                      <span className="day-progress-mini">
                        {dp.modesDone.length}/{plLen}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {screen === "day" && (
        <section className="screen day">
          <header className="bar">
            <button type="button" className="icon-btn" onClick={openMap}>
              ←
            </button>
            <h2>
              {theme.emoji} 第 {dayNum} 天
            </h2>
            <div className="chip sm">🪙 {dayCoins || getDayProgress(progress, dayNum).coinsEarned || 0}</div>
          </header>
          <p className="day-title">{dayPack.title}</p>
          <p className="muted center">
            {theme.name} · 共 {playlist.length} 关 · 可任意点选
            {dayTier(dayNum) === "late" && " · 后段加强"}
            {dayTier(dayNum) === "graduation" && " · 🎓 毕业验收"}
          </p>
          <div className="day-jump">
            <button
              type="button"
              className="ghost-btn"
              disabled={dayNum <= 1}
              onClick={() => openDay(dayNum - 1)}
            >
              ← 上一天
            </button>
            <select
              className="day-select"
              value={dayNum}
              onChange={(e) => openDay(Number(e.target.value))}
              aria-label="选择日期"
            >
              {DAYS.map((d) => {
                const n = buildPlaylist(d, config, progress, DAYS).length;
                return (
                  <option key={d.day} value={d.day}>
                    第 {d.day} 天 · {statusLabel(getDayStatus(progress, d.day, n))}
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              className="ghost-btn"
              disabled={dayNum >= DAYS.length}
              onClick={() => openDay(dayNum + 1)}
            >
              下一天 →
            </button>
          </div>
          <div className="playlist">
            {playlist.map((p, i) => {
              const st = getModeStatus(progress, dayNum, p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`play-card free ${statusClass(st)}`}
                  onClick={() => startMode(i)}
                >
                  <div className="play-emoji">{p.emoji}</div>
                  <div className="play-info">
                    <strong>
                      {i + 1}. {p.title}
                    </strong>
                    <span>{p.blurb}</span>
                    <span className="qcount">
                      {p.questions.length} 题 · {MODE_META[p.mode]?.title || p.title}
                    </span>
                  </div>
                  <div className={`play-state-col ${statusClass(st)}`}>
                    <span className="play-state-icon">
                      {st === "done" ? "✅" : st === "incomplete" ? "🟡" : "⚪"}
                    </span>
                    <span className="play-state-text">{statusLabel(st)}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {playlist.length > 0 &&
            getDayProgress(progress, dayNum).modesDone.length >= playlist.length && (
              <div className="chest">
                <div className="chest-box">🎁</div>
                <p>今日全部关卡已完成！</p>
                <button type="button" className="primary-btn" onClick={openMap}>
                  回岛屿地图
                </button>
              </div>
            )}
        </section>
      )}

      {screen === "play" && currentItem && (
        <section className="screen play">
          <header className="bar">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setScreen(practiceMode ? "practice" : "day")}
            >
              ←
            </button>
            <h2>
              {currentItem.emoji} {currentItem.title}
            </h2>
            <div />
          </header>
          {currentItem.mode === "sprint" && (
            <SprintMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {currentItem.mode === "balloon" && (
            <BalloonMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {currentItem.mode === "race" && (
            <RaceMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {currentItem.mode === "memory" && (
            <MemoryMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {currentItem.mode === "treasure" && (
            <TreasureMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {currentItem.mode === "boss" && (
            <BossMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {currentItem.mode === "review" && (
            <ReviewMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {currentItem.mode === "story" && (
            <ClassicMode
              item={currentItem}
              day={dayNum}
              sound={progress.sound}
              onFinish={onModeFinish}
              storySkin
            />
          )}
          {currentItem.mode === "train" && (
            <TrainMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {currentItem.mode === "classic" && (
            <ClassicMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
        </section>
      )}

      {screen === "result" && lastResult && (
        <section className="screen result">
          <div className="result-card">
            <div className="result-emoji">
              {lastResult.stars >= 3 ? "🏆" : lastResult.stars >= 2 ? "🎉" : "💪"}
            </div>
            <h2>{lastResult.stars >= 3 ? "完美通关！" : lastResult.stars >= 2 ? "表现很棒！" : "继续加油！"}</h2>
            <div className="stars-lg">{"⭐".repeat(lastResult.stars) || "☆"}</div>
            <p>
              答对 {lastResult.correct}/{lastResult.total} · 最高连击 {lastResult.comboMax}
            </p>
            <p className="coins-get">+{lastResult.coins} 金币</p>
            <button type="button" className="primary-btn lg" onClick={continueAfterResult}>
              继续
            </button>
          </div>
        </section>
      )}

      {screen === "practice" && (
        <section className="screen practice">
          <header className="bar">
            <button type="button" className="icon-btn" onClick={() => setScreen("home")}>
              ←
            </button>
            <h2>练习场</h2>
            <div />
          </header>
          <p className="muted center">自选玩法无限练（全部中文名）</p>
          <div className="practice-grid">
            {(
              [
                "sprint",
                "balloon",
                "race",
                "memory",
                "treasure",
                "boss",
                "story",
                "classic",
              ] as ModeId[]
            ).map((mode) => {
              const m = MODE_META[mode];
              return (
                <button key={mode} type="button" className="play-card" onClick={() => startPractice(mode)}>
                  <div className="play-emoji">{m.emoji}</div>
                  <div className="play-info">
                    <strong>{m.title}</strong>
                    <span>{m.blurb}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {screen === "mistakes" && (
        <section className="screen mistakes">
          <header className="bar">
            <button type="button" className="icon-btn" onClick={() => setScreen("home")}>
              ←
            </button>
            <h2>错题本</h2>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                if (confirm("清空错题？")) setProgress(clearMistakes());
              }}
            >
              🗑️
            </button>
          </header>
          <p className="muted center">
            闯关中会出现「错题小怪物」· {mistakeClearRule()}
          </p>
          {!progress.mistakes.length && <p className="empty">还没有错题，超厉害！🌟</p>}
          {progress.mistakes.map((m) => (
            <div key={m.day + m.questionId} className="mistake">
              <div className="mistake-head">
                <span className="muted">第 {m.day} 天</span>
                <span className="mistake-streak">{mistakeStreakLabel(m.correctStreak)}</span>
              </div>
              <div>{m.prompt}</div>
              <div className="ans">参考：{m.answer}</div>
            </div>
          ))}
        </section>
      )}

      {screen === "parent" && (
        <section className="screen parent">
          <header className="bar">
            <button type="button" className="icon-btn" onClick={() => setScreen("home")}>
              ←
            </button>
            <h2>家长角</h2>
            <div />
          </header>

          <div className="parent-panel">
              <div className="stat-row">
                <div className="chip">完成 {stats.completedDays} 天</div>
                <div className="chip">关卡 {stats.modesPlayed}</div>
                <div className="chip">错题 {stats.mistakes}</div>
                <div className="chip">金币 {stats.coins}</div>
              </div>

              <p className="muted small">
                地图与关卡已默认可自由点选，无需解锁。下方开关保留作兼容。
              </p>
              <label className="pref block">
                <input
                  type="checkbox"
                  checked={progress.freeMode}
                  onChange={(e) => setProgress(setPrefs({ freeMode: e.target.checked }))}
                />
                自由模式标记（历史选项）
              </label>

              <h3>玩法开关</h3>
              <div className="mode-toggles">
                {(Object.keys(config.modeEnabled) as ModeId[]).map((k) => (
                  <label key={k} className="pref">
                    <input
                      type="checkbox"
                      checked={config.modeEnabled[k] !== false}
                      onChange={(e) =>
                        updateConfig({
                          modeEnabled: { ...config.modeEnabled, [k]: e.target.checked },
                        })
                      }
                    />
                    {MODE_META[k]?.emoji} {MODE_META[k]?.title || k}
                  </label>
                ))}
              </div>
              <p className="muted small">
                难度分层：1–10 入门 · 11–20 进阶 · 21–29 后段加强（题量↑时限↓应用题↑）· 第 30
                天毕业验收。
              </p>

              <h3>难度参数</h3>
              <div className="param-grid">
                {(
                  [
                    ["sprintSeconds", "闪电秒数"],
                    ["sprintTarget", "闪电目标题数"],
                    ["raceSteps", "竞速步数"],
                    ["balloonRounds", "气球轮数"],
                    ["classicBatch", "经典题量"],
                    ["dailyGoalMinutes", "每日目标分钟"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="param">
                    {label}
                    <input
                      type="number"
                      value={config[key]}
                      onChange={(e) => updateConfig({ [key]: Number(e.target.value) || 0 })}
                    />
                  </label>
                ))}
              </div>

              <h3>浏览器本地存档</h3>
              <p className="muted small">
                进度、错题和家长设置会自动保存在当前浏览器中，不需要 PIN，也不会上传到云端。
                清除本网站的浏览器数据会同时清除记录，建议定期导出备份。
              </p>

              <h3>导出 / 导入</h3>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  const blob = new Blob([JSON.stringify({ progress, config }, null, 2)], {
                    type: "application/json",
                  });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "math-island-backup.json";
                  a.click();
                }}
              >
                导出备份 JSON
              </button>
              <label className="ghost-btn file-btn">
                导入备份
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const data = JSON.parse(await f.text());
                      if (data.progress) setProgress(setPrefs(data.progress));
                      if (data.config) {
                        saveConfig({ ...DEFAULT_CONFIG, ...data.config });
                        setConfig(loadConfig());
                      }
                      alert("导入成功");
                    } catch {
                      alert("导入失败");
                    }
                  }}
                />
              </label>
          </div>
        </section>
      )}
    </div>
  );
}
