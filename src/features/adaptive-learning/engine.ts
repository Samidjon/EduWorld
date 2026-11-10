import type { GradeCode, LearningProgressRow, ProgressStatus } from "@/types/db";
import type { GradeLevel, Topic, WorldDef } from "@/types/content";

/**
 * Adaptive Learning Engine (pure functions, unit-tested in tests/unit/adaptive.test.ts).
 *
 * - Mastery is an exponentially-smoothed estimate in [0,1]; one mistake never flips a topic
 *   to "needs review" - that requires several attempts and a weak recent window.
 * - Topics are recommended only when their prerequisites are understood (skill graph).
 * - Mastered topics come back for spaced review (1, 3, 7, 14, 30 days).
 */

export const PRIOR_MASTERY = 0.3;
export const UNDERSTOOD = 0.7;
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30];
const RECENT_WINDOW = 10;
const DAY = 86_400_000;

export function gradeLevel(grade: GradeCode, customLevel?: number | null, age?: number): GradeLevel {
  if (grade === "none") return -1;
  if (grade === "prep") return 0;
  if (grade === "custom") return customLevel ?? Math.max(-1, Math.min(11, (age ?? 7) - 7));
  return Number(grade);
}

export function emptyProgress(childId: string, topicId: string): LearningProgressRow {
  return {
    id: "",
    child_id: childId,
    topic_id: topicId,
    mastery_level: PRIOR_MASTERY,
    attempts_count: 0,
    correct_count: 0,
    recent_results: "",
    status: "new",
    review_stage: 0,
    placed_by_assessment: false,
    last_practiced_at: null,
    next_review_at: null,
  };
}

function recentAccuracy(recent: string, n = 5): number | null {
  const window = recent.slice(-n);
  if (window.length < Math.min(n, 3)) return null;
  return [...window].filter((c) => c === "1").length / window.length;
}

/** Apply one answer to a topic's progress. */
export function applyAnswer(p: LearningProgressRow, correct: boolean, opts: { hintUsed?: boolean; now?: Date } = {}): LearningProgressRow {
  const now = opts.now ?? new Date();
  const attempts = p.attempts_count + 1;
  // learning rate: larger early, never below 0.12; hint-assisted correct answers count a bit less
  const alpha = Math.max(0.12, 1 / (attempts + 1));
  const target = correct ? (opts.hintUsed ? 0.75 : 1) : 0;
  const mastery = clamp(p.mastery_level + alpha * (target - p.mastery_level));
  const recent = (p.recent_results + (correct ? "1" : "0")).slice(-RECENT_WINDOW);
  const next: LearningProgressRow = {
    ...p,
    attempts_count: attempts,
    correct_count: p.correct_count + (correct ? 1 : 0),
    mastery_level: round3(mastery),
    recent_results: recent,
    last_practiced_at: now.toISOString(),
  };
  next.status = deriveStatus(next);
  if (p.status === "mastered" && next.status === "needs_review") {
    next.review_stage = 0;
    next.next_review_at = now.toISOString();
  }
  return next;
}

export function deriveStatus(p: LearningProgressRow): ProgressStatus {
  const acc5 = recentAccuracy(p.recent_results, 5);
  if (p.attempts_count === 0) return p.status === "mastered" ? "mastered" : "new";
  if (p.mastery_level >= 0.8 && p.attempts_count >= 5 && (acc5 ?? 0) >= 0.8) return "mastered";
  if (p.status === "mastered" && p.mastery_level >= 0.6) return "mastered";
  // Never after a single mistake: need at least 4 attempts and a weak recent window.
  if (p.attempts_count >= 4 && p.mastery_level < 0.45 && acc5 !== null && acc5 < 0.5) return "needs_review";
  return "learning";
}

/** Called when a lesson's understanding check is finished. */
export function applyLessonResult(p: LearningProgressRow, score: number, masteryScore: number, now = new Date()): LearningProgressRow {
  const next = { ...p, last_practiced_at: now.toISOString() };
  if (score >= masteryScore) {
    next.mastery_level = round3(Math.max(p.mastery_level, 0.85));
    if (p.status !== "mastered") next.review_stage = 0;
    next.status = "mastered";
    next.next_review_at = new Date(now.getTime() + REVIEW_INTERVAL_DAYS[next.review_stage] * DAY).toISOString();
  } else if (p.status !== "mastered") {
    next.status = deriveStatus(next) === "needs_review" ? "needs_review" : "learning";
  }
  return next;
}

/** Called when a spaced review session finishes. */
export function applyReviewResult(p: LearningProgressRow, score: number, now = new Date()): LearningProgressRow {
  const next = { ...p, last_practiced_at: now.toISOString() };
  if (score >= 0.8) {
    next.review_stage = Math.min(REVIEW_INTERVAL_DAYS.length - 1, p.review_stage + 1);
    next.status = "mastered";
  } else {
    next.review_stage = 0;
    next.status = score >= 0.5 ? "mastered" : "needs_review";
  }
  next.next_review_at = new Date(now.getTime() + REVIEW_INTERVAL_DAYS[next.review_stage] * DAY).toISOString();
  return next;
}

