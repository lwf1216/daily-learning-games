import { useMemo, useState, type CSSProperties } from "react";
import daysData from "./data/days.json";
import { DEFAULT_CONFIG, loadConfig, saveConfig, MODE_META } from "./data/config";
import { themeForDay, THEMES } from "./data/themes";
import { buildPlaylist, buildReviewFromMistakes } from "./engine/playlist";
import {
  clearMistakes,
  completedDaysCount,
  exportBackup,
  getDayProgress,
  getDayStatus,
  getModeStatus,
  importBackup,
  loadProgress,
  markModeDone,
  markModeStarted,
  resetProgress,
  setPrefs,
  statsSummary,
  type ModeStatus,
} from "./engine/progress";
import type { AppConfig, DayPack, ModeId, ModeResult, PlaylistItem, ProgressState } from "./engine/types";
import { LeafMode } from "./modes/LeafMode";
import { BalloonMode } from "./modes/BalloonMode";
import { ClassicMode } from "./modes/ClassicMode";
import { TrainMode } from "./modes/TrainMode";
import { MemoryMode } from "./modes/MemoryMode";
import { TreasureMode } from "./modes/TreasureMode";
import { BossMode } from "./modes/BossMode";
import { ReviewMode } from "./modes/ReviewMode";

type Screen = "home" | "map" | "day" | "play" | "result" | "practice" | "mistakes" | "parent";

const DAYS = daysData as DayPack[];

export interface ChineseSubjectAppProps {
  initialDay?: number;
  onDayComplete?: (subjectDay: number) => void;
}

