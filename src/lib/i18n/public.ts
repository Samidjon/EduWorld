import type { Locale } from "@/types/content";

/**
 * Strings for the public pages (landing, login, register).
 * Pure data: safe to import from server and client components.
 * The active language comes from the `ew_lang` cookie (default "ru").
 */

export const LANG_COOKIE = "ew_lang";
export const PUBLIC_LOCALES: Locale[] = ["ru", "en", "uz"];

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "en" || value === "uz" || value === "ru" ? value : "ru";
}

const ru = {
  langName: "Русский",
  langLabel: "Язык сайта",
  skipToContent: "Перейти к содержимому",
  nav: {
    label: "Основная навигация",
    how: "Как это работает",
    ages: "Возраст",
    worlds: "Миры",
    parents: "Родителям",
    faq: "Вопросы",
    menu: "Меню",
    closeMenu: "Закрыть меню",
  },
  common: {
    login: "Войти",
    start: "Начать обучение",
    home: "На главную",
  },
  hero: {
    badge: "Образовательное приключение для детей 4–17 лет",
    title: "Учиться — это настоящее приключение!",
    subtitle: "Исследуй новые миры, открывай знания и развивай свои способности",
    slogan: "Learn. Play. Explore. Grow.",
    secondary: "Как это работает",
    sceneLabel: "Герои EduWorld: лисёнок Фокси, совёнок Оли, медвежонок Бруно и зайчонок Луна на парящих островах",
    note: "Аккаунт создаёт родитель — ребёнок играет в своём профиле",
  },
  characters: {
    foxy: "Фокси — проводник",
    oli: "Оли — учитель",
    bruno: "Бруно — изобретатель",
    luna: "Луна — исследователь",
  },
  how: {
    title: "Как устроен EduWorld",
    subtitle: "Четыре шага от регистрации до первого приключения.",
    steps: [
      { title: "Родитель создаёт профиль", text: "Вы регистрируетесь, добавляете ребёнка, указываете возраст, класс и язык. Ребёнку не нужен e-mail." },
      { title: "Стартовое приключение", text: "Короткая игровая диагностика без оценок помогает понять, с чего начать." },
      { title: "Личный маршрут", text: "EduWorld подбирает темы по уровню ребёнка: не слишком легко и не слишком сложно." },
      { title: "Учёба в мирах", text: "Уроки, мини-игры и боссы в шести мирах. За старания — опыт, монетки и награды." },
    ],
  },
  ages: {
    title: "Для каждого возраста",
    subtitle: "Интерфейс, задания и подсказки подстраиваются под возраст. Выберите группу, чтобы начать.",
    cta: "Начать с этой группой",
    groups: [
      { range: "4–6", unit: "лет", title: "Первые шаги", text: "Буквы, цифры, цвета и формы. Крупные кнопки, озвучка и минимум текста.", points: ["Подготовка к школе", "Игры на внимание", "Короткие сессии"] },
      { range: "7–10", unit: "лет", title: "Юные исследователи", text: "Счёт, чтение, окружающий мир и первые шаги в программировании.", points: ["Математика и чтение", "Мини-игры и боссы", "Пошаговые подсказки"] },
      { range: "11–14", unit: "лет", title: "Искатели знаний", text: "Дроби, грамматика, естественные науки, языки и алгоритмы.", points: ["Более глубокие темы", "Повторение пройденного", "Помощник EduBuddy"] },
      { range: "15–17", unit: "лет", title: "Мастера", text: "Алгебра, физика, химия, языки и программирование в спокойном стиле.", points: ["Подготовка к экзаменам", "Сложные задачи", "Самостоятельный темп"] },
    ],
  },
  worlds: {
    title: "Образовательные миры",
    subtitle: "Каждый предмет — отдельный мир со своими героями, тропинками и секретами. Миры открываются по мере роста.",
    guide: "Проводник",
  },
  personal: {
    title: "Обучение, которое подстраивается",
    subtitle: "EduWorld следит не за оценками, а за тем, какие навыки уже освоены и какие стоит подтянуть.",
    items: [
      { title: "Адаптивный движок", text: "Сложность заданий меняется по ответам ребёнка, чтобы учиться было интересно, а не страшно." },
      { title: "Карта навыков", text: "Темы связаны между собой: прежде чем идти дальше, ребёнок закрепляет нужную основу." },
      { title: "Умное повторение", text: "Пройденное возвращается через нужные промежутки времени, чтобы знания не забывались." },
    ],
  },
  tutor: {
    title: "Помощник EduBuddy",
    subtitle: "Объясняет темы простыми словами.",
    points: [
      "Отвечает из заранее подготовленной и проверенной базы знаний",
      "Объясняет школьные темы и ведёт к нужному уроку",
      "Честно говорит «пока не знаю», если ответа нет в базе",
      "Без ИИ, вопросы не сохраняются; родители могут отключить его",
    ],
    demoLabel: "Пример диалога",
    demoChild: "Что такое дроби?",
    demoBuddy: "Дробь показывает часть целого. Знаменатель - на сколько частей разделили целое, числитель - сколько частей взяли. Потренируемся в уроке?",
    disclaimer: "EduBuddy не решает домашние задания за ребёнка - он объясняет тему.",
  },
  parents: {
    title: "Родительский контроль",
    subtitle: "Вы видите прогресс и решаете, как ребёнок пользуется EduWorld.",
    items: [
      { title: "Панель родителя", text: "Все профили детей и их успехи в одном месте." },
      { title: "Аналитика", text: "Какие навыки освоены, где сложности и что повторить." },
      { title: "Лимиты времени", text: "Дневной лимит и напоминания о перерывах." },
      { title: "Приватность", text: "Ребёнку нужен только никнейм — без фамилии, телефона и e-mail." },
      { title: "Без рекламы", text: "В EduWorld нет рекламы и сторонних баннеров." },
      { title: "Без публичных чатов", text: "Дети не переписываются с незнакомцами." },
    ],
  },
  rewards: {
    title: "Игровые достижения",
    subtitle: "Награды за старание, а не за покупки.",
    items: [
      { emoji: "⭐", title: "Опыт и уровни", text: "Каждый урок приносит опыт и новые уровни." },
      { emoji: "🪙", title: "Монетки", text: "Зарабатываются учёбой и тратятся только на украшения." },
      { emoji: "🐉", title: "Боссы", text: "Добрые боссы проверяют знания в конце тем." },
      { emoji: "🐾", title: "Питомцы", text: "Забавные спутники, которые путешествуют с ребёнком." },
      { emoji: "🏠", title: "Своя комната", text: "Комнату можно украшать предметами из наград." },
      { emoji: "🏅", title: "Достижения", text: "Значки за серии занятий и пройденные миры." },
    ],
    note: "Никаких платных лутбоксов и покупок внутри игры за реальные деньги.",
  },
  faq: {
    title: "Частые вопросы",
    items: [
      { q: "Это бесплатно?", a: "Регистрация родителя бесплатна. Монетки в игре нельзя купить — их зарабатывают только учёбой. Если когда-нибудь появятся платные функции, родители узнают об этом заранее, и ничего не будет списано без их решения." },
      { q: "Для какого возраста EduWorld?", a: "Для детей от 4 до 17 лет. Интерфейс, задания и подсказки меняются в зависимости от возраста: для малышей — крупные кнопки и озвучка, для подростков — более спокойный стиль и сложные задачи." },
      { q: "Это официальная школьная программа?", a: "Нет. EduWorld использует собственную систему навыков. Соответствия программам разных стран пока являются черновиками и будут уточняться после проверки педагогами. EduWorld дополняет школу, а не заменяет её." },
      { q: "Как вы обращаетесь с данными?", a: "Аккаунт создаёт только взрослый. Для ребёнка достаточно никнейма. Мы не показываем рекламу и не продаём данные. Родитель управляет профилями детей в своей панели." },
      { q: "Безопасен ли помощник EduBuddy?", a: "EduBuddy - это чат-бот без ИИ: он отвечает только из заранее подготовленной базы знаний о школьных темах и об EduWorld. Если ответа нет, он честно говорит, что пока не знает. Вопросы ребёнка никуда не отправляются и не сохраняются, а родители могут отключить помощника в настройках." },
      { q: "На каких устройствах работает?", a: "В современном браузере на компьютере, планшете или телефоне. Ничего устанавливать не нужно." },
    ],
  },
  finalCta: {
    title: "Готовы к первому приключению?",
    text: "Создайте профиль родителя, добавьте ребёнка — и Фокси покажет дорогу.",
  },
  footer: {
    tagline: "Образовательное приключение для детей 4–17 лет.",
    sections: "Разделы",
    account: "Аккаунт",
    privacy: "Мы не показываем рекламу и не продаём данные. Аккаунты создают только взрослые; детям нужен лишь никнейм.",
    rights: "Все права защищены.",
  },
  auth: {
    email: "E-mail",
    password: "Пароль",
    showPassword: "Показать пароль",
    hidePassword: "Скрыть пароль",
    login: {
      title: "С возвращением!",
      subtitle: "Вход для родителей",
      submit: "Войти",
      noAccount: "Ещё нет аккаунта?",
      toRegister: "Зарегистрироваться",
      foxy: "Привет! Я Фокси. Войдите, и продолжим приключение!",
      childHint: "Дети входят через профиль, который создал родитель.",
    },
    register: {
      title: "Регистрация родителя",
      subtitle: "Создайте аккаунт, а затем добавьте профили детей.",
      childNote: "Дети не создают аккаунты сами — это делает родитель или законный представитель.",
      confirm: "Повторите пароль",
      rulesTitle: "Пароль должен содержать:",
      ruleLength: "не меньше 8 символов",
      ruleLetter: "хотя бы одну букву",
      ruleDigit: "хотя бы одну цифру",
      guardian: "Я родитель или законный представитель ребёнка, мне есть 18 лет",
      submit: "Создать аккаунт",
      haveAccount: "Уже есть аккаунт?",
      toLogin: "Войти",
      foxy: "Ура, новый путешественник! Сначала — аккаунт для взрослого.",
      checkTitle: "Проверьте почту",
      checkText: "Мы отправили письмо со ссылкой для подтверждения. Откройте его, чтобы активировать аккаунт, а затем войдите.",
      checkSpam: "Не видите письмо? Загляните в папку «Спам».",
    },
    errors: {
      email: "Введите корректный e-mail",
      passwordRequired: "Введите пароль",
      min8: "Минимум 8 символов",
      letter: "Добавьте хотя бы одну букву",
      digit: "Добавьте хотя бы одну цифру",
      tooLong: "Слишком длинный пароль",
      mismatch: "Пароли не совпадают",
      guardian: "Подтвердите, что вы взрослый родитель или опекун",
      invalidCredentials: "Неверный e-mail или пароль",
      emailTaken: "Этот e-mail уже зарегистрирован. Попробуйте войти.",
      rateLimited: "Слишком много попыток. Подождите немного и попробуйте снова.",
      weakPassword: "Пароль слишком простой. Выберите другой.",
      invalidInput: "Проверьте правильность заполнения полей.",
      network: "Нет связи. Проверьте интернет и попробуйте снова.",
      generic: "Что-то пошло не так. Попробуйте ещё раз.",
    },
  },
};

