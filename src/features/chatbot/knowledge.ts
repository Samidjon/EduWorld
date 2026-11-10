import type { LText } from "@/types/content";
import { TOPICS } from "@/data/topics";
import { ALL_LESSONS } from "@/data/content";

/**
 * EduBuddy knowledge base: prepared answers only (no AI). Two parts:
 *  1. hand-written entries about EduWorld, small talk and study tips;
 *  2. one entry per learning topic, built from the reviewed lesson explanations.
 * Keywords are matched by the stemming matcher in ./match.ts.
 */

export interface KbEntry {
  id: string;
  /** Phrases that identify the question. Russian also serves Uzbek users (+ optional uz phrases). */
  keywords: { ru: string[]; en: string[]; uz?: string[] };
  answer: LText;
  link?: { href: string; label: LText };
  /** Extra weight for very specific entries. */
  boost?: number;
}

const APP: KbEntry[] = [
  {
    id: "hello",
    keywords: { ru: ["привет", "здравствуй", "здравствуйте", "добрый день", "доброе утро", "добрый вечер", "хай"], en: ["hello", "hi", "hey", "good morning", "good afternoon"], uz: ["salom", "assalomu alaykum"] },
    answer: { en: "Hi! I'm EduBuddy 🦉 Ask me about a school topic (fractions, nouns, the water cycle…) or about EduWorld (coins, levels, worlds).", ru: "Привет! Я EduBuddy 🦉 Спроси меня про школьную тему (дроби, существительные, круговорот воды…) или про EduWorld (монеты, уровни, миры).", uz: "Salom! Men EduBuddy 🦉 Maktab mavzusi yoki EduWorld haqida so‘rang." },
  },
  {
    id: "how-are-you",
    keywords: { ru: ["как дела", "как ты", "как поживаешь"], en: ["how are you", "how is it going"], uz: ["qalaysan", "ishlar qalay"] },
    answer: { en: "I'm great, thanks! Ready to learn something new together? 🦉", ru: "Отлично, спасибо! Готов узнать что-нибудь новое вместе? 🦉", uz: "Zo‘r, rahmat! Birga yangi narsa o‘rganamizmi? 🦉" },
  },
  {
    id: "thanks",
    keywords: { ru: ["спасибо", "благодарю", "спс"], en: ["thanks", "thank you"], uz: ["rahmat"] },
    answer: { en: "You're welcome! Keep exploring 🌟", ru: "Пожалуйста! Продолжай исследовать 🌟", uz: "Arzimaydi! Izlanishda davom eting 🌟" },
  },
  {
    id: "bye",
    keywords: { ru: ["пока", "до свидания", "до встречи"], en: ["bye", "goodbye", "see you"], uz: ["xayr"] },
    answer: { en: "Bye! Come back for new adventures 👋", ru: "Пока! Возвращайся за новыми приключениями 👋", uz: "Xayr! Yangi sarguzashtlar uchun qayting 👋" },
  },
  {
    id: "who-are-you",
    keywords: { ru: ["кто ты", "ты кто", "что ты умеешь", "что умеешь", "как тебя зовут", "помоги", "помощь"], en: ["who are you", "what can you do", "your name", "help"], uz: ["sen kimsan", "yordam"] },
    answer: {
      en: "I'm EduBuddy, the owl helper of EduWorld. I know answers to prepared questions: school topics from all six worlds and how EduWorld works. If I don't know something, I'll say so honestly - then ask a parent or teacher.",
      ru: "Я EduBuddy, сова-помощник EduWorld. Я знаю ответы на заранее подготовленные вопросы: школьные темы из всех шести миров и то, как устроен EduWorld. Если я чего-то не знаю, я честно скажу - тогда спроси родителя или учителя.",
    },
  },
  {
    id: "how-to-play",
    keywords: { ru: ["как играть", "с чего начать", "что делать", "как учиться", "как пользоваться"], en: ["how to play", "where to start", "what do i do", "how does it work"] },
    answer: {
      en: "Open the Map, pick a world and start a lesson. Each lesson: Foxy or Oli introduce the topic, explain it, show an example, you practise, sometimes play a game, then check yourself. Lessons give XP and coins. Your path page shows what to learn next!",
      ru: "Открой Карту, выбери мир и начни урок. В каждом уроке: знакомство с темой, объяснение, пример, практика, иногда игра, а потом проверка. За уроки дают опыт и монеты. На странице «Мой путь» видно, что учить дальше!",
    },
    link: { href: "/play/map", label: { en: "Open the map", ru: "Открыть карту" } },
  },
  {
    id: "xp-levels",
    keywords: { ru: ["опыт", "xp", "уровень", "уровни", "как повысить уровень", "новый уровень"], en: ["xp", "experience", "level", "level up"] },
    answer: {
      en: "XP (experience) comes from lessons, new skills, daily challenges, games and boss challenges. Collect enough XP and you reach a new level - each next level needs a little more XP.",
      ru: "Опыт (XP) дают за уроки, освоенные навыки, задания дня, игры и испытания боссов. Набери достаточно опыта - и получишь новый уровень. Каждый следующий уровень требует чуть больше опыта.",
    },
  },
  {
    id: "coins",
    keywords: { ru: ["монеты", "монетки", "деньги", "как заработать монеты", "где взять монеты"], en: ["coins", "money", "earn coins"] },
    answer: {
      en: "Coins are earned by learning: lessons, challenges, games and bosses. Spend them in the Shop on clothes, hats, pets and room decorations. Coins never buy answers - only style!",
      ru: "Монеты зарабатываются учёбой: уроки, задания, игры и боссы. Трать их в Магазине на одежду, шапки, питомцев и украшения для комнаты. За монеты нельзя купить ответы - только красоту!",
    },
    link: { href: "/play/shop", label: { en: "Go to the shop", ru: "В магазин" } },
  },
  {
    id: "worlds",
    keywords: { ru: ["миры", "мир", "карта", "как открыть мир", "закрытый мир", "замок"], en: ["worlds", "world", "map", "unlock world", "locked"] },
    answer: {
      en: "There are six worlds: Little Steps (school readiness), Numberia (maths), Bookoria (reading), Scientia (science), Lingua (languages) and TechTown (coding). A locked world opens when you master the skills it needs - the map shows which ones.",
      ru: "Миров шесть: Маленькие шаги (подготовка к школе), Намбирия (математика), Букория (чтение), Сциентия (наука), Лингва (языки) и Техтаун (программирование). Закрытый мир откроется, когда ты освоишь нужные навыки - на карте написано, какие.",
    },
    link: { href: "/play/map", label: { en: "Open the map", ru: "Открыть карту" } },
  },
  {
    id: "bosses",
    keywords: { ru: ["босс", "боссы", "испытание", "дракон", "голем"], en: ["boss", "bosses", "challenge", "dragon", "golem"] },
    answer: {
      en: "Bosses are friendly challenges in each world. They mix questions from several topics you've learned. Master the listed topics, then try - win to get big rewards and special items!",
      ru: "Боссы - дружелюбные испытания в каждом мире. Они смешивают вопросы из нескольких изученных тем. Освой нужные темы и попробуй - за победу дают большую награду и особые предметы!",
    },
  },
  {
    id: "streak",
    keywords: { ru: ["серия", "дней подряд", "огонек", "огонь"], en: ["streak", "days in a row", "fire"] },
    answer: {
      en: "The 🔥 streak counts days in a row with learning. If you miss a day, it simply starts again - you never lose coins or items.",
      ru: "🔥 Серия считает дни подряд, когда ты занимался. Если пропустишь день, серия просто начнётся заново - монеты и предметы не пропадают.",
    },
  },
  {
    id: "daily",
    keywords: { ru: ["задания дня", "ежедневные задания", "цель недели", "задание"], en: ["daily challenge", "daily tasks", "weekly goal"] },
    answer: {
      en: "Every day there are three daily challenges (finish lessons, give correct answers, play or review). They complete automatically while you learn and give bonus XP and coins. The weekly goal counts lessons this week.",
      ru: "Каждый день есть три задания дня (пройти уроки, дать правильные ответы, сыграть или повторить тему). Они выполняются сами, пока ты учишься, и дают бонусный опыт и монеты. Цель недели считает уроки за неделю.",
    },
    link: { href: "/play/dashboard", label: { en: "Home", ru: "На главную" } },
  },
  {
    id: "achievements",
    keywords: { ru: ["достижения", "награды", "медали", "кубок"], en: ["achievements", "badges", "rewards", "trophy"] },
    answer: { en: "Achievements unlock for learning milestones: first lesson, mastered topics, correct answers, streaks, bosses and more. Each one gives a bonus.", ru: "Достижения открываются за успехи в учёбе: первый урок, освоенные темы, правильные ответы, серии, боссы и другое. За каждое дают бонус." },
    link: { href: "/play/achievements", label: { en: "My achievements", ru: "Мои достижения" } },
  },
  {
    id: "avatar",
    keywords: { ru: ["аватар", "персонаж", "одежда", "шапка", "переодеться", "внешность"], en: ["avatar", "character", "clothes", "hat", "outfit"] },
    answer: { en: "Change your look in the Avatar editor: animal, colours, face, and items you own - hats, clothes, accessories, shoes and pets.", ru: "Внешность меняется в редакторе Аватара: животное, цвета, выражение лица и твои предметы - шапки, одежда, аксессуары, обувь и питомцы." },
    link: { href: "/play/avatar", label: { en: "Avatar editor", ru: "Редактор аватара" } },
  },
  {
    id: "pets",
    keywords: { ru: ["питомец", "питомцы", "котенок", "щенок", "дракончик"], en: ["pet", "pets", "kitten", "puppy"] },
    answer: { en: "Pets come from the Shop or as boss rewards. Equip one in the Avatar editor and it will follow you!", ru: "Питомцев можно купить в Магазине или получить за победу над боссом. Выбери питомца в редакторе Аватара - и он будет рядом с тобой!" },
  },
  {
    id: "room",
    keywords: { ru: ["комната", "моя комната", "дом", "украшения", "мебель"], en: ["room", "home", "decor", "decorations"] },
    answer: { en: "In My room you place decorations you own anywhere you like and choose wallpaper. Don't forget to press Save!", ru: "В Моей комнате можно расставить свои украшения где угодно и выбрать обои. Не забудь нажать «Сохранить»!" },
    link: { href: "/play/home", label: { en: "My room", ru: "Моя комната" } },
  },
  {
    id: "games",
    keywords: { ru: ["игры", "мини игры", "поиграть", "игра"], en: ["games", "mini games", "play a game"] },
    answer: { en: "There are 11 learning games: letters, words, counting, maths sprint, memory, patterns, maze, shapes, reading adventure, science lab and robot coding.", ru: "Есть 11 обучающих игр: буквы, слова, счёт, математический спринт, память, узоры, лабиринт, фигуры, читательское приключение, научная лаборатория и программирование робота." },
    link: { href: "/play/games", label: { en: "Games", ru: "Игры" } },
  },
  {
    id: "mistakes",
    keywords: { ru: ["ошибка", "ошибся", "неправильно", "не получается", "не понимаю", "трудно", "сложно"], en: ["mistake", "wrong", "i can't", "don't understand", "hard", "difficult"] },
    answer: {
      en: "Mistakes are part of learning! Read the hint 💡, try again, and if a topic feels hard, open its lesson once more - EduWorld will also suggest easier basics first. You can do it!",
      ru: "Ошибки - это часть учёбы! Прочитай подсказку 💡, попробуй ещё раз, а если тема трудная - пройди её урок ещё раз. EduWorld сам подскажет, какие основы повторить. У тебя получится!",
    },
  },
  {
    id: "study-tips",
    keywords: { ru: ["как лучше учиться", "как запомнить", "совет", "как готовиться", "контрольная", "экзамен"], en: ["study tips", "how to remember", "advice", "test", "exam"] },
    answer: {
      en: "Study tips: learn a little every day; explain the topic in your own words; practise with a few tasks, then check yourself; review after 1, 3 and 7 days; take short breaks and sleep well before a test.",
      ru: "Советы: занимайся понемногу каждый день; объясни тему своими словами; реши несколько задач и проверь себя; повторяй через 1, 3 и 7 дней; делай короткие перерывы и хорошо выспись перед контрольной.",
    },
  },
  {
    id: "homework",
    keywords: { ru: ["домашка", "домашнее задание", "реши за меня", "дай ответ"], en: ["homework", "solve it for me", "give me the answer"] },
    answer: {
      en: "I can't solve homework for you, but I can explain the topic! Tell me the topic name (for example \"fractions\" or \"parts of speech\") and I'll explain it step by step.",
      ru: "Я не решаю домашку за тебя, но могу объяснить тему! Напиши, как она называется (например, «дроби» или «части речи»), - и я расскажу по шагам.",
    },
  },
  {
    id: "parents",
    keywords: { ru: ["родители", "мама", "папа", "родительский кабинет", "пин код", "пароль родителя"], en: ["parents", "mom", "dad", "parent area", "pin"] },
    answer: { en: "The parent area is behind the 🔒 button. It's protected with a parent PIN, so ask your parent to open it.", ru: "Кабинет родителя - за кнопкой 🔒. Он защищён PIN-кодом родителя, поэтому попроси маму или папу открыть его." },
  },
  {
    id: "break",
    keywords: { ru: ["устал", "перерыв", "отдохнуть", "надоело"], en: ["tired", "break", "rest", "bored"] },
    answer: { en: "Time for a short break! Stretch, drink some water and look out of the window for a minute 🌿", ru: "Самое время для короткого перерыва! Потянись, выпей воды и минутку посмотри в окно 🌿" },
  },
  {
    id: "music",
    keywords: { ru: ["музыка", "звук", "выключить музыку", "тише"], en: ["music", "sound", "turn off music"] },
    answer: { en: "Use the 🎵 button in the top bar to turn music and sounds on or off.", ru: "Кнопка 🎵 в верхней панели включает и выключает музыку и звуки." },
  },
  {
    id: "characters",
    keywords: { ru: ["фокси", "оли", "бруно", "луна", "персонажи", "лисенок", "сова", "медвежонок", "зайчиха"], en: ["foxy", "oli", "bruno", "luna", "characters", "fox", "owl", "bear", "bunny"] },
    answer: {
      en: "Foxy the fox is your guide, Oli the owl teaches maths and reading, Bruno the bear is the inventor for science and coding, and Luna the bunny explores languages and the world.",
      ru: "Лисёнок Фокси - твой проводник, сова Оли учит математике и чтению, медвежонок Бруно - изобретатель (наука и программирование), а зайчиха Луна исследует языки и окружающий мир.",
    },
  },
];

