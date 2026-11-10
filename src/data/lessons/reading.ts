/**
 * Bookoria (reading & literature) lessons.
 * Language-arts rule: `en` teaches with English examples, `ru` teaches the same concept
 * with genuinely Russian examples and rules. Choice questions keep the same correct index
 * in both languages.
 */
import type { Lesson, LText } from "@/types/content";

const t = (en: string, ru: string): LText => ({ en, ru });
const same = (s: string): LText => ({ en: s, ru: s });
const opts = (...pairs: [string, string][]): LText[] => pairs.map(([en, ru]) => ({ en, ru }));

/* ------------------------------------------------------------------ */
/* reading.syllables (grades 0-1)                                      */
/* ------------------------------------------------------------------ */
const SYL = "reading.syllables.l1";
const syllables: Lesson = {
  id: SYL,
  topicId: "reading.syllables",
  title: t("Clap the Syllables", "Хлопаем слоги"),
  subtopic: t("Splitting words into syllables", "Деление слов на слоги"),
  objective: t(
    "Split short words into syllables and count them by clapping.",
    "Делить короткие слова на слоги и считать их хлопками.",
  ),
  ageRange: [6, 7],
  grades: [0, 1],
  difficulty: 1,
  durationMin: 8,
  character: "oli",
  intro: t(
    "Hoo-hoo! Let's clap our hands and discover the little parts hiding inside words!",
    "Ух-ух! Давай похлопаем в ладоши и найдём маленькие части, которые прячутся в словах!",
  ),
  explanation: [
    t(
      "Words are made of small sound parts called syllables. Say a word slowly and clap once for each part: ap-ple has two claps.",
      "Слова состоят из маленьких частей — слогов. Скажи слово медленно и хлопни на каждый слог: ма-ма — два хлопка.",
    ),
    t(
      "Every syllable has a vowel sound inside it. Cat has one syllable, ti-ger has two, ba-na-na has three.",
      "Сколько в слове гласных, столько и слогов. В слове «кот» один слог, в слове «ры-ба» — два, в слове «мо-ло-ко» — три.",
    ),
    t(
      "Put your hand under your chin and say the word: each time your chin drops, that is a new syllable!",
      "Положи ладошку под подбородок и скажи слово: сколько раз подбородок опустится, столько и слогов!",
    ),
  ],
  example: {
    kind: "text",
    text: t(
      "cat 👏   ap-ple 👏👏   ba-na-na 👏👏👏",
      "кот 👏   ма-ма 👏👏   мо-ло-ко 👏👏👏",
    ),
  },
  practice: [
    {
      id: `${SYL}.p1`,
      type: "single",
      prompt: t("How many syllables are in the word «apple»?", "Сколько слогов в слове «мама»?"),
      hint: t("Clap it: ap - ple.", "Похлопай: ма - ма."),
      explanation: t("Ap-ple has two syllables: two claps.", "Ма-ма — два слога: два хлопка."),
      difficulty: 1,
      audio: true,
      options: [same("1"), same("2"), same("3")],
      answer: 1,
    },
    {
      id: `${SYL}.p2`,
      type: "image_selection",
      prompt: t("Which word has just ONE syllable?", "В каком слове только ОДИН слог?"),
      hint: t("Say each word and clap. Which one needs only one clap?", "Скажи каждое слово и похлопай. Где нужен только один хлопок?"),
      explanation: t("Cat — one clap. Ba-na-na has three, rab-bit has two.", "Кот — один хлопок. Ба-нан и кро-лик — по два."),
      difficulty: 1,
      audio: true,
      options: [
        { emoji: "🐱", label: t("cat", "кот") },
        { emoji: "🍌", label: t("banana", "банан") },
        { emoji: "🐰", label: t("rabbit", "кролик") },
      ],
      answer: 0,
    },
    {
      id: `${SYL}.p3`,
      type: "audio_recognition",
      prompt: t("Listen to the word. How many syllables do you hear?", "Послушай слово. Сколько слогов ты слышишь?"),
      hint: t("Clap along while you listen.", "Хлопай, пока слушаешь."),
      explanation: t("Ba-na-na has three syllables.", "Мо-ло-ко — три слога."),
      difficulty: 1,
      audio: true,
      say: t("ba - na - na", "мо - ло - ко"),
      options: [same("1"), same("2"), same("3")],
      answer: 2,
    },
  ],
  check: [
    {
      id: `${SYL}.c1`,
      type: "true_false",
      prompt: t("The word «tiger» has two syllables: ti-ger.", "В слове «рыба» два слога: ры-ба."),
      explanation: t("Yes! Ti-ger — two claps.", "Да! Ры-ба — два хлопка."),
      difficulty: 1,
      audio: true,
      answer: true,
    },
    {
      id: `${SYL}.c2`,
      type: "single",
      prompt: t("Which word is split into syllables correctly?", "Какое слово правильно разделено на слоги?"),
      hint: t("Each part needs a vowel sound.", "В каждом слоге должна быть гласная."),
      explanation: t("Ro-bot: each part has a vowel, o and o.", "Ли-са: в каждом слоге есть гласная — и, а."),
      difficulty: 1,
      audio: true,
      options: opts(["ca-t", "ко-т"], ["ro-bot", "ли-са"], ["b-ook", "д-ом"]),
      answer: 1,
    },
    {
      id: `${SYL}.c3`,
      type: "ordering",
      prompt: t(
        "Put the syllables in order to make a word: a pretty insect with wings 🦋",
        "Поставь слоги по порядку и собери слово: верный друг, который лает 🐶",
      ),
      explanation: t("But-ter-fly — butterfly!", "Со-ба-ка — собака!"),
      difficulty: 2,
      audio: true,
      items: opts(["but", "со"], ["ter", "ба"], ["fly", "ка"]),
    },
    {
      id: `${SYL}.c4`,
      type: "multiple",
      prompt: t("Which words have TWO syllables? Pick all.", "В каких словах ДВА слога? Выбери все."),
      hint: t("Clap each word slowly.", "Похлопай каждое слово медленно."),
      explanation: t("Pen-cil and sis-ter have two syllables. Dog and sun have one.", "Ли-са и ко-за — два слога. Дом и сон — один."),
      difficulty: 2,
      audio: true,
      options: opts(["pencil", "лиса"], ["dog", "дом"], ["sister", "коза"], ["sun", "сон"]),
      answers: [0, 2],
    },
    {
      id: `${SYL}.c5`,
      type: "fill_blank",
      prompt: t("Write the missing last syllable.", "Допиши последний слог."),
      hint: t("This animal loves bananas 🐒", "Она живёт в воде 🐟"),
      explanation: t("Mon-key — monkey!", "Ры-ба — рыба!"),
      difficulty: 2,
      audio: true,
      text: t("mon-___ 🐒", "ры-___ 🐟"),
      accepted: { en: ["key"], ru: ["ба"] },
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Say words slowly and clap for every part. Count the vowel sounds — that is the number of syllables.",
    "Произноси слова медленно и хлопай на каждый слог. Считай гласные — сколько гласных, столько и слогов.",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.words (grade 1)                                              */
/* ------------------------------------------------------------------ */
const WRD = "reading.words.l1";
const words: Lesson = {
  id: WRD,
  topicId: "reading.words",
  title: t("Building Words", "Собираем слова"),
  subtopic: t("Blending sounds into words", "Слияние звуков в слова"),
  objective: t(
    "Blend letter sounds to read and build short words.",
    "Сливать звуки и слоги, чтобы читать и составлять короткие слова.",
  ),
  ageRange: [7, 7],
  grades: [1, 1],
  difficulty: 1,
  durationMin: 10,
  character: "oli",
  intro: t(
    "Letters are like building blocks. Let's put them together and build real words!",
    "Буквы — как кубики. Давай сложим их вместе и построим настоящие слова!",
  ),
  explanation: [
    t(
      "Every letter makes a sound. When we say the sounds one after another and glide them together, we read a word: c-a-t → cat.",
      "Каждая буква обозначает звук. Сливаем согласный с гласным — получаем слог: к-о → ко. Из слогов складываются слова: ко-т → кот, ма-ма → мама.",
    ),
    t(
      "Read from left to right. If a word is long, read it in small parts first, then say it fast.",
      "Читаем слева направо. Длинное слово сначала читаем по слогам, а потом говорим целиком.",
    ),
  ],
  example: { kind: "text", text: t("c + a + t = cat 🐱", "к + о + т = кот 🐱") },
  game: "word-builder",
  practice: [
    {
      id: `${WRD}.p1`,
      type: "word_building",
      prompt: t("Build the word for this animal: 🐱", "Собери слово для этого животного: 🐱"),
      hint: t("It starts with the sound /k/ and has 3 letters.", "Оно начинается на «к» и в нём 3 буквы."),
      explanation: t("c-a-t → cat!", "к-о-т → кот!"),
      difficulty: 1,
      audio: true,
      word: t("cat", "кот"),
    },
    {
      id: `${WRD}.p2`,
      type: "image_selection",
      prompt: t("Read the word and find its picture: SUN", "Прочитай слово и найди картинку: СОЛНЦЕ"),
      hint: t("It shines in the sky in the daytime.", "Оно светит на небе днём."),
      explanation: t("☀️ is the sun.", "☀️ — это солнце."),
      difficulty: 1,
      audio: true,
      options: [
        { emoji: "☀️", label: t("sun", "солнце") },
        { emoji: "🌙", label: t("moon", "луна") },
        { emoji: "⭐", label: t("star", "звезда") },
      ],
      answer: 0,
    },
    {
      id: `${WRD}.p3`,
      type: "audio_recognition",
      prompt: t("Listen and choose the word you hear.", "Послушай и выбери слово, которое услышишь."),
      hint: t("Listen to the middle sound carefully.", "Внимательно послушай звук в середине."),
      explanation: t("You heard «dog».", "Ты услышал слово «дом»."),
      difficulty: 1,
      audio: true,
      say: t("dog", "дом"),
      options: opts(["dig", "дым"], ["dog", "дом"], ["log", "сом"]),
      answer: 1,
    },
  ],
  check: [
    {
      id: `${WRD}.c1`,
      type: "word_building",
      prompt: t("Build the word for this picture: 🐟", "Собери слово для этой картинки: 🐟"),
      explanation: t("f-i-sh → fish!", "ры-ба → рыба!"),
      difficulty: 1,
      audio: true,
      word: t("fish", "рыба"),
    },
    {
      id: `${WRD}.c2`,
      type: "single",
      prompt: t("Which word names this animal: 🐸?", "Какое слово называет это животное: 🐸?"),
      explanation: t("🐸 is a frog.", "🐸 — это лягушка."),
      difficulty: 1,
      audio: true,
      options: opts(["frog", "лягушка"], ["flag", "лодка"], ["fog", "лампа"]),
      answer: 0,
    },
    {
      id: `${WRD}.c3`,
      type: "fill_blank",
      prompt: t("Write the missing letter.", "Впиши пропущенную букву."),
      hint: t("This pet says «woof» 🐶", "Это животное мурлычет 🐱"),
      explanation: t("d-o-g → dog.", "к-о-т → кот."),
      difficulty: 1,
      audio: true,
      text: t("d___g 🐶", "к___т 🐱"),
      accepted: { en: ["o"], ru: ["о", "o"] },
    },
    {
      id: `${WRD}.c4`,
      type: "true_false",
      prompt: t("The word «hat» has three letters: h-a-t.", "В слове «сок» три буквы: с-о-к."),
      explanation: t("Yes, h-a-t — three letters.", "Да, с-о-к — три буквы."),
      difficulty: 1,
      audio: true,
      answer: true,
    },
    {
      id: `${WRD}.c5`,
      type: "image_selection",
      prompt: t("Read the word and find its picture: BALL", "Прочитай слово и найди картинку: МЯЧ"),
      explanation: t("⚽ is a ball.", "⚽ — это мяч."),
      difficulty: 1,
      audio: true,
      options: [
        { emoji: "🍎", label: t("apple", "яблоко") },
        { emoji: "🚗", label: t("car", "машина") },
        { emoji: "⚽", label: t("ball", "мяч") },
      ],
      answer: 2,
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Say each sound slowly, then glide them together faster and faster until you hear the word.",
    "Читай по слогам: сначала медленно, потом быстрее, пока не услышишь целое слово.",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.sentences (grades 1-2)                                       */
/* ------------------------------------------------------------------ */
const SEN = "reading.sentences.l1";
const sentences: Lesson = {
  id: SEN,
  topicId: "reading.sentences",
  title: t("My First Sentences", "Мои первые предложения"),
  subtopic: t("Capital letters and end marks", "Большая буква и знак в конце"),
  objective: t(
    "Build a sentence from words, start it with a capital letter and end it with a mark.",
    "Составлять предложение из слов, начинать его с большой буквы и ставить знак в конце.",
  ),
  ageRange: [7, 8],
  grades: [1, 2],
  difficulty: 1,
  durationMin: 10,
  character: "oli",
  intro: t(
    "Words love to hold hands and make sentences. Let's help them line up!",
    "Слова любят браться за руки и становиться предложениями. Давай поможем им встать по порядку!",
  ),
  explanation: [
    t(
      "A sentence is a group of words that tells a whole idea: The dog runs.",
      "Предложение — это слова, которые выражают законченную мысль: Собака бежит.",
    ),
    t(
      "A sentence starts with a capital (big) letter and ends with a full stop (.), a question mark (?) or an exclamation mark (!).",
      "Предложение начинается с большой (заглавной) буквы. В конце ставим точку (.), вопросительный (?) или восклицательный (!) знак. Слова пишем отдельно друг от друга.",
    ),
  ],
  example: { kind: "text", text: t("The dog runs. 🐶  Is it fast? 🤔  Yes! 🎉", "Собака бежит. 🐶  Она быстрая? 🤔  Да! 🎉") },
  practice: [
    {
      id: `${SEN}.p1`,
      type: "ordering",
      prompt: t("Put the words in order to make a sentence.", "Расставь слова по порядку, чтобы получилось предложение."),
      hint: t("The word with a capital letter goes first.", "Слово с большой буквы идёт первым."),
      explanation: t("The cat drinks milk.", "Кошка пьёт молоко."),
      difficulty: 1,
      audio: true,
      items: opts(["The cat", "Кошка"], ["drinks", "пьёт"], ["milk.", "молоко."]),
    },
    {
      id: `${SEN}.p2`,
      type: "single",
      prompt: t("Which sentence is written correctly?", "Какое предложение записано правильно?"),
      hint: t("Look at the first letter and the end.", "Посмотри на первую букву и на конец."),
      explanation: t(
        "It begins with a capital letter and ends with a full stop.",
        "Оно начинается с большой буквы и заканчивается точкой.",
      ),
      difficulty: 1,
      audio: true,
      options: opts(
        ["the sun is hot.", "солнце светит."],
        ["The sun is hot.", "Солнце светит."],
        ["The sun is hot", "Солнце светит"],
      ),
      answer: 1,
    },
    {
      id: `${SEN}.p3`,
      type: "true_false",
      prompt: t("A sentence begins with a small letter.", "Предложение начинается с маленькой буквы."),
      hint: t("Think about the first word of a sentence.", "Вспомни, как пишется первое слово в предложении."),
      explanation: t("A sentence begins with a capital letter.", "Предложение начинается с большой буквы."),
      difficulty: 1,
      audio: true,
      answer: false,
    },
  ],
  check: [
    {
      id: `${SEN}.c1`,
      type: "ordering",
      prompt: t("Make a sentence from the words.", "Составь предложение из слов."),
      explanation: t("My mom reads a book.", "Моя мама читает книгу."),
      difficulty: 1,
      audio: true,
      items: opts(["My", "Моя"], ["mom", "мама"], ["reads", "читает"], ["a book.", "книгу."]),
    },
    {
      id: `${SEN}.c2`,
      type: "fill_blank",
      prompt: t("Put the right mark at the end.", "Поставь нужный знак в конце."),
      hint: t("This sentence asks something.", "В этом предложении что-то спрашивают."),
      explanation: t("A question ends with a question mark: ?", "В конце вопроса ставим вопросительный знак: ?"),
      difficulty: 1,
      audio: true,
      text: t("Where is my hat___", "Где моя шапка___"),
      accepted: { en: ["?"], ru: ["?"] },
    },
    {
      id: `${SEN}.c3`,
      type: "multiple",
      prompt: t("Which are whole sentences? Pick all.", "Где целые предложения? Выбери все."),
      explanation: t(
        "«Birds sing.» and «We play ball.» tell a whole idea.",
        "«Птицы поют.» и «Мы играем в мяч.» выражают законченную мысль.",
      ),
      difficulty: 2,
      audio: true,
      options: opts(
        ["Birds sing.", "Птицы поют."],
        ["big red", "большой красный"],
        ["We play ball.", "Мы играем в мяч."],
        ["under the", "под столом"],
      ),
      answers: [0, 2],
    },
    {
      id: `${SEN}.c4`,
      type: "single",
      prompt: t("What goes at the end of a telling sentence?", "Что ставят в конце повествовательного предложения (когда просто сообщают)?"),
      explanation: t("A telling sentence ends with a full stop.", "Когда мы просто сообщаем, ставим точку."),
      difficulty: 1,
      audio: true,
      options: [same("."), same("?"), same(",")],
      answer: 0,
    },
    {
      id: `${SEN}.c5`,
      type: "drag_drop",
      prompt: t("Sort: is it a sentence or not?", "Разложи: это предложение или нет?"),
      explanation: t(
        "A sentence tells a whole idea and ends with a mark.",
        "Предложение выражает законченную мысль и заканчивается знаком.",
      ),
      difficulty: 2,
      audio: true,
      items: [
        { id: "a", label: t("The fish swims.", "Рыба плывёт.") },
        { id: "b", label: t("green tree", "зелёное дерево") },
        { id: "c", label: t("I can jump.", "Я умею прыгать.") },
        { id: "d", label: t("on the", "на столе") },
      ],
      buckets: [
        { id: "yes", label: t("Sentence", "Предложение") },
        { id: "no", label: t("Not a sentence", "Не предложение") },
      ],
      answer: { a: "yes", b: "no", c: "yes", d: "no" },
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Check three things: Does it tell a whole idea? Does it start with a capital letter? Is there a mark at the end?",
    "Проверь три вещи: есть ли законченная мысль? Начинается ли с большой буквы? Стоит ли знак в конце?",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.spelling (grades 2-4)                                        */
/* ------------------------------------------------------------------ */
const SPL = "reading.spelling.l1";
const spelling: Lesson = {
  id: SPL,
  topicId: "reading.spelling",
  title: t("Spelling Detectives", "Детективы правописания"),
  subtopic: t("Magic e and tricky words", "Проверяемые гласные и согласные, ЖИ-ШИ"),
  objective: t(
    "Use the magic-e rule and remember common tricky words.",
    "Проверять безударные гласные и парные согласные, писать ЖИ-ШИ с буквой И.",
  ),
  ageRange: [8, 10],
  grades: [2, 4],
  difficulty: 2,
  durationMin: 12,
  character: "oli",
  intro: t(
    "Let's become spelling detectives and crack the secret codes of words!",
    "Давай станем детективами правописания и разгадаем тайны слов!",
  ),
  explanation: [
    t(
      "Magic e: an e at the end of a word is silent, but it makes the vowel before it say its name. cap → cape, kit → kite, hop → hope.",
      "Безударную гласную проверяем ударением: измени слово так, чтобы гласная стала ударной. Вода́ — во́ды, гора́ — го́ры.",
    ),
    t(
      "Some words do not follow the rules — they are tricky words. We learn them by heart: said, because, friend.",
      "Парную согласную на конце слова проверяем так, чтобы после неё стояла гласная: дуб — дубы́, лёд — льды. А словарные слова (корова, собака) запоминаем.",
    ),
    t(
      "Read the word, cover it, write it, then check it. Detectives always check!",
      "Запомни правило: ЖИ-ШИ пиши с буквой И — жираф, шина, лыжи. Детективы всегда проверяют!",
    ),
  ],
  example: {
    kind: "text",
    text: t(
      "cap + e → cape 🧢   kit + e → kite 🪁   Tricky words: said, because, friend",
      "гора́ → го́ры ⛰️   дуб → дубы́ 🌳   ЖИ-ШИ: жираф 🦒, шина 🛞",
    ),
  },
  game: "word-builder",
  practice: [
    {
      id: `${SPL}.p1`,
      type: "single",
      prompt: t("Which word is spelled correctly?", "Какое слово написано правильно?"),
      hint: t("This is a tricky word: f-r-i-e-n-d.", "Вспомни правило: ЖИ-ШИ пиши с буквой И."),
      explanation: t("«Friend» is a tricky word: i comes before e.", "«Шина» — ШИ пишем с буквой И."),
      difficulty: 2,
      audio: true,
      options: opts(["frend", "шына"], ["friend", "шина"], ["freind", "шинна"]),
      answer: 1,
    },
    {
      id: `${SPL}.p2`,
      type: "fill_blank",
      prompt: t("Write the missing letter.", "Вставь пропущенную букву."),
      hint: t("Magic e makes the i say its name: bike.", "Измени слово, чтобы гласная стала ударной: во́ды."),
      explanation: t("bik + e → bike.", "Вода — проверяем словом «во́ды», пишем О."),
      difficulty: 2,
      audio: true,
      text: t("I ride my bik___ 🚲", "В реке чистая в___да 💧"),
      accepted: { en: ["e"], ru: ["о", "o"] },
    },
    {
      id: `${SPL}.p3`,
      type: "true_false",
      prompt: t(
        "In «hope», the e at the end is silent and makes the o say its name.",
        "В слове «ёж» на конце пишем Ж, потому что можно проверить: ежи́.",
      ),
      hint: t("Say «hop» and «hope». What changed?", "Скажи «ежи». Какой звук ты слышишь?"),
      explanation: t("Yes! That is the magic-e rule.", "Да! Ежи́ — слышим Ж, значит, и в слове «ёж» пишем Ж."),
      difficulty: 2,
      audio: true,
      answer: true,
    },
  ],
  check: [
    {
      id: `${SPL}.c1`,
      type: "single",
      prompt: t("Which word is spelled correctly?", "Какое словарное слово написано правильно?"),
      explanation: t("«Because» is a tricky word to remember.", "«Корова» — словарное слово, его нужно запомнить."),
      difficulty: 2,
      audio: true,
      options: opts(["becos", "карова"], ["because", "корова"], ["becuz", "каровва"]),
      answer: 1,
    },
    {
      id: `${SPL}.c2`,
      type: "multiple",
      prompt: t("Which words have a magic e? Pick all.", "Какие слова написаны правильно? Выбери все."),
      hint: t("Look for a silent e at the end.", "Проверь: дубы, грибы, льды, зубы."),
      explanation: t(
        "Cake and kite end with a silent magic e.",
        "Дуб (дубы) и лёд (льды) написаны верно. Правильно: гриб, зуб.",
      ),
      difficulty: 2,
      audio: true,
      options: opts(["cake", "дуб"], ["cat", "грип"], ["kite", "лёд"], ["kit", "зуп"]),
      answers: [0, 2],
    },
    {
      id: `${SPL}.c3`,
      type: "word_building",
      prompt: t("Build the word: 🎂 (remember magic e!)", "Собери слово: 🦒 (помни: ЖИ пиши с И!)"),
      explanation: t("c-a-k-e → cake.", "ж-и-р-а-ф → жираф."),
      difficulty: 2,
      audio: true,
      word: t("cake", "жираф"),
    },
    {
      id: `${SPL}.c4`,
      type: "fill_blank",
      prompt: t("Write the missing letters.", "Вставь пропущенную букву."),
      hint: t("This tricky word sounds like «sed».", "ЖИ-ШИ пиши с буквой И."),
      explanation: t("«Said» is spelled s-a-i-d.", "Шли — ШИ пишем с буквой И."),
      difficulty: 3,
      audio: true,
      text: t("She s___d hello to me.", "Мы ш___ли домой."),
      accepted: { en: ["ai"], ru: ["и"] },
    },
    {
      id: `${SPL}.c5`,
      type: "matching",
      prompt: t("Match each word with its magic-e partner.", "Соедини слово с проверочным словом."),
      explanation: t(
        "Adding e changes the vowel sound: cap → cape.",
        "В проверочном слове гласная или согласная звучит ясно: зима — зи́мы.",
      ),
      difficulty: 3,
      audio: true,
      pairs: [
        { left: t("cap", "з_ма"), right: t("cape", "зи́мы") },
        { left: t("hop", "тр_ва"), right: t("hope", "тра́вы") },
        { left: t("kit", "сне_ (г/к)"), right: t("kite", "снега́") },
      ],
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Read the word, cover it, write it, check it. Remember: magic e makes the vowel say its name.",
    "Ищи проверочное слово: для гласной — где она под ударением, для согласной — где после неё гласная.",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.parts-of-speech (grades 2-4)                                 */
/* ------------------------------------------------------------------ */
const POS = "reading.parts-of-speech.l1";
const partsOfSpeech: Lesson = {
  id: POS,
  topicId: "reading.parts-of-speech",
  title: t("Nouns, Verbs and Adjectives", "Существительное, глагол, прилагательное"),
  subtopic: t("Three main parts of speech", "Три главные части речи"),
  objective: t(
    "Tell nouns, verbs and adjectives apart.",
    "Различать существительные, глаголы и прилагательные по вопросам.",
  ),
  ageRange: [8, 10],
  grades: [2, 4],
  difficulty: 2,
  durationMin: 12,
  character: "oli",
  intro: t(
    "Every word has a job! Some name things, some show actions, and some describe. Let's meet them!",
    "У каждого слова есть работа! Одни называют предметы, другие — действия, третьи — признаки. Давай познакомимся!",
  ),
  explanation: [
    t(
      "A noun names a person, place, animal or thing: girl, school, dog, ball.",
      "Существительное обозначает предмет и отвечает на вопросы кто? что?: девочка, школа, кот, мяч.",
    ),
    t(
      "A verb is an action word — what someone does: run, eat, sing.",
      "Глагол обозначает действие и отвечает на вопросы что делать? что сделать?: бежать, читает, спела.",
    ),
    t(
      "An adjective describes a noun — what it is like: big, red, happy.",
      "Прилагательное обозначает признак предмета и отвечает на вопросы какой? какая? какое?: большой, красная, весёлое.",
    ),
  ],
  example: {
    kind: "text",
    text: t(
      "The big 🐶 runs.  big = adjective · dog = noun · runs = verb",
      "Большая 🐶 бежит.  большая — прилагательное · собака — существительное · бежит — глагол",
    ),
  },
  practice: [
    {
      id: `${POS}.p1`,
      type: "drag_drop",
      prompt: t("Sort the words into parts of speech.", "Разложи слова по частям речи."),
      hint: t("Ask: Is it a thing? An action? Does it describe?", "Задай вопрос: кто? что? / что делать? / какой?"),
      explanation: t(
        "Cat, apple — nouns. Jump, sing — verbs. Happy, tall — adjectives.",
        "Кот, яблоко — существительные. Прыгать, поёт — глаголы. Весёлый, высокий — прилагательные.",
      ),
      difficulty: 2,
      audio: true,
      items: [
        { id: "a", label: t("cat", "кот") },
        { id: "b", label: t("jump", "прыгать") },
        { id: "c", label: t("happy", "весёлый") },
        { id: "d", label: t("apple", "яблоко") },
        { id: "e", label: t("sing", "поёт") },
        { id: "f", label: t("tall", "высокий") },
      ],
      buckets: [
        { id: "noun", label: t("Noun", "Существительное") },
        { id: "verb", label: t("Verb", "Глагол") },
        { id: "adj", label: t("Adjective", "Прилагательное") },
      ],
      answer: { a: "noun", b: "verb", c: "adj", d: "noun", e: "verb", f: "adj" },
    },
    {
      id: `${POS}.p2`,
      type: "single",
      prompt: t("Which word is a verb?", "Какое слово — глагол?"),
      hint: t("A verb is something you can do.", "Глагол отвечает на вопрос «что делать?»."),
      explanation: t("You can swim — it is an action.", "Плавать — что делать? Это глагол."),
      difficulty: 1,
      audio: true,
      options: opts(["table", "стол"], ["swim", "плавать"], ["green", "зелёный"]),
      answer: 1,
    },
    {
      id: `${POS}.p3`,
      type: "true_false",
      prompt: t("«Happy» is a noun.", "«Весёлый» — это существительное."),
      hint: t("Does «happy» name a thing or describe one?", "Задай вопрос: весёлый — какой?"),
      explanation: t("«Happy» describes, so it is an adjective.", "Весёлый — какой? Это прилагательное."),
      difficulty: 2,
      audio: true,
      answer: false,
    },
  ],
  check: [
    {
      id: `${POS}.c1`,
      type: "single",
      prompt: t("Find the adjective: «The red ball rolls.»", "Найди прилагательное: «Красный мяч катится»."),
      explanation: t("«Red» describes the ball.", "Мяч какой? Красный — это прилагательное."),
      difficulty: 2,
      audio: true,
      options: opts(["red", "красный"], ["ball", "мяч"], ["rolls", "катится"]),
      answer: 0,
    },
    {
      id: `${POS}.c2`,
      type: "multiple",
      prompt: t("Which words are nouns? Pick all.", "Какие слова — существительные? Выбери все."),
      explanation: t("House and teacher name a thing and a person.", "Дом — что? Учитель — кто? Это существительные."),
      difficulty: 2,
      audio: true,
      options: opts(["house", "дом"], ["run", "бежать"], ["teacher", "учитель"], ["soft", "мягкий"]),
      answers: [0, 2],
    },
    {
      id: `${POS}.c3`,
      type: "fill_blank",
      prompt: t("Add a verb to finish the sentence.", "Вставь глагол, чтобы закончить предложение."),
      hint: t("What can a bird do in the sky?", "Что делает птица в небе?"),
      explanation: t("«Flies» is an action — a verb.", "«Летит» — что делает? Это глагол."),
      difficulty: 2,
      audio: true,
      text: t("The bird ___ in the sky.", "Птица ___ в небе."),
      accepted: {
        en: ["flies", "sings", "soars", "glides", "flaps", "floats"],
        ru: ["летит", "летает", "парит", "поёт", "поет", "кружит", "кружится"],
      },
    },
    {
      id: `${POS}.c4`,
      type: "matching",
      prompt: t("Match each part of speech with its job.", "Соедини часть речи с её вопросами."),
      explanation: t(
        "Nouns name, verbs act, adjectives describe.",
        "Существительное — кто? что?; глагол — что делать?; прилагательное — какой?",
      ),
      difficulty: 2,
      audio: true,
      pairs: [
        { left: t("noun", "существительное"), right: t("names a person, place or thing", "кто? что?") },
        { left: t("verb", "глагол"), right: t("an action word", "что делать? что сделать?") },
        { left: t("adjective", "прилагательное"), right: t("a describing word", "какой? какая? какое?") },
      ],
    },
    {
      id: `${POS}.c5`,
      type: "drag_drop",
      prompt: t(
        "Sort the words from «The small frog jumps into the pond.»",
        "Разложи слова из предложения «Маленькая лягушка прыгает в пруд».",
      ),
      explanation: t(
        "small — adjective, frog and pond — nouns, jumps — verb.",
        "маленькая — прилагательное, лягушка и пруд — существительные, прыгает — глагол.",
      ),
      difficulty: 3,
      audio: true,
      items: [
        { id: "a", label: t("small", "маленькая") },
        { id: "b", label: t("frog", "лягушка") },
        { id: "c", label: t("jumps", "прыгает") },
        { id: "d", label: t("pond", "пруд") },
      ],
      buckets: [
        { id: "noun", label: t("Noun", "Существительное") },
        { id: "verb", label: t("Verb", "Глагол") },
        { id: "adj", label: t("Adjective", "Прилагательное") },
      ],
      answer: { a: "adj", b: "noun", c: "verb", d: "noun" },
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Ask about each word: Is it a thing (noun)? Something you do (verb)? Does it describe (adjective)?",
    "Задавай вопрос к слову: кто? что? — существительное; что делать? — глагол; какой? — прилагательное.",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.punctuation (grades 2-5)                                     */
/* ------------------------------------------------------------------ */
const PUN = "reading.punctuation.l1";
const punctuation: Lesson = {
  id: PUN,
  topicId: "reading.punctuation",
  title: t("Little Marks, Big Help", "Маленькие знаки — большая помощь"),
  subtopic: t("End marks and commas", "Знаки в конце предложения и запятая"),
  objective: t(
    "Choose the right end mark and use commas in lists and before «but».",
    "Выбирать знак в конце предложения, ставить запятые между однородными словами и перед «а», «но».",
  ),
  ageRange: [8, 11],
  grades: [2, 5],
  difficulty: 2,
  durationMin: 12,
  character: "oli",
  intro: t(
    "Punctuation marks are like road signs for readers. They tell us when to stop, ask or shout hooray!",
    "Знаки препинания — как дорожные знаки для читателя. Они подсказывают, где остановиться, спросить или крикнуть «ура»!",
  ),
  explanation: [
    t(
      "A full stop (.) ends a telling sentence. A question mark (?) ends a question. An exclamation mark (!) shows strong feeling.",
      "Точка (.) ставится в конце повествовательного предложения, вопросительный знак (?) — в конце вопроса, восклицательный знак (!) — когда говорим с сильным чувством.",
    ),
    t(
      "A comma (,) separates things in a list: apples, pears and plums. It also goes before «but» when it joins two ideas: I wanted to play, but it rained.",
      "Запятая (,) разделяет однородные слова: яблоки, груши и сливы (перед одиночным «и» запятую не ставим). Ещё запятая нужна перед «а» и «но»: Я хотел гулять, но пошёл дождь.",
    ),
  ],
  example: {
    kind: "text",
    text: t(
      "I like cats. Do you like cats? I love cats! I have a cat, a dog and a fish.",
      "Я люблю кошек. А ты любишь кошек? Я обожаю кошек! У меня есть кошка, собака и рыбка.",
    ),
  },
  practice: [
    {
      id: `${PUN}.p1`,
      type: "single",
      prompt: t("Which mark ends this sentence: «What is your name_»", "Какой знак нужен в конце: «Как тебя зовут_»"),
      hint: t("Is someone asking something?", "Здесь о чём-то спрашивают?"),
      explanation: t("It is a question, so we use «?».", "Это вопрос, поэтому ставим «?»."),
      difficulty: 1,
      audio: true,
      options: [same("."), same("?"), same("!")],
      answer: 1,
    },
    {
      id: `${PUN}.p2`,
      type: "fill_blank",
      prompt: t("Put in the missing mark.", "Поставь пропущенный знак."),
      hint: t("This is a list of fruits.", "Здесь перечисляются фрукты."),
      explanation: t("Items in a list are separated by commas.", "Однородные слова разделяем запятыми."),
      difficulty: 2,
      audio: true,
      text: t("I bought apples___ pears and plums.", "Я купил яблоки___ груши и сливы."),
      accepted: { en: [","], ru: [","] },
    },
    {
      id: `${PUN}.p3`,
      type: "true_false",
      prompt: t(
        "An exclamation mark shows strong feeling: Hooray!",
        "Восклицательный знак ставят, когда говорят с сильным чувством: Ура!",
      ),
      hint: t("Think about how you say «Hooray».", "Вспомни, как ты говоришь «Ура»."),
      explanation: t("Yes! «!» shows joy, surprise or excitement.", "Да! «!» передаёт радость, удивление, восторг."),
      difficulty: 1,
      audio: true,
      answer: true,
    },
  ],
  check: [
    {
      id: `${PUN}.c1`,
      type: "drag_drop",
      prompt: t("Which mark does each sentence need?", "Какой знак нужен в конце каждого предложения?"),
      explanation: t(
        "Telling — «.», asking — «?», strong feeling — «!».",
        "Сообщаем — «.», спрашиваем — «?», сильное чувство — «!».",
      ),
      difficulty: 2,
      audio: true,
      items: [
        { id: "a", label: t("The sky is blue", "Небо голубое") },
        { id: "b", label: t("Can you swim", "Ты умеешь плавать") },
        { id: "c", label: t("What a wonderful day", "Какой чудесный день") },
        { id: "d", label: t("Where do you live", "Где ты живёшь") },
      ],
      buckets: [
        { id: "dot", label: same(".") },
        { id: "q", label: same("?") },
        { id: "ex", label: same("!") },
      ],
      answer: { a: "dot", b: "q", c: "ex", d: "q" },
    },
    {
      id: `${PUN}.c2`,
      type: "single",
      prompt: t("Where are the commas in the right place?", "Где запятые стоят правильно?"),
      explanation: t(
        "Commas separate the items in the list: a cat, a dog and a cow.",
        "Запятые разделяют однородные слова: кошку, собаку и корову. Перед одиночным «и» запятая не нужна.",
      ),
      difficulty: 3,
      audio: true,
      options: opts(
        ["I saw a cat a dog, and a cow.", "Я видел кошку собаку, и корову."],
        ["I saw a cat, a dog and a cow.", "Я видел кошку, собаку и корову."],
        ["I saw, a cat a dog and a cow.", "Я видел, кошку собаку и корову."],
      ),
      answer: 1,
    },
    {
      id: `${PUN}.c3`,
      type: "fill_blank",
      prompt: t("Put in the missing mark.", "Поставь пропущенный знак."),
      explanation: t(
        "A comma goes before «but» when it joins two ideas.",
        "Перед союзом «но» ставится запятая.",
      ),
      difficulty: 3,
      audio: true,
      text: t("I wanted to play outside___ but it was raining.", "Я хотел гулять___ но пошёл дождь."),
      accepted: { en: [","], ru: [","] },
    },
    {
      id: `${PUN}.c4`,
      type: "multiple",
      prompt: t("Which sentences need a question mark? Pick all.", "В конце каких предложений нужен вопросительный знак? Выбери все."),
      explanation: t("«Where is the cat» and «Do you like soup» are questions.", "«Где кошка» и «Ты любишь суп» — это вопросы."),
      difficulty: 2,
      audio: true,
      options: opts(
        ["Where is the cat", "Где кошка"],
        ["The cat is here", "Кошка здесь"],
        ["Do you like soup", "Ты любишь суп"],
        ["I like soup", "Я люблю суп"],
      ),
      answers: [0, 2],
    },
    {
      id: `${PUN}.c5`,
      type: "true_false",
      prompt: t("A comma is used to end a sentence.", "Запятую ставят в конце предложения."),
      explanation: t(
        "A sentence ends with . ? or ! — a comma goes inside a sentence.",
        "В конце предложения ставят . ? или ! — а запятая стоит внутри предложения.",
      ),
      difficulty: 1,
      audio: true,
      answer: false,
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Read the sentence aloud. Does your voice stop, ask or get excited? Pause for commas in lists.",
    "Прочитай предложение вслух. Голос понижается, спрашивает или радуется? Ищи однородные слова и союзы «а», «но».",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.comprehension (grades 2-6)                                   */
/* ------------------------------------------------------------------ */
const CMP = "reading.comprehension.l1";
const KITTEN: LText = t(
  "Mila found a tiny kitten under the old bench in the park. It was wet and shaking. Mila wrapped it in her scarf and carried it home. Grandma warmed some milk, and the kitten drank every drop. Soon it was purring on the warm windowsill. Mila named it Button because its nose was small and round.",
  "Мила нашла крошечного котёнка под старой скамейкой в парке. Он был мокрый и дрожал. Мила завернула его в свой шарф и принесла домой. Бабушка подогрела молоко, и котёнок выпил всё до капли. Вскоре он уже мурлыкал на тёплом подоконнике. Мила назвала его Пуговкой, потому что носик у него был маленький и круглый.",
);
const kittenVisual = { kind: "text" as const, text: KITTEN };
const comprehension: Lesson = {
  id: CMP,
  topicId: "reading.comprehension",
  title: t("Main Idea and Details", "Главная мысль и детали"),
  subtopic: t("Reading a short story carefully", "Внимательно читаем рассказ"),
  objective: t(
    "Find the main idea and important details in a short story.",
    "Находить главную мысль и важные детали в коротком рассказе.",
  ),
  ageRange: [8, 12],
  grades: [2, 6],
  difficulty: 2,
  durationMin: 12,
  character: "oli",
  intro: t(
    "I love a good story! Let's read one together and become story explorers.",
    "Обожаю хорошие истории! Давай прочитаем одну вместе и станем исследователями текста.",
  ),
  explanation: [
    t(
      "The main idea is what the whole text is mostly about. Ask yourself: «What is this story about in one sentence?»",
      "Главная мысль — это то, о чём весь текст. Спроси себя: «О чём этот рассказ, если сказать одним предложением?»",
    ),
    t(
      "Details are small facts: who, where, when, what happened and why. You can find them in the text, so look back and re-read!",
      "Детали — это мелкие факты: кто, где, когда, что случилось и почему. Их можно найти в тексте — не бойся перечитывать!",
    ),
  ],
  example: kittenVisual,
  game: "reading-adventure",
  practice: [
    {
      id: `${CMP}.p1`,
      type: "single",
      prompt: t("Where did Mila find the kitten?", "Где Мила нашла котёнка?"),
      hint: t("Look at the first sentence.", "Посмотри на первое предложение."),
      explanation: t("She found it under the old bench in the park.", "Она нашла его под старой скамейкой в парке."),
      difficulty: 1,
      audio: true,
      visual: kittenVisual,
      options: opts(["under a bench in the park", "под скамейкой в парке"], ["in a tree", "на дереве"], ["at school", "в школе"]),
      answer: 0,
    },
    {
      id: `${CMP}.p2`,
      type: "true_false",
      prompt: t("The kitten was dry and warm when Mila found it.", "Когда Мила нашла котёнка, он был сухой и тёплый."),
      hint: t("Read the second sentence again.", "Перечитай второе предложение."),
      explanation: t("The kitten was wet and shaking.", "Котёнок был мокрый и дрожал."),
      difficulty: 1,
      audio: true,
      visual: kittenVisual,
      answer: false,
    },
    {
      id: `${CMP}.p3`,
      type: "single",
      prompt: t("Why did Mila name the kitten Button?", "Почему Мила назвала котёнка Пуговкой?"),
      hint: t("Look for the word «because».", "Найди слова «потому что»."),
      explanation: t("Because its nose was small and round, like a button.", "Потому что носик у него был маленький и круглый, как пуговка."),
      difficulty: 2,
      audio: true,
      visual: kittenVisual,
      options: opts(
        ["it was black", "он был чёрный"],
        ["its nose was small and round", "носик был маленький и круглый"],
        ["it played with buttons", "он играл с пуговицами"],
      ),
      answer: 1,
    },
  ],
  check: [
    {
      id: `${CMP}.c1`,
      type: "single",
      prompt: t("What is the story mostly about?", "О чём этот рассказ в целом?"),
      explanation: t(
        "The whole story is about Mila helping a lost kitten and giving it a home.",
        "Весь рассказ о том, как Мила помогла котёнку и подарила ему дом.",
      ),
      difficulty: 2,
      audio: true,
      visual: kittenVisual,
      options: opts(
        ["Grandma cooks dinner", "Бабушка готовит ужин"],
        ["Mila helps a lost kitten and gives it a home", "Мила помогает котёнку и дарит ему дом"],
        ["A fun day at the playground", "Весёлый день на детской площадке"],
      ),
      answer: 1,
    },
    {
      id: `${CMP}.c2`,
      type: "ordering",
      prompt: t("Put the events in the order they happened.", "Расставь события по порядку."),
      explanation: t(
        "First she found it, then carried it home, then Grandma warmed milk, and at last it purred.",
        "Сначала нашла, потом принесла домой, затем бабушка подогрела молоко, а в конце котёнок мурлыкал.",
      ),
      difficulty: 2,
      audio: true,
      visual: kittenVisual,
      items: opts(
        ["Mila finds the kitten.", "Мила находит котёнка."],
        ["Mila carries it home in her scarf.", "Мила несёт его домой в шарфе."],
        ["Grandma warms some milk.", "Бабушка подогревает молоко."],
        ["The kitten purrs on the windowsill.", "Котёнок мурлычет на подоконнике."],
      ),
    },
    {
      id: `${CMP}.c3`,
      type: "multiple",
      prompt: t("Which details are in the story? Pick all.", "Какие детали есть в рассказе? Выбери все."),
      explanation: t(
        "The text says the kitten was wet and Grandma warmed milk. A dog and snow are not mentioned.",
        "В тексте сказано, что котёнок был мокрый и бабушка подогрела молоко. О собаке и снеге там нет ни слова.",
      ),
      difficulty: 2,
      audio: true,
      visual: kittenVisual,
      options: opts(
        ["The kitten was wet.", "Котёнок был мокрый."],
        ["Mila had a dog.", "У Милы была собака."],
        ["Grandma warmed milk.", "Бабушка подогрела молоко."],
        ["It was snowing.", "Шёл снег."],
      ),
      answers: [0, 2],
    },
    {
      id: `${CMP}.c4`,
      type: "fill_blank",
      prompt: t("Finish the sentence with a word from the story.", "Закончи предложение словом из рассказа."),
      explanation: t("Mila wrapped the kitten in her scarf.", "Мила завернула котёнка в свой шарф."),
      difficulty: 2,
      audio: true,
      visual: kittenVisual,
      text: t("Mila wrapped the kitten in her ___.", "Мила завернула котёнка в свой ___."),
      accepted: { en: ["scarf"], ru: ["шарф"] },
    },
    {
      id: `${CMP}.c5`,
      type: "single",
      prompt: t("How did the kitten feel at the end?", "Как чувствовал себя котёнок в конце?"),
      hint: t("What does purring tell us?", "Что значит, когда котёнок мурлычет?"),
      explanation: t("Purring on a warm windowsill shows it felt safe and happy.", "Котёнок мурлыкал в тепле — значит, ему было спокойно и хорошо."),
      difficulty: 3,
      audio: true,
      visual: kittenVisual,
      options: opts(["cold and scared", "холодно и страшно"], ["safe and happy", "спокойно и радостно"], ["very hungry", "очень голодно"]),
      answer: 1,
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Read the story twice. First ask «What is it mostly about?», then look back in the text to find each detail.",
    "Прочитай рассказ дважды. Сначала спроси: «О чём он?», потом ищи каждую деталь в тексте.",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.vocabulary (grades 2-8)                                      */
/* ------------------------------------------------------------------ */
const VOC = "reading.vocabulary.l1";
const vocabulary: Lesson = {
  id: VOC,
  topicId: "reading.vocabulary",
  title: t("Synonyms and Antonyms", "Синонимы и антонимы"),
  subtopic: t("Word meanings and context clues", "Значение слова и подсказки контекста"),
  objective: t(
    "Find synonyms and antonyms and work out word meanings from context.",
    "Подбирать синонимы и антонимы и понимать значение слова по тексту.",
  ),
  ageRange: [8, 14],
  grades: [2, 8],
  difficulty: 2,
  durationMin: 12,
  character: "oli",
  intro: t(
    "Words have friends and opposites! Let's grow your word treasure chest.",
    "У слов есть друзья и противоположности! Давай пополним твою копилку слов.",
  ),
  explanation: [
    t(
      "Synonyms are words with nearly the same meaning: big — large, happy — glad.",
      "Синонимы — слова одной части речи, близкие по значению: большой — огромный, весёлый — радостный.",
    ),
    t(
      "Antonyms are words with opposite meanings: hot — cold, day — night.",
      "Антонимы — слова с противоположным значением: горячий — холодный, день — ночь.",
    ),
    t(
      "Meet a new word? Look at the words around it — they are clues to its meaning.",
      "Встретил незнакомое слово? Посмотри на соседние слова — они подскажут его значение.",
    ),
  ],
  example: {
    kind: "text",
    text: t(
      "big = large (synonyms)   big ↔ small (antonyms)",
      "большой = огромный (синонимы)   большой ↔ маленький (антонимы)",
    ),
  },
  practice: [
    {
      id: `${VOC}.p1`,
      type: "matching",
      prompt: t("Match each word with its antonym (opposite).", "Соедини слово с его антонимом."),
      hint: t("Think of the opposite.", "Подумай о противоположном значении."),
      explanation: t("hot ↔ cold, up ↔ down, day ↔ night.", "горячий ↔ холодный, высокий ↔ низкий, день ↔ ночь."),
      difficulty: 1,
      audio: true,
      pairs: [
        { left: t("hot", "горячий"), right: t("cold", "холодный") },
        { left: t("up", "высокий"), right: t("down", "низкий") },
        { left: t("day", "день"), right: t("night", "ночь") },
      ],
    },
    {
      id: `${VOC}.p2`,
      type: "single",
      prompt: t("Which word is a synonym for «happy»?", "Какое слово — синоним к слову «весёлый»?"),
      hint: t("Find the word that means almost the same.", "Найди слово, близкое по значению."),
      explanation: t("«Glad» means almost the same as «happy».", "«Радостный» близко по значению к «весёлый»."),
      difficulty: 1,
      audio: true,
      options: opts(["sad", "грустный"], ["glad", "радостный"], ["angry", "сердитый"]),
      answer: 1,
    },
    {
      id: `${VOC}.p3`,
      type: "true_false",
      prompt: t("«Fast» and «quick» are antonyms.", "«Быстрый» и «скорый» — антонимы."),
      hint: t("Do they mean the same or the opposite?", "Они похожи по значению или противоположны?"),
      explanation: t("They mean the same, so they are synonyms.", "Они близки по значению — это синонимы."),
      difficulty: 2,
      audio: true,
      answer: false,
    },
  ],
  check: [
    {
      id: `${VOC}.c1`,
      type: "matching",
      prompt: t("Match each word with its synonym.", "Соедини слово с его синонимом."),
      explanation: t("small = little, begin = start, shout = yell.", "друг = товарищ, смелый = храбрый, бежать = мчаться."),
      difficulty: 2,
      audio: true,
      pairs: [
        { left: t("small", "друг"), right: t("little", "товарищ") },
        { left: t("begin", "смелый"), right: t("start", "храбрый") },
        { left: t("shout", "бежать"), right: t("yell", "мчаться") },
      ],
    },
    {
      id: `${VOC}.c2`,
      type: "single",
      prompt: t("Pick the antonym of «old» in «an old house».", "Подбери антоним к слову «старый» в сочетании «старый дом»."),
      explanation: t("The opposite of an old house is a new house.", "Противоположность старому дому — новый дом."),
      difficulty: 2,
      audio: true,
      options: opts(["ancient", "древний"], ["new", "новый"], ["big", "большой"]),
      answer: 1,
    },
    {
      id: `${VOC}.c3`,
      type: "fill_blank",
      prompt: t("Write the antonym of «empty».", "Напиши антоним к слову «пустой»."),
      explanation: t("The opposite of empty is full.", "Противоположность слову «пустой» — «полный»."),
      difficulty: 2,
      audio: true,
      text: t("The glass is not empty, it is ___.", "Стакан не пустой, он ___."),
      accepted: { en: ["full"], ru: ["полный"] },
    },
    {
      id: `${VOC}.c4`,
      type: "single",
      prompt: t(
        "«The puppy was exhausted after the long walk, so it fell asleep at once.» What does «exhausted» mean?",
        "«После долгой прогулки щенок был утомлён и сразу уснул». Что значит «утомлён»?",
      ),
      hint: t("What happens after a long walk?", "Что бывает после долгой прогулки?"),
      explanation: t(
        "A long walk and falling asleep are clues: exhausted means very tired.",
        "Долгая прогулка и сон — подсказки: «утомлён» значит «очень устал».",
      ),
      difficulty: 3,
      audio: true,
      options: opts(["very tired", "очень устал"], ["very hungry", "очень голоден"], ["very noisy", "очень шумный"]),
      answer: 0,
    },
    {
      id: `${VOC}.c5`,
      type: "drag_drop",
      prompt: t("Sort the words: synonym or antonym of «big»?", "Разложи слова: синоним или антоним к слову «большой»?"),
      explanation: t(
        "Huge and giant mean big; tiny and little mean the opposite.",
        "Огромный и громадный — синонимы; крошечный и маленький — антонимы.",
      ),
      difficulty: 2,
      audio: true,
      items: [
        { id: "a", label: t("huge", "огромный") },
        { id: "b", label: t("tiny", "крошечный") },
        { id: "c", label: t("giant", "громадный") },
        { id: "d", label: t("little", "маленький") },
      ],
      buckets: [
        { id: "syn", label: t("Synonym", "Синоним") },
        { id: "ant", label: t("Antonym", "Антоним") },
      ],
      answer: { a: "syn", b: "ant", c: "syn", d: "ant" },
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Synonyms are word friends (same meaning), antonyms are opposites. Use the words around a new word as clues.",
    "Синонимы — слова-друзья (похожее значение), антонимы — противоположности. Ищи подсказки в соседних словах.",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.morphology (grades 5-7)                                      */
/* ------------------------------------------------------------------ */
const MOR = "reading.morphology.l1";
const morphology: Lesson = {
  id: MOR,
  topicId: "reading.morphology",
  title: t("How Words Are Built", "Из чего состоит слово"),
  subtopic: t("Roots, prefixes, suffixes and endings", "Корень, приставка, суффикс, окончание"),
  objective: t(
    "Identify the root, prefix, suffix and ending of a word and explain what they add.",
    "Выделять в слове приставку, корень, суффикс, окончание и основу.",
  ),
  ageRange: [11, 13],
  grades: [5, 7],
  difficulty: 3,
  durationMin: 14,
  character: "oli",
  intro: t(
    "Words are like LEGO models: snap on a piece and you get a new meaning. Let's take some apart!",
    "Слова — как конструктор: добавишь деталь — получишь новое значение. Давай разберём несколько слов!",
  ),
  explanation: [
    t(
      "The root (base) carries the main meaning: help, play, kind. Words with the same root are a word family: help, helper, helpful.",
      "Корень — общая часть родственных слов, в нём главный смысл: лес, лесник, лесной. Приставка стоит перед корнем, суффикс — после корня, окончание — изменяемая часть, которая связывает слова в предложении.",
    ),
    t(
      "A prefix goes before the root and changes its meaning: un- = not (unhappy), re- = again (reread), pre- = before (preview). A suffix goes after the root: -er = a person who (teacher), -ful = full of (helpful), -ness makes a noun (kindness).",
      "Основа — это слово без окончания. Пример разбора: под|снеж|ник|□ — приставка под-, корень -снеж-, суффикс -ник-, нулевое окончание. Лесн|ой: основа «лесн», окончание -ой.",
    ),
    t(
      "Endings like -s and -ed change the form, not the meaning: plays, played.",
      "Окончание меняет форму слова, а не его смысл: лес — леса — в лесу.",
    ),
  ],
  example: {
    kind: "text",
    text: t(
      "un + help + ful = unhelpful  (prefix + root + suffix)",
      "под + снеж + ник + □ = подснежник  (приставка + корень + суффикс + нулевое окончание)",
    ),
  },
  game: "word-builder",
  practice: [
    {
      id: `${MOR}.p1`,
      type: "single",
      prompt: t("What is the root of «unhelpful»?", "Найди корень в слове «подснежник»."),
      hint: t("Remove the parts at the start and the end.", "Подбери родственные слова: снег, снежный."),
      explanation: t("un- is a prefix, -ful is a suffix, help is the root.", "под- — приставка, -ник — суффикс, -снеж- — корень (снег, снежный)."),
      difficulty: 2,
      options: opts(["un", "под"], ["help", "снеж"], ["ful", "ник"]),
      answer: 1,
    },
    {
      id: `${MOR}.p2`,
      type: "matching",
      prompt: t("Match each word part with its description.", "Соедини часть слова с её описанием."),
      hint: t("Where does each part stand in the word?", "Где стоит каждая часть в слове?"),
      explanation: t(
        "Prefix — before the root, suffix — after it, root — the main meaning.",
        "Приставка — перед корнем, суффикс — после корня, корень — общая часть родственных слов.",
      ),
      difficulty: 2,
      pairs: [
        { left: t("prefix", "приставка"), right: t("comes before the root", "стоит перед корнем") },
        { left: t("suffix", "суффикс"), right: t("comes after the root", "стоит после корня") },
        { left: t("root", "корень"), right: t("carries the main meaning", "общая часть родственных слов") },
      ],
    },
    {
      id: `${MOR}.p3`,
      type: "true_false",
      prompt: t(
        "In «teacher», -er is a suffix that means «a person who».",
        "В слове «лесной» окончание — -ой.",
      ),
      hint: t("A teacher is a person who teaches.", "Измени слово: лесной — лесная — лесного. Что меняется?"),
      explanation: t("Yes: teach + -er = a person who teaches.", "Да: лес|н|ой — корень -лес-, суффикс -н-, окончание -ой."),
      difficulty: 2,
      answer: true,
    },
  ],
  check: [
    {
      id: `${MOR}.c1`,
      type: "single",
      prompt: t("Which word has a prefix?", "В каком слове есть приставка?"),
      explanation: t("re- (again) + read = reread.", "пере- + ход = переход."),
      difficulty: 2,
      options: opts(["reread", "переход"], ["reader", "ходок"], ["read", "ход"]),
      answer: 0,
    },
    {
      id: `${MOR}.c2`,
      type: "drag_drop",
      prompt: t(
        "Sort the parts of «disagreements» (dis-agree-ment-s).",
        "Разбери по составу слово «загадка» (за-гад-к-а).",
      ),
      explanation: t(
        "dis- prefix, agree root, -ment suffix, -s ending.",
        "за- — приставка, -гад- — корень (гадать), -к- — суффикс, -а — окончание.",
      ),
      difficulty: 3,
      items: [
        { id: "a", label: t("dis", "за") },
        { id: "b", label: t("agree", "гад") },
        { id: "c", label: t("ment", "к") },
        { id: "d", label: t("s", "а") },
      ],
      buckets: [
        { id: "pre", label: t("Prefix", "Приставка") },
        { id: "root", label: t("Root", "Корень") },
        { id: "suf", label: t("Suffix", "Суффикс") },
        { id: "end", label: t("Ending", "Окончание") },
      ],
      answer: { a: "pre", b: "root", c: "suf", d: "end" },
    },
    {
      id: `${MOR}.c3`,
      type: "fill_blank",
      prompt: t("Add a prefix that means «not».", "Вставь приставку со значением «внутрь»."),
      hint: t("un- … unkind, unfair", "Куда прыгнула кошка? Внутрь."),
      explanation: t("un + happy = unhappy (not happy).", "в- (за-) + прыгнула = впрыгнула (запрыгнула) — внутрь."),
      difficulty: 3,
      text: t("The sad clown looked ___happy.", "Кошка ___прыгнула в окно."),
      accepted: { en: ["un", "un-"], ru: ["в", "за", "в-", "за-"] },
    },
    {
      id: `${MOR}.c4`,
      type: "multiple",
      prompt: t("Which words share a root with «act»? Pick all.", "Какие слова однокоренные со словом «лес»? Выбери все."),
      hint: t("Same root = same family of meaning.", "У однокоренных слов общий корень и близкий смысл."),
      explanation: t(
        "Actor and react are in the «act» family. Apple and attic only look similar.",
        "Лесник и лесной — однокоренные. «Лестница» и «лесть» только похожи по звучанию.",
      ),
      difficulty: 3,
      options: opts(["actor", "лесник"], ["apple", "лестница"], ["react", "лесной"], ["attic", "лесть"]),
      answers: [0, 2],
    },
    {
      id: `${MOR}.c5`,
      type: "single",
      prompt: t("What is the base (stem) of «played»?", "Выдели основу в слове «лесной»."),
      explanation: t("Remove the ending -ed: the base is «play».", "Основа — слово без окончания: «лесн»."),
      difficulty: 3,
      options: opts(["play", "лесн"], ["pla", "лес"], ["ed", "ой"]),
      answer: 0,
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Find the root first using word-family words, then look for parts added before (prefix) and after (suffix, ending).",
    "Порядок разбора: окончание (измени форму слова) → основа → корень (подбери родственные слова) → приставка → суффикс.",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.syntax (grades 7-9)                                          */
/* ------------------------------------------------------------------ */
const SYN = "reading.syntax.l1";
const syntax: Lesson = {
  id: SYN,
  topicId: "reading.syntax",
  title: t("Inside a Sentence", "Строение предложения"),
  subtopic: t("Subject, predicate, simple and complex sentences", "Грамматическая основа, простые и сложные предложения"),
  objective: t(
    "Find the subject and predicate and tell simple, compound and complex sentences apart.",
    "Находить подлежащее и сказуемое, отличать простое предложение от сложного.",
  ),
  ageRange: [13, 15],
  grades: [7, 9],
  difficulty: 4,
  durationMin: 15,
  character: "oli",
  intro: t(
    "Every sentence has a skeleton. Let's find the bones that hold it together!",
    "У каждого предложения есть скелет. Давай найдём то, на чём оно держится!",
  ),
  explanation: [
    t(
      "The subject is who or what the sentence is about; the predicate tells what the subject does or is. Together they form a clause: [The old clock] [ticked loudly].",
      "Подлежащее отвечает на вопросы кто? что? (подчёркиваем одной чертой), сказуемое — что делает? каков? (двумя чертами). Вместе они — грамматическая основа: Старые [часы] громко [тикали].",
    ),
    t(
      "A simple sentence has one clause. A compound sentence joins two main clauses with and, but, or. A complex sentence has a main clause and a dependent clause starting with because, when, although, that, which.",
      "В простом предложении одна грамматическая основа, в сложном — две и больше. Сложносочинённое связано союзами и, а, но; сложноподчинённое — союзами и союзными словами потому что, когда, что, который. Части сложного предложения разделяются запятой.",
    ),
  ],
  example: {
    kind: "text",
    text: t(
      "[The rain]S [stopped]P, and [the children]S [ran]P outside. → compound sentence (two clauses)",
      "[Дождь]подл. [закончился]сказ., и [дети]подл. [выбежали]сказ. на улицу. → сложное предложение (две основы)",
    ),
  },
  practice: [
    {
      id: `${SYN}.p1`,
      type: "single",
      prompt: t("Find the subject: «The old clock ticked loudly.»", "Найди подлежащее: «Старые часы громко тикали»."),
      hint: t("Who or what ticked?", "Кто? Что? тикали?"),
      explanation: t("The clock is what the sentence is about.", "Что тикали? Часы — это подлежащее."),
      difficulty: 3,
      options: opts(["clock", "часы"], ["ticked", "тикали"], ["loudly", "громко"]),
      answer: 0,
    },
    {
      id: `${SYN}.p2`,
      type: "true_false",
      prompt: t(
        "«I stayed home because it was raining.» is a complex sentence.",
        "«Я остался дома, потому что шёл дождь» — сложное предложение.",
      ),
      hint: t("Count the subject + predicate pairs.", "Посчитай грамматические основы."),
      explanation: t(
        "Two clauses (I stayed / it was raining), joined by «because» — complex.",
        "Две основы (я остался / дождь шёл), связаны союзом «потому что» — сложноподчинённое.",
      ),
      difficulty: 3,
      answer: true,
    },
    {
      id: `${SYN}.p3`,
      type: "single",
      prompt: t(
        "How many clauses are in: «The sun rose, and the birds began to sing.»",
        "Сколько грамматических основ в предложении: «Взошло солнце, и запели птицы»?",
      ),
      hint: t("Find each subject and its verb.", "Найди каждое подлежащее и его сказуемое."),
      explanation: t("The sun rose + the birds began to sing = 2 clauses.", "Солнце взошло + птицы запели = 2 основы."),
      difficulty: 3,
      options: [same("1"), same("2"), same("3")],
      answer: 1,
    },
  ],
  check: [
    {
      id: `${SYN}.c1`,
      type: "drag_drop",
      prompt: t("Sort the sentences: one clause or two?", "Разложи предложения: простое или сложное?"),
      explanation: t(
        "Two subjects with ONE verb is still one clause. Two subject + verb pairs make two clauses.",
        "Однородные подлежащие при одном сказуемом — всё равно одна основа. Две основы — сложное предложение.",
      ),
      difficulty: 4,
      items: [
        { id: "a", label: t("The cat slept on the sofa.", "Кот спал на диване.") },
        { id: "b", label: t("I called, but nobody answered.", "Я позвонил, но никто не ответил.") },
        { id: "c", label: t("When spring came, the snow melted.", "Когда пришла весна, растаял снег.") },
        { id: "d", label: t("My brother and sister play chess.", "Брат и сестра играют в шахматы.") },
      ],
      buckets: [
        { id: "one", label: t("Simple (one clause)", "Простое (одна основа)") },
        { id: "two", label: t("Two or more clauses", "Сложное (две и более основы)") },
      ],
      answer: { a: "one", b: "two", c: "two", d: "one" },
    },
    {
      id: `${SYN}.c2`,
      type: "single",
      prompt: t("Find the predicate: «The students wrote an essay.»", "Найди сказуемое: «Ученики написали сочинение»."),
      explanation: t("«Wrote» tells what the students did.", "Ученики что сделали? Написали — это сказуемое."),
      difficulty: 3,
      options: opts(["students", "ученики"], ["wrote", "написали"], ["essay", "сочинение"]),
      answer: 1,
    },
    {
      id: `${SYN}.c3`,
      type: "multiple",
      prompt: t(
        "Which sentences are complex (have a dependent clause)? Pick all.",
        "Какие предложения сложноподчинённые? Выбери все.",
      ),
      explanation: t(
        "«that you are right» and «that I read» are dependent clauses.",
        "Части связаны союзом «что» и союзным словом «которую» — это сложноподчинённые предложения.",
      ),
      difficulty: 4,
      options: opts(
        ["I know that you are right.", "Я знаю, что ты прав."],
        ["We sang and danced.", "Мы пели и танцевали."],
        ["The book that I read was funny.", "Книга, которую я прочитал, была смешной."],
        ["Tom ate an apple.", "Том съел яблоко."],
      ),
      answers: [0, 2],
    },
    {
      id: `${SYN}.c4`,
      type: "fill_blank",
      prompt: t("Add a conjunction to make a complex sentence.", "Вставь союз, чтобы получилось сложноподчинённое предложение."),
      hint: t("The second part gives a reason.", "Вторая часть называет причину."),
      explanation: t("«Because» introduces a reason.", "Союз «потому что» (или «так как») указывает на причину."),
      difficulty: 3,
      text: t("We stayed inside ___ it was cold.", "Мы остались дома, ___ было холодно."),
      accepted: {
        en: ["because", "since", "as"],
        ru: ["потому что", "так как", "поскольку", "ведь", "оттого что"],
      },
    },
    {
      id: `${SYN}.c5`,
      type: "ordering",
      prompt: t("Put the parts in order to build a complex sentence.", "Расставь части по порядку, чтобы получилось сложное предложение."),
      explanation: t(
        "When the bell rang, the students left the classroom.",
        "Когда прозвенел звонок, ученики вышли из класса.",
      ),
      difficulty: 3,
      items: opts(
        ["When", "Когда"],
        ["the bell rang,", "прозвенел звонок,"],
        ["the students", "ученики"],
        ["left", "вышли"],
        ["the classroom.", "из класса."],
      ),
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Find every subject + predicate pair first. One pair = simple sentence; two or more = compound or complex.",
    "Сначала найди все грамматические основы. Одна основа — простое предложение, две и больше — сложное. Между частями ставь запятую.",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.literature (grades 5-9)                                      */
/* ------------------------------------------------------------------ */
const LIT = "reading.literature.l1";
const MAGPIE: LText = t(
  "A proud Magpie collected shiny things and boasted about them to the whole forest. One day she found a piece of glass and decided it was a diamond. She guarded it day and night and completely forgot to build her nest. When the cold autumn rains came, the other birds sat in their warm nests, while the Magpie shivered next to her «treasure». Moral: not everything that sparkles is what we truly need.",
  "Гордая Сорока собирала блестящие вещицы и хвасталась ими перед всем лесом. Однажды она нашла осколок стекла и решила, что это алмаз. Она стерегла его день и ночь и совсем забыла свить гнездо. Когда пришли холодные осенние дожди, другие птицы сидели в тёплых гнёздах, а Сорока дрожала рядом со своим «сокровищем». Мораль: не всё то нужно, что блестит.",
);
const magpieVisual = { kind: "text" as const, text: MAGPIE };
const literature: Lesson = {
  id: LIT,
  topicId: "reading.literature",
  title: t("Literary Genres", "Литературные жанры"),
  subtopic: t("Fairy tale, fable, poem, novel, drama", "Сказка, басня, стихотворение, роман, драма"),
  objective: t(
    "Recognise the main literary genres and find the moral of a fable.",
    "Узнавать основные литературные жанры и находить мораль басни.",
  ),
  ageRange: [11, 15],
  grades: [5, 9],
  difficulty: 3,
  durationMin: 15,
  character: "oli",
  intro: t(
    "Stories come in many shapes. Let's visit the library of genres and read a brand-new fable!",
    "Истории бывают разными. Давай заглянем в библиотеку жанров и прочитаем новую басню!",
  ),
  explanation: [
    t(
      "A fairy tale has magic and wonders, and good usually wins. A fable is a short story, often with animals that act like people, that ends with a moral — a lesson (Aesop wrote many fables).",
      "Сказка — история с волшебством и чудесами, где добро обычно побеждает. Басня — короткий, часто стихотворный рассказ, где животные ведут себя как люди; в ней есть мораль — поучение (вспомни басни И. А. Крылова).",
    ),
    t(
      "A poem uses rhythm and often rhyme; its lines are grouped into stanzas. A novel is a long story with many chapters and characters. A drama (play) is written as dialogue for actors on a stage.",
      "Стихотворение написано с ритмом и часто с рифмой, строки объединяются в строфы. Роман — большое произведение со множеством героев и глав. Драма (пьеса) написана в виде реплик героев для сцены, с ремарками для актёров.",
    ),
  ],
  example: magpieVisual,
  game: "reading-adventure",
  practice: [
    {
      id: `${LIT}.p1`,
      type: "single",
      prompt: t("What genre is this text?", "К какому жанру относится этот текст?"),
      hint: t("Look at the characters and the last sentence.", "Посмотри на героев и на последнее предложение."),
      explanation: t(
        "A short story with an animal character and a moral is a fable.",
        "Короткий рассказ о животном с моралью в конце — это басня.",
      ),
      difficulty: 2,
      visual: magpieVisual,
      options: opts(["novel", "роман"], ["fable", "басня"], ["drama", "драма"]),
      answer: 1,
    },
    {
      id: `${LIT}.p2`,
      type: "matching",
      prompt: t("Match each genre with its feature.", "Соедини жанр с его особенностью."),
      hint: t("Which one is written for actors?", "Какой жанр пишут для актёров?"),
      explanation: t(
        "Fairy tale — magic; poem — rhythm and rhyme; drama — dialogue for the stage.",
        "Сказка — волшебство; стихотворение — ритм и рифма; драма — реплики для сцены.",
      ),
      difficulty: 3,
      pairs: [
        { left: t("fairy tale", "сказка"), right: t("magic and wonders", "волшебство и чудеса") },
        { left: t("poem", "стихотворение"), right: t("rhythm and rhyme", "ритм и рифма") },
        { left: t("drama", "драма"), right: t("dialogue for the stage", "реплики героев для сцены") },
      ],
    },
    {
      id: `${LIT}.p3`,
      type: "true_false",
      prompt: t("A moral is the lesson a story teaches.", "Мораль — это поучение, которое содержит произведение."),
      hint: t("Look at the last sentence of the fable.", "Посмотри на последнее предложение басни."),
      explanation: t("Yes, a fable's moral tells us what to learn.", "Да, мораль басни говорит, чему нас учит история."),
      difficulty: 2,
      answer: true,
    },
  ],
  check: [
    {
      id: `${LIT}.c1`,
      type: "single",
      prompt: t("What is the moral of the fable?", "В чём мораль басни?"),
      explanation: t(
        "The Magpie chased something shiny and forgot what she really needed.",
        "Сорока погналась за блестящим и забыла о действительно нужном.",
      ),
      difficulty: 3,
      visual: magpieVisual,
      options: opts(
        ["Shiny things are always valuable.", "Всё блестящее — ценное."],
        ["Don't let pretty things distract you from what really matters.", "Не позволяй красивым пустякам отвлечь тебя от важного."],
        ["Magpies cannot build nests.", "Сороки не умеют вить гнёзда."],
      ),
      answer: 1,
    },
    {
      id: `${LIT}.c2`,
      type: "multiple",
      prompt: t("Which features does a fable usually have? Pick all.", "Какие черты обычно есть у басни? Выбери все."),
      explanation: t(
        "Fables are short, have animals that act like people, and teach a moral.",
        "Басня короткая, в ней животные ведут себя как люди, и в ней есть мораль.",
      ),
      difficulty: 3,
      options: opts(
        ["animals that act like people", "животные ведут себя как люди"],
        ["a moral", "мораль (поучение)"],
        ["hundreds of pages", "сотни страниц"],
        ["stage directions for actors", "ремарки для актёров"],
      ),
      answers: [0, 1],
    },
    {
      id: `${LIT}.c3`,
      type: "single",
      prompt: t("Why was the Magpie cold when the rains came?", "Почему Сороке было холодно, когда пошли дожди?"),
      explanation: t("She was guarding the glass and forgot to build a nest.", "Она стерегла стекло и забыла свить гнездо."),
      difficulty: 2,
      visual: magpieVisual,
      options: opts(
        ["She forgot to build a nest.", "Она забыла свить гнездо."],
        ["She lost the glass.", "Она потеряла стекло."],
        ["The other birds chased her away.", "Другие птицы прогнали её."],
      ),
      answer: 0,
    },
    {
      id: `${LIT}.c4`,
      type: "drag_drop",
      prompt: t("Sort the works by genre.", "Распредели произведения по жанрам."),
      explanation: t(
        "Cinderella — fairy tale, The Tortoise and the Hare — fable, Treasure Island — novel, Romeo and Juliet — drama.",
        "«Морозко» — сказка, «Стрекоза и Муравей» — басня, «Война и мир» — роман, «Ревизор» — драма (пьеса).",
      ),
      difficulty: 4,
      items: [
        { id: "a", label: t("Cinderella", "«Морозко»") },
        { id: "b", label: t("The Tortoise and the Hare (Aesop)", "«Стрекоза и Муравей» (И. А. Крылов)") },
        { id: "c", label: t("Treasure Island (R. L. Stevenson)", "«Война и мир» (Л. Н. Толстой)") },
        { id: "d", label: t("Romeo and Juliet (W. Shakespeare)", "«Ревизор» (Н. В. Гоголь)") },
      ],
      buckets: [
        { id: "tale", label: t("Fairy tale", "Сказка") },
        { id: "fable", label: t("Fable", "Басня") },
        { id: "novel", label: t("Novel", "Роман") },
        { id: "drama", label: t("Drama", "Драма") },
      ],
      answer: { a: "tale", b: "fable", c: "novel", d: "drama" },
    },
    {
      id: `${LIT}.c5`,
      type: "single",
      prompt: t("In the fable, what does the piece of glass stand for?", "Что символизирует осколок стекла в басне?"),
      hint: t("Was the glass really useful to the Magpie?", "Была ли от стекла настоящая польза Сороке?"),
      explanation: t(
        "The glass stands for things that look valuable but do not really help us.",
        "Стекло — символ того, что кажется ценным, но не приносит пользы.",
      ),
      difficulty: 4,
      visual: magpieVisual,
      options: opts(
        ["things that look valuable but are not useful", "то, что кажется ценным, но бесполезно"],
        ["a real diamond", "настоящий алмаз"],
        ["the cold rain", "холодный дождь"],
      ),
      answer: 0,
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Ask: Is there magic? A moral? Rhyme? Many chapters? Dialogue for a stage? Each answer points to a genre.",
    "Спроси себя: есть ли волшебство? мораль? рифма? много глав и героев? реплики для сцены? Каждый ответ подскажет жанр.",
  ),
  status: "reviewed",
};

/* ------------------------------------------------------------------ */
/* reading.text-analysis (grades 8-11)                                  */
/* ------------------------------------------------------------------ */
const TXA = "reading.text-analysis.l1";
const MISTAKES: LText = t(
  "Many people think that mistakes are something to be ashamed of. However, every inventor, athlete and scientist has made thousands of them. A child learning to walk falls again and again, and no one calls this a failure. Mistakes show us where we still need to grow. That is why we should treat them not as defeats but as steps forward.",
  "Многие считают, что ошибок нужно стыдиться. Однако каждый изобретатель, спортсмен и учёный совершил их тысячи. Ребёнок, который учится ходить, падает снова и снова, и никто не называет это неудачей. Ошибки показывают, где нам ещё нужно расти. Вот почему к ним стоит относиться не как к поражениям, а как к шагам вперёд.",
);
const mistakesVisual = { kind: "text" as const, text: MISTAKES };
const textAnalysis: Lesson = {
  id: TXA,
  topicId: "reading.text-analysis",
  title: t("Thesis, Evidence, Essay", "Тезис, аргументы, сочинение"),
  subtopic: t("Analysing an argument and planning an essay", "Анализ рассуждения и план сочинения"),
  objective: t(
    "Identify a text's thesis and evidence and plan an argumentative essay.",
    "Определять тему, основную мысль и тезис текста, подбирать аргументы и строить сочинение-рассуждение.",
  ),
  ageRange: [14, 17],
  grades: [8, 11],
  difficulty: 5,
  durationMin: 15,
  character: "oli",
  intro: t(
    "Good readers don't just read — they ask «What is the author claiming, and how do they prove it?» Let's dig in.",
    "Вдумчивый читатель не просто читает, а спрашивает: «Что утверждает автор и как он это доказывает?» Давай разберёмся.",
  ),
  explanation: [
    t(
      "The topic is what a text is about (mistakes). The theme or main idea is the message about that topic (mistakes help us grow). The thesis is the author's central claim.",
      "Тема — о чём текст (об ошибках). Основная мысль (идея) — что автор хочет сказать (ошибки помогают расти). Тезис — главное утверждение, которое автор доказывает.",
    ),
    t(
      "Strong arguments are backed by evidence: facts, examples, quotations from the text. Opinions like «everyone knows» are not evidence.",
      "Аргументы подтверждают тезис: примеры из прочитанного текста, из литературы, из жизни, факты. Фразы вроде «все это знают» аргументом не являются.",
    ),
    t(
      "An essay has an introduction (with the thesis), body paragraphs (point → evidence → explanation) and a conclusion that sums up.",
      "Сочинение-рассуждение строится так: вступление (тезис) → основная часть (аргументы с примерами и пояснениями) → заключение (вывод).",
    ),
  ],
  example: {
    kind: "text",
    text: t(
      "Thesis: Mistakes help us grow. → Argument: Every inventor makes many attempts. → Evidence: a child learning to walk falls again and again. → Conclusion: treat mistakes as steps forward.",
      "Тезис: ошибки помогают расти. → Аргумент: любой изобретатель делает много попыток. → Пример: ребёнок, который учится ходить, падает снова и снова. → Вывод: ошибки — это шаги вперёд.",
    ),
  },
  practice: [
    {
      id: `${TXA}.p1`,
      type: "single",
      prompt: t("What is the thesis (main claim) of the passage?", "Какой тезис (главное утверждение) у этого текста?"),
      hint: t("Look for the sentence the author is trying to prove — often near the end.", "Найди мысль, которую автор доказывает, — часто она в конце."),
      explanation: t(
        "The author argues that mistakes are steps toward growth, not reasons for shame.",
        "Автор доказывает, что ошибки — это шаги к росту, а не повод для стыда.",
      ),
      difficulty: 4,
      visual: mistakesVisual,
      options: opts(
        ["Inventors are very clever.", "Изобретатели очень умные."],
        ["Mistakes are steps toward growth, not reasons for shame.", "Ошибки — это шаги к росту, а не повод для стыда."],
        ["Children learn to walk early.", "Дети рано учатся ходить."],
      ),
      answer: 1,
    },
    {
      id: `${TXA}.p2`,
      type: "drag_drop",
      prompt: t("Which part of an essay does each job?", "В какой части сочинения это делается?"),
      hint: t("Where do we state the claim, prove it and sum up?", "Где мы заявляем тезис, где доказываем, где подводим итог?"),
      explanation: t(
        "Introduction — thesis; body — arguments, evidence, explanation; conclusion — summary.",
        "Вступление — тезис; основная часть — аргументы, примеры, пояснения; заключение — вывод.",
      ),
      difficulty: 4,
      items: [
        { id: "a", label: t("states the thesis", "формулирует тезис") },
        { id: "b", label: t("gives an argument with evidence", "приводит аргумент с примером") },
        { id: "c", label: t("explains how the evidence supports the point", "поясняет, как пример доказывает тезис") },
        { id: "d", label: t("sums up and restates the main idea", "подводит итог и повторяет главную мысль") },
      ],
      buckets: [
        { id: "intro", label: t("Introduction", "Вступление") },
        { id: "body", label: t("Body", "Основная часть") },
        { id: "concl", label: t("Conclusion", "Заключение") },
      ],
      answer: { a: "intro", b: "body", c: "body", d: "concl" },
    },
    {
      id: `${TXA}.p3`,
      type: "true_false",
      prompt: t("The theme of a text is the same as its topic.", "Тема и основная мысль текста — это одно и то же."),
      hint: t("«Mistakes» vs «mistakes help us grow».", "«Об ошибках» и «ошибки помогают расти» — одно и то же?"),
      explanation: t(
        "The topic is what the text is about; the theme is the message about it.",
        "Тема — о чём текст, а основная мысль — что автор хочет сказать об этом.",
      ),
      difficulty: 4,
      answer: false,
    },
  ],
  check: [
    {
      id: `${TXA}.c1`,
      type: "single",
      prompt: t("Which sentence from the passage is an example used as evidence?", "Какое предложение текста — пример, подтверждающий тезис?"),
      explanation: t(
        "The child learning to walk is a concrete example that supports the claim.",
        "Ребёнок, который учится ходить, — конкретный пример, подтверждающий мысль автора.",
      ),
      difficulty: 4,
      visual: mistakesVisual,
      options: opts(
        ["A child learning to walk falls again and again…", "Ребёнок, который учится ходить, падает снова и снова…"],
        ["That is why we should treat them…", "Вот почему к ним стоит относиться…"],
        ["Many people think that mistakes…", "Многие считают, что ошибок…"],
      ),
      answer: 0,
    },
    {
      id: `${TXA}.c2`,
      type: "ordering",
      prompt: t("Put the parts of an argumentative essay in order.", "Расставь части сочинения-рассуждения по порядку."),
      explanation: t(
        "Introduction and thesis → arguments with evidence → conclusion.",
        "Вступление и тезис → аргументы с примерами → вывод.",
      ),
      difficulty: 4,
      items: opts(
        ["Introduction with thesis", "Вступление и тезис"],
        ["First argument with evidence", "Первый аргумент с примером"],
        ["Second argument with evidence", "Второй аргумент с примером"],
        ["Conclusion", "Заключение (вывод)"],
      ),
    },
    {
      id: `${TXA}.c3`,
      type: "multiple",
      prompt: t("Which are strong pieces of evidence? Pick all.", "Что можно использовать как сильный аргумент? Выбери все."),
      explanation: t(
        "Facts from reliable sources and quotations from the text can be checked; feelings and «everyone knows» cannot.",
        "Факты из надёжных источников и цитаты из текста можно проверить, а «все знают» и «мне так кажется» — нет.",
      ),
      difficulty: 4,
      options: opts(
        ["a fact from a reliable source", "факт из надёжного источника"],
        ["«everyone knows it»", "«это все знают»"],
        ["a quotation from the text", "цитата из текста"],
        ["«I just feel it»", "«мне так кажется»"],
      ),
      answers: [0, 2],
    },
    {
      id: `${TXA}.c4`,
      type: "single",
      prompt: t(
        "What is the role of «However» at the start of the second sentence?",
        "Какую роль играет слово «Однако» в начале второго предложения?",
      ),
      explanation: t(
        "«However» signals a contrast: the author disagrees with the common opinion.",
        "«Однако» вводит противопоставление: автор спорит с распространённым мнением.",
      ),
      difficulty: 5,
      visual: mistakesVisual,
      options: opts(
        ["It introduces a contrast with a common opinion.", "Вводит противопоставление распространённому мнению."],
        ["It gives an example.", "Приводит пример."],
        ["It concludes the text.", "Завершает текст."],
      ),
      answer: 0,
    },
    {
      id: `${TXA}.c5`,
      type: "fill_blank",
      prompt: t("Finish the sentence.", "Закончи предложение."),
      explanation: t(
        "The conclusion sums up the argument and restates the thesis.",
        "В заключении подводят итог и делают вывод.",
      ),
      difficulty: 3,
      text: t(
        "The final part of an essay that sums up the argument is called the ___.",
        "Последняя часть сочинения, где подводится итог, называется ___.",
      ),
      accepted: { en: ["conclusion"], ru: ["заключение", "вывод", "заключением"] },
    },
  ],
  masteryScore: 0.8,
  reviewTips: t(
    "Ask three questions of any text: What is the claim? What evidence supports it? Is that evidence convincing?",
    "Задавай тексту три вопроса: какова основная мысль? чем автор её доказывает? убедительны ли аргументы?",
  ),
  status: "reviewed",
};

export const LESSONS: Lesson[] = [
  syllables,
  words,
  sentences,
  spelling,
  partsOfSpeech,
  punctuation,
  comprehension,
  vocabulary,
  morphology,
  syntax,
  literature,
  textAnalysis,
];
