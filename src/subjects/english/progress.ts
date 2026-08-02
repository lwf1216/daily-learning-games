export interface EnglishProgress {
  stars: number;
  coins: number;
  learned: Record<string, number>;
  mistakes: Record<string, number>;
  sentences: number;
  speak: number;
  dailySeed: number;
}

const KEY = "wordCarnivalProgress";

const freshProgress = (): EnglishProgress => ({
  stars: 0,
  coins: 0,
  learned: {},
  mistakes: {},
  sentences: 0,
  speak: 0,
  dailySeed: Date.now(),
});

export function loadEnglishProgress(): EnglishProgress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...freshProgress(), ...(JSON.parse(raw) as Partial<EnglishProgress>) } : freshProgress();
  } catch {
    return freshProgress();
  }
}

export function saveEnglishProgress(progress: EnglishProgress): EnglishProgress {
  localStorage.setItem(KEY, JSON.stringify(progress));
  return progress;
}

export function recordEnglishWord(word: string, isCorrect: boolean): EnglishProgress {
  const progress = loadEnglishProgress();
  progress.learned[word] = (progress.learned[word] || 0) + 1;
  if (isCorrect) {
    progress.stars += 1;
    progress.coins += 3;
    if (progress.mistakes[word]) {
      progress.mistakes[word] -= 1;
      if (progress.mistakes[word] <= 0) delete progress.mistakes[word];
    }
  } else {
    progress.mistakes[word] = (progress.mistakes[word] || 0) + 1;
  }
  return saveEnglishProgress(progress);
}

export function recordEnglishSentence(): EnglishProgress {
  const progress = loadEnglishProgress();
  progress.sentences += 1;
  progress.stars += 2;
  progress.coins += 5;
  return saveEnglishProgress(progress);
}

export function recordEnglishSpeaking(word: string): EnglishProgress {
  const progress = recordEnglishWord(word, true);
  progress.speak += 1;
  return saveEnglishProgress(progress);
}
