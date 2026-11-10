/**
 * Content management layer: the single entry point the app uses to read learning content.
 * Content is versioned in git and mirrored into Postgres by `npm run seed:sql`
 * (supabase/seed.sql). Only lessons with status "reviewed" or "published" are served to children.
 */
import type { Lesson, Question, Topic } from "@/types/content";
import { TOPICS, TOPIC_MAP } from "./topics";
import { LESSONS as EARLY } from "./lessons/early";
import { LESSONS as MATH } from "./lessons/math";
import { LESSONS as READING } from "./lessons/reading";
import { LESSONS as SCIENCE } from "./lessons/science";
import { LESSONS as LANGUAGES } from "./lessons/languages";
import { LESSONS as TECH } from "./lessons/tech";
import { GENERATORS, generateQuestion, parseGeneratedId } from "@/features/learning/generators";

const SERVABLE = new Set(["reviewed", "published"]);

export const ALL_LESSONS: Lesson[] = [...EARLY, ...MATH, ...READING, ...SCIENCE, ...LANGUAGES, ...TECH].filter((l) => SERVABLE.has(l.status));

const LESSON_MAP = new Map(ALL_LESSONS.map((l) => [l.id, l]));
const QUESTION_MAP = new Map<string, { q: Question; lesson: Lesson }>();
for (const l of ALL_LESSONS) for (const q of [...l.practice, ...l.check]) QUESTION_MAP.set(q.id, { q, lesson: l });

export const getLesson = (id: string) => LESSON_MAP.get(id);
export const lessonsForTopic = (topicId: string) => ALL_LESSONS.filter((l) => l.topicId === topicId);
export const lessonsForWorld = (world: string) => ALL_LESSONS.filter((l) => TOPIC_MAP.get(l.topicId)?.world === world);
export const topicsForWorld = (world: string): Topic[] => TOPICS.filter((t) => t.world === world);

/** Resolve any question id (authored or generated) and the topic it belongs to. */
export function resolveQuestion(id: string): { q: Question; topicId: string } | null {
  const authored = QUESTION_MAP.get(id);
  if (authored) return { q: authored.q, topicId: authored.lesson.topicId };
  const gen = parseGeneratedId(id);
  if (gen) {
    const q = generateQuestion(gen.generator, gen.seed);
    if (!q) return null;
    return { q, topicId: GENERATORS[gen.generator].topicId };
  }
  return null;
}

/** Question pool for a topic (check + practice questions of its lessons). */
export function questionPool(topicId: string): Question[] {
  return lessonsForTopic(topicId).flatMap((l) => [...l.check, ...l.practice]);
}

export { TOPICS, TOPIC_MAP };
