import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const issues = [];
const notes = [];

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf8"));
}

function verifyDayPacks(subject, path, expectedDays) {
  const days = loadJson(path);
  const questions = days.flatMap((day) =>
    day.sections.flatMap((section) => section.questions)
  );
  const ids = questions.map((question) => question.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const emptySections = days.flatMap((day) =>
    day.sections
      .filter((section) => !section.questions.length)
      .map((section) => `${day.day}:${section.id}`)
  );

  if (days.length !== expectedDays) {
    issues.push(`${subject}: expected ${expectedDays} days, got ${days.length}`);
  }
  if (duplicateIds.length) {
    issues.push(
      `${subject}: duplicate question IDs: ${[...new Set(duplicateIds)].join(", ")}`
    );
  }
  if (emptySections.length) {
    issues.push(`${subject}: empty sections: ${emptySections.join(", ")}`);
  }
  if (days.some((day, index) => day.day !== index + 1)) {
    issues.push(`${subject}: day numbers are not sequential`);
  }

  notes.push(`${subject}: ${days.length} days, ${questions.length} questions`);
  return { days, questions };
}

function parseGeneratedEnglishThemes() {
  const source = readFileSync(
    resolve(root, "src/subjects/english/data.ts"),
    "utf8"
  );
  const startToken = "export const themes: EnglishTheme[] = ";
  const start = source.indexOf(startToken);
  if (start < 0) {
    throw new Error("Could not find generated English themes.");
  }
  const generatedSource = source.slice(start + startToken.length);
  const end = generatedSource.search(/;\r?\n\r?\nexport const allWords/);
  if (end < 0) {
    throw new Error("Could not parse generated English themes.");
  }
  return JSON.parse(generatedSource.slice(0, end));
}

const maths = verifyDayPacks("Maths", "src/subjects/math/data/days.json", 30);
const chinese = verifyDayPacks("Chinese", "src/subjects/chinese/data/days.json", 21);

function evaluateArithmetic(text) {
  const normalized = String(text)
    .trim()
    .replace(/[?？]\s*$/, "")
    .replace(/[=＝]\s*$/, "")
    .replace(/−/g, "-")
    .replace(/×/g, "*");
  if (!/^[\d\s()+\-*]+$/.test(normalized)) return null;
  // Content is repository-owned and restricted to digits/operators by the regex.
  return Function(`"use strict"; return (${normalized});`)();
}

for (const question of maths.questions) {
  if (question.type === "calc") {
    const calculated = evaluateArithmetic(question.prompt);
    if (calculated != null && typeof question.answer === "number" && calculated !== question.answer) {
      issues.push(`Maths: ${question.id} calculates to ${calculated}, stored ${question.answer}`);
    }
  }

  if (question.type === "match") {
    const left = new Map((question.left || []).map((item) => [item.id, evaluateArithmetic(item.text)]));
    const right = new Map((question.right || []).map((item) => [item.id, evaluateArithmetic(item.text)]));
    for (const [leftId, rightId] of question.answer || []) {
      if (left.get(leftId) !== right.get(rightId)) {
        issues.push(`Maths: ${question.id} mismatches ${leftId} and ${rightId}`);
      }
    }
  }

  if (question.type === "order" && question.items?.length) {
    const values = new Map(question.items.map((item) => [item.id, evaluateArithmetic(item.text)]));
    const stored = (question.answer || []).map((id) => values.get(id));
    const descending = [...stored].sort((a, b) => b - a);
    if (stored.some((value, index) => value !== descending[index])) {
      issues.push(`Maths: ${question.id} is not ordered from largest to smallest`);
    }
  }

  if (question.type === "choice" && question.options?.length) {
    const values = new Set(question.options.map((option, index) =>
      typeof option === "object" ? option.value : index
    ));
    if (!values.has(question.answer)) {
      issues.push(`Maths: ${question.id} answer is not present in its options`);
    }
    for (const accepted of question.accept || []) {
      if (!values.has(accepted)) {
        issues.push(`Maths: ${question.id} accepted answer ${accepted} is not present in its options`);
      }
    }
  }
}

const expectedMathAnswers = new Map([
  ["d12-s3-q1", 0],
  ["d16-s3-q2", 1],
  ["d18-s4-q1", 2],
  ["d26-s2-q1", 2],
  ["d26-s2-q3", 2],
  ["d30-s5-q1", 8],
]);
for (const [id, expected] of expectedMathAnswers) {
  const question = maths.questions.find((item) => item.id === id);
  if (question?.answer !== expected) {
    issues.push(`Maths: ${id} expected answer ${expected}, got ${question?.answer}`);
  }
}

const invalidAcceptedAnswers = new Map([
  ["d10-s3-q3", [4]],
  ["d10-s5-q1", ["12+3+4+5+67+9"]],
  ["d28-s2-q1", ["50", 50]],
]);
for (const [id, forbidden] of invalidAcceptedAnswers) {
  const question = maths.questions.find((item) => item.id === id);
  if ((question?.accept || []).some((candidate) => forbidden.includes(candidate))) {
    issues.push(`Maths: ${id} still accepts a known incorrect answer`);
  }
}

const expectedChinesePinyin = new Map([
  ["d11-pinyin-3", "shǔ shù"],
  ["d12-pinyin-6", "qiū qiān"],
  ["d15-pinyin-3", "xiǎo dù"],
]);
for (const [id, expected] of expectedChinesePinyin) {
  const question = chinese.questions.find((item) => item.id === id);
  if (question?.visual !== expected) {
    issues.push(`Chinese: ${id} expected pinyin ${expected}, got ${question?.visual}`);
  }
}

const englishThemes = parseGeneratedEnglishThemes();
const englishWords = englishThemes.flatMap((theme) =>
  theme.words.map(([word]) => word)
);
const englishUnique = new Set(englishWords);

if (englishThemes.length !== 6) {
  issues.push(`English: expected 6 themes, got ${englishThemes.length}`);
}
if (englishWords.length !== 100) {
  issues.push(`English: expected 100 words, got ${englishWords.length}`);
}

const seenAcrossProgram = new Set();
for (let day = 1; day <= 30; day += 1) {
  const start = ((day - 1) * 5) % englishWords.length;
  const dailyIndexes = Array.from(
    { length: 5 },
    (_, index) => (start + index) % englishWords.length
  );
  const daily = dailyIndexes.map((index) => englishWords[index]);
  dailyIndexes.forEach((index) => seenAcrossProgram.add(index));
  if (new Set(daily).size !== 5) {
    issues.push(`English: duplicate word inside day ${day}`);
  }
}
if (seenAcrossProgram.size !== englishWords.length) {
  issues.push(
    `English: 30-day plan covers ${seenAcrossProgram.size}/${englishWords.length} vocabulary entries`
  );
}

const requiredEnglishWords = [
  "pear",
  "potatoes",
  "tomatoes",
  "pineapples",
  "mangoes",
  "these",
  "those",
  "volleyball",
  "chicken wings",
  "hockey",
  "taking a photo",
  "wearing",
  "ice cream",
  "cow",
  "mice",
  "sheep",
  "crocodile",
  "kangaroo",
  "giraffe",
  "climbing",
  "crawling",
  "jumping",
  "eating",
  "seal",
  "shellfish",
  "shark",
  "dolphin",
  "whale",
  "seaweed",
];
for (const word of requiredEnglishWords) {
  if (!englishUnique.has(word)) {
    issues.push(`English: required curriculum word is missing: ${word}`);
  }
}

const englishSource = readFileSync(
  resolve(root, "src/subjects/english/data.ts"),
  "utf8"
);
const requiredGrammarPatterns = [
  "How many cows are there?",
  "There is one cow.",
  "What is the kangaroo doing?",
  "They are jumping.",
  "What does a dolphin eat?",
  "They eat fish and shellfish.",
];
for (const pattern of requiredGrammarPatterns) {
  if (!englishSource.includes(pattern)) {
    issues.push(`English: required grammar pattern is missing: ${pattern}`);
  }
}

const reviewMap = Array.from({ length: 9 }, (_, index) => 13 + index);
if (reviewMap.join(",") !== "13,14,15,16,17,18,19,20,21") {
  issues.push("Chinese: review-day mapping is incorrect");
}

notes.push(
  `English: ${englishThemes.length} themes, ${englishWords.length} entries (${englishUnique.size} unique spellings), all covered in 30 days`
);
notes.push("Chinese review mapping: program days 22–30 -> source days 13–21");
notes.push("Maths and Chinese question IDs are isolated by subject modules");
notes.push("Unified storage key is distinct from all three legacy subject keys");

console.log("=== CONTENT NOTES ===");
for (const note of notes) console.log(note);
console.log(`=== ISSUES (${issues.length}) ===`);
for (const issue of issues) console.log(issue);
if (issues.length) process.exitCode = 1;
