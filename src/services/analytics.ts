import type { Store } from "@/services/db/store";
import type { ChildProfileRow, DailyActivityRow, GameProfileRow, LearningProgressRow, LessonAttemptRow, ParentSettings, QuestionAttemptRow } from "@/types/db";
import type { SubjectSlug, Topic } from "@/types/content";
import { TOPICS } from "@/data/topics";
import { gradeLevel, recommend, type Recommendation } from "@/features/adaptive-learning/engine";

/**
 * Parent analytics.
 *
 * Server-side use only (the loaders take the request-scoped Store, which itself is "server-only").
 * This module intentionally does not `import "server-only"` so that the pure aggregation
 * functions below can be unit-tested with vitest in a plain node environment.
 *
 * All dates are handled in UTC, matching how the app records `daily_activity.date` (YYYY-MM-DD)
 * and ISO timestamps.
 */

const DAY_MS = 86_400_000;

/* ------------------------------------------------------------------ */
/* Pure aggregation functions                                          */
/* ------------------------------------------------------------------ */

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** UTC midnight of the given date. */
export function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** UTC Monday 00:00 of the week containing `d`. */
export function startOfUtcWeek(d: Date): Date {
  const day = startOfUtcDay(d);
  const offset = (day.getUTCDay() + 6) % 7; // Monday = 0
  return new Date(day.getTime() - offset * DAY_MS);
}

/** Lesson attempts that count as a "completed lesson" for parents (diagnostic excluded). */
export function completedLessons(attempts: LessonAttemptRow[]): LessonAttemptRow[] {
  return attempts.filter((a) => a.completed && a.kind !== "assessment");
}

const lessonTime = (a: LessonAttemptRow) => a.completed_at ?? a.started_at;

export interface SubjectPerformance { subject: SubjectSlug; total: number; correct: number; accuracy: number }

/** Accuracy per subject from question attempts, joined to the topic's subject. Subjects without answers are omitted. */
export function subjectPerformance(attempts: Pick<QuestionAttemptRow, "topic_id" | "is_correct">[], topics: Topic[] = TOPICS): SubjectPerformance[] {
  const subjectOf = new Map(topics.map((t) => [t.id, t.subject]));
  const acc = new Map<SubjectSlug, { total: number; correct: number }>();
  for (const a of attempts) {
    const subject = subjectOf.get(a.topic_id) ?? (a.topic_id.split(".")[0] as SubjectSlug);
    if (!subject) continue;
    const s = acc.get(subject) ?? { total: 0, correct: 0 };
    s.total++;
    if (a.is_correct) s.correct++;
    acc.set(subject, s);
  }
  return [...acc.entries()]
    .map(([subject, s]) => ({ subject, total: s.total, correct: s.correct, accuracy: s.total ? s.correct / s.total : 0 }))
    .sort((a, b) => b.total - a.total);
}

export function masteredTopics(progress: LearningProgressRow[]): LearningProgressRow[] {
  return progress.filter((p) => p.status === "mastered").sort((a, b) => (b.last_practiced_at ?? "").localeCompare(a.last_practiced_at ?? ""));
}

export const LOW_MASTERY = 0.5;
export const MIN_ATTEMPTS_FOR_REVIEW = 4;

/** Topics marked "needs_review", or with low mastery after at least 4 attempts. */
export function topicsNeedingReview(progress: LearningProgressRow[]): LearningProgressRow[] {
  return progress
    .filter((p) => p.status !== "mastered" && (p.status === "needs_review" || (p.attempts_count >= MIN_ATTEMPTS_FOR_REVIEW && p.mastery_level < LOW_MASTERY)))
    .sort((a, b) => a.mastery_level - b.mastery_level);
}

export interface DayActivity { date: string; minutes: number; lessons: number }

/** One entry per day for the last `days` days (oldest first, today last). */
export function dailyActivitySeries(days: number, activity: Pick<DailyActivityRow, "date" | "minutes">[], lessons: LessonAttemptRow[], now = new Date()): DayActivity[] {
  const today = startOfUtcDay(now);
  const out: DayActivity[] = [];
  const idx = new Map<string, DayActivity>();
  for (let i = days - 1; i >= 0; i--) {
    const e = { date: isoDay(new Date(today.getTime() - i * DAY_MS)), minutes: 0, lessons: 0 };
    out.push(e);
    idx.set(e.date, e);
  }
  for (const a of activity) {
    const e = idx.get(a.date.slice(0, 10));
    if (e) e.minutes += Math.max(0, a.minutes);
  }
  for (const l of completedLessons(lessons)) {
    const e = idx.get(lessonTime(l).slice(0, 10));
    if (e) e.lessons++;
  }
  return out;
}

export interface WeekLessons { weekStart: string; lessons: number }

