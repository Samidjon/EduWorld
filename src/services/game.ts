import "server-only";
import type { Store } from "@/services/db/store";
import type { ChildProfileRow, GameProfileRow, ChallengeData } from "@/types/db";
import { ACHIEVEMENTS } from "@/data/achievements";
import { WORLDS } from "@/data/worlds";
import { getItem } from "@/data/items";
import { TOPICS } from "@/data/topics";
import { achievementMet, addXp, dailyChallengesFor, isoDate, newGameProfile, touchStreak, type ChildStats } from "@/features/progression/rules";
import { gradeLevel, isWorldUnlocked } from "@/features/adaptive-learning/engine";

export interface RewardEvent {
  xp: number;
  coins: number;
  levelUp?: number;
  achievements?: { id: string; icon: string; name: { en: string; ru: string } }[];
  challenges?: { title: ChallengeData["title"] }[];
  item?: string;
}

export async function getGameProfile(store: Store, childId: string): Promise<GameProfileRow> {
  const [gp] = await store.select("game_profiles", { child_id: childId });
  if (gp) return gp;
  return store.insert("game_profiles", newGameProfile(childId));
}

/** Grants XP/coins, touches the streak, and returns the new profile + levels gained. */
export async function grant(store: Store, childId: string, xp: number, coins: number) {
  const gp = touchStreak(await getGameProfile(store, childId));
  const { profile, levelsGained } = addXp(gp, xp);
  profile.coins = Math.max(0, profile.coins + coins);
  await store.update("game_profiles", { id: gp.id }, { level: profile.level, xp: profile.xp, total_xp: profile.total_xp, coins: profile.coins, streak: profile.streak, longest_streak: profile.longest_streak, last_active_date: profile.last_active_date });
  return { profile, levelsGained };
}

export async function giveItem(store: Store, childId: string, itemId: string) {
  if (!getItem(itemId)) return false;
  const [inv] = await store.select("inventory", { child_id: childId, item_id: itemId });
  if (inv) return false;
  await store.insert("inventory", { child_id: childId, item_id: itemId, quantity: 1, acquired_at: new Date().toISOString() });
  return true;
}

export async function childStats(store: Store, child: ChildProfileRow): Promise<ChildStats> {
  const [gp, lessons, progress, correct, bosses, games, items] = await Promise.all([
    getGameProfile(store, child.id),
    store.count("lesson_attempts", { child_id: child.id, kind: "lesson", completed: true }),
    store.select("learning_progress", { child_id: child.id }),
    store.count("question_attempts", { child_id: child.id, is_correct: true }),
    store.select("lesson_attempts", { child_id: child.id, kind: "boss", completed: true }),
    store.count("game_sessions", { child_id: child.id }),
    store.count("inventory", { child_id: child.id }),
  ]);
  const pmap = new Map(progress.map((p) => [p.topic_id, p]));
  const grade = gradeLevel(child.current_grade, child.custom_level, child.age_years);
  return {
    lessonsCompleted: lessons,
    topicsMastered: progress.filter((p) => p.status === "mastered").length,
    correctAnswers: correct,
    streak: gp.streak,
    level: gp.level,
    bossesDefeated: new Set(bosses.filter((b) => (b.score ?? 0) >= 0.7).map((b) => b.lesson_id)).size,
    gamesPlayed: games,
    worldsUnlocked: WORLDS.filter((w) => isWorldUnlocked(w, pmap, grade, !!child.assessment_completed_at)).length,
    assessmentDone: !!child.assessment_completed_at,
    itemsOwned: items,
  };
}

/** Unlocks every newly-earned achievement and pays its reward. */
export async function evaluateAchievements(store: Store, child: ChildProfileRow): Promise<RewardEvent["achievements"]> {
  const have = new Set((await store.select("child_achievements", { child_id: child.id })).map((a) => a.achievement_id));
  const unlocked: NonNullable<RewardEvent["achievements"]> = [];
  for (let pass = 0; pass < 3; pass++) {
    const stats = await childStats(store, child);
    let changed = false;
    for (const a of ACHIEVEMENTS) {
      if (have.has(a.id) || !achievementMet(a, stats)) continue;
      have.add(a.id);
      await store.insert("child_achievements", { child_id: child.id, achievement_id: a.id, unlocked_at: new Date().toISOString() });
      if (a.reward.xp || a.reward.coins) await grant(store, child.id, a.reward.xp, a.reward.coins);
      unlocked.push({ id: a.id, icon: a.icon, name: a.name });
      changed = true;
    }
    if (!changed) break; // level-based achievements may chain after rewards
  }
  return unlocked;
}

export async function ensureDailyChallenges(store: Store, date = isoDate()) {
  let rows = await store.select("daily_challenges", { date });
  if (!rows.length) {
    for (const c of dailyChallengesFor(date)) {
      try {
        await store.insert("daily_challenges", { date, title: c.title.en, challenge_data: c });
      } catch {
        /* created concurrently or not permitted (RLS: seeded by cron) */
      }
    }
    rows = await store.select("daily_challenges", { date });
  }
  return rows;
}

/** Advances today's challenges of the given kind and auto-claims completed ones. */
export async function progressChallenges(store: Store, childId: string, kind: ChallengeData["kind"], amount = 1) {
  const done: { title: ChallengeData["title"] }[] = [];
  const daily = await ensureDailyChallenges(store);
  for (const ch of daily) {
    if (ch.challenge_data.kind !== kind) continue;
    let [cc] = await store.select("child_challenges", { child_id: childId, challenge_id: ch.id });
    if (!cc) cc = await store.insert("child_challenges", { child_id: childId, challenge_id: ch.id, progress: 0, completed_at: null, claimed_at: null });
    if (cc.completed_at) continue;
    const progress = Math.min(ch.challenge_data.target, cc.progress + amount);
    const complete = progress >= ch.challenge_data.target;
    const now = new Date().toISOString();
    await store.update("child_challenges", { id: cc.id }, { progress, completed_at: complete ? now : null, claimed_at: complete ? now : null });
    if (complete) {
      await grant(store, childId, ch.challenge_data.reward.xp, ch.challenge_data.reward.coins);
      done.push({ title: ch.challenge_data.title });
    }
  }
  return done;
}

export async function worldsUnlockedFor(store: Store, child: ChildProfileRow) {
  const progress = await store.select("learning_progress", { child_id: child.id });
  const pmap = new Map(progress.map((p) => [p.topic_id, p]));
  const grade = gradeLevel(child.current_grade, child.custom_level, child.age_years);
  return { pmap, grade, unlocked: new Set(WORLDS.filter((w) => isWorldUnlocked(w, pmap, grade, !!child.assessment_completed_at)).map((w) => w.slug)), topicsCount: TOPICS.length };
}
