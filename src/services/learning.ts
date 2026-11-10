import "server-only";
import type { Store } from "@/services/db/store";
import type { Answer, Locale, Question } from "@/types/content";
import type { ChildProfileRow, LearningProgressRow, LessonAttemptRow } from "@/types/db";
import { getLesson, questionPool, resolveQuestion, TOPIC_MAP } from "@/data/content";
import { getBoss } from "@/data/worlds";
import { checkAnswer } from "@/features/learning/check";
import { applyAnswer, applyLessonResult, applyReviewResult, emptyProgress, isUnderstood } from "@/features/adaptive-learning/engine";
import { lessonReward } from "@/features/progression/rules";
import { evaluateAchievements, giveItem, grant, progressChallenges, type RewardEvent } from "@/services/game";
import { HttpError } from "@/services/context";
import { rng } from "@/lib/rng";
import { GENERATORS, generateQuestion } from "@/features/learning/generators";

export async function getProgress(store: Store, childId: string, topicId: string): Promise<LearningProgressRow> {
  const [p] = await store.select("learning_progress", { child_id: childId, topic_id: topicId });
  return p ?? emptyProgress(childId, topicId);
}

export async function saveProgress(store: Store, p: LearningProgressRow) {
  const { id, ...rest } = p;
  if (id) await store.update("learning_progress", { id }, rest);
  else await store.insert("learning_progress", rest);
}

/** Keep only what is needed for mistake analysis; never free-form text longer than 200 chars. */
function minimalAnswer(a: Answer): unknown {
  const s = JSON.stringify(a);
  return s.length > 600 ? { type: a.type, truncated: true } : a;
}

async function ownedAttempt(store: Store, childId: string, attemptId: string): Promise<LessonAttemptRow> {
  const [att] = await store.select("lesson_attempts", { id: attemptId, child_id: childId });
  if (!att) throw new HttpError(404, "attempt_not_found");
  return att;
}

export async function startAttempt(store: Store, child: ChildProfileRow, kind: LessonAttemptRow["kind"], lessonId: string, topicId: string) {
  return store.insert("lesson_attempts", { child_id: child.id, lesson_id: lessonId, topic_id: topicId, kind, score: null, completed: false, xp_awarded: 0, coins_awarded: 0, started_at: new Date().toISOString(), completed_at: null });
}

/** Authoritative answer check + adaptive progress update. */
export async function recordAnswer(store: Store, child: ChildProfileRow, input: { questionId: string; answer: Answer; attemptId?: string; hintUsed?: boolean; scored?: boolean }) {
  const resolved = resolveQuestion(input.questionId);
  if (!resolved) throw new HttpError(404, "question_not_found");
  const { q, topicId } = resolved;
  if (input.attemptId) {
    const att = await ownedAttempt(store, child.id, input.attemptId);
    if (att.completed) throw new HttpError(409, "attempt_completed");
  }
  const locale = child.interface_language as Locale;
  const correct = checkAnswer(q, input.answer, locale);
  await store.insert("question_attempts", {
    child_id: child.id,
    question_id: q.id,
    topic_id: topicId,
    lesson_attempt_id: input.attemptId ?? null,
    answer_data: minimalAnswer(input.answer),
    is_correct: correct,
    hint_used: !!input.hintUsed,
    created_at: new Date().toISOString(),
  });
  const p = await getProgress(store, child.id, topicId);
  await saveProgress(store, applyAnswer(p, correct, { hintUsed: input.hintUsed }));
  if (correct) await progressChallenges(store, child.id, "correct", 1);
  return { correct, explanation: q.explanation, hint: q.hint ?? null };
}

/** First-try correctness of the given questions inside an attempt. */
async function firstTryScore(store: Store, attemptId: string, questionIds: string[]) {
  const rows = await store.select("question_attempts", { lesson_attempt_id: attemptId }, { orderBy: "created_at" });
  if (!questionIds.length) return 0;
  let correct = 0;
  for (const id of questionIds) {
    const first = rows.find((r) => r.question_id === id);
    if (first?.is_correct) correct++;
  }
  return correct / questionIds.length;
}

export async function finishLesson(store: Store, child: ChildProfileRow, attemptId: string): Promise<{ score: number; mastered: boolean; reward: RewardEvent }> {
  const att = await ownedAttempt(store, child.id, attemptId);
  if (att.completed) throw new HttpError(409, "attempt_completed");
  const lesson = getLesson(att.lesson_id);
  if (!lesson || att.kind !== "lesson") throw new HttpError(400, "not_a_lesson");
  const score = await firstTryScore(store, attemptId, lesson.check.map((q) => q.id));
  const before = await getProgress(store, child.id, lesson.topicId);
  const after = applyLessonResult(before, score, lesson.masteryScore);
  await saveProgress(store, after);
  const firstMastery = before.status !== "mastered" && after.status === "mastered";
  const repeat = (await store.count("lesson_attempts", { child_id: child.id, lesson_id: lesson.id, completed: true })) > 0;
  const r = lessonReward(lesson.difficulty, score, firstMastery, repeat);
  await store.update("lesson_attempts", { id: attemptId }, { completed: true, score, completed_at: new Date().toISOString(), xp_awarded: r.xp, coins_awarded: r.coins });
  const { levelsGained } = await grant(store, child.id, r.xp, r.coins);
  const challenges = [...(await progressChallenges(store, child.id, "lessons", 1))];
  const achievements = await evaluateAchievements(store, child);
  return { score, mastered: after.status === "mastered", reward: { xp: r.xp, coins: r.coins, levelUp: levelsGained, achievements, challenges } };
}

