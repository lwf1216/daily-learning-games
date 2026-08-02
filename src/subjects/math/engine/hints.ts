import type { Question } from "./types";
import { formatAnswer } from "./check";

/**
 * Kid-facing solve tips: method first, not "just go left to right".
 * Prefer author hint only when it's already a real method tip.
 */
export function getHint(q: Question): string {
  const custom = (q.hint || "").trim();
  // Skip shallow author hints that don't teach method
  if (custom && !isShallowHint(custom)) return custom;

  switch (q.type) {
    case "calc":
      return hintCalc(q.prompt);
    case "compare":
      return hintCompare(q.prompt);
    case "true_false":
      return "① 把题里的数量关系列成小算式算一算；② 再对照句子，看说得对不对。不能只靠感觉猜。";
    case "choice":
      return "① 先自己算出正确答案；② 再去选项里找；③ 如果算不出，用排除法去掉明显离谱的。";
    case "multi_blank":
      return hintMultiBlank(q.prompt);
    case "pattern":
      return hintPattern(q.prompt);
    case "chain":
      return "把每一小步当成新的起点：上一步的得数，就是下一步的被加数/被减数。不要跳步，写在草稿纸上更稳。";
    case "match":
      return "① 左边每个算式先算出得数；② 在右边找相同得数；③ 一对一对连，连过的就不再用。";
    case "order":
      return "① 先算出每个式子的得数；② 把得数写在旁边；③ 再按题目要求从大到小（或从小到大）排。";
    case "expression":
      return "看图三问：① 原来有什么？② 变了什么（合起来/拿走）？③ 求什么？然后用「部分+部分=总共」或「总共−部分=另一部分」列式。";
    case "table":
      return "关系式记牢：原有 + 买入 = 现在。哪一格缺数，就用另外两格推：缺现在就相加，缺买入就用现在减原有，缺原有就用现在减买入。";
    case "word":
      return hintWord(q.prompt);
    default:
      return "① 题目在问什么？② 已知哪些数？③ 用加还是减？列式 → 计算 → 看单位是否合理。";
  }
}

function isShallowHint(h: string): boolean {
  return /从左到右|一步一步算|慢慢算|仔细算|再算一次|验算一次/.test(h) && h.length < 40;
}

function parseOps(prompt: string): { nums: number[]; ops: string[] } | null {
  const p = prompt
    .replace(/＝/g, "=")
    .replace(/－/g, "-")
    .replace(/−/g, "-")
    .replace(/＋/g, "+")
    .replace(/\s/g, "")
    .replace(/=.*$/, "");
  if (!/^[\d+\-()]+$/.test(p.replace(/[()]/g, ""))) {
    // allow parentheses already stripped check
  }
  const nums = (p.match(/\d+/g) || []).map(Number);
  // Better: tokenize
  const tokens = p.match(/\d+|[+\-()]/g);
  if (!tokens || nums.length < 2) return null;
  const opList: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "+" || tokens[i] === "-") {
      // skip unary if at start or after (
      if (i === 0 || tokens[i - 1] === "(") continue;
      opList.push(tokens[i]);
    }
  }
  if (nums.length < 2) return null;
  return { nums, ops: opList };
}

function tensOnes(n: number): { t: number; o: number } {
  return { t: Math.floor(n / 10) * 10, o: n % 10 };
}

