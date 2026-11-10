import type { AchievementDef } from "@/types/content";

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-steps", icon: "👣", name: { en: "First Steps", ru: "Первые шаги" }, description: { en: "Finish the starting adventure (diagnostic).", ru: "Пройди стартовое приключение (диагностику)." }, requirement: { kind: "assessment_done" }, reward: { xp: 30, coins: 20 } },
  { id: "first-lesson", icon: "📗", name: { en: "First Lesson", ru: "Первый урок" }, description: { en: "Complete your first lesson.", ru: "Пройди первый урок." }, requirement: { kind: "lessons_completed", count: 1 }, reward: { xp: 20, coins: 15 } },
  { id: "lessons-10", icon: "📚", name: { en: "Bookworm", ru: "Книжный червячок" }, description: { en: "Complete 10 lessons.", ru: "Пройди 10 уроков." }, requirement: { kind: "lessons_completed", count: 10 }, reward: { xp: 60, coins: 40 } },
  { id: "lessons-50", icon: "🎓", name: { en: "Scholar", ru: "Учёный" }, description: { en: "Complete 50 lessons.", ru: "Пройди 50 уроков." }, requirement: { kind: "lessons_completed", count: 50 }, reward: { xp: 200, coins: 120 } },
  { id: "mastery-1", icon: "⭐", name: { en: "New Skill!", ru: "Новый навык!" }, description: { en: "Master your first topic.", ru: "Освой первую тему." }, requirement: { kind: "topics_mastered", count: 1 }, reward: { xp: 30, coins: 20 } },
  { id: "mastery-10", icon: "🌟", name: { en: "Skill Collector", ru: "Коллекционер навыков" }, description: { en: "Master 10 topics.", ru: "Освой 10 тем." }, requirement: { kind: "topics_mastered", count: 10 }, reward: { xp: 120, coins: 80 } },
  { id: "correct-50", icon: "✅", name: { en: "Sharp Mind", ru: "Острый ум" }, description: { en: "Give 50 correct answers.", ru: "Дай 50 правильных ответов." }, requirement: { kind: "correct_answers", count: 50 }, reward: { xp: 50, coins: 30 } },
  { id: "correct-250", icon: "🧠", name: { en: "Brain Power", ru: "Сила мысли" }, description: { en: "Give 250 correct answers.", ru: "Дай 250 правильных ответов." }, requirement: { kind: "correct_answers", count: 250 }, reward: { xp: 150, coins: 90 } },
  { id: "streak-3", icon: "🔥", name: { en: "Warming Up", ru: "Разминка" }, description: { en: "Learn 3 days in a row.", ru: "Занимайся 3 дня подряд." }, requirement: { kind: "streak_days", count: 3 }, reward: { xp: 40, coins: 25 } },
  { id: "streak-7", icon: "🏅", name: { en: "Steady Explorer", ru: "Упорный исследователь" }, description: { en: "Learn 7 days in a row.", ru: "Занимайся 7 дней подряд." }, requirement: { kind: "streak_days", count: 7 }, reward: { xp: 100, coins: 60 } },
  { id: "level-5", icon: "🚀", name: { en: "Level 5", ru: "Уровень 5" }, description: { en: "Reach level 5.", ru: "Достигни 5 уровня." }, requirement: { kind: "level", count: 5 }, reward: { xp: 0, coins: 50 } },
  { id: "level-10", icon: "🛸", name: { en: "Level 10", ru: "Уровень 10" }, description: { en: "Reach level 10.", ru: "Достигни 10 уровня." }, requirement: { kind: "level", count: 10 }, reward: { xp: 0, coins: 120 } },
  { id: "boss-1", icon: "🛡️", name: { en: "Brave Hero", ru: "Смелый герой" }, description: { en: "Win your first boss challenge.", ru: "Пройди первое испытание босса." }, requirement: { kind: "bosses_defeated", count: 1 }, reward: { xp: 80, coins: 50 } },
  { id: "boss-5", icon: "👑", name: { en: "Champion", ru: "Чемпион" }, description: { en: "Win 5 boss challenges.", ru: "Пройди 5 испытаний боссов." }, requirement: { kind: "bosses_defeated", count: 5 }, reward: { xp: 250, coins: 150 } },
  { id: "games-10", icon: "🎮", name: { en: "Game Explorer", ru: "Исследователь игр" }, description: { en: "Play 10 learning games.", ru: "Сыграй в 10 обучающих игр." }, requirement: { kind: "games_played", count: 10 }, reward: { xp: 40, coins: 30 } },
  { id: "worlds-3", icon: "🗺️", name: { en: "Traveller", ru: "Путешественник" }, description: { en: "Unlock 3 worlds.", ru: "Открой 3 мира." }, requirement: { kind: "worlds_unlocked", count: 3 }, reward: { xp: 60, coins: 40 } },
  { id: "worlds-6", icon: "🌐", name: { en: "World Explorer", ru: "Покоритель миров" }, description: { en: "Unlock all 6 worlds.", ru: "Открой все 6 миров." }, requirement: { kind: "worlds_unlocked", count: 6 }, reward: { xp: 150, coins: 100 } },
  { id: "collector-5", icon: "🎒", name: { en: "Collector", ru: "Коллекционер" }, description: { en: "Own 5 items.", ru: "Собери 5 предметов." }, requirement: { kind: "items_owned", count: 5 }, reward: { xp: 30, coins: 0 } },
];

export const getAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