export type PublicDict = typeof ru;

const en: PublicDict = {
  langName: "English",
  langLabel: "Site language",
  skipToContent: "Skip to content",
  nav: {
    label: "Main navigation",
    how: "How it works",
    ages: "Ages",
    worlds: "Worlds",
    parents: "For parents",
    faq: "FAQ",
    menu: "Menu",
    closeMenu: "Close menu",
  },
  common: {
    login: "Log in",
    start: "Start learning",
    home: "Home",
  },
  hero: {
    badge: "An educational adventure for children aged 4–17",
    title: "Learning is a real adventure!",
    subtitle: "Explore new worlds, discover knowledge and grow your abilities",
    slogan: "Learn. Play. Explore. Grow.",
    secondary: "How it works",
    sceneLabel: "EduWorld heroes: Foxy the fox, Oli the owl, Bruno the bear and Luna the bunny on floating islands",
    note: "A parent creates the account — the child plays in their own profile",
  },
  characters: {
    foxy: "Foxy — the guide",
    oli: "Oli — the teacher",
    bruno: "Bruno — the inventor",
    luna: "Luna — the explorer",
  },
  how: {
    title: "How EduWorld works",
    subtitle: "Four steps from sign-up to the first adventure.",
    steps: [
      { title: "A parent creates a profile", text: "You sign up, add your child and set their age, grade and language. Children don't need an e-mail." },
      { title: "Starting adventure", text: "A short, playful check-in with no grades helps us see where to begin." },
      { title: "A personal route", text: "EduWorld picks topics that match your child's level: not too easy, not too hard." },
      { title: "Learning in worlds", text: "Lessons, mini-games and bosses across six worlds. Effort earns XP, coins and rewards." },
    ],
  },
  ages: {
    title: "For every age",
    subtitle: "The interface, tasks and hints adapt to age. Pick a group to get started.",
    cta: "Start with this group",
    groups: [
      { range: "4–6", unit: "years", title: "First steps", text: "Letters, numbers, colours and shapes. Big buttons, voice-over and very little text.", points: ["School readiness", "Attention games", "Short sessions"] },
      { range: "7–10", unit: "years", title: "Young explorers", text: "Counting, reading, the world around us and first steps in coding.", points: ["Maths and reading", "Mini-games and bosses", "Step-by-step hints"] },
      { range: "11–14", unit: "years", title: "Knowledge seekers", text: "Fractions, grammar, science, languages and algorithms.", points: ["Deeper topics", "Smart review", "EduBuddy helper"] },
      { range: "15–17", unit: "years", title: "Masters", text: "Algebra, physics, chemistry, languages and coding in a calmer style.", points: ["Exam preparation", "Challenging problems", "Self-paced learning"] },
    ],
  },
  worlds: {
    title: "Educational worlds",
    subtitle: "Every subject is a world with its own heroes, paths and secrets. Worlds unlock as your child grows.",
    guide: "Guide",
  },
  personal: {
    title: "Learning that adapts",
    subtitle: "EduWorld tracks skills, not grades: what is already mastered and what needs a little more practice.",
    items: [
      { title: "Adaptive engine", text: "Task difficulty follows your child's answers, so learning stays exciting rather than stressful." },
      { title: "Skill graph", text: "Topics are connected: before moving on, your child strengthens the foundations they need." },
      { title: "Smart review", text: "Past topics come back at the right intervals so knowledge sticks." },
    ],
  },
  tutor: {
    title: "EduBuddy helper",
    subtitle: "Explains topics in simple words.",
    points: [
      "Answers from a prepared, reviewed knowledge base",
      "Explains school topics and leads to the right lesson",
      "Honestly says \"I don't know yet\" when the answer isn't in the base",
      "No AI, questions aren't stored; parents can switch it off",
    ],
    demoLabel: "Example conversation",
    demoChild: "What is a fraction?",
    demoBuddy: "A fraction shows part of a whole. The denominator tells how many equal parts the whole is cut into, the numerator how many parts we take. Shall we practise in the lesson?",
    disclaimer: "EduBuddy doesn't do homework for children - it explains the topic.",
  },
  parents: {
    title: "Parental control",
    subtitle: "You see the progress and decide how your child uses EduWorld.",
    items: [
      { title: "Parent dashboard", text: "All your children's profiles and progress in one place." },
      { title: "Analytics", text: "Which skills are mastered, where it's hard and what to review." },
      { title: "Time limits", text: "A daily limit and break reminders." },
      { title: "Privacy", text: "A child only needs a nickname — no surname, phone or e-mail." },
      { title: "No ads", text: "EduWorld has no advertising or third-party banners." },
      { title: "No public chat", text: "Children don't message strangers." },
    ],
  },
  rewards: {
    title: "Game achievements",
    subtitle: "Rewards for effort, not for purchases.",
    items: [
      { emoji: "⭐", title: "XP and levels", text: "Every lesson earns experience and new levels." },
      { emoji: "🪙", title: "Coins", text: "Earned by learning and spent only on cosmetics." },
      { emoji: "🐉", title: "Bosses", text: "Friendly bosses check knowledge at the end of topics." },
      { emoji: "🐾", title: "Pets", text: "Funny companions that travel with your child." },
      { emoji: "🏠", title: "Your own room", text: "Decorate a room with items earned as rewards." },
      { emoji: "🏅", title: "Achievements", text: "Badges for learning streaks and completed worlds." },
    ],
    note: "No paid loot boxes and no real-money purchases inside the game.",
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      { q: "Is it free?", a: "Parent sign-up is free. In-game coins can't be bought — they are earned only by learning. If paid features ever appear, parents will be told in advance and nothing will be charged without their decision." },
      { q: "Which ages is EduWorld for?", a: "Children from 4 to 17. The interface, tasks and hints change with age: big buttons and voice-over for little ones, a calmer style and harder problems for teens." },
      { q: "Is it an official school curriculum?", a: "No. EduWorld uses its own skills framework. Mappings to different countries' programmes are drafts until they are reviewed by educators. EduWorld complements school rather than replacing it." },
      { q: "How do you handle data and privacy?", a: "Only an adult creates the account. A child needs just a nickname. We show no ads and don't sell data. Parents manage their children's profiles from their dashboard." },
      { q: "Is the EduBuddy helper safe?", a: "EduBuddy is a chat bot without AI: it answers only from a prepared knowledge base about school topics and EduWorld. If it doesn't know, it says so honestly. Children's questions are not sent anywhere or stored, and parents can switch the helper off in settings." },
      { q: "Which devices does it work on?", a: "Any modern browser on a computer, tablet or phone. Nothing to install." },
    ],
  },
  finalCta: {
    title: "Ready for the first adventure?",
    text: "Create a parent profile, add your child — and Foxy will lead the way.",
  },
  footer: {
    tagline: "An educational adventure for children aged 4–17.",
    sections: "Sections",
    account: "Account",
    privacy: "We show no ads and don't sell data. Accounts are created only by adults; children need just a nickname.",
    rights: "All rights reserved.",
  },
  auth: {
    email: "E-mail",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    login: {
      title: "Welcome back!",
      subtitle: "Parent log in",
      submit: "Log in",
      noAccount: "No account yet?",
      toRegister: "Sign up",
      foxy: "Hi! I'm Foxy. Log in and let's continue the adventure!",
      childHint: "Children enter through the profile a parent created.",
    },
    register: {
      title: "Parent sign-up",
      subtitle: "Create an account, then add your children's profiles.",
      childNote: "Children don't create accounts themselves — a parent or legal guardian does.",
      confirm: "Repeat password",
      rulesTitle: "Your password needs:",
      ruleLength: "at least 8 characters",
      ruleLetter: "at least one letter",
      ruleDigit: "at least one digit",
      guardian: "I am a parent or legal guardian and I am 18 or older",
      submit: "Create account",
      haveAccount: "Already have an account?",
      toLogin: "Log in",
      foxy: "Hooray, a new traveller! First, an account for a grown-up.",
      checkTitle: "Check your e-mail",
      checkText: "We've sent you a confirmation link. Open it to activate your account, then log in.",
      checkSpam: "Can't find it? Check your spam folder.",
    },
    errors: {
      email: "Enter a valid e-mail",
      passwordRequired: "Enter your password",
      min8: "At least 8 characters",
      letter: "Add at least one letter",
      digit: "Add at least one digit",
      tooLong: "Password is too long",
      mismatch: "Passwords don't match",
      guardian: "Please confirm you are an adult parent or guardian",
      invalidCredentials: "Wrong e-mail or password",
      emailTaken: "This e-mail is already registered. Try logging in.",
      rateLimited: "Too many attempts. Please wait a little and try again.",
      weakPassword: "This password is too weak. Please choose another one.",
      invalidInput: "Please check the form fields.",
      network: "No connection. Check the internet and try again.",
      generic: "Something went wrong. Please try again.",
    },
  },
};

