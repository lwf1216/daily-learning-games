import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  Check,
  Gamepad2,
  Headphones,
  Mic2,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import {
  allWords,
  beVerbItems,
  grammarItems,
  grammarPatterns,
  pluralPairs,
  pronounItems,
  sentenceItems,
  type GrammarQuestion,
  type EnglishWord,
} from "./data";
import {
  recordEnglishSentence,
  recordEnglishSpeaking,
  recordEnglishWord,
} from "./progress";
import "./english.css";

type DailyStep = "learn" | "quiz" | "grammar" | "speak";
type View = "home" | DailyStep | "games" | "done";
type GameType =
  | "listen"
  | "balloon"
  | "memory"
  | "spell"
  | "pronoun"
  | "plural"
  | "beverb"
  | "sentence";

interface EnglishModuleProps {
  programDay: number;
  onComplete: (sourceDay: number, score?: number) => void;
}

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
}

type RecognitionCtor = new () => RecognitionLike;

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let value = seed || 1;
  for (let i = result.length - 1; i > 0; i -= 1) {
    value = (value * 1664525 + 1013904223) >>> 0;
    const j = value % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function dailyWordsFor(programDay: number): EnglishWord[] {
  const count = 5;
  const start = ((programDay - 1) * count) % allWords.length;
  return Array.from({ length: count }, (_, index) => allWords[(start + index) % allWords.length]);
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.78;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

function choicesFor(word: EnglishWord, seed: number): EnglishWord[] {
  const distractors = seededShuffle(
    allWords.filter((item) => item.word !== word.word),
    seed
  ).slice(0, 3);
  return seededShuffle([word, ...distractors], seed + 17);
}

function pluralChoices(item: string[], seed: number): string[] {
  const [singular, plural] = item;
  const distractors = Array.from(new Set([
    singular,
    `${singular}s`,
    `${singular}es`,
    singular.endsWith("y") ? `${singular.slice(0, -1)}ies` : `${singular}ies`,
    `${plural}s`,
  ])).filter((choice) => choice !== plural).slice(0, 3);
  return seededShuffle([plural, ...distractors], seed);
}

export function EnglishModule({ programDay, onComplete }: EnglishModuleProps) {
  const dailyWords = useMemo(() => dailyWordsFor(programDay), [programDay]);
  const [view, setView] = useState<View>("home");
  const [completedSteps, setCompletedSteps] = useState<DailyStep[]>([]);
  const [dailyScore, setDailyScore] = useState(0);
  const [game, setGame] = useState<GameType | null>(null);

  function completeStep(step: DailyStep, score = 0) {
    const next = completedSteps.includes(step) ? completedSteps : [...completedSteps, step];
    setCompletedSteps(next);
    setDailyScore((current) => current + score);
    if (next.length === 4) {
      const totalScore = dailyScore + score;
      onComplete(programDay, totalScore);
      setView("done");
    } else {
      setView("home");
    }
  }

  if (game) {
    return (
      <div className="english-app">
        <header className="english-topbar">
          <button type="button" className="english-icon-btn" onClick={() => setGame(null)} aria-label="返回英语游戏">
            <ArrowLeft />
          </button>
          <div>
            <span className="eyebrow">英语游乐场</span>
            <h2>{GAME_META[game].title}</h2>
          </div>
        </header>
        <GameRunner
          type={game}
          programDay={programDay}
          dailyWords={dailyWords}
          onFinish={() => setGame(null)}
        />
      </div>
    );
  }

  return (
    <div className="english-app">
      <header className="english-hero">
        <div>
          <span className="eyebrow">English · Day {programDay}</span>
          <h1>Word Carnival</h1>
          <p>听一听、认一认、勇敢说出来，完成今天的英语打卡。</p>
        </div>
        <div className="english-mascot" aria-hidden="true">Aa</div>
      </header>

      {view === "home" && (
        <>
          <section className="english-progress" aria-label="今日英语进度">
            <div>
              <strong>{completedSteps.length}/4</strong>
              <span>今日任务</span>
            </div>
            <div className="english-progress-track">
              <i style={{ width: `${(completedSteps.length / 4) * 100}%` }} />
            </div>
            <span>完成四站即可打卡</span>
          </section>

          <section className="english-task-grid">
            <DailyTaskCard
              title="听读单词"
              description="听完今天的 5 个单词"
              icon={<Headphones />}
              done={completedSteps.includes("learn")}
              onClick={() => setView("learn")}
            />
            <DailyTaskCard
              title="单词闯关"
              description="完成 5 题图片选择"
              icon={<BookOpen />}
              done={completedSteps.includes("quiz")}
              onClick={() => setView("quiz")}
            />
            <DailyTaskCard
              title="句型语法"
              description="完成 5 题句型闯关"
              icon={<BookOpenCheck />}
              done={completedSteps.includes("grammar")}
              onClick={() => setView("grammar")}
            />
            <DailyTaskCard
              title="开口跟读"
              description="读出 3 个今日单词"
              icon={<Mic2 />}
              done={completedSteps.includes("speak")}
              onClick={() => setView("speak")}
            />
          </section>

          <section className="english-word-strip">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Today’s words</span>
                <h2>今日单词</h2>
              </div>
              <span>{dailyWords.length} words</span>
            </div>
            <div className="word-preview-grid">
              {dailyWords.map((word) => (
                <button type="button" key={word.word} onClick={() => speak(word.word)}>
                  <span aria-hidden="true">{word.emoji}</span>
                  <strong>{word.word}</strong>
                  <small>{word.cn}</small>
                  <Volume2 aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section className="english-grammar-strip">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Grammar patterns</span>
                <h2>本期重点句型</h2>
              </div>
              <BookOpenCheck aria-hidden="true" />
            </div>
            <div className="grammar-pattern-grid">
              {grammarPatterns.map((pattern) => (
                <article key={pattern.id}>
                  <span>{pattern.title}</span>
                  <strong>{pattern.question}</strong>
                  <p>{pattern.singular}</p>
                  <p>{pattern.plural}</p>
                  <small>{pattern.rule}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="english-game-lab">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Free play</span>
                <h2>英语游乐场</h2>
              </div>
              <Gamepad2 aria-hidden="true" />
            </div>
            <div className="game-grid">
              {(Object.keys(GAME_META) as GameType[]).map((type) => (
                <button type="button" key={type} onClick={() => setGame(type)}>
                  <span className="game-glyph" aria-hidden="true">{GAME_META[type].glyph}</span>
                  <strong>{GAME_META[type].title}</strong>
                  <small>{GAME_META[type].description}</small>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {view === "learn" && (
        <LearnStep
          words={dailyWords}
          onBack={() => setView("home")}
          onComplete={() => completeStep("learn")}
        />
      )}
      {view === "quiz" && (
        <QuizStep
          words={dailyWords}
          programDay={programDay}
          onBack={() => setView("home")}
          onComplete={(score) => completeStep("quiz", score)}
        />
      )}
      {view === "grammar" && (
        <GrammarStep
          programDay={programDay}
          onBack={() => setView("home")}
          onComplete={(score) => completeStep("grammar", score)}
        />
      )}
      {view === "speak" && (
        <SpeakStep
          words={dailyWords.slice(0, 3)}
          onBack={() => setView("home")}
          onComplete={() => completeStep("speak")}
        />
      )}
      {view === "done" && (
        <section className="english-done">
          <Sparkles aria-hidden="true" />
          <span className="eyebrow">English complete</span>
          <h2>今天的英语打卡完成！</h2>
          <p>你完成了听读、单词闯关、句型语法和跟读，获得 {dailyScore + 10} 点英语能量。</p>
          <button type="button" className="english-primary" onClick={() => setView("home")}>
            再看看今日单词
          </button>
        </section>
      )}
    </div>
  );
}

function DailyTaskCard({
  title,
  description,
  icon,
  done,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`daily-task ${done ? "done" : ""}`} onClick={onClick}>
      <span className="task-icon">{done ? <Check /> : icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{done ? "已完成，可以再次练习" : description}</small>
      </span>
      <span className="task-state">{done ? "完成" : "开始"}</span>
    </button>
  );
}

function StepHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="step-header">
      <button type="button" className="english-icon-btn" onClick={onBack} aria-label="返回英语首页">
        <ArrowLeft />
      </button>
      <h2>{title}</h2>
      <span />
    </header>
  );
}

function LearnStep({
  words,
  onBack,
  onComplete,
}: {
  words: EnglishWord[];
  onBack: () => void;
  onComplete: () => void;
}) {
  const [heard, setHeard] = useState<string[]>([]);
  function hear(word: EnglishWord) {
    speak(word.word);
    setHeard((current) => (current.includes(word.word) ? current : [...current, word.word]));
  }
  return (
    <section className="english-step">
      <StepHeader title="听读今日单词" onBack={onBack} />
      <p className="step-intro">依次点开五张卡，听清楚发音再跟读。</p>
      <div className="learn-grid">
        {words.map((word) => (
          <button
            type="button"
            key={word.word}
            className={heard.includes(word.word) ? "heard" : ""}
            onClick={() => hear(word)}
          >
            <span aria-hidden="true">{word.emoji}</span>
            <strong>{word.word}</strong>
            <small>{word.cn}</small>
            <Volume2 aria-hidden="true" />
          </button>
        ))}
      </div>
      <button
        type="button"
        className="english-primary"
        disabled={heard.length < words.length}
        onClick={onComplete}
      >
        {heard.length < words.length ? `还要听 ${words.length - heard.length} 个` : "完成听读"}
      </button>
    </section>
  );
}

function QuizStep({
  words,
  programDay,
  onBack,
  onComplete,
}: {
  words: EnglishWord[];
  programDay: number;
  onBack: () => void;
  onComplete: (score: number) => void;
}) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [locked, setLocked] = useState(false);
  const current = words[round];
  const choices = useMemo(
    () => choicesFor(current, programDay * 101 + round * 17),
    [current, programDay, round]
  );

  function answer(choice: EnglishWord) {
    if (locked) return;
    const ok = choice.word === current.word;
    setLocked(true);
    recordEnglishWord(current.word, ok);
    if (ok) {
      setScore((value) => value + 1);
      setFeedback("答对了！Great job!");
      speak(current.word);
    } else {
      setFeedback(`再记一记：${current.word} 是“${current.cn}”`);
    }
    window.setTimeout(() => {
      if (round + 1 >= words.length) onComplete(score + (ok ? 1 : 0));
      else {
        setRound((value) => value + 1);
        setFeedback("");
        setLocked(false);
      }
    }, 650);
  }

  return (
    <section className="english-step">
      <StepHeader title="单词图片闯关" onBack={onBack} />
      <div className="round-line">
        <span>{round + 1}/{words.length}</span>
        <div><i style={{ width: `${((round + 1) / words.length) * 100}%` }} /></div>
        <strong>{score} 分</strong>
      </div>
      <div className="quiz-prompt">
        <button type="button" onClick={() => speak(current.word)} aria-label={`播放 ${current.word}`}>
          <Volume2 />
        </button>
        <span>听发音，选出正确图片</span>
      </div>
      <div className="quiz-choice-grid">
        {choices.map((choice) => (
          <button type="button" key={choice.word} disabled={locked} onClick={() => answer(choice)}>
            <span aria-hidden="true">{choice.emoji}</span>
            <strong>{choice.word}</strong>
            <small>{choice.cn}</small>
          </button>
        ))}
      </div>
      {feedback && <p className="english-feedback" role="status">{feedback}</p>}
    </section>
  );
}

function GrammarStep({
  programDay,
  onBack,
  onComplete,
}: {
  programDay: number;
  onBack: () => void;
  onComplete: (score: number) => void;
}) {
  const totalRounds = 5;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [locked, setLocked] = useState(false);
  const question: GrammarQuestion =
    grammarItems[(programDay * 7 + round * 3) % grammarItems.length];
  const choices = useMemo(
    () => seededShuffle(question.choices, programDay * 131 + round * 29),
    [programDay, question, round]
  );

  function answer(choice: string) {
    if (locked) return;
    const ok = choice === question.answer;
    const nextScore = score + (ok ? 1 : 0);
    setLocked(true);
    if (ok) {
      setScore(nextScore);
      recordEnglishSentence();
      setFeedback(`答对了！${question.explanation}`);
      speak(question.prompt.replace("___", question.answer));
    } else {
      setFeedback(`正确答案是 ${question.answer}。${question.explanation}`);
    }
    window.setTimeout(() => {
      if (round + 1 >= totalRounds) onComplete(nextScore);
      else {
        setRound((value) => value + 1);
        setFeedback("");
        setLocked(false);
      }
    }, 850);
  }

  return (
    <section className="english-step">
      <StepHeader title="句型语法闯关" onBack={onBack} />
      <div className="round-line">
        <span>{round + 1}/{totalRounds}</span>
        <div><i style={{ width: `${((round + 1) / totalRounds) * 100}%` }} /></div>
        <strong>{score} 分</strong>
      </div>
      <div className="lab-prompt grammar-question-copy">
        <span aria-hidden="true">{question.emoji}</span>
        <small>{question.topic}</small>
        <h3>{question.prompt}</h3>
        <p>{question.cn}</p>
      </div>
      <div className="lab-choices">
        {choices.map((choice) => (
          <button
            type="button"
            key={choice}
            disabled={locked}
            onClick={() => answer(choice)}
          >
            {choice}
          </button>
        ))}
      </div>
      {feedback && <p className="english-feedback" role="status">{feedback}</p>}
    </section>
  );
}

function SpeakStep({
  words,
  onBack,
  onComplete,
}: {
  words: EnglishWord[];
  onBack: () => void;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("先听一遍，再大声跟读。");
  const current = words[index];

  function pass() {
    recordEnglishSpeaking(current.word);
    if (index + 1 >= words.length) onComplete();
    else {
      setIndex((value) => value + 1);
      setMessage("很好！继续下一个。");
    }
  }

  function recognize() {
    const holder = window as typeof window & {
      SpeechRecognition?: RecognitionCtor;
      webkitSpeechRecognition?: RecognitionCtor;
    };
    const Recognition = holder.SpeechRecognition || holder.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage("这个浏览器暂不支持语音识别，请由家长确认。");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.toLowerCase().trim() || "";
      if (transcript.includes(current.word.toLowerCase())) {
        setMessage(`听到了 “${transcript}”，读得很好！`);
        pass();
      } else {
        setMessage(`听到的是 “${transcript}”，再试一次吧。`);
      }
    };
    recognition.onerror = () => setMessage("没有听清楚，可以再试一次或请家长确认。");
    recognition.start();
    setMessage("正在听，请大声读……");
  }

  return (
    <section className="english-step">
      <StepHeader title="开口跟读" onBack={onBack} />
      <div className="speak-card">
        <span className="speak-count">{index + 1}/{words.length}</span>
        <div className="speak-emoji" aria-hidden="true">{current.emoji}</div>
        <h2>{current.word}</h2>
        <p>{current.cn}</p>
        <div className="speak-actions">
          <button type="button" onClick={() => speak(current.word)}><Volume2 /> 听一听</button>
          <button type="button" onClick={recognize}><Mic2 /> 我来读</button>
        </div>
        <p className="recognition-message" role="status">{message}</p>
        <button type="button" className="english-secondary" onClick={pass}>
          家长确认读对了
        </button>
      </div>
    </section>
  );
}

const GAME_META: Record<GameType, { title: string; description: string; glyph: string }> = {
  listen: { title: "听音点图", description: "听英文，选图片", glyph: "♫" },
  balloon: { title: "气球认词", description: "戳中正确单词", glyph: "○" },
  memory: { title: "翻牌配对", description: "单词和图片配对", glyph: "▦" },
  spell: { title: "拼写小火车", description: "按顺序拼单词", glyph: "Aa" },
  pronoun: { title: "代词舞台", description: "he / she / it / they", glyph: "P" },
  plural: { title: "复数泡泡", description: "one 与 many", glyph: "+s" },
  beverb: { title: "is / are 小火车", description: "选择 be 动词", glyph: "be" },
  sentence: { title: "句子拼图", description: "把句子排完整", glyph: "S" },
};

function GameRunner({
  type,
  programDay,
  dailyWords,
  onFinish,
}: {
  type: GameType;
  programDay: number;
  dailyWords: EnglishWord[];
  onFinish: () => void;
}) {
  if (type === "memory") return <MemoryGame words={dailyWords.slice(0, 3)} onFinish={onFinish} />;
  if (type === "spell") return <SpellGame words={dailyWords} onFinish={onFinish} />;
  if (type === "sentence") {
    return <SentenceGame programDay={programDay} onFinish={onFinish} />;
  }
  return <ChoiceLabGame type={type} programDay={programDay} onFinish={onFinish} />;
}

function ChoiceLabGame({
  type,
  programDay,
  onFinish,
}: {
  type: Exclude<GameType, "memory" | "spell" | "sentence">;
  programDay: number;
  onFinish: () => void;
}) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const question = buildLabQuestion(type, programDay, round);

  function choose(value: string) {
    const ok = value === question.answer;
    if (ok) setScore((current) => current + 1);
    setMessage(ok ? "正确！" : `答案是 ${question.answer}`);
    window.setTimeout(() => {
      if (round >= 4) onFinish();
      else {
        setRound((current) => current + 1);
        setMessage("");
      }
    }, 600);
  }

  return (
    <section className="lab-game">
      <div className="round-line">
        <span>{round + 1}/5</span>
        <div><i style={{ width: `${((round + 1) / 5) * 100}%` }} /></div>
        <strong>{score} 分</strong>
      </div>
      <div className="lab-prompt">
        <span aria-hidden="true">{question.visual}</span>
        <h3>{question.prompt}</h3>
        {question.speakText && (
          <button type="button" className="english-icon-btn" onClick={() => speak(question.speakText as string)} aria-label="播放题目">
            <Volume2 />
          </button>
        )}
      </div>
      <div className="lab-choices">
        {question.choices.map((choice) => (
          <button type="button" key={choice} onClick={() => choose(choice)} disabled={Boolean(message)}>
            {choice}
          </button>
        ))}
      </div>
      {message && <p className="english-feedback" role="status">{message}</p>}
    </section>
  );
}

function buildLabQuestion(type: Exclude<GameType, "memory" | "spell" | "sentence">, day: number, round: number) {
  const seed = day * 97 + round * 23;
  if (type === "listen" || type === "balloon") {
    const word = allWords[seed % allWords.length];
    return {
      prompt: type === "listen" ? "听发音，选单词" : `哪个单词是“${word.cn}”？`,
      visual: type === "balloon" ? word.emoji : "♫",
      choices: choicesFor(word, seed).map((item) => item.word),
      answer: word.word,
      speakText: type === "listen" ? word.word : undefined,
    };
  }
  if (type === "pronoun") {
    const item = pronounItems[seed % pronounItems.length];
    return { prompt: `${item.label} 应该用哪个代词？`, visual: item.emoji, choices: ["He", "She", "It", "They"], answer: item.answer };
  }
  if (type === "plural") {
    const item = pluralPairs[seed % pluralPairs.length];
    return { prompt: item[4], visual: item[2], choices: pluralChoices(item, seed), answer: item[1] };
  }
  const item = beVerbItems[seed % beVerbItems.length];
  return { prompt: item.sentence, visual: "be", choices: ["is", "are"], answer: item.answer };
}

function MemoryGame({ words, onFinish }: { words: EnglishWord[]; onFinish: () => void }) {
  const cards = useMemo(
    () => seededShuffle(words.flatMap((word) => [
      { id: `${word.word}-word`, pair: word.word, text: word.word },
      { id: `${word.word}-emoji`, pair: word.word, text: word.emoji },
    ]), words.length * 37),
    [words]
  );
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  function flip(index: number) {
    if (open.length >= 2 || open.includes(index) || matched.includes(cards[index].pair)) return;
    const next = [...open, index];
    setOpen(next);
    if (next.length === 2) {
      window.setTimeout(() => {
        if (cards[next[0]].pair === cards[next[1]].pair) {
          const pairs = [...matched, cards[next[0]].pair];
          setMatched(pairs);
          if (pairs.length === words.length) window.setTimeout(onFinish, 450);
        }
        setOpen([]);
      }, 550);
    }
  }

  return (
    <section className="lab-game">
      <p className="step-intro">翻开两张牌，把英文单词和图片配成一对。</p>
      <div className="memory-grid">
        {cards.map((card, index) => {
          const visible = open.includes(index) || matched.includes(card.pair);
          return (
            <button type="button" key={card.id} className={visible ? "open" : ""} onClick={() => flip(index)}>
              {visible ? card.text : "?"}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SpellGame({ words, onFinish }: { words: EnglishWord[]; onFinish: () => void }) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const word = words[round];
  const spellingTarget = word.word.replace(/[^a-z]/gi, "");
  const letters = useMemo(
    () => seededShuffle(
      spellingTarget.split("").map((letter, index) => ({ letter, index })),
      round * 29 + spellingTarget.length
    ),
    [round, spellingTarget]
  );
  const built = picked.map((index) => letters[index].letter).join("");

  function check() {
    if (built.toLowerCase() === spellingTarget.toLowerCase()) {
      recordEnglishWord(word.word, true);
      setMessage("拼对了！");
      window.setTimeout(() => {
        if (round + 1 >= words.length) onFinish();
        else {
          setRound((value) => value + 1);
          setPicked([]);
          setMessage("");
        }
      }, 550);
    } else {
      setMessage("顺序还不对，再试一次。");
    }
  }

  return (
    <section className="lab-game">
      <div className="spell-visual" aria-hidden="true">{word.emoji}</div>
      <h3>{word.cn}</h3>
      <div className="spell-built">{built || "点字母开始拼写"}</div>
      <div className="letter-bank">
        {letters.map((letter, index) => (
          <button type="button" key={`${letter.index}-${letter.letter}`} disabled={picked.includes(index)} onClick={() => setPicked((current) => [...current, index])}>
            {letter.letter}
          </button>
        ))}
      </div>
      <div className="lab-actions">
        <button type="button" className="english-secondary" onClick={() => setPicked([])}><RotateCcw /> 重来</button>
        <button type="button" className="english-primary" disabled={picked.length !== letters.length} onClick={check}>检查</button>
      </div>
      {message && <p className="english-feedback">{message}</p>}
    </section>
  );
}

function SentenceGame({
  programDay,
  onFinish,
}: {
  programDay: number;
  onFinish: () => void;
}) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const item = sentenceItems[((programDay - 1) * 5 + round) % sentenceItems.length];
  const parts = useMemo(
    () => seededShuffle(item.parts.map((part, index) => ({ part, index })), round * 41 + 9),
    [item, round]
  );
  const built = picked.map((index) => parts[index].part).join(" ");

  function check() {
    if (built === item.parts.join(" ")) {
      recordEnglishSentence();
      speak(built);
      if (round >= 4) window.setTimeout(onFinish, 550);
      else {
        setRound((value) => value + 1);
        setPicked([]);
      }
    }
  }

  return (
    <section className="lab-game">
      <div className="spell-visual" aria-hidden="true">{item.emoji}</div>
      <p>{item.cn}</p>
      <div className="sentence-built">{built || "按顺序点词语"}</div>
      <div className="word-bank">
        {parts.map((part, index) => (
          <button type="button" key={`${part.index}-${part.part}`} disabled={picked.includes(index)} onClick={() => setPicked((current) => [...current, index])}>
            {part.part}
          </button>
        ))}
      </div>
      <div className="lab-actions">
        <button type="button" className="english-secondary" onClick={() => setPicked([])}><RotateCcw /> 重来</button>
        <button type="button" className="english-primary" disabled={picked.length !== parts.length || built !== item.parts.join(" ")} onClick={check}>下一句</button>
      </div>
    </section>
  );
}
