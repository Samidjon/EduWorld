import type { Locale } from "@/types/content";

/**
 * Interface translations (kept separate from learning content).
 * Add a language: add its code to Locale and a column here; missing keys fall back to ru → en.
 */
type Entry = { en: string; ru: string; uz?: string };

export const UI = {
  // brand / nav
  slogan: { en: "Learn. Play. Explore. Grow.", ru: "Учись. Играй. Исследуй. Расти.", uz: "O‘rgan. O‘yna. Kashf et. O‘s." },
  login: { en: "Log in", ru: "Войти", uz: "Kirish" },
  logout: { en: "Log out", ru: "Выйти", uz: "Chiqish" },
  register: { en: "Sign up", ru: "Регистрация", uz: "Ro‘yxatdan o‘tish" },
  startLearning: { en: "Start learning", ru: "Начать обучение", uz: "O‘qishni boshlash" },
  back: { en: "Back", ru: "Назад", uz: "Orqaga" },
  next: { en: "Next", ru: "Далее", uz: "Keyingi" },
  continue: { en: "Continue", ru: "Продолжить", uz: "Davom etish" },
  save: { en: "Save", ru: "Сохранить", uz: "Saqlash" },
  saved: { en: "Saved", ru: "Сохранено", uz: "Saqlandi" },
  cancel: { en: "Cancel", ru: "Отмена", uz: "Bekor qilish" },
  close: { en: "Close", ru: "Закрыть", uz: "Yopish" },
  loading: { en: "Loading…", ru: "Загрузка…", uz: "Yuklanmoqda…" },
  errorGeneric: { en: "Something went wrong. Please try again.", ru: "Что-то пошло не так. Попробуй ещё раз.", uz: "Nimadir xato ketdi. Qayta urinib ko‘ring." },
  networkError: { en: "No connection. Check the internet and try again.", ru: "Нет связи. Проверь интернет и попробуй снова.", uz: "Aloqa yo‘q. Internetni tekshiring." },

  // child nav
  navHome: { en: "Home", ru: "Главная", uz: "Bosh sahifa" },
  navMap: { en: "Map", ru: "Карта", uz: "Xarita" },
  navGames: { en: "Games", ru: "Игры", uz: "O‘yinlar" },
  navTutor: { en: "EduBuddy", ru: "EduBuddy", uz: "EduBuddy" },
  navMe: { en: "Me", ru: "Я", uz: "Men" },
  navRoadmap: { en: "My path", ru: "Мой путь", uz: "Mening yo‘lim" },
  navSkills: { en: "Skill tree", ru: "Дерево навыков", uz: "Ko‘nikmalar daraxti" },
  navJournal: { en: "Journal", ru: "Дневник", uz: "Kundalik" },
  navAchievements: { en: "Achievements", ru: "Достижения", uz: "Yutuqlar" },
  navAvatar: { en: "Avatar", ru: "Аватар", uz: "Avatar" },
  navInventory: { en: "Backpack", ru: "Рюкзак", uz: "Ryukzak" },
  navShop: { en: "Shop", ru: "Магазин", uz: "Do‘kon" },
  navHomeRoom: { en: "My room", ru: "Моя комната", uz: "Mening xonam" },
  parentArea: { en: "Parents", ru: "Для родителей", uz: "Ota-onalar uchun" },

  // dashboard
  hello: { en: "Hello, {name}", ru: "Привет, {name}", uz: "Salom, {name}" },
  level: { en: "Level", ru: "Уровень", uz: "Daraja" },
  coins: { en: "Coins", ru: "Монеты", uz: "Tangalar" },
  streak: { en: "Day streak", ru: "Дней подряд", uz: "Ketma-ket kunlar" },
  continueLearning: { en: "Continue learning", ru: "Продолжить обучение", uz: "O‘qishni davom ettirish" },
  dailyChallenges: { en: "Daily challenges", ru: "Задания дня", uz: "Kunlik vazifalar" },
  weeklyGoal: { en: "Weekly goal", ru: "Цель недели", uz: "Haftalik maqsad" },
  recommended: { en: "Recommended for you", ru: "Рекомендуем тебе", uz: "Siz uchun tavsiya" },
  worlds: { en: "Worlds", ru: "Миры", uz: "Olamlar" },
  locked: { en: "Locked", ru: "Закрыто", uz: "Yopiq" },
  open: { en: "Open", ru: "Открыть", uz: "Ochish" },
  mastered: { en: "Mastered", ru: "Освоено", uz: "O‘zlashtirildi" },
  learning: { en: "Learning", ru: "Изучаю", uz: "O‘rganmoqda" },
  needsReview: { en: "Let's practise", ru: "Повторим", uz: "Takrorlaymiz" },
  notStarted: { en: "New", ru: "Новое", uz: "Yangi" },
  reviewDue: { en: "Time to review", ru: "Пора повторить", uz: "Takrorlash vaqti" },
  reasonFoundation: { en: "Builds a base", ru: "Основа для новых тем", uz: "Asos" },
  reasonNext: { en: "Next step", ru: "Следующий шаг", uz: "Keyingi qadam" },
  reasonStretch: { en: "A bit of a challenge", ru: "Чуть сложнее", uz: "Biroz qiyinroq" },
  minutes: { en: "min", ru: "мин", uz: "daq" },
  lessons: { en: "Lessons", ru: "Уроки", uz: "Darslar" },
  boss: { en: "Boss challenge", ru: "Испытание босса", uz: "Boss sinovi" },
  start: { en: "Start", ru: "Начать", uz: "Boshlash" },
  play: { en: "Play", ru: "Играть", uz: "O‘ynash" },
  review: { en: "Review", ru: "Повторить", uz: "Takrorlash" },
  needsTopics: { en: "First master:", ru: "Сначала освой:", uz: "Avval o‘zlashtiring:" },

  // lessons
  check: { en: "Check", ru: "Проверить", uz: "Tekshirish" },
  hint: { en: "Hint", ru: "Подсказка", uz: "Maslahat" },
  tryAgain: { en: "Try again", ru: "Ещё раз", uz: "Yana urinish" },
  listen: { en: "Listen", ru: "Послушать", uz: "Tinglash" },
  stepIntro: { en: "Meet the topic", ru: "Знакомство", uz: "Tanishuv" },
  stepExplain: { en: "Explanation", ru: "Объяснение", uz: "Tushuntirish" },
  stepExample: { en: "Example", ru: "Пример", uz: "Misol" },
  stepPractice: { en: "Practice", ru: "Практика", uz: "Mashq" },
  stepGame: { en: "Game", ru: "Игра", uz: "O‘yin" },
  stepCheck: { en: "Check yourself", ru: "Проверь себя", uz: "O‘zingni tekshir" },
  stepReward: { en: "Reward", ru: "Награда", uz: "Mukofot" },
  great: { en: "Great job!", ru: "Здорово!", uz: "Ajoyib!" },
  niceTry: { en: "Nice try! Let's try again.", ru: "Отличная попытка! Давай попробуем ещё раз.", uz: "Yaxshi urinish! Yana bir bor urinib ko‘ramiz." },
  close1: { en: "You're very close!", ru: "Ты уже близко к ответу!", uz: "Javobga juda yaqinsiz!" },
  together: { en: "Let's work it out together.", ru: "Давай разберём это вместе.", uz: "Keling, birga ko‘rib chiqamiz." },
  learnedTopic: { en: "Awesome! You've learned a new topic!", ru: "Здорово! Ты понял новую тему!", uz: "Zo‘r! Siz yangi mavzuni o‘rgandingiz!" },
  keepPractising: { en: "Good work! A little more practice and you'll master it.", ru: "Хорошая работа! Ещё немного практики - и тема будет освоена.", uz: "Yaxshi! Yana ozgina mashq - va mavzu o‘zlashtiriladi." },
  score: { en: "Score", ru: "Результат", uz: "Natija" },
  xp: { en: "XP", ru: "Опыт", uz: "Tajriba" },
  levelUp: { en: "Level up!", ru: "Новый уровень!", uz: "Yangi daraja!" },
  newAchievement: { en: "New achievement!", ru: "Новое достижение!", uz: "Yangi yutuq!" },
  challengeDone: { en: "Challenge complete!", ru: "Задание выполнено!", uz: "Vazifa bajarildi!" },
  newItem: { en: "New item!", ru: "Новый предмет!", uz: "Yangi buyum!" },
  finish: { en: "Finish", ru: "Завершить", uz: "Yakunlash" },
  backToWorld: { en: "Back to the world", ru: "Вернуться в мир", uz: "Olamga qaytish" },
  typeAnswer: { en: "Type your answer", ru: "Введи ответ", uz: "Javobni kiriting" },
  dragHere: { en: "Drop here", ru: "Перетащи сюда", uz: "Bu yerga tashlang" },
  tapToPlace: { en: "Tap an item, then tap a box", ru: "Нажми на карточку, потом на корзину", uz: "Kartani, keyin qutini bosing" },
  clear: { en: "Clear", ru: "Очистить", uz: "Tozalash" },
  run: { en: "Run", ru: "Запустить", uz: "Ishga tushirish" },
  reset: { en: "Reset", ru: "Сбросить", uz: "Qayta boshlash" },
  trueW: { en: "True", ru: "Верно", uz: "To‘g‘ri" },
  falseW: { en: "False", ru: "Неверно", uz: "Noto‘g‘ri" },
  timeForBreak: { en: "Time for a break!", ru: "Пора отдохнуть!", uz: "Dam olish vaqti!" },
  breakText: { en: "You've been learning for a while. Stretch, drink some water and look out of the window.", ru: "Ты давно занимаешься. Потянись, выпей воды и посмотри в окно.", uz: "Siz uzoq vaqt o‘qidingiz. Cho‘zilib oling, suv iching." },
  dailyLimitReached: { en: "That's enough learning for today. See you tomorrow!", ru: "На сегодня достаточно. До завтра!", uz: "Bugunga yetarli. Ertaga ko‘rishguncha!" },
  featureDisabled: { en: "This feature is turned off by your parent.", ru: "Эту функцию отключил родитель.", uz: "Bu funksiyani ota-onangiz o‘chirgan." },
} satisfies Record<string, Entry>;

export type UIKey = keyof typeof UI;

export function ut(locale: Locale, key: UIKey, vars?: Record<string, string | number>): string {
  const e: Entry = UI[key];
  let s = (locale === "uz" ? e.uz ?? e.ru : e[locale]) ?? e.en;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
