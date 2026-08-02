import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ErrorInfo,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Coins,
  Download,
  Flame,
  House,
  Languages,
  RotateCcw,
  Settings2,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  PROGRAM_DAYS,
  SUBJECTS,
  completedDaysCount,
  exportAllProgress,
  importAllProgress,
  importLegacySubject,
  isDayComplete,
  isSubjectComplete,
  loadHubProgress,
  markSubjectComplete,
  resetHubProgress,
  setCurrentDay,
  setHubPreferences,
  subjectCompletedCount,
} from "./core/progress";
import type { HubProgress, SubjectDefinition, SubjectId } from "./core/types";
import "./App.css";

type HubScreen = "today" | "calendar" | "parent" | "subject-checkin" | "subject";

const MathModule = lazy(() =>
  import("./subjects/math/MathModule").then((module) => ({ default: module.MathModule }))
);
const ChineseModule = lazy(() =>
  import("./subjects/chinese/ChineseModule").then((module) => ({ default: module.ChineseModule }))
);
const EnglishModule = lazy(() =>
  import("./subjects/english/EnglishModule").then((module) => ({ default: module.EnglishModule }))
);

const SUBJECT_DEFINITIONS: Record<SubjectId, SubjectDefinition> = {
  math: {
    id: "math",
    title: "数学冒险岛",
    shortTitle: "数学",
    description: "口算、应用题与趣味闯关",
    color: "#2563eb",
    softColor: "#e7f1ff",
    totalLabel: "30 天 · 770 题",
  },
  chinese: {
    id: "chinese",
    title: "语文森林",
    shortTitle: "语文",
    description: "拼音、识字、组词与古诗",
    color: "#059669",
    softColor: "#e6f8ef",
    totalLabel: "21 天 + 9 天复习",
  },
  english: {
    id: "english",
    title: "Word Carnival",
    shortTitle: "英文",
    description: "听单词、玩游戏、开口跟读",
    color: "#d97706",
    softColor: "#fff4d6",
    totalLabel: "30 天 · 100 词",
  },
};

const HOME_SUBJECTS: SubjectId[] = ["chinese", "math", "english"];

function subjectIcon(subject: SubjectId, size = 26) {
  if (subject === "math") return <ChartNoAxesCombined size={size} strokeWidth={2.4} />;
  if (subject === "chinese") return <BookOpenText size={size} strokeWidth={2.4} />;
  return <Languages size={size} strokeWidth={2.4} />;
}

function chineseSourceDay(programDay: number): number {
  return programDay <= 21 ? programDay : 13 + (programDay - 22);
}