/** Extra search phrases for topics (how children actually ask). */
const SYNONYMS: Record<string, { ru: string[]; en: string[] }> = {
  "math.multiplication": { ru: ["таблица умножения", "умножить", "умножать"], en: ["times table", "times", "multiply"] },
  "math.division": { ru: ["разделить", "делить"], en: ["divide", "share"] },
  "math.addition-20": { ru: ["плюс", "сложить", "складывать"], en: ["plus", "add", "sum"] },
  "math.subtraction-20": { ru: ["минус", "вычесть", "отнять"], en: ["minus", "take away", "subtract"] },
  "math.fractions": { ru: ["дробь", "дроби", "числитель", "знаменатель"], en: ["fraction", "numerator", "denominator"] },
  "math.decimals": { ru: ["десятичная дробь", "запятая в числе"], en: ["decimal", "decimal point"] },
  "math.percentages": { ru: ["процент", "проценты"], en: ["percent", "percentage"] },
  "math.area-perimeter": { ru: ["площадь", "периметр"], en: ["area", "perimeter"] },
  "math.equations": { ru: ["уравнение", "найти икс", "неизвестное"], en: ["equation", "solve for x", "unknown"] },
  "math.quadratics": { ru: ["дискриминант", "квадратное уравнение"], en: ["discriminant", "quadratic"] },
  "math.geometry": { ru: ["пифагор", "теорема пифагора", "треугольник", "угол"], en: ["pythagoras", "triangle", "angle"] },
  "math.negative-numbers": { ru: ["отрицательные числа", "минус число", "ниже нуля"], en: ["negative numbers", "below zero"] },
  "math.powers": { ru: ["степень", "квадрат числа", "корень"], en: ["power", "exponent", "square root"] },
  "math.probability": { ru: ["вероятность", "шанс"], en: ["probability", "chance"] },
  "reading.parts-of-speech": { ru: ["существительное", "глагол", "прилагательное", "части речи"], en: ["noun", "verb", "adjective", "parts of speech"] },
  "reading.syllables": { ru: ["слог", "слоги"], en: ["syllable", "syllables"] },
  "reading.punctuation": { ru: ["запятая", "точка", "вопросительный знак", "знаки препинания"], en: ["comma", "full stop", "question mark", "punctuation"] },
  "reading.morphology": { ru: ["корень", "приставка", "суффикс", "окончание", "состав слова"], en: ["root", "prefix", "suffix"] },
  "reading.vocabulary": { ru: ["синоним", "антоним"], en: ["synonym", "antonym"] },
  "science.water-cycle": { ru: ["круговорот воды", "дождь", "испарение", "облака"], en: ["water cycle", "rain", "evaporation", "clouds"] },
  "science.states-of-matter": { ru: ["лед", "пар", "жидкость", "газ", "твердое тело", "таяние"], en: ["ice", "steam", "liquid", "gas", "solid", "melting"] },
  "science.solar-system": { ru: ["планеты", "солнце", "луна планета", "космос", "земля вращается"], en: ["planets", "sun", "moon", "space"] },
  "science.living-things": { ru: ["растения", "животные", "что нужно растению", "фотосинтез"], en: ["plants", "animals", "photosynthesis"] },
  "science.ecosystems": { ru: ["пищевая цепь", "цепь питания", "хищник", "экосистема"], en: ["food chain", "predator", "ecosystem"] },
  "science.human-body": { ru: ["тело человека", "сердце", "органы чувств", "скелет"], en: ["human body", "heart", "senses", "skeleton"] },
  "science.energy": { ru: ["электричество", "электрическая цепь", "батарейка", "энергия"], en: ["electricity", "circuit", "battery", "energy"] },
  "science.forces": { ru: ["гравитация", "трение", "закон ньютона", "сила"], en: ["gravity", "friction", "newton", "force"] },
  "science.cells": { ru: ["клетка", "клетки"], en: ["cell", "cells"] },
  "science.genetics": { ru: ["днк", "гены", "эволюция", "наследственность"], en: ["dna", "genes", "evolution", "heredity"] },
  "science.chemistry-basics": { ru: ["атом", "молекула", "химическая реакция"], en: ["atom", "molecule", "chemical reaction"] },
  "tech.algorithms": { ru: ["алгоритм"], en: ["algorithm"] },
  "tech.loops": { ru: ["цикл", "повторение блоков"], en: ["loop", "repeat"] },
  "tech.conditions": { ru: ["условие", "если то"], en: ["condition", "if then"] },
  "tech.internet-safety": { ru: ["безопасность в интернете", "пароль", "незнакомец в сети", "личные данные"], en: ["internet safety", "password", "stranger online", "personal data"] },
  "tech.html": { ru: ["html", "теги", "сайт"], en: ["html", "tags", "website"] },
  "tech.python": { ru: ["python", "питон"], en: ["python"] },
  "tech.javascript": { ru: ["javascript", "джаваскрипт"], en: ["javascript"] },
  "early.letters": { ru: ["буквы", "алфавит", "заглавная буква"], en: ["letters", "alphabet", "capital letter"] },
  "early.counting": { ru: ["считать", "счет", "посчитать"], en: ["count", "counting"] },
  "early.colors-shapes": { ru: ["цвета", "фигуры", "круг", "квадрат"], en: ["colours", "colors", "shapes", "circle", "square"] },
  "languages.english-basics": { ru: ["английский", "английский алфавит", "как поздороваться по английски"], en: ["english alphabet", "greetings"] },
  "languages.uzbek-basics": { ru: ["узбекский", "узбекский язык"], en: ["uzbek"] },
};