/** Completed lessons per (Monday-based, UTC) week for the last `weeks` weeks, oldest first. */
export function weeklyLessonSeries(weeks: number, lessons: LessonAttemptRow[], now = new Date()): WeekLessons[] {
  const thisWeek = startOfUtcWeek(now);
  const out: WeekLessons[] = [];
  const idx = new Map<string, WeekLessons>();
  for (let i = weeks - 1; i >= 0; i--) {
    const e = { weekStart: isoDay(new Date(thisWeek.getTime() - i * 7 * DAY_MS)), lessons: 0 };
    out.push(e);
    idx.set(e.weekStart, e);
  }
  for (const l of completedLessons(lessons)) {
    const e = idx.get(isoDay(startOfUtcWeek(new Date(lessonTime(l)))));
    if (e) e.lessons++;
  }
  return out;
}

/** Completed lessons within the last `days` days (rolling window). */
export function lessonsInLastDays(lessons: LessonAttemptRow[], days: number, now = new Date()): number {
  const since = now.getTime() - days * DAY_MS;
  return completedLessons(lessons).filter((l) => new Date(lessonTime(l)).getTime() >= since).length;
}

/** Most recent activity timestamp (ISO) among game profile, lessons and daily activity. */
export function lastActivity(gp: Pick<GameProfileRow, "last_active_date"> | null, lessons: LessonAttemptRow[], activity: Pick<DailyActivityRow, "date" | "minutes">[]): string | null {
  const candidates = [
    gp?.last_active_date ?? null,
    ...lessons.map((l) => lessonTime(l)),
    ...activity.filter((a) => a.minutes > 0).map((a) => a.date),
  ].filter((x): x is string => !!x);
  if (!candidates.length) return null;
  // ISO strings sort chronologically; a bare date sorts before timestamps of the same day
  return candidates.reduce((max, c) => (c > max ? c : max));
}

export const hasAnyActivity = (series: DayActivity[]) => series.some((d) => d.minutes > 0 || d.lessons > 0);

/* ------------------------------------------------------------------ */
/* Loaders (server only)                                               */
/* ------------------------------------------------------------------ */

export interface ChildOverview {
  child: ChildProfileRow;
  game: GameProfileRow | null;
  masteredCount: number;
  lessonsThisWeek: number;
  lastActivity: string | null;
  recommendations: Recommendation[];
}

/** Summary card data for the parent overview. */
export async function loadChildOverview(store: Store, child: ChildProfileRow, settings: Pick<ParentSettings, "allowedSubjects">, now = new Date()): Promise<ChildOverview> {
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const [[game], progress, weekLessons, [latestLesson], recentActivity] = await Promise.all([
    store.select("game_profiles", { child_id: child.id }),
    store.select("learning_progress", { child_id: child.id }),
    store.select("lesson_attempts", { child_id: child.id }, { gte: ["started_at", weekAgo.toISOString()] }),
    store.select("lesson_attempts", { child_id: child.id }, { orderBy: "started_at", desc: true, limit: 1 }),
    store.select("daily_activity", { child_id: child.id }, { orderBy: "date", desc: true, limit: 1 }),
  ]);
  const recommendations = child.assessment_completed_at
    ? recommend({
        topics: TOPICS,
        progress,
        grade: gradeLevel(child.current_grade, child.custom_level, child.age_years),
        preferredSubjects: child.preferred_subjects,
        allowedSubjects: settings.allowedSubjects,
        now,
        limit: 3,
      })
    : [];
  return {
    child,
    game: game ?? null,
    masteredCount: progress.filter((p) => p.status === "mastered").length,
    lessonsThisWeek: lessonsInLastDays(weekLessons, 7, now),
    lastActivity: lastActivity(game ?? null, latestLesson ? [latestLesson] : [], recentActivity),
    recommendations,
  };
}

export interface ChildAnalytics {
  subjects: SubjectPerformance[];
  mastered: LearningProgressRow[];
  review: LearningProgressRow[];
  week: DayActivity[];
  month: DayActivity[];
  dynamics: WeekLessons[];
}

/** Full analytics for one child. */
export async function loadChildAnalytics(store: Store, childId: string, now = new Date()): Promise<ChildAnalytics> {
  const monthStart = isoDay(new Date(startOfUtcDay(now).getTime() - 29 * DAY_MS));
  const eightWeeksStart = new Date(startOfUtcWeek(now).getTime() - 7 * 7 * DAY_MS).toISOString();
  const [questions, progress, activity, lessons] = await Promise.all([
    store.select("question_attempts", { child_id: childId }, { orderBy: "created_at", desc: true, limit: 10_000 }),
    store.select("learning_progress", { child_id: childId }),
    store.select("daily_activity", { child_id: childId }, { gte: ["date", monthStart] }),
    store.select("lesson_attempts", { child_id: childId }, { gte: ["started_at", eightWeeksStart] }),
  ]);
  return {
    subjects: subjectPerformance(questions),
    mastered: masteredTopics(progress),
    review: topicsNeedingReview(progress),
    week: dailyActivitySeries(7, activity, lessons, now),
    month: dailyActivitySeries(30, activity, lessons, now),
    dynamics: weeklyLessonSeries(8, lessons, now),
  };
}