export default function App() {
  const [progress, setProgress] = useState<HubProgress>(() => loadHubProgress());
  const [screen, setScreen] = useState<HubScreen>("today");
  const [selectedDay, setSelectedDay] = useState(() => loadHubProgress().currentDay);
  const [activeSubject, setActiveSubject] = useState<SubjectId>("math");
  const [celebrationDay, setCelebrationDay] = useState<number | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importSubject, setImportSubject] = useState<SubjectId | "all">("all");
  const completedSubjects = SUBJECTS.filter((subject) =>
    isSubjectComplete(progress, selectedDay, subject)
  );

  useEffect(() => {
    const refresh = () => setProgress(loadHubProgress());
    window.addEventListener("hub-progress-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("hub-progress-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const browserWindow = window as typeof window & {
      render_game_to_text?: () => string;
      advanceTime?: (ms: number) => void;
    };
    browserWindow.render_game_to_text = () =>
      JSON.stringify({
        coordinateSystem: "DOM layout; no game-world coordinates",
        screen,
        selectedDay,
        activeSubject:
          screen === "subject" || screen === "subject-checkin" ? activeSubject : null,
        completedSubjects,
        fullCheckin: isDayComplete(progress, selectedDay),
        streak: progress.streak,
        coins: progress.coins,
      });
    browserWindow.advanceTime = () => undefined;
    return () => {
      delete browserWindow.render_game_to_text;
      delete browserWindow.advanceTime;
    };
  }, [activeSubject, completedSubjects, progress, screen, selectedDay]);

  function openSubject(subject: SubjectId) {
    setActiveSubject(subject);
    setScreen("subject-checkin");
    window.scrollTo({ top: 0, behavior: progress.preferences.focusMode ? "auto" : "smooth" });
  }

  function openSubjectDay(subject: SubjectId, day: number) {
    const next = setCurrentDay(day);
    setProgress(next);
    setSelectedDay(day);
    setActiveSubject(subject);
    setScreen("subject");
    window.scrollTo({ top: 0, behavior: progress.preferences.focusMode ? "auto" : "smooth" });
  }

  function completeSubject(subject: SubjectId, sourceDay: number, score?: number) {
    const before = loadHubProgress();
    const wasDayComplete = isDayComplete(before, selectedDay);
    const next = markSubjectComplete(subject, selectedDay, sourceDay, score);
    setProgress(next);
    setScreen("subject-checkin");
    if (!wasDayComplete && isDayComplete(next, selectedDay)) {
      setCelebrationDay(selectedDay);
    }
  }

  function chooseDay(day: number) {
    const next = setCurrentDay(day);
    setProgress(next);
    setSelectedDay(day);
    setScreen("today");
  }

  function downloadBackup() {
    const blob = new Blob([exportAllProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `class1-daily-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function openImport(subject: SubjectId | "all") {
    setImportSubject(subject);
    importInputRef.current?.click();
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      if (importSubject === "all") setProgress(importAllProgress(text));
      else importLegacySubject(importSubject, text);
      alert("导入成功。");
    } catch (error) {
      alert(error instanceof Error ? error.message : "导入失败，请检查备份文件。");
    }
  }

  function resetAll() {
    if (!confirm("确定清空统一打卡记录吗？三科原始练习进度不会被删除。")) return;
    const next = resetHubProgress();
    setProgress(next);
    setSelectedDay(1);
    setScreen("today");
  }

  if (screen === "subject") {
    const definition = SUBJECT_DEFINITIONS[activeSubject];
    const sourceDay = activeSubject === "chinese" ? chineseSourceDay(selectedDay) : selectedDay;
    return (
      <div className={`hub-app subject-route ${progress.preferences.focusMode ? "focus-mode" : ""}`}>
        <header className="subject-route-header">
          <button
            type="button"
            className="icon-button"
            onClick={() => setScreen("subject-checkin")}
            aria-label={`返回${definition.shortTitle}打卡`}
          >
            <ArrowLeft />
          </button>
          <div className="subject-route-title">
            <span
              className="subject-route-icon"
              style={{ color: definition.color, background: definition.softColor }}
            >
              {subjectIcon(activeSubject)}
            </span>
            <div>
              <span className="route-kicker">第 {selectedDay} 天 · 今日打卡</span>
              <h1>{definition.title}</h1>
            </div>
          </div>
          <span className={`route-status ${isSubjectComplete(progress, selectedDay, activeSubject) ? "done" : ""}`}>
            {isSubjectComplete(progress, selectedDay, activeSubject) ? <Check /> : <Circle />}
            {isSubjectComplete(progress, selectedDay, activeSubject) ? "已完成" : "进行中"}
          </span>
        </header>
        {activeSubject === "chinese" && selectedDay > 21 && (
          <div className="review-notice">
            第 {selectedDay} 天为语文复习日，今天复习原课程第 {sourceDay} 天内容。
          </div>
        )}
        <main className="subject-route-content" key={`${activeSubject}-${selectedDay}`}>
          <SubjectErrorBoundary subject={definition.shortTitle}>
            <Suspense fallback={<SubjectLoading subject={definition.shortTitle} />}>
              {activeSubject === "math" && (
                <MathModule
                  programDay={selectedDay}
                  onComplete={(day) => completeSubject("math", day)}
                />
              )}
              {activeSubject === "chinese" && (
                <ChineseModule
                  programDay={selectedDay}
                  sourceDay={sourceDay}
                  onComplete={(day) => completeSubject("chinese", day)}
                />
              )}
              {activeSubject === "english" && (
                <EnglishModule
                  programDay={selectedDay}
                  onComplete={(day, score) => completeSubject("english", day, score)}
                />
              )}
            </Suspense>
          </SubjectErrorBoundary>
        </main>
      </div>
    );
  }

  return (
    <div className={`hub-app ${progress.preferences.focusMode ? "focus-mode" : ""}`}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      {screen !== "today" && (
        <header className="hub-header">
          <button type="button" className="brand" onClick={() => setScreen("today")}>
            <span className="brand-mark"><Sparkles /></span>
            <span>
              <strong>语数英学习乐园</strong>
              <small>Class 1 Learning World</small>
            </span>
          </button>
          <div className="header-stats" aria-label="学习统计">
            <span><Flame /> {progress.streak} 天</span>
            <span><Coins /> {progress.coins}</span>
          </div>
        </header>
      )}

      <main className={`hub-main ${screen === "today" ? "home-main" : ""}`}>
        {screen === "today" && (
          <TodayPage
            progress={progress}
            selectedDay={selectedDay}
            onOpenSubject={openSubject}
            onOpenCalendar={() => setScreen("calendar")}
            onOpenParent={() => setScreen("parent")}
          />
        )}
        {screen === "calendar" && (
          <CalendarPage
            progress={progress}
            selectedDay={selectedDay}
            onChooseDay={chooseDay}
          />
        )}
        {screen === "subject-checkin" && (
          <SubjectCheckinPage
            progress={progress}
            selectedDay={selectedDay}
            subject={activeSubject}
            onOpenSubjectDay={openSubjectDay}
          />
        )}
        {screen === "parent" && (
          <ParentPage
            progress={progress}
            onDownload={downloadBackup}
            onImport={openImport}
            onReset={resetAll}
            onSetPreferences={(partial) => setProgress(setHubPreferences(partial))}
          />
        )}
      </main>

      {screen !== "today" && (
        <nav className="bottom-nav" aria-label="主要导航">
          <NavButton active={false} label="主页" icon={<House />} onClick={() => setScreen("today")} />
          <NavButton active={screen === "calendar"} label="30 天" icon={<CalendarDays />} onClick={() => setScreen("calendar")} />
          <NavButton active={screen === "parent"} label="家长" icon={<Settings2 />} onClick={() => setScreen("parent")} />
        </nav>
      )}

      <input
        ref={importInputRef}
        className="sr-only"
        type="file"
        accept="application/json,.json"
        onChange={importBackup}
      />

      {celebrationDay != null && (
        <div className="celebration-backdrop" role="presentation">
          <section className="celebration-card" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
            <span className="celebration-icon"><CheckCircle2 /></span>
            <span className="eyebrow">Daily check-in complete</span>
            <h2 id="celebration-title">第 {celebrationDay} 天三科打卡成功！</h2>
            <p>数学、语文和英文全部完成，获得 30 枚总打卡金币。</p>
            <div className="celebration-stats">
              <span><Flame /> 连续 {progress.streak} 天</span>
              <span><Coins /> 共 {progress.coins} 枚</span>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setCelebrationDay(null);
                setSelectedDay(progress.currentDay);
              }}
            >
              进入第 {Math.min(PROGRAM_DAYS, progress.currentDay)} 天
              <ChevronRight />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function TodayPage({
  progress,
  selectedDay,
  onOpenSubject,
  onOpenCalendar,
  onOpenParent,
}: {
  progress: HubProgress;
  selectedDay: number;
  onOpenSubject: (subject: SubjectId) => void;
  onOpenCalendar: () => void;
  onOpenParent: () => void;
}) {
  return (
    <div className="learning-portal">
      <section className="portal-intro" aria-labelledby="portal-title">
        <div className="portal-intro-top">
          <div className="portal-brand">
            <span className="portal-brand-mark"><Sparkles /></span>
            <span>
              <strong>Class 1 Learning World</strong>
              <small>一年级语数英学习乐园</small>
            </span>
          </div>
          <div className="portal-utility-actions">
            <button type="button" onClick={onOpenCalendar}>
              <CalendarDays />
              30 天记录
            </button>
            <button type="button" onClick={onOpenParent}>
              <Settings2 />
              家长设置
            </button>
          </div>
        </div>
        <div className="portal-intro-copy">
          <span className="eyebrow">三个科目 · 三种独立游戏体验</span>
          <h1 id="portal-title">把每天的学习，变成一场好玩的冒险</h1>
          <p>
            为一年级孩子准备的语文、数学与英文互动课程。选择一门科目，
            就会进入它自己的学习世界、游戏画面和闯关方式。
          </p>
          <div className="portal-highlights" aria-label="项目特点">
            <span><CheckCircle2 />独立科目风格</span>
            <span><CheckCircle2 />游戏化练习</span>
            <span><CheckCircle2 />浏览器自动保存</span>
          </div>
        </div>
      </section>

      <section className="portal-subject-section" aria-labelledby="subject-entry-title">
        <div className="portal-section-heading">
          <div>
            <span className="eyebrow">Choose your world</span>
            <h2 id="subject-entry-title">选择今天想进入的科目</h2>
          </div>
          <p>每一科都是完整、独立的学习游戏</p>
        </div>
        <div className="subject-portal-grid">
          {HOME_SUBJECTS.map((subject) => (
            <SubjectCard
              key={subject}
              subject={subject}
              day={selectedDay}
              done={isSubjectComplete(progress, selectedDay, subject)}
              onClick={() => onOpenSubject(subject)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SubjectCard({
  subject,
  day,
  done,
  onClick,
}: {
  subject: SubjectId;
  day: number;
  done: boolean;
  onClick: () => void;
}) {
  const definition = SUBJECT_DEFINITIONS[subject];
  const detail =
    subject === "chinese" && day > 21
      ? `复习原课程第 ${chineseSourceDay(day)} 天`
      : definition.totalLabel;
  const features =
    subject === "chinese"
      ? ["拼音识字", "组词古诗"]
      : subject === "math"
        ? ["口算应用", "竞速闯关"]
        : ["听说词汇", "拼写游戏"];
  return (
    <button
      type="button"
      className={`subject-portal-card subject-${subject} ${done ? "done" : ""}`}
      style={{ "--subject-color": definition.color, "--subject-soft": definition.softColor } as React.CSSProperties}
      onClick={onClick}
      aria-label={`进入${definition.shortTitle}打卡页面，选择学习日期`}
    >
      <span className="portal-card-visual" aria-hidden="true">
        <span className="portal-card-orbit portal-card-orbit-one" />
        <span className="portal-card-orbit portal-card-orbit-two" />
        <span className="portal-card-main-icon">{subjectIcon(subject, 48)}</span>
        <span className="portal-card-spark"><Sparkles /></span>
      </span>
      <span className="portal-card-copy">
        <span className="portal-card-kicker">{definition.shortTitle}独立课程</span>
        <strong>{definition.title}</strong>
        <small>{definition.description}</small>
        <span className="portal-feature-list">
          {features.map((feature) => <span key={feature}>{feature}</span>)}
        </span>
      </span>
      <span className="portal-card-footer">
        <span>
          <small>{detail}</small>
          <strong>{done ? "今日已打卡 · 选择日期" : `选择${definition.shortTitle}打卡日期`}</strong>
        </span>
        <span className="portal-card-arrow">
          <ChevronRight />
        </span>
      </span>
    </button>
  );
}

function CalendarPage({
  progress,
  selectedDay,
  onChooseDay,
}: {
  progress: HubProgress;
  selectedDay: number;
  onChooseDay: (day: number) => void;
}) {
  return (
    <section className="calendar-page">
      <div className="page-title">
        <span className="page-icon"><CalendarDays /></span>
        <div>
          <span className="eyebrow">30-day overview</span>
          <h1>三科打卡总览</h1>
          <p>每一天分别显示语文、数学和英文的完成状态；亮起哪科的颜色点，就代表当天已完成哪一科。</p>
        </div>
      </div>

      <div className="calendar-legend" aria-label="科目颜色说明">
        {HOME_SUBJECTS.map((subject) => (
          <span key={subject}>
            <i className={`dot ${subject}`} />
            {SUBJECT_DEFINITIONS[subject].shortTitle}
          </span>
        ))}
        <span><CheckCircle2 /> 三科完成</span>
      </div>

      <div className="day-grid">
        {Array.from({ length: PROGRAM_DAYS }, (_, index) => index + 1).map((day) => {
          const done = isDayComplete(progress, day);
          const completedNames = HOME_SUBJECTS
            .filter((subject) => isSubjectComplete(progress, day, subject))
            .map((subject) => SUBJECT_DEFINITIONS[subject].shortTitle);
          const statusText =
            completedNames.length > 0 ? `已完成${completedNames.join("、")}` : "尚未完成科目";
          return (
            <button
              type="button"
              key={day}
              className={`${done ? "done" : ""} ${selectedDay === day ? "selected" : ""}`}
              onClick={() => onChooseDay(day)}
              aria-label={`第 ${day} 天，${statusText}`}
            >
              <span>Day</span>
              <strong>{day}</strong>
              <div className="day-subject-dots" aria-hidden="true">
                {HOME_SUBJECTS.map((subject) => (
                  <i
                    key={subject}
                    className={`${subject} ${
                      isSubjectComplete(progress, day, subject) ? "active" : ""
                    }`}
                  />
                ))}
              </div>
              {done && <CheckCircle2 aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SubjectCheckinPage({
  progress,
  selectedDay,
  subject,
  onOpenSubjectDay,
}: {
  progress: HubProgress;
  selectedDay: number;
  subject: SubjectId;
  onOpenSubjectDay: (subject: SubjectId, day: number) => void;
}) {
  const definition = SUBJECT_DEFINITIONS[subject];
  const completedCount = Array.from({ length: PROGRAM_DAYS }, (_, index) => index + 1)
    .filter((day) => isSubjectComplete(progress, day, subject)).length;
  const completionPercent = Math.round((completedCount / PROGRAM_DAYS) * 100);

  return (
    <section
      className="calendar-page subject-checkin-page"
      style={{ "--subject-color": definition.color, "--subject-soft": definition.softColor } as React.CSSProperties}
    >
      <div className="page-title">
        <span
          className="page-icon subject-page-icon"
          style={{ background: definition.color }}
        >
          {subjectIcon(subject, 30)}
        </span>
        <div>
          <span className="eyebrow">{definition.shortTitle} check-in</span>
          <h1>{definition.shortTitle}打卡</h1>
          <p>先选择想练习的日期，再进入原来的{definition.shortTitle}题目和游戏。</p>
        </div>
      </div>

      <section className="subject-checkin-overview" aria-label={`${definition.shortTitle}打卡进度`}>
        <span className="subject-checkin-overview-icon">{subjectIcon(subject, 34)}</span>
        <div className="subject-checkin-overview-copy">
          <span className="eyebrow">{definition.shortTitle}专属打卡</span>
          <h2>{definition.title}</h2>
          <p>
            已完成 <strong>{completedCount}</strong> 天，还剩 {PROGRAM_DAYS - completedCount} 天。
            点击下方任意一天，继续进入原来的{definition.shortTitle}游戏。
          </p>
        </div>
        <strong className="subject-checkin-percent">{completionPercent}%</strong>
        <div
          className="subject-checkin-progress"
          role="progressbar"
          aria-label={`${definition.shortTitle}完成进度`}
          aria-valuemin={0}
          aria-valuemax={PROGRAM_DAYS}
          aria-valuenow={completedCount}
        >
          <i style={{ width: `${completionPercent}%` }} />
        </div>
      </section>

      <div className="subject-day-heading">
        <div>
          <span className="eyebrow">Choose a day</span>
          <h2>选择{definition.shortTitle}打卡日</h2>
        </div>
        <span><CheckCircle2 /> 已打卡</span>
      </div>

      <div className="subject-day-grid" aria-label={`${definition.shortTitle}30 天打卡日期`}>
        {Array.from({ length: PROGRAM_DAYS }, (_, index) => index + 1).map((day) => {
          const done = isSubjectComplete(progress, day, subject);
          const isReview = subject === "chinese" && day > 21;
          return (
            <button
              type="button"
              key={day}
              className={`${done ? "done" : ""} ${selectedDay === day ? "selected" : ""}`}
              onClick={() => onOpenSubjectDay(subject, day)}
              aria-label={`${definition.shortTitle}第 ${day} 天，${
                done ? "已打卡，可再次练习" : isReview ? "复习日，进入打卡" : "进入打卡"
              }`}
            >
              <span className="subject-day-label">Day</span>
              <strong>{day}</strong>
              <small>{done ? "已打卡" : isReview ? "复习日 · 进入" : "进入打卡"}</small>
              {done ? <CheckCircle2 aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ParentPage({
  progress,
  onDownload,
  onImport,
  onReset,
  onSetPreferences,
}: {
  progress: HubProgress;
  onDownload: () => void;
  onImport: (subject: SubjectId | "all") => void;
  onReset: () => void;
  onSetPreferences: (partial: Partial<HubProgress["preferences"]>) => void;
}) {
  const completeDays = completedDaysCount(progress);
  return (
    <section className="parent-page">
      <div className="page-title">
        <span className="page-icon"><Settings2 /></span>
        <div>
          <span className="eyebrow">Parent dashboard</span>
          <h1>家长角</h1>
          <p>所有记录仅保存在当前浏览器，不需要 PIN，也不会上传学习数据。</p>
        </div>
      </div>

      <div className="parent-stat-grid">
        <StatCard label="完成天数" value={`${completeDays}/${PROGRAM_DAYS}`} note="三科全部完成" icon={<CheckCircle2 />} />
        <StatCard label="连续打卡" value={`${progress.streak} 天`} note={`最佳 ${progress.bestStreak} 天`} icon={<Flame />} />
        <StatCard label="总金币" value={String(progress.coins)} note="鼓励性奖励" icon={<Coins />} />
        <StatCard label="当前课程" value={`第 ${progress.currentDay} 天`} note="可在日历自由调整" icon={<CalendarDays />} />
      </div>

      <section className="parent-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Subject progress</span>
            <h2>三科完成情况</h2>
          </div>
        </div>
        <div className="subject-progress-list">
          {SUBJECTS.map((subject) => {
            const count = subjectCompletedCount(progress, subject);
            const definition = SUBJECT_DEFINITIONS[subject];
            return (
              <div key={subject}>
                <span className="subject-mini-icon" style={{ color: definition.color, background: definition.softColor }}>
                  {subjectIcon(subject, 20)}
                </span>
                <span>
                  <strong>{definition.shortTitle}</strong>
                  <small>{count}/{PROGRAM_DAYS} 天</small>
                </span>
                <div><i style={{ width: `${(count / PROGRAM_DAYS) * 100}%`, background: definition.color }} /></div>
                <b>{Math.round((count / PROGRAM_DAYS) * 100)}%</b>
              </div>
            );
          })}
        </div>
      </section>

      <div className="parent-columns">
        <section className="parent-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Backup & migration</span>
              <h2>备份与旧记录迁移</h2>
            </div>
          </div>
          <p>完整备份包含统一打卡和三科学习进度。旧网站备份可以按科目单独导入。</p>
          <div className="parent-actions">
            <button type="button" className="primary-button" onClick={onDownload}><Download />导出完整备份</button>
            <button type="button" className="secondary-button" onClick={() => onImport("all")}><Upload />导入完整备份</button>
          </div>
          <div className="legacy-imports">
            {SUBJECTS.map((subject) => (
              <button type="button" key={subject} onClick={() => onImport(subject)}>
                {subjectIcon(subject, 18)}
                导入旧{SUBJECT_DEFINITIONS[subject].shortTitle}备份
              </button>
            ))}
          </div>
        </section>

        <section className="parent-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Preferences</span>
              <h2>学习偏好</h2>
            </div>
          </div>
          <label className="preference-row">
            <span><strong>音效与朗读</strong><small>允许各科播放反馈和英文发音</small></span>
            <input
              type="checkbox"
              checked={progress.preferences.sound}
              onChange={(event) => onSetPreferences({ sound: event.target.checked })}
            />
          </label>
          <label className="preference-row">
            <span><strong>专注模式</strong><small>减少装饰动画和背景效果</small></span>
            <input
              type="checkbox"
              checked={progress.preferences.focusMode}
              onChange={(event) => onSetPreferences({ focusMode: event.target.checked })}
            />
          </label>
          <button type="button" className="danger-button" onClick={onReset}><RotateCcw />清空统一打卡记录</button>
        </section>
      </div>
    </section>
  );
}

function StatCard({ label, value, note, icon }: { label: string; value: string; note: string; icon: ReactNode }) {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{note}</p>
      </div>
    </div>
  );
}

function NavButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className={active ? "active" : ""} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SubjectLoading({ subject }: { subject: string }) {
  return (
    <div className="subject-loading" role="status">
      <span />
      <strong>正在准备{subject}课程……</strong>
    </div>
  );
}

class SubjectErrorBoundary extends Component<
  { children: ReactNode; subject: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Subject module failed to load", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="subject-load-error" role="alert">
        <strong>{this.props.subject}课程暂时未能加载</strong>
        <span>请检查网络后重试，学习记录不会丢失。</span>
        <button type="button" onClick={() => window.location.reload()}>
          重新加载
        </button>
      </div>
    );
  }
}
