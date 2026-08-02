export interface EnglishWord {
  word: string;
  cn: string;
  emoji: string;
  theme: string;
}

export interface EnglishTheme {
  id: string;
  name: string;
  cn: string;
  icon: string;
  words: Array<[string, string, string]>;
}

export interface GrammarQuestion {
  id: string;
  topic: string;
  prompt: string;
  cn: string;
  emoji: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export interface GrammarPattern {
  id: string;
  title: string;
  question: string;
  singular: string;
  plural: string;
  rule: string;
}

export const themes: EnglishTheme[] = [
  {
    "id": "lesson4-produce",
    "name": "Market Basket",
    "cn": "Lesson 4 蔬果与指示词",
    "icon": "🥭",
    "words": [
      ["pear", "梨", "🍐"],
      ["pears", "梨（复数）", "🍐🍐"],
      ["pea", "豌豆", "🫛"],
      ["peas", "豌豆（复数）", "🫛🫛"],
      ["potato", "土豆", "🥔"],
      ["potatoes", "土豆（复数）", "🥔🥔"],
      ["tomato", "番茄；西红柿", "🍅"],
      ["tomatoes", "番茄（复数）", "🍅🍅"],
      ["pineapple", "菠萝", "🍍"],
      ["pineapples", "菠萝（复数）", "🍍🍍"],
      ["mango", "芒果", "🥭"],
      ["mangoes", "芒果（复数）", "🥭🥭"],
      ["these", "这些", "👈👈"],
      ["those", "那些", "👉👉"],
      ["banana", "香蕉", "🍌"],
      ["carrot", "胡萝卜", "🥕"]
    ]
  },
  {
    "id": "lesson4-everyday",
    "name": "Everyday Quest",
    "cn": "Lesson 4 日常词汇",
    "icon": "📸",
    "words": [
      ["volleyball", "排球", "🏐"],
      ["chicken wings", "鸡翅", "🍗"],
      ["hockey", "曲棍球", "🏑"],
      ["foot", "脚", "🦶"],
      ["train", "火车", "🚆"],
      ["sausage", "香肠", "🌭"],
      ["skirt", "裙子", "👗"],
      ["lamp", "灯", "💡"],
      ["watch", "手表", "⌚"],
      ["black", "黑色", "⬛"],
      ["white", "白色", "⬜"],
      ["bird", "鸟", "🐦"],
      ["horse", "马", "🐎"],
      ["woman", "女人", "👩"],
      ["man", "男人", "👨"],
      ["people", "人们", "🧑‍🤝‍🧑"],
      ["plane", "飞机", "✈️"],
      ["taking a photo", "拍照", "📸"],
      ["sleeping", "睡觉；正在睡觉", "😴"],
      ["mirror", "镜子", "🪞"],
      ["wall", "墙", "🧱"],
      ["bath", "洗澡", "🛁"],
      ["clothes", "衣服", "👕"],
      ["brown", "棕色", "🟫"],
      ["boat", "小船", "⛵"],
      ["rug", "地毯", "🧶"],
      ["floor", "地板", "🪵"],
      ["wearing", "穿戴；正穿着", "👒"],
      ["socks", "袜子", "🧦"]
    ]
  },
  {
    "id": "lesson4-food",
    "name": "Food Party",
    "cn": "Lesson 4 食物",
    "icon": "🍕",
    "words": [
      ["bread", "面包", "🍞"],
      ["rice", "米饭", "🍚"],
      ["juice", "果汁", "🧃"],
      ["salad", "沙拉", "🥗"],
      ["meat", "肉", "🥩"],
      ["ice cream", "冰淇淋", "🍦"],
      ["hot dog", "热狗", "🌭"],
      ["soup", "汤", "🥣"],
      ["pizza", "披萨", "🍕"],
      ["sandwich", "三明治", "🥪"],
      ["hamburger", "汉堡包", "🍔"],
      ["chips", "薯条", "🍟"]
    ]
  },
  {
    "id": "farm-animals",
    "name": "Animal Kingdom",
    "cn": "农场动物与单复数",
    "icon": "🐄",
    "words": [
      ["cow", "奶牛", "🐄"],
      ["cows", "奶牛（复数）", "🐄🐄"],
      ["pig", "小猪", "🐷"],
      ["pigs", "小猪（复数）", "🐷🐷"],
      ["mouse", "老鼠", "🐭"],
      ["mice", "老鼠（复数）", "🐭🐭"],
      ["duck", "鸭子", "🦆"],
      ["ducks", "鸭子（复数）", "🦆🦆"],
      ["chicken", "小鸡", "🐔"],
      ["chickens", "小鸡（复数）", "🐔🐔"],
      ["rooster", "公鸡", "🐓"],
      ["roosters", "公鸡（复数）", "🐓🐓"],
      ["horses", "马（复数）", "🐎🐎"],
      ["sheep", "绵羊；绵羊（复数）", "🐑"]
    ]
  },
  {
    "id": "wild-actions",
    "name": "Animal Race",
    "cn": "野生动物与动作",
    "icon": "🦘",
    "words": [
      ["tiger", "老虎", "🐯"],
      ["monkey", "猴子", "🐒"],
      ["crocodile", "鳄鱼", "🐊"],
      ["kangaroo", "袋鼠", "🦘"],
      ["panda", "熊猫", "🐼"],
      ["giraffe", "长颈鹿", "🦒"],
      ["climb", "攀爬", "🧗"],
      ["climbing", "正在攀爬", "🧗"],
      ["crawl", "爬行", "🐊"],
      ["crawling", "正在爬行", "🐊"],
      ["jump", "跳跃", "🦘"],
      ["jumping", "正在跳跃", "🦘"],
      ["eat", "吃", "🍽️"],
      ["eating", "正在吃", "🍽️"]
    ]
  },
  {
    "id": "under-the-sea",
    "name": "Under the Sea",
    "cn": "海洋动物",
    "icon": "🐬",
    "words": [
      ["seal", "海豹", "🦭"],
      ["seals", "海豹（复数）", "🦭🦭"],
      ["crab", "螃蟹", "🦀"],
      ["crabs", "螃蟹（复数）", "🦀🦀"],
      ["turtle", "乌龟", "🐢"],
      ["turtles", "乌龟（复数）", "🐢🐢"],
      ["starfish", "海星", "⭐"],
      ["shellfish", "甲壳类动物", "🦐"],
      ["shark", "鲨鱼", "🦈"],
      ["sharks", "鲨鱼（复数）", "🦈🦈"],
      ["dolphin", "海豚", "🐬"],
      ["dolphins", "海豚（复数）", "🐬🐬"],
      ["whale", "鲸鱼", "🐋"],
      ["whales", "鲸鱼（复数）", "🐋🐋"],
      ["seaweed", "海草", "🌿"]
    ]
  }
];

export const allWords: EnglishWord[] = themes.flatMap((theme) =>
  theme.words.map(([word, cn, emoji]) => ({
    word,
    cn,
    emoji,
    theme: theme.id,
  }))
);

export const grammarPatterns: GrammarPattern[] = [
  {
    id: "how-many",
    title: "How many · 有多少",
    question: "How many cows are there?",
    singular: "There is one cow.",
    plural: "There are two pigs.",
    rule: "一个用 There is；两个或以上用 There are。",
  },
  {
    id: "doing-now",
    title: "What ... doing? · 正在做什么",
    question: "What is the kangaroo doing?",
    singular: "It is jumping.",
    plural: "They are jumping.",
    rule: "单数用 is，复数用 are；动作词使用 -ing。",
  },
  {
    id: "animal-food",
    title: "What ... eat? · 吃什么",
    question: "What does a dolphin eat?",
    singular: "It eats fish and shellfish.",
    plural: "They eat fish and shellfish.",
    rule: "单数用 does / eats；复数用 do / eat。",
  },
];

export const grammarItems: GrammarQuestion[] = [
  {
    id: "there-cow",
    topic: "There is / There are",
    prompt: "There ___ one cow.",
    cn: "有一头奶牛。",
    emoji: "🐄",
    choices: ["is", "are", "am"],
    answer: "is",
    explanation: "one cow 是单数，所以用 There is。",
  },
  {
    id: "there-pigs",
    topic: "There is / There are",
    prompt: "There ___ two pigs.",
    cn: "有两只猪。",
    emoji: "🐷🐷",
    choices: ["are", "is", "am"],
    answer: "are",
    explanation: "two pigs 是复数，所以用 There are。",
  },
  {
    id: "how-many-cows",
    topic: "How many",
    prompt: "How many ___ are there?",
    cn: "有多少头奶牛？",
    emoji: "🐄🐄",
    choices: ["cows", "cow", "cowes"],
    answer: "cows",
    explanation: "How many 后面要接可数名词的复数 cows。",
  },
  {
    id: "mouse-plural",
    topic: "Irregular plurals",
    prompt: "One mouse, two ___.",
    cn: "一只老鼠，两只老鼠。",
    emoji: "🐭🐭",
    choices: ["mice", "mouses", "mouse"],
    answer: "mice",
    explanation: "mouse 的不规则复数是 mice。",
  },
  {
    id: "sheep-plural",
    topic: "Irregular plurals",
    prompt: "One sheep, two ___.",
    cn: "一只绵羊，两只绵羊。",
    emoji: "🐑🐑",
    choices: ["sheep", "sheeps", "sheepes"],
    answer: "sheep",
    explanation: "sheep 的单数和复数形式相同。",
  },
  {
    id: "kangaroo-doing",
    topic: "Present continuous",
    prompt: "What ___ the kangaroo doing?",
    cn: "袋鼠正在做什么？",
    emoji: "🦘",
    choices: ["is", "are", "do"],
    answer: "is",
    explanation: "the kangaroo 是单数，正在进行时用 is doing。",
  },
  {
    id: "kangaroos-doing",
    topic: "Present continuous",
    prompt: "What ___ the kangaroos doing?",
    cn: "袋鼠们正在做什么？",
    emoji: "🦘🦘",
    choices: ["are", "is", "does"],
    answer: "are",
    explanation: "kangaroos 是复数，正在进行时用 are doing。",
  },
  {
    id: "it-jumping",
    topic: "Present continuous",
    prompt: "It ___ jumping.",
    cn: "它正在跳。",
    emoji: "🦘",
    choices: ["is", "are", "do"],
    answer: "is",
    explanation: "It 是单数，搭配 is。",
  },
  {
    id: "they-jumping",
    topic: "Present continuous",
    prompt: "They ___ jumping.",
    cn: "它们正在跳。",
    emoji: "🦘🦘",
    choices: ["are", "is", "does"],
    answer: "are",
    explanation: "They 是复数，搭配 are。",
  },
  {
    id: "monkey-climbing",
    topic: "Present continuous",
    prompt: "The monkey is ___.",
    cn: "猴子正在攀爬。",
    emoji: "🐒",
    choices: ["climbing", "climb", "climbs"],
    answer: "climbing",
    explanation: "is 后接动作词的 -ing 形式 climbing。",
  },
  {
    id: "crocodiles-crawling",
    topic: "Present continuous",
    prompt: "The crocodiles are ___.",
    cn: "鳄鱼们正在爬行。",
    emoji: "🐊🐊",
    choices: ["crawling", "crawl", "crawls"],
    answer: "crawling",
    explanation: "are 后接动作词的 -ing 形式 crawling。",
  },
  {
    id: "dolphin-question",
    topic: "Do / Does",
    prompt: "What ___ a dolphin eat?",
    cn: "海豚吃什么？",
    emoji: "🐬",
    choices: ["does", "do", "is"],
    answer: "does",
    explanation: "a dolphin 是第三人称单数，疑问句用 does。",
  },
  {
    id: "dolphins-question",
    topic: "Do / Does",
    prompt: "What ___ dolphins eat?",
    cn: "海豚们吃什么？",
    emoji: "🐬🐬",
    choices: ["do", "does", "are"],
    answer: "do",
    explanation: "dolphins 是复数，疑问句用 do。",
  },
  {
    id: "dolphin-eats",
    topic: "It eats / They eat",
    prompt: "It ___ fish and shellfish.",
    cn: "它吃鱼和甲壳类动物。",
    emoji: "🐬",
    choices: ["eats", "eat", "eating"],
    answer: "eats",
    explanation: "It 是第三人称单数，一般现在时用 eats。",
  },
  {
    id: "dolphins-eat",
    topic: "It eats / They eat",
    prompt: "They ___ fish and shellfish.",
    cn: "它们吃鱼和甲壳类动物。",
    emoji: "🐬🐬",
    choices: ["eat", "eats", "eating"],
    answer: "eat",
    explanation: "They 是复数，一般现在时用 eat。",
  },
  {
    id: "these-mangoes",
    topic: "These / Those",
    prompt: "___ are mangoes.",
    cn: "这些是芒果。",
    emoji: "🥭🥭",
    choices: ["These", "This", "It"],
    answer: "These",
    explanation: "mangoes 是复数，近处的“这些”用 These。",
  },
  {
    id: "those-potatoes",
    topic: "These / Those",
    prompt: "___ are potatoes over there.",
    cn: "那边那些是土豆。",
    emoji: "🥔🥔",
    choices: ["Those", "That", "This"],
    answer: "Those",
    explanation: "复数且在远处，使用 Those。",
  },
  {
    id: "tomato-plural",
    topic: "Plural spelling",
    prompt: "One tomato, two ___.",
    cn: "一个番茄，两个番茄。",
    emoji: "🍅🍅",
    choices: ["tomatoes", "tomatos", "tomato"],
    answer: "tomatoes",
    explanation: "tomato 的复数加 -es：tomatoes。",
  },
  {
    id: "woman-plural",
    topic: "Irregular plurals",
    prompt: "One woman, two ___.",
    cn: "一个女人，两个女人。",
    emoji: "👩👩",
    choices: ["women", "womans", "woman"],
    answer: "women",
    explanation: "woman 的不规则复数是 women。",
  },
  {
    id: "people-are",
    topic: "There is / There are",
    prompt: "There ___ many people.",
    cn: "有许多人。",
    emoji: "🧑‍🤝‍🧑",
    choices: ["are", "is", "am"],
    answer: "are",
    explanation: "people 表示复数的人，搭配 are。",
  },
];

export const pluralPairs: string[][] = [
  ["pear", "pears", "🍐🍐", "一只梨", "two ___"],
  ["pea", "peas", "🫛🫛", "一颗豌豆", "three ___"],
  ["potato", "potatoes", "🥔🥔", "一个土豆", "two ___"],
  ["tomato", "tomatoes", "🍅🍅", "一个番茄", "two ___"],
  ["pineapple", "pineapples", "🍍🍍", "一个菠萝", "two ___"],
  ["mango", "mangoes", "🥭🥭", "一个芒果", "two ___"],
  ["foot", "feet", "🦶🦶", "一只脚", "two ___"],
  ["woman", "women", "👩👩", "一个女人", "two ___"],
  ["man", "men", "👨👨", "一个男人", "two ___"],
  ["cow", "cows", "🐄🐄", "一头奶牛", "two ___"],
  ["pig", "pigs", "🐷🐷", "一只猪", "two ___"],
  ["mouse", "mice", "🐭🐭", "一只老鼠", "two ___"],
  ["duck", "ducks", "🦆🦆", "一只鸭子", "two ___"],
  ["chicken", "chickens", "🐔🐔", "一只小鸡", "two ___"],
  ["rooster", "roosters", "🐓🐓", "一只公鸡", "two ___"],
  ["horse", "horses", "🐎🐎", "一匹马", "two ___"],
  ["sheep", "sheep", "🐑🐑", "一只绵羊", "two ___"],
  ["seal", "seals", "🦭🦭", "一只海豹", "two ___"],
  ["crab", "crabs", "🦀🦀", "一只螃蟹", "two ___"],
  ["turtle", "turtles", "🐢🐢", "一只乌龟", "two ___"],
  ["starfish", "starfish", "⭐⭐", "一只海星", "two ___"],
  ["shellfish", "shellfish", "🦐🦐", "一只甲壳类动物", "two ___"],
  ["shark", "sharks", "🦈🦈", "一条鲨鱼", "two ___"],
  ["dolphin", "dolphins", "🐬🐬", "一只海豚", "two ___"],
  ["whale", "whales", "🐋🐋", "一条鲸鱼", "two ___"]
];

export const pronounItems = [
  { label: "一个女人", emoji: "👩", answer: "She" },
  { label: "一个男人", emoji: "👨", answer: "He" },
  { label: "一只袋鼠", emoji: "🦘", answer: "It" },
  { label: "一只海豚", emoji: "🐬", answer: "It" },
  { label: "两只奶牛", emoji: "🐄🐄", answer: "They" },
  { label: "三只小鸡", emoji: "🐔🐔🐔", answer: "They" },
  { label: "两只鲨鱼", emoji: "🦈🦈", answer: "They" },
  { label: "一个男孩", emoji: "👦", answer: "He" }
];

export const beVerbItems = [
  { sentence: "There ___ one cow.", answer: "is", cn: "有一头奶牛。" },
  { sentence: "There ___ two pigs.", answer: "are", cn: "有两只猪。" },
  { sentence: "It ___ jumping.", answer: "is", cn: "它正在跳。" },
  { sentence: "They ___ jumping.", answer: "are", cn: "它们正在跳。" },
  { sentence: "The monkey ___ climbing.", answer: "is", cn: "猴子正在攀爬。" },
  { sentence: "The crocodiles ___ crawling.", answer: "are", cn: "鳄鱼们正在爬行。" },
  { sentence: "This ___ a pineapple.", answer: "is", cn: "这是一个菠萝。" },
  { sentence: "These ___ mangoes.", answer: "are", cn: "这些是芒果。" }
];

export const sentenceItems = [
  { parts: ["How", "many", "cows", "are", "there?"], cn: "有多少头奶牛？", emoji: "🐄🐄" },
  { parts: ["There", "is", "one", "cow."], cn: "有一头奶牛。", emoji: "🐄" },
  { parts: ["How", "many", "pigs", "are", "there?"], cn: "有多少只猪？", emoji: "🐷🐷" },
  { parts: ["There", "are", "two", "pigs."], cn: "有两只猪。", emoji: "🐷🐷" },
  { parts: ["What", "is", "the", "kangaroo", "doing?"], cn: "袋鼠正在做什么？", emoji: "🦘" },
  { parts: ["It", "is", "jumping."], cn: "它正在跳。", emoji: "🦘" },
  { parts: ["What", "are", "the", "kangaroos", "doing?"], cn: "袋鼠们正在做什么？", emoji: "🦘🦘" },
  { parts: ["They", "are", "jumping."], cn: "它们正在跳。", emoji: "🦘🦘" },
  { parts: ["What", "does", "a", "dolphin", "eat?"], cn: "海豚吃什么？", emoji: "🐬" },
  { parts: ["It", "eats", "fish", "and", "shellfish."], cn: "它吃鱼和甲壳类动物。", emoji: "🐬" },
  { parts: ["What", "do", "dolphins", "eat?"], cn: "海豚们吃什么？", emoji: "🐬🐬" },
  { parts: ["They", "eat", "fish", "and", "shellfish."], cn: "它们吃鱼和甲壳类动物。", emoji: "🐬🐬" },
  { parts: ["These", "are", "mangoes."], cn: "这些是芒果。", emoji: "🥭🥭" },
  { parts: ["Those", "are", "potatoes."], cn: "那些是土豆。", emoji: "🥔🥔" },
  { parts: ["The", "monkey", "is", "climbing."], cn: "猴子正在攀爬。", emoji: "🐒" },
  { parts: ["The", "crocodiles", "are", "crawling."], cn: "鳄鱼们正在爬行。", emoji: "🐊🐊" }
];