export default function App({ initialDay = 1, onDayComplete }: ChineseSubjectAppProps) {
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

  const dayPack = useMemo(() => DAYS.find((d) => d.day === dayNum) ?? DAYS[0], [dayNum]);
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
    const pack = DAYS.find((d) => d.day === n) ?? DAYS[0];
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
    setProgress(loadProgress());
    setScreen("day");
  }

  function startPractice(mode: ModeId) {
    const pool = DAYS.flatMap((d) => d.sections.flatMap((s) => s.questions));
    const filtered =
      mode === "leaf" || mode === "boss"
        ? pool.filter((q) =>
            ["pinyin_pick", "tone_pick", "char_fill", "char_math", "choice", "sentence"].includes(q.type)
          )
        : mode === "memory"
          ? pool.filter((q) => q.type === "pinyin_pick")
          : mode === "train"
            ? pool.filter((q) =>
                ["multi_fill", "poem_fill", "make_word", "char_fill"].includes(q.type)
              )
            : pool;
    const base = filtered.length ? filtered : pool;
    const shuffled = [...base].sort(() => Math.random() - 0.5).slice(0, 12);
    const item: PlaylistItem = {
      id: `practice-${mode}`,
      mode,
      title: MODE_META[mode].title,
      emoji: MODE_META[mode].emoji,
      blurb: "练习场",
      questions: shuffled,
      meta:
        mode === "leaf"
          ? { seconds: 45, target: 8, readBufferMs: 150 }
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

  /** 错题只在错题本积累，从这里启动「错题小毛虫」 */
  function startMistakeReview() {
    const prog = loadProgress();
    const item = buildReviewFromMistakes(prog.mistakes);
    if (!item) {
      alert("还没有可练习的错题哦，先去闯关吧～");
      return;
    }
    setPlaylist([item]);
    setPlayIndex(0);
    setPracticeMode(true);
    setDayNum(prog.lastPlayedDay || 1);
    setScreen("play");
  }

  function updateConfig(partial: Partial<AppConfig>) {
    const next = {
      ...config,
      ...partial,
      modeEnabled: { ...config.modeEnabled, ...(partial.modeEnabled || {}) },
    };
    saveConfig(next);
    setConfig(next);
  }

  // 星语林改为浅紫星空，不再启用 dark 类（dark 会导致选项黑字+深底看不见）
  const darkTheme = false;
  const stats = statsSummary(progress);

  return (
    <div
      className={`app ${darkTheme ? "dark" : ""} ${focus ? "focus" : ""} theme-${theme.id}`}
      style={
        {
          background: focus ? "linear-gradient(180deg,#f0f4f8,#e2e8f0)" : theme.bg,
          ["--accent" as string]: focus ? "#3182ce" : theme.accent,
          ["--accent2" as string]: focus ? "#dd6b20" : theme.accent2,
          ["--card" as string]: focus ? "#ffffff" : theme.card,
          color: "#1a202c",
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
              <span className="float-leaf l1">🍃</span>
              <span className="float-leaf l2">🍂</span>
              <span className="float-leaf l3">🍃</span>
              <span className="float-leaf l4">🌿</span>
              <span className="bird b1">🐦</span>
              <span className="bird b2">🕊️</span>
            </div>
          )}

          <div className="home-card">
            <div className="badge pop-in">一升二 · 暑假每日一练 · 21 天</div>
            <h1 className="title-anime">
              <span className="title-line">语文森林</span>
              <span className="title-line accent">小书虫</span>
            </h1>
            <p className="sub pop-in delay-1">
              {focus ? "专注模式已开 · 动画已关闭" : "拼音 · 组词 · 课文 · 古诗 · 多玩法闯关"}
            </p>

            <div className={`mascot-stage ${focus ? "still" : ""}`}>
              <div className="mascot-shadow" />
              <div className="mascot-body">
                <span className="mascot-face">{focus ? "🐛" : theme.mascot}</span>
                <span className="mascot-leaf">🍃</span>
                <span className="mascot-book">📖</span>
              </div>
              {!focus && (
                <div className="speech-bubble">
                  嗨！一起去汉字森林探险吧～
                  <span className="bubble-tail" />
                </div>
              )}
            </div>

            <div className="stat-row pop-in delay-2">
              <div className="chip bounce-chip">🪙 {progress.coins}</div>
              <div className="chip bounce-chip d1">🌲 {completedDaysCount(progress)}/21</div>
              <div className="chip bounce-chip d2">🐛 {progress.mistakes.length}</div>
            </div>

            <button type="button" className="primary-btn lg cta-pulse" onClick={openMap}>
              <span className="cta-icon">🌳</span> 进入森林
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
              <span>🌷</span>
              <span>🍄</span>
              <span>🌼</span>
              <span>🦋</span>
              <span>🌸</span>
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
            <h2>森林地图</h2>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                if (confirm("重置所有进度？")) setProgress(resetProgress());
              }}
            >
              ♻️
            </button>
          </header>
          <p className="map-tip">可任意点选日期 · 进度保存在本机浏览器</p>
          <div className="status-legend">
            <span className="st-new">未开始</span>
            <span className="st-incomplete">未完成</span>
            <span className="st-done">已完成</span>
          </div>
          {THEMES.map((grove) => (
            <div key={grove.id} className="island-block" style={{ borderColor: grove.accent }}>
              <div className="island-head">
                <span className="island-emoji">{focus ? "📍" : grove.emoji}</span>
                <div>
                  <strong>{grove.name}</strong>
                  <div className="muted">{grove.tagline}</div>
                </div>
              </div>
              <div className="day-row">
                {DAYS.filter((d) => d.day >= grove.days[0] && d.day <= grove.days[1]).map((d) => {
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

      {screen === "day" && dayPack && (
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
          </p>
          <div className="day-jump">
            <button type="button" className="ghost-btn" disabled={dayNum <= 1} onClick={() => openDay(dayNum - 1)}>
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
                <button key={p.id} type="button" className={`play-card free ${statusClass(st)}`} onClick={() => startMode(i)}>
                  <div className="play-emoji">{p.emoji}</div>
                  <div className="play-info">
                    <strong>
                      {i + 1}. {p.title}
                    </strong>
                    <span>{p.blurb}</span>
                    <span className="qcount">
                      {p.questions.length} 题 · {p.mode}
                    </span>
                  </div>
                  <div className={`play-state-col ${statusClass(st)}`}>
                    <span className="play-state-icon">{st === "done" ? "✅" : st === "incomplete" ? "🟡" : "⚪"}</span>
                    <span className="play-state-text">{statusLabel(st)}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {playlist.length > 0 && getDayProgress(progress, dayNum).modesDone.length >= playlist.length && (
            <div className="chest">
              <div className="chest-box">🎁</div>
              <p>今日全部关卡已完成！小书虫吃饱啦～</p>
              <button type="button" className="primary-btn" onClick={openMap}>
                回森林地图
              </button>
            </div>
          )}
        </section>
      )}

      {screen === "play" && currentItem && (
        <section className="screen play">
          <header className="bar play-bar sticky-bar">
            <div />
            <h2>
              {currentItem.emoji} {currentItem.title}
            </h2>
            <div className="chip sm">第{dayNum}天</div>
          </header>
          {(currentItem.mode === "leaf" || currentItem.mode === "race") && (
            <LeafMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {currentItem.mode === "balloon" && (
            <BalloonMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
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
          {(currentItem.mode === "story" || currentItem.mode === "classic") && (
            <ClassicMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {currentItem.mode === "train" && (
            <TrainMode item={currentItem} day={dayNum} sound={progress.sound} onFinish={onModeFinish} />
          )}
          {/* 题目下方退出：随时可离开，不必做完 */}
          <div className="exit-below">
            <button
              type="button"
              className="exit-below-btn"
              onClick={() => {
                if (confirm("确定退出本关？不用做完也可以走～\n本关会记为「未完成」，之后还能再进。")) {
                  setScreen(practiceMode ? "practice" : "day");
                }
              }}
            >
              ← 退出本关
            </button>
            <p className="muted tiny center">选错玩法也不用做完，点这里就能回去</p>
          </div>
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
          <p className="muted center">自选玩法无限练</p>
          <div className="practice-grid">
            {(
              [
                ["leaf", "🍃", "吃树叶冲刺"],
                ["memory", "🃏", "拼音翻牌"],
                ["train", "🚂", "词语小火车"],
                ["classic", "✏️", "智慧答题卡"],
                ["boss", "🌳", "大树怪 Boss"],
              ] as const
            ).map(([mode, emoji, title]) => (
              <button key={mode} type="button" className="play-card" onClick={() => startPractice(mode)}>
                <div className="play-emoji">{emoji}</div>
                <div className="play-info">
                  <strong>{title}</strong>
                  <span>随时开练</span>
                </div>
              </button>
            ))}
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
          <p className="muted center">错题会在这里慢慢积累，不会插进每天闯关</p>
          {progress.mistakes.length >= 3 && (
            <p className="hint-text center">
              💡 老师建议：本周至少练 1～2 次「错题小毛虫」，和爸爸妈妈一起看错因哦
            </p>
          )}
          {progress.mistakes.length > 0 && (
            <button type="button" className="primary-btn lg" onClick={startMistakeReview}>
              🐛 错题小毛虫 · 练一练（{progress.mistakes.length}）
            </button>
          )}
          {!progress.mistakes.length && <p className="empty">还没有错题，超厉害！🌟</p>}
          {progress.mistakes.map((m) => (
            <div key={m.day + m.questionId} className="mistake">
              <div className="muted">第 {m.day} 天</div>
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
              进度保存在本机浏览器 localStorage，不上传云端。换设备需导出备份。
            </p>
            <h3>玩法开关</h3>
            <div className="mode-toggles">
              {(Object.keys(config.modeEnabled) as ModeId[])
                .filter((k) => !["race", "story", "balloon", "treasure", "review"].includes(k))
                .map((k) => (
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
                  {MODE_META[k].emoji} {MODE_META[k].title}
                </label>
              ))}
            </div>
            <p className="muted small">
              注：气球/寻宝已下线；错题只在错题本积累，从「错题本」启动小毛虫练习。
            </p>
            <h3>难度参数</h3>
            <div className="param-grid">
              {(
                [
                  ["leafSeconds", "冲刺秒数", 30, 120],
                  ["leafTarget", "冲刺目标", 5, 20],
                  ["classicBatch", "答题卡题量", 4, 10],
                  ["bossHp", "Boss 血量", 3, 8],
                ] as const
              ).map(([key, label, min, max]) => (
                <label key={key} className="param">
                  <span>
                    {label}：{config[key]}
                  </span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={config[key]}
                    onChange={(e) => updateConfig({ [key]: Number(e.target.value) })}
                  />
                </label>
              ))}
            </div>
            <h3>备份</h3>
            <div className="action-row wrap">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  const blob = new Blob([exportBackup()], { type: "application/json" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `chinese-bookworm-backup-${Date.now()}.json`;
                  a.click();
                }}
              >
                导出 JSON
              </button>
              <label className="ghost-btn file-btn">
                导入 JSON
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const text = await f.text();
                      setProgress(importBackup(text));
                      setConfig(loadConfig());
                      alert("导入成功");
                    } catch {
                      alert("导入失败，请检查文件");
                    }
                  }}
                />
              </label>
              <button
                type="button"
                className="ghost-btn danger"
                onClick={() => {
                  if (confirm("确定清空全部进度？")) setProgress(resetProgress());
                }}
              >
                清空进度
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  saveConfig({ ...DEFAULT_CONFIG, modeEnabled: { ...DEFAULT_CONFIG.modeEnabled } });
                  setConfig(loadConfig());
                }}
              >
                恢复默认设置
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