function topicEntries(): KbEntry[] {
  return TOPICS.flatMap((t) => {
    const lesson = ALL_LESSONS.find((l) => l.topicId === t.id);
    if (!lesson) return [];
    const syn = SYNONYMS[t.id] ?? { ru: [], en: [] };
    const para = (k: "en" | "ru") => lesson.explanation.slice(0, 3).map((p) => p[k]).join("\n\n");
    return [
      {
        id: `topic:${t.id}`,
        keywords: { ru: [t.title.ru, ...syn.ru], en: [t.title.en, ...syn.en] },
        answer: { en: `${t.title.en}. ${para("en")}`, ru: `${t.title.ru}. ${para("ru")}` },
        link: { href: `/play/lessons/${lesson.id}`, label: { en: "Practise in the lesson", ru: "Потренироваться в уроке" } },
      },
    ];
  });
}

export const KNOWLEDGE: KbEntry[] = [...APP, ...topicEntries()];

export const UNKNOWN_ANSWER: LText = {
  en: "I don't know the answer to this question yet 🦉 Try asking about a school topic (for example \"fractions\", \"nouns\", \"water cycle\") or about EduWorld (coins, levels, worlds). You can also ask a parent or teacher.",
  ru: "Пока что я не знаю ответа на этот вопрос 🦉 Спроси про школьную тему (например, «дроби», «существительное», «круговорот воды») или про EduWorld (монеты, уровни, миры). А ещё можно спросить родителя или учителя.",
  uz: "Hozircha bu savolga javobni bilmayman 🦉 Maktab mavzusi yoki EduWorld haqida so‘rang. Ota-onangiz yoki o‘qituvchingizdan ham so‘rashingiz mumkin.",
};