const uz: PublicDict = {
  langName: "O‘zbekcha",
  langLabel: "Sayt tili",
  skipToContent: "Asosiy qismga o‘tish",
  nav: {
    label: "Asosiy navigatsiya",
    how: "Qanday ishlaydi",
    ages: "Yosh",
    worlds: "Olamlar",
    parents: "Ota-onalarga",
    faq: "Savollar",
    menu: "Menyu",
    closeMenu: "Menyuni yopish",
  },
  common: {
    login: "Kirish",
    start: "O‘qishni boshlash",
    home: "Bosh sahifa",
  },
  hero: {
    badge: "4–17 yoshli bolalar uchun ta’limiy sarguzasht",
    title: "O‘qish — haqiqiy sarguzasht!",
    subtitle: "Yangi olamlarni kashf et, bilim ol va qobiliyatlaringni rivojlantir",
    slogan: "Learn. Play. Explore. Grow.",
    secondary: "Qanday ishlaydi",
    sceneLabel: "EduWorld qahramonlari: tulkicha Foxy, boyo‘g‘licha Oli, ayiqcha Bruno va quyoncha Luna uchar orollarda",
    note: "Akkauntni ota-ona yaratadi — bola o‘z profilida o‘ynaydi",
  },
  characters: {
    foxy: "Foxy — yo‘lboshchi",
    oli: "Oli — o‘qituvchi",
    bruno: "Bruno — ixtirochi",
    luna: "Luna — tadqiqotchi",
  },
  how: {
    title: "EduWorld qanday ishlaydi",
    subtitle: "Ro‘yxatdan o‘tishdan birinchi sarguzashtgacha to‘rt qadam.",
    steps: [
      { title: "Ota-ona profil yaratadi", text: "Siz ro‘yxatdan o‘tasiz, bolani qo‘shasiz, yoshi, sinfi va tilini belgilaysiz. Bolaga e-mail kerak emas." },
      { title: "Boshlang‘ich sarguzasht", text: "Baholarsiz qisqa o‘yin-diagnostika qayerdan boshlashni aniqlashga yordam beradi." },
      { title: "Shaxsiy yo‘nalish", text: "EduWorld mavzularni bolaning darajasiga moslab tanlaydi: juda oson ham, juda qiyin ham emas." },
      { title: "Olamlarda o‘qish", text: "Oltita olamda darslar, mini-o‘yinlar va bosslar. Harakat uchun tajriba, tangalar va mukofotlar." },
    ],
  },
  ages: {
    title: "Har bir yosh uchun",
    subtitle: "Interfeys, topshiriqlar va maslahatlar yoshga moslashadi. Boshlash uchun guruhni tanlang.",
    cta: "Shu guruh bilan boshlash",
    groups: [
      { range: "4–6", unit: "yosh", title: "Birinchi qadamlar", text: "Harflar, raqamlar, ranglar va shakllar. Katta tugmalar, ovozli yordam va kam matn.", points: ["Maktabga tayyorgarlik", "Diqqat o‘yinlari", "Qisqa mashg‘ulotlar"] },
      { range: "7–10", unit: "yosh", title: "Yosh tadqiqotchilar", text: "Hisob, o‘qish, atrof-olam va dasturlashdagi ilk qadamlar.", points: ["Matematika va o‘qish", "Mini-o‘yinlar va bosslar", "Bosqichma-bosqich maslahatlar"] },
      { range: "11–14", unit: "yosh", title: "Bilim izlovchilar", text: "Kasrlar, grammatika, tabiiy fanlar, tillar va algoritmlar.", points: ["Chuqurroq mavzular", "Takrorlash", "EduBuddy yordamchisi"] },
      { range: "15–17", unit: "yosh", title: "Ustalar", text: "Algebra, fizika, kimyo, tillar va dasturlash — xotirjam uslubda.", points: ["Imtihonlarga tayyorgarlik", "Murakkab masalalar", "O‘z sur’atida o‘qish"] },
    ],
  },
  worlds: {
    title: "Ta’limiy olamlar",
    subtitle: "Har bir fan — o‘z qahramonlari, so‘qmoqlari va sirlariga ega alohida olam. Olamlar bola o‘sgan sari ochiladi.",
    guide: "Yo‘lboshchi",
  },
  personal: {
    title: "Moslashuvchan ta’lim",
    subtitle: "EduWorld baholarni emas, ko‘nikmalarni kuzatadi: nima o‘zlashtirildi va nimani mustahkamlash kerak.",
    items: [
      { title: "Adaptiv dvigatel", text: "Topshiriqlar murakkabligi bolaning javoblariga qarab o‘zgaradi — o‘qish qo‘rqinchli emas, qiziqarli bo‘ladi." },
      { title: "Ko‘nikmalar xaritasi", text: "Mavzular o‘zaro bog‘langan: oldinga yurishdan avval bola kerakli asosni mustahkamlaydi." },
      { title: "Aqlli takrorlash", text: "O‘tilgan mavzular kerakli vaqt oralig‘ida qaytadi, shunda bilim unutilmaydi." },
    ],
  },
  tutor: {
    title: "EduBuddy yordamchisi",
    subtitle: "Mavzularni oddiy so‘zlar bilan tushuntiradi.",
    points: [
      "Oldindan tayyorlangan bilimlar bazasidan javob beradi",
      "Maktab mavzularini tushuntiradi va kerakli darsga olib boradi",
      "Javob bazada bo‘lmasa, «hozircha bilmayman» deydi",
      "AI emas, savollar saqlanmaydi; ota-onalar o‘chirib qo‘yishi mumkin",
    ],
    demoLabel: "Suhbat namunasi",
    demoChild: "Kasr nima?",
    demoBuddy: "Kasr butunning bir qismini ko‘rsatadi. Maxraj butun necha qismga bo‘linganini, surat esa nechta qism olinganini bildiradi.",
    disclaimer: "EduBuddy uy vazifasini bola o‘rniga bajarmaydi - mavzuni tushuntiradi.",
  },
  parents: {
    title: "Ota-ona nazorati",
    subtitle: "Siz rivojlanishni ko‘rasiz va bola EduWorld’dan qanday foydalanishini o‘zingiz hal qilasiz.",
    items: [
      { title: "Ota-ona paneli", text: "Barcha bolalar profillari va yutuqlari bir joyda." },
      { title: "Tahlil", text: "Qaysi ko‘nikmalar o‘zlashtirilgan, qayerda qiyinchilik bor va nimani takrorlash kerak." },
      { title: "Vaqt cheklovlari", text: "Kunlik limit va tanaffus haqida eslatmalar." },
      { title: "Maxfiylik", text: "Bolaga faqat taxallus kerak — familiya, telefon yoki e-mailsiz." },
      { title: "Reklamasiz", text: "EduWorld’da reklama va begona bannerlar yo‘q." },
      { title: "Ochiq chatlarsiz", text: "Bolalar notanish odamlar bilan yozishmaydi." },
    ],
  },
  rewards: {
    title: "O‘yin yutuqlari",
    subtitle: "Mukofotlar xarid uchun emas, harakat uchun.",
    items: [
      { emoji: "⭐", title: "Tajriba va darajalar", text: "Har bir dars tajriba va yangi darajalar beradi." },
      { emoji: "🪙", title: "Tangalar", text: "O‘qish orqali topiladi va faqat bezaklarga sarflanadi." },
      { emoji: "🐉", title: "Bosslar", text: "Mehribon bosslar mavzu oxirida bilimni tekshiradi." },
      { emoji: "🐾", title: "Uy hayvonlari", text: "Bola bilan birga sayohat qiladigan quvnoq hamrohlar." },
      { emoji: "🏠", title: "O‘z xonang", text: "Xonani mukofot buyumlari bilan bezash mumkin." },
      { emoji: "🏅", title: "Yutuqlar", text: "Muntazam mashg‘ulotlar va o‘tilgan olamlar uchun nishonlar." },
    ],
    note: "Pullik lutboks va o‘yin ichida haqiqiy pulga xaridlar yo‘q.",
  },
  faq: {
    title: "Ko‘p beriladigan savollar",
    items: [
      { q: "Bu bepulmi?", a: "Ota-onaning ro‘yxatdan o‘tishi bepul. O‘yindagi tangalarni sotib olib bo‘lmaydi — ular faqat o‘qish orqali topiladi. Agar pullik funksiyalar paydo bo‘lsa, ota-onalar oldindan xabardor qilinadi va ularning qarorisiz hech narsa yechilmaydi." },
      { q: "EduWorld qaysi yosh uchun?", a: "4 yoshdan 17 yoshgacha bo‘lgan bolalar uchun. Interfeys, topshiriqlar va maslahatlar yoshga qarab o‘zgaradi: kichiklar uchun katta tugmalar va ovoz, o‘smirlar uchun xotirjam uslub va murakkab masalalar." },
      { q: "Bu rasmiy maktab dasturimi?", a: "Yo‘q. EduWorld o‘zining ko‘nikmalar tizimidan foydalanadi. Turli mamlakatlar dasturlariga moslashtirishlar pedagoglar tekshirmaguncha qoralama hisoblanadi. EduWorld maktabni almashtirmaydi, balki to‘ldiradi." },
      { q: "Ma’lumotlar bilan qanday ishlaysiz?", a: "Akkauntni faqat kattalar yaratadi. Bolaga taxallus kifoya. Biz reklama ko‘rsatmaymiz va ma’lumotlarni sotmaymiz. Ota-ona bolalar profillarini o‘z panelida boshqaradi." },
      { q: "EduBuddy yordamchisi xavfsizmi?", a: "EduBuddy - AI bo‘lmagan chat-bot: u faqat maktab mavzulari va EduWorld haqidagi tayyor bilimlar bazasidan javob beradi. Javob bo‘lmasa, hozircha bilmasligini aytadi. Savollar hech qayerga yuborilmaydi va saqlanmaydi, ota-onalar uni sozlamalarda o‘chirishi mumkin." },
      { q: "Qaysi qurilmalarda ishlaydi?", a: "Kompyuter, planshet yoki telefondagi zamonaviy brauzerda. Hech narsa o‘rnatish shart emas." },
    ],
  },
  finalCta: {
    title: "Birinchi sarguzashtga tayyormisiz?",
    text: "Ota-ona profilini yarating, bolani qo‘shing — Foxy yo‘l ko‘rsatadi.",
  },
  footer: {
    tagline: "4–17 yoshli bolalar uchun ta’limiy sarguzasht.",
    sections: "Bo‘limlar",
    account: "Akkaunt",
    privacy: "Biz reklama ko‘rsatmaymiz va ma’lumotlarni sotmaymiz. Akkauntlarni faqat kattalar yaratadi; bolalarga faqat taxallus kerak.",
    rights: "Barcha huquqlar himoyalangan.",
  },
  auth: {
    email: "E-mail",
    password: "Parol",
    showPassword: "Parolni ko‘rsatish",
    hidePassword: "Parolni yashirish",
    login: {
      title: "Xush kelibsiz!",
      subtitle: "Ota-onalar uchun kirish",
      submit: "Kirish",
      noAccount: "Akkauntingiz yo‘qmi?",
      toRegister: "Ro‘yxatdan o‘tish",
      foxy: "Salom! Men Foxy. Kiring va sarguzashtni davom ettiramiz!",
      childHint: "Bolalar ota-ona yaratgan profil orqali kiradi.",
    },
    register: {
      title: "Ota-ona ro‘yxatdan o‘tishi",
      subtitle: "Akkaunt yarating, so‘ng bolalar profillarini qo‘shing.",
      childNote: "Bolalar akkauntni o‘zlari yaratmaydi — buni ota-ona yoki qonuniy vakil qiladi.",
      confirm: "Parolni takrorlang",
      rulesTitle: "Parolda bo‘lishi kerak:",
      ruleLength: "kamida 8 ta belgi",
      ruleLetter: "kamida bitta harf",
      ruleDigit: "kamida bitta raqam",
      guardian: "Men bolaning ota-onasi yoki qonuniy vakiliman, yoshim 18 dan katta",
      submit: "Akkaunt yaratish",
      haveAccount: "Akkauntingiz bormi?",
      toLogin: "Kirish",
      foxy: "Hurro, yangi sayohatchi! Avval kattalar uchun akkaunt.",
      checkTitle: "Pochtangizni tekshiring",
      checkText: "Tasdiqlash havolasi bilan xat yubordik. Akkauntni faollashtirish uchun uni oching, so‘ng tizimga kiring.",
      checkSpam: "Xatni topa olmayapsizmi? «Spam» papkasini tekshiring.",
    },
    errors: {
      email: "To‘g‘ri e-mail kiriting",
      passwordRequired: "Parolni kiriting",
      min8: "Kamida 8 ta belgi",
      letter: "Kamida bitta harf qo‘shing",
      digit: "Kamida bitta raqam qo‘shing",
      tooLong: "Parol juda uzun",
      mismatch: "Parollar mos kelmadi",
      guardian: "Voyaga yetgan ota-ona yoki vasiy ekanligingizni tasdiqlang",
      invalidCredentials: "E-mail yoki parol noto‘g‘ri",
      emailTaken: "Bu e-mail allaqachon ro‘yxatdan o‘tgan. Kirib ko‘ring.",
      rateLimited: "Urinishlar juda ko‘p. Biroz kutib, qayta urinib ko‘ring.",
      weakPassword: "Parol juda oddiy. Boshqasini tanlang.",
      invalidInput: "Maydonlar to‘g‘ri to‘ldirilganini tekshiring.",
      network: "Aloqa yo‘q. Internetni tekshirib, qayta urinib ko‘ring.",
      generic: "Nimadir xato ketdi. Qayta urinib ko‘ring.",
    },
  },
};

export const PUBLIC_DICT: Record<Locale, PublicDict> = { ru, en, uz };

export const getPublicDict = (locale: Locale): PublicDict => PUBLIC_DICT[locale];

export type AuthDict = PublicDict["auth"];
export type AuthErrorKey = keyof AuthDict["errors"];

/** Map zod issue messages (codes from validation.ts) to AuthDict error keys. */
export function authErrorKey(message: string | undefined, fallback: AuthErrorKey): AuthErrorKey {
  switch (message) {
    case "min8":
    case "letter":
    case "digit":
    case "mismatch":
    case "guardian":
      return message;
    default:
      return fallback;
  }
}
