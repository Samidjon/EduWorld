import type { AchievementDef } from "@/types/content";
import type { ChallengeData, GameProfileRow } from "@/types/db";
import { hashString, rng } from "@/lib/rng";

/** RPG progression rules (pure, unit-tested). */

export const xpToNext = (level: number) => 100 + (level - 1) * 50;

export function addXp(p: GameProfileRow, amount: number): { profile: GameProfileRow; levelsGained: number } {
  let { level, xp } = p;
  xp += Math.max(0, Math.round(amount));
  let gained = 0;
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level++;
    gained++;
  }
  return { profile: { ...p, level, xp, total_xp: p.total_xp + Math.max(0, Math.round(amount)) }, levelsGained: gained };
}

export function newGameProfile(childId: string): Omit<GameProfileRow, "id"> {
  return { child_id: childId, level: 1, xp: 0, total_xp: 0, coins: 50, streak: 0, longest_streak: 0, last_active_date: null, home_config: { placed: [], wallpaper: "sky" } };
}

export const isoDate = (d = new Date()) => d.toISOString().slice(0, 10);

/** Streak only grows; a missed day simply restarts it at 1 - no punishment or loss of items. */
export function touchStreak(p: GameProfileRow, today = isoDate()): GameProfileRow {
  if (p.last_active_date === today) return p;
  const y = new Date(today + "T00:00:00Z");
  y.setUTCDate(y.getUTCDate() - 1);
  const streak = p.last_active_date === isoDate(y) ? p.streak + 1 : 1;
  return { ...p, streak, longest_streak: Math.max(p.longest_streak, streak), last_active_date: today };
}

export function lessonReward(difficulty: number, score: number, firstMastery: boolean, repeat: boolean) {
  const base = { xp: 30 + 10 * difficulty, coins: 10 + 5 * difficulty };
  const factor = repeat ? 0.4 : 1;
  const quality = 0.5 + 0.5 * Math.max(0, Math.min(1, score));
  return {
    xp: Math.round(base.xp * factor * quality + (firstMastery ? 30 : 0)),
    coins: Math.round(base.coins * factor * quality + (firstMastery ? 10 : 0)),
  };
}

export const GAME_REWARD_DAILY_CAP = 8;
export function gameReward(score: number, maxScore: number, rewardedToday: number) {
  if (rewardedToday >= GAME_REWARD_DAILY_CAP || maxScore <= 0) return { xp: 0, coins: 0 };
  const r = Math.max(0, Math.min(1, score / maxScore));
  return { xp: Math.round(10 + 20 * r), coins: Math.round(4 + 8 * r) };
}

export interface ChildStats {
  lessonsCompleted: number;
  topicsMastered: number;
  correctAnswers: number;
  streak: number;
  level: number;
  bossesDefeated: number;
  gamesPlayed: number;
  worldsUnlocked: number;
  assessmentDone: boolean;
  itemsOwned: number;
}

export function achievementMet(a: AchievementDef, s: ChildStats): boolean {
  const r = a.requirement;
  switch (r.kind) {
    case "lessons_completed": return s.lessonsCompleted >= r.count;
    case "topics_mastered": return s.topicsMastered >= r.count;
    case "correct_answers": return s.correctAnswers >= r.count;
    case "streak_days": return s.streak >= r.count;
    case "level": return s.level >= r.count;
    case "bosses_defeated": return s.bossesDefeated >= r.count;
    case "games_played": return s.gamesPlayed >= r.count;
    case "worlds_unlocked": return s.worldsUnlocked >= r.count;
    case "assessment_done": return s.assessmentDone;
    case "items_owned": return s.itemsOwned >= r.count;
  }
}

export function achievementProgress(a: AchievementDef, s: ChildStats): number {
  const r = a.requirement;
  if (r.kind === "assessment_done") return s.assessmentDone ? 1 : 0;
  const map: Record<string, number> = {
    lessons_completed: s.lessonsCompleted, topics_mastered: s.topicsMastered, correct_answers: s.correctAnswers,
    streak_days: s.streak, level: s.level, bosses_defeated: s.bossesDefeated, games_played: s.gamesPlayed,
    worlds_unlocked: s.worldsUnlocked, items_owned: s.itemsOwned,
  };
  return Math.min(1, (map[r.kind] ?? 0) / r.count);
}

const CHALLENGE_POOL: ChallengeData[] = [
  { kind: "lessons", target: 1, reward: { xp: 30, coins: 15 }, title: { en: "Finish 1 lesson", ru: "Пройди 1 урок", uz: "1 ta darsni tugating" } },
  { kind: "lessons", target: 2, reward: { xp: 50, coins: 25 }, title: { en: "Finish 2 lessons", ru: "Пройди 2 урока", uz: "2 ta darsni tugating" } },
  { kind: "correct", target: 10, reward: { xp: 30, coins: 15 }, title: { en: "Give 10 correct answers", ru: "Дай 10 правильных ответов", uz: "10 ta to‘g‘ri javob bering" } },
  { kind: "correct", target: 20, reward: { xp: 50, coins: 25 }, title: { en: "Give 20 correct answers", ru: "Дай 20 правильных ответов", uz: "20 ta to‘g‘ri javob bering" } },
  { kind: "games", target: 1, reward: { xp: 20, coins: 10 }, title: { en: "Play a learning game", ru: "Сыграй в обучающую игру", uz: "O‘quv o‘yinini o‘ynang" } },
  { kind: "review", target: 1, reward: { xp: 40, coins: 20 }, title: { en: "Review a topic you learned", ru: "Повтори изученную тему", uz: "O‘rganilgan mavzuni takrorlang" } },
];

/** Deterministic daily set of 3 challenges (same for everyone on a date; progress is per child). */
export function dailyChallengesFor(date: string): ChallengeData[] {
  const r = rng(hashString(date));
  const first = r.pick(CHALLENGE_POOL.filter((c) => c.kind === "lessons"));
  const second = r.pick(CHALLENGE_POOL.filter((c) => c.kind === "correct"));
  const third = r.pick(CHALLENGE_POOL.filter((c) => c.kind === "games" || c.kind === "review"));
  return [first, second, third];
}

export function weekStart(d = new Date()): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (x.getUTCDay() + 6) % 7; // Monday = 0
  x.setUTCDate(x.getUTCDate() - day);
  return x;
}