function hintCalc(prompt: string): string {
  const p = prompt.replace(/\s/g, "");
  if (/\(|（/.test(p)) {
    return "有括号：先算括号里面，把括号变成一个数，再算外面。口诀：括号优先。";
  }

  const parsed = parseOps(prompt);
  if (!parsed) {
    return "把每个数分成「几个十 + 几个一」。加法：十加十、一加一，个位满十进一；减法：个位不够就向十位借一当十。";
  }

  const { nums, ops } = parsed;

  // a±b±c multi-step
  if (nums.length >= 3 && ops.length >= 2) {
    const [a, b, c] = nums;
    const [op1, op2] = ops;
    const parts: string[] = [];
    parts.push(`这是连加减。建议分两步写：先算 ${a}${op1}${b}，得到中间结果，再${op2 === "+" ? "加上" : "减去"}${c}。`);
    if (op1 === "+" && b % 10 !== 0) {
      parts.push(addMethod(a, b, "第一步"));
    } else if (op1 === "-") {
      parts.push(subMethod(a, b, "第一步"));
    }
    if (op2 === "+") {
      parts.push(`第二步用加法：中间结果 + ${c}，同样可以拆成整十和个位来加。`);
    } else {
      parts.push(`第二步用减法：中间结果 − ${c}，个位不够就借十。`);
    }
    return parts.join(" ");
  }

  // a+b
  if (ops.length === 1 && ops[0] === "+" && nums.length === 2) {
    return addMethod(nums[0], nums[1]);
  }
  // a-b
  if (ops.length === 1 && ops[0] === "-" && nums.length === 2) {
    return subMethod(nums[0], nums[1]);
  }

  return "把数拆成整十和个位：加法分开加再合并；减法个位不够就借十。写竖式时数位一定要对齐。";
}

function addMethod(a: number, b: number, step = ""): string {
  const pre = step ? `${step}：` : "";
  const A = tensOnes(a);
  const B = tensOnes(b);
  // both near tens - make ten
  if (A.o + B.o === 10) {
    return `${pre}${a}+${b}：个位 ${A.o}+${B.o}=10，刚好凑成整十，得数是 ${A.t + B.t + 10}。这叫「凑十法」。`;
  }
  if (A.o + B.o > 10) {
    return `${pre}${a}+${b}：个位 ${A.o}+${B.o}=${A.o + B.o}，满十要向十位进 1。也可以把 ${b} 拆开：先 ${a}+${10 - A.o} 凑成 ${a + (10 - A.o)}，再加剩下的 ${b - (10 - A.o)}（凑十法）。`;
  }
  if (B.o === 0 || A.o === 0) {
    return `${pre}${a}+${b}：其中一个是整十，直接加整十即可，个位不变。`;
  }
  // split method
  if (b < 10) {
    return `${pre}${a}+${b}：从 ${a} 往后数 ${b} 个；或 ${a} 的个位 ${A.o}+${b}=${A.o + b}，十位不变。`;
  }
  return `${pre}${a}+${b}：拆成 (${A.t}+${B.t})+(${A.o}+${B.o})。先算整十 ${A.t}+${B.t}=${A.t + B.t}，再算个位 ${A.o}+${B.o}=${A.o + B.o}，最后合起来。`;
}

function subMethod(a: number, b: number, step = ""): string {
  const pre = step ? `${step}：` : "";
  const A = tensOnes(a);
  const B = tensOnes(b);
  if (A.o >= B.o) {
    return `${pre}${a}−${b}：个位够减。个位 ${A.o}−${B.o}=${A.o - B.o}，十位 ${A.t / 10}−${B.t / 10} 个十。也可以「想加算减」：想几加 ${b} 等于 ${a}。`;
  }
  // need borrow
  return `${pre}${a}−${b}：个位 ${A.o}<${B.o}，不够减 → 向十位借 1，个位变成 ${A.o + 10}，再减 ${B.o}。也可以破十法：先 ${a}−${A.o} 得到整十，再继续减剩下的。或想：？+${b}=${a}。`;
}

function hintCompare(prompt: string): string {
  if (/元|角|分/.test(prompt)) {
    return "钱币比较：先统一单位（1 元=10 角=100 分），都变成「分」或都变成「角」再比大小。";
  }
  return "① 左边算式算出一个数；② 右边算出一个数；③ 大的那边用 >，小的用 <，相等用 =。不要直接看数字位数就下结论。";
}

function hintMultiBlank(prompt: string): string {
  if (/十|个|百|位/.test(prompt)) {
    return "数位：个位表示几个「一」，十位表示几个「十」，百位表示几个「百」。例如 46＝4 个十 + 6 个一。";
  }
  if (/元|角|分/.test(prompt)) {
    return "进率：1 元=10 角，1 角=10 分，1 元=100 分。换算时乘进率或除进率，不要加错。";
  }
  if (/相邻|前面|后面|连续/.test(prompt)) {
    return "相邻数：比它小 1 的是前面，大 1 的是后面。连续减几：每次都减同一个数，像下楼梯。";
  }
  return "每个空对应一个条件。先找题里「最明确」的信息填一空，再推出其他空。注意读写单位是否一致。";
}

function hintPattern(prompt: string): string {
  // try extract first few numbers
  const nums = (prompt.match(/\d+/g) || []).map(Number);
  if (nums.length >= 3) {
    const d1 = nums[1] - nums[0];
    const d2 = nums[2] - nums[1];
    if (d1 === d2) {
      return `观察前几项：${nums[0]}、${nums[1]}、${nums[2]}… 每次${d1 >= 0 ? "加" : "减"}${Math.abs(d1)}。后面每一项都按「${d1 >= 0 ? "+" : "−"}${Math.abs(d1)}」继续。`;
    }
    return `不要只看相邻两项。试试：① 每次加/减是否固定；② 是否两项一组交替变化；③ 是否奇数项、偶数项各有规律。`;
  }
  return "找规律：算出相邻两数的差，差相同就是等差；差在变就看差的差，或看奇偶项分开。";
}

function hintWord(prompt: string): string {
  const t = prompt;

  if (/一共|合起来|总共/.test(t) && /借|还|送|用掉|飞走|吃|买/.test(t)) {
    return "数量有增减：画一条线，写「开始 → 拿走/借出 → 又回来」。算式常常是：开始 − 拿走 + 回来，或分步算。";
  }
  if (/一共|合起来|总共|两.*共|共有|共做|共剪|共种/.test(t)) {
    return "求「一共」：把几部分合起来 → 用加法。先找出每一部分是多少，再相加。";
  }
  if (/还剩|剩下|还余|差多少|少多少|多多少|比.*多|比.*少|找回/.test(t)) {
    return "求「还剩/差/多多少」：用减法。谁多谁当被减数；「比 A 多/少几」时，另一量 = A ± 这个差。";
  }
  if (/前面.*后面|后面.*前面|排队|从左|从右|正着|倒着|报数/.test(t)) {
    return "排队/报数：① 数清「前面几人 + 自己 + 后面几人」；② 正数第 a、倒数第 b 时，总人数 = a+b−1（自己数了两次）。";
  }
  if (/元|角|分|付钱|找回|便宜|贵/.test(t)) {
    return "钱币题：统一成「角」或「分」再算。付的钱 − 物品价钱 = 应找回；贵/便宜 = 两个价钱相减。";
  }
  if (/年龄|岁|大几岁|小几岁|年后|年前/.test(t)) {
    return "年龄差不变：大的年龄 − 小的年龄 = 差。过几年后两人各加相同岁数，差还是那么多。";
  }
  if (/每隔|分钟|一班|等.*分/.test(t)) {
    return "班车：先确定发车间隔，找出「下一班时刻」，用下一班 − 到达时刻 = 要等的时间。";
  }
  if (/握手|两两|每两/.test(t)) {
    return "两两握手：第 1 人握 n−1 次，第 2 人握 n−2 次… 加起来，或用 n×(n−1)÷2（二年级可先用连加）。";
  }
  if (/开关|灯亮|灯灭|拉.*次/.test(t)) {
    return "开关来回切换：从关开始，第 1、3、5… 次变亮，第 2、4、6… 次变灭。看次数是奇数还是偶数。";
  }
  if (/同样多|一样多|每人|各/.test(t)) {
    return "「每人同样多」：总量 = 每人数量 × 人数；或一人多少，几人就加几次（一年）。";
  }
  if (/至少|保证|摸|袜子|最坏/.test(t)) {
    return "「保证一定…」要想最坏情况：先尽量摸到还不能确定的，再多摸 1 个就能保证。";
  }
  if (/锯|段|根/.test(t)) {
    return "锯木头：锯成 n 段通常要锯 n−1 次。次数 × 每次时间 = 总时间。";
  }
  if (/倍|几倍/.test(t)) {
    return "「几倍」：一倍是一份，几倍就是几份合起来（或用乘法）。先找到 1 份是多少。";
  }

  return "读题三步：① 问句求什么；② 已知条件圈出来；③ 画简单图（○ 和 △）表示多少，再决定用加还是减。";
}

export function getAnswerReveal(q: Question): string {
  try {
    return formatAnswer(q);
  } catch {
    return "";
  }
}