/* ---------------- Boss challenges ---------------- */

export async function bossUnlocked(store: Store, childId: string, bossId: string) {
  const boss = getBoss(bossId);
  if (!boss) return { boss: null, unlocked: false };
  const progress = await store.select("learning_progress", { child_id: childId });
  const pmap = new Map(progress.map((p) => [p.topic_id, p]));
  return { boss, unlocked: boss.topics.every((t) => isUnderstood(pmap.get(t))) };
}

/** Picks a mixed question set across all boss topics (deterministic per attempt). */
export function bossQuestions(bossId: string, attemptId: string): Question[] {
  const boss = getBoss(bossId);
  if (!boss) return [];
  const r = rng(hashId(attemptId));
  const perTopic = Math.ceil(boss.questionCount / boss.topics.length);
  const out: Question[] = [];
  for (const t of boss.topics) {
    const pool = r.shuffle(questionPool(t).filter((q) => q.type !== "drawing"));
    out.push(...pool.slice(0, perTopic));
  }
  return r.shuffle(out).slice(0, boss.questionCount);
}

export async function finishBoss(store: Store, child: ChildProfileRow, attemptId: string) {
  const att = await ownedAttempt(store, child.id, attemptId);
  if (att.completed || att.kind !== "boss") throw new HttpError(409, "invalid_attempt");
  const boss = getBoss(att.lesson_id);
  if (!boss) throw new HttpError(404, "boss_not_found");
  const score = await firstTryScore(store, attemptId, bossQuestions(boss.id, attemptId).map((q) => q.id));
  const won = score >= boss.passScore;
  const already = (await store.select("lesson_attempts", { child_id: child.id, lesson_id: boss.id, kind: "boss", completed: true })).some((a) => (a.score ?? 0) >= boss.passScore);
  const xp = won ? (already ? Math.round(boss.reward.xp * 0.3) : boss.reward.xp) : 25;
  const coins = won ? (already ? Math.round(boss.reward.coins * 0.3) : boss.reward.coins) : 5;
  await store.update("lesson_attempts", { id: attemptId }, { completed: true, score, completed_at: new Date().toISOString(), xp_awarded: xp, coins_awarded: coins });
  const { levelsGained } = await grant(store, child.id, xp, coins);
  let item: string | undefined;
  if (won && boss.reward.itemId && (await giveItem(store, child.id, boss.reward.itemId))) item = boss.reward.itemId;
  const achievements = await evaluateAchievements(store, child);
  return { score, won, reward: { xp, coins, levelUp: levelsGained, achievements, item } satisfies RewardEvent };
}

/* ---------------- Spaced review ---------------- */

export function reviewQuestions(topicId: string, attemptId: string): Question[] {
  const r = rng(hashId(attemptId));
  const pool: Question[] = r.shuffle(questionPool(topicId).filter((q) => q.type !== "drawing")).slice(0, 4);
  // add one fresh generated variant when a generator exists for the topic
  const gen = Object.entries(GENERATORS).find(([, g]) => g.topicId === topicId);
  if (gen) {
    const q = generateQuestion(gen[0], r.int(1, 1_000_000));
    if (q) pool.push(q);
  }
  return pool;
}

export async function finishReview(store: Store, child: ChildProfileRow, attemptId: string) {
  const att = await ownedAttempt(store, child.id, attemptId);
  if (att.completed || att.kind !== "review") throw new HttpError(409, "invalid_attempt");
  const ids = reviewQuestions(att.topic_id, attemptId).map((q) => q.id);
  const score = await firstTryScore(store, attemptId, ids);
  const p = await getProgress(store, child.id, att.topic_id);
  await saveProgress(store, applyReviewResult(p, score));
  const xp = Math.round(20 + 20 * score), coins = Math.round(5 + 10 * score);
  await store.update("lesson_attempts", { id: attemptId }, { completed: true, score, completed_at: new Date().toISOString(), xp_awarded: xp, coins_awarded: coins });
  const { levelsGained } = await grant(store, child.id, xp, coins);
  const challenges = await progressChallenges(store, child.id, "review", 1);
  const achievements = await evaluateAchievements(store, child);
  return { score, reward: { xp, coins, levelUp: levelsGained, achievements, challenges } satisfies RewardEvent };
}

export function topicExists(id: string) {
  return TOPIC_MAP.has(id);
}

export { generateQuestion };

function hashId(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
