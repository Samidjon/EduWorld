import "server-only";
import type { Store } from "@/services/db/store";
import type { ChildProfileRow, LearningProgressRow, ParentSettings } from "@/types/db";
import { TOPICS, lessonsForTopic, TOPIC_MAP } from "@/data/content";
import { WORLDS } from "@/data/worlds";
import { gradeLevel, isUnderstood, isWorldUnlocked, recommend } from "@/features/adaptive-learning/engine";
import { ensureDailyChallenges, getGameProfile } from "@/services/game";
import { weekStart } from "@/features/progression/rules";
import { currentAge } from "@/services/children";

/** Read models for the child area pages. */
export async function childOverview(store: Store, child: ChildProfileRow, settings: ParentSettings) {
  const [gp, progress] = await Promise.all([getGameProfile(store, child.id), store.select("learning_progress", { child_id: child.id })]);
  const pmap = new Map(progress.map((p) => [p.topic_id, p]));
  const age = currentAge(child);
  const grade = gradeLevel(child.current_grade, child.custom_level, age);
  const assessed = !!child.assessment_completed_at;
  const worlds = WORLDS.map((w) => {
    const topics = TOPICS.filter((t) => t.world === w.slug);
    const mastered = topics.filter((t) => pmap.get(t.id)?.status === "mastered").length;
    return { world: w, unlocked: isWorldUnlocked(w, pmap, grade, assessed), mastered, total: topics.length };
  });
  const recs = recommend({ topics: TOPICS, progress, grade, preferredSubjects: child.preferred_subjects, allowedSubjects: settings.allowedSubjects, limit: 6 })
    .map((r) => ({ ...r, topic: TOPIC_MAP.get(r.topicId)!, lesson: lessonsForTopic(r.topicId)[0] ?? null, progress: pmap.get(r.topicId) ?? null }))
    .filter((r) => r.lesson && worlds.find((w) => w.world.slug === r.topic.world)?.unlocked);
  return { gp, progress, pmap, grade, age, worlds, recs };
}

export async function challengesFor(store: Store, childId: string, settings: ParentSettings) {
  const daily = await ensureDailyChallenges(store);
  const mine = await store.select("child_challenges", { child_id: childId });
  const items = daily.map((d) => {
    const c = mine.find((m) => m.challenge_id === d.id);
    return { id: d.id, data: d.challenge_data, progress: c?.progress ?? 0, done: !!c?.completed_at };
  });
  const ws = weekStart().toISOString();
  const weekLessons = await store.count("lesson_attempts", { child_id: childId, kind: "lesson", completed: true }, { gte: ["completed_at", ws] });
  return { daily: items, weekly: { done: weekLessons, goal: settings.weeklyGoalLessons } };
}

export function topicStatus(p: LearningProgressRow | undefined | null) {
  if (!p) return "new" as const;
  if (p.status === "mastered") return "mastered" as const;
  if (p.status === "needs_review") return "needs_review" as const;
  if (p.placed_by_assessment && isUnderstood(p)) return "placed" as const;
  return p.attempts_count > 0 ? ("learning" as const) : ("new" as const);
}

/** Level for embedded mini-games from grade + mastery. */
export function gameLevelFor(grade: number, mastery: number): 1 | 2 | 3 {
  if (grade <= 0) return mastery > 0.7 ? 2 : 1;
  if (grade <= 2) return mastery > 0.7 ? 3 : 2;
  return 3;
}