export function isUnderstood(p: LearningProgressRow | undefined): boolean {
  if (!p) return false;
  return p.status === "mastered" || p.mastery_level >= UNDERSTOOD;
}

export function prerequisitesMet(topic: Topic, progress: Map<string, LearningProgressRow>): boolean {
  return topic.prerequisites.every((pre) => isUnderstood(progress.get(pre)));
}

export function missingPrerequisites(topic: Topic, progress: Map<string, LearningProgressRow>, topics: Map<string, Topic>): Topic[] {
  return topic.prerequisites.filter((pre) => !isUnderstood(progress.get(pre))).map((id) => topics.get(id)).filter((t): t is Topic => !!t);
}

export type RecommendationReason = "review_due" | "needs_review" | "foundation" | "next_step" | "stretch";
export interface Recommendation { topicId: string; reason: RecommendationReason; priority: number }

/**
 * Builds the personal learning queue.
 * Priority: due spaced reviews > topics that need review (via their weak prerequisites first) >
 * next topics at the child's grade > stretch topics one grade above.
 */
export function recommend(opts: {
  topics: Topic[];
  progress: LearningProgressRow[];
  grade: GradeLevel;
  preferredSubjects?: string[];
  allowedSubjects?: string[];
  now?: Date;
  limit?: number;
}): Recommendation[] {
  const now = opts.now ?? new Date();
  const pmap = new Map(opts.progress.map((p) => [p.topic_id, p]));
  const tmap = new Map(opts.topics.map((t) => [t.id, t]));
  const allowed = (t: Topic) => !opts.allowedSubjects?.length || opts.allowedSubjects.includes(t.subject);
  const pref = (t: Topic) => (opts.preferredSubjects?.includes(t.subject) ? 5 : 0);
  const out = new Map<string, Recommendation>();
  const add = (topicId: string, reason: RecommendationReason, priority: number) => {
    const ex = out.get(topicId);
    if (!ex || ex.priority < priority) out.set(topicId, { topicId, reason, priority });
  };

  for (const t of opts.topics) {
    if (!allowed(t)) continue;
    const p = pmap.get(t.id);
    if (p?.status === "mastered" && p.next_review_at && new Date(p.next_review_at) <= now) add(t.id, "review_due", 90 + pref(t));
    if (p?.status === "needs_review") {
      // go back to basics first: weak prerequisites get higher priority
      const weak = missingPrerequisites(t, pmap, tmap);
      for (const w of weak) add(w.id, "foundation", 85 + pref(w));
      if (!weak.length) add(t.id, "needs_review", 80 + pref(t));
    }
  }

  for (const t of opts.topics) {
    if (!allowed(t)) continue;
    const p = pmap.get(t.id);
    if (p?.status === "mastered" || p?.status === "needs_review") continue;
    if (!prerequisitesMet(t, pmap)) continue;
    const [lo, hi] = t.grades;
    const g = opts.grade;
    let priority: number | null = null;
    let reason: RecommendationReason = "next_step";
    if (g >= lo && g <= hi) priority = 60;
    else if (hi < g) priority = 55; // a gap below the child's grade - fill it
    else if (lo === g + 1) { priority = 30; reason = "stretch"; }
    if (priority === null) continue;
    if (p?.status === "learning") priority += 8; // continue what was started
    add(t.id, hi < g ? "foundation" : reason, priority + pref(t) - Math.max(0, lo - g));
  }

  return [...out.values()].sort((a, b) => b.priority - a.priority).slice(0, opts.limit ?? 8);
}

/** Topological order of topics inside a subject - used by the roadmap and skill tree. */
export function topoOrder(topics: Topic[]): Topic[] {
  const ids = new Set(topics.map((t) => t.id));
  const visited = new Set<string>();
  const out: Topic[] = [];
  const byId = new Map(topics.map((t) => [t.id, t]));
  const visit = (t: Topic) => {
    if (visited.has(t.id)) return;
    visited.add(t.id);
    for (const pre of t.prerequisites) {
      const pt = byId.get(pre);
      if (pt && ids.has(pre)) visit(pt);
    }
    out.push(t);
  };
  [...topics].sort((a, b) => a.grades[0] - b.grades[0]).forEach(visit);
  return out;
}

export function isWorldUnlocked(world: WorldDef, progress: Map<string, LearningProgressRow>, grade: GradeLevel, assessmentDone: boolean): boolean {
  if (!world.unlockTopics.length) return true;
  if (world.unlockTopics.every((id) => isUnderstood(progress.get(id)))) return true;
  return assessmentDone && world.unlockGrade !== undefined && grade >= world.unlockGrade;
}

/** Target difficulty (1-5) for generated practice given current mastery. */
export function targetDifficulty(mastery: number): 1 | 2 | 3 | 4 | 5 {
  if (mastery < 0.3) return 1;
  if (mastery < 0.5) return 2;
  if (mastery < 0.7) return 3;
  if (mastery < 0.85) return 4;
  return 5;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const round3 = (v: number) => Math.round(v * 1000) / 1000;
