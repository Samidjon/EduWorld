import "server-only";
import type { z } from "zod";
import type { Store } from "@/services/db/store";
import type { AgeGroup, ChildProfileRow } from "@/types/db";
import type { childSchema } from "@/lib/validation";
import { getCurriculum } from "@/data/curricula";
import { newGameProfile } from "@/features/progression/rules";
import { HttpError } from "@/services/context";

export const ageGroupOf = (age: number): AgeGroup => (age <= 5 ? "4-5" : age <= 7 ? "6-7" : age <= 10 ? "8-10" : age <= 13 ? "11-13" : "14-17");

/** Current age estimate without storing a birth date. */
export const currentAge = (c: Pick<ChildProfileRow, "age_years" | "age_recorded_year">) => c.age_years + (new Date().getFullYear() - c.age_recorded_year);

export const MAX_CHILDREN = 6;

export async function createChild(store: Store, parentId: string, input: z.infer<typeof childSchema>) {
  const existing = await store.count("child_profiles", { parent_id: parentId });
  if (existing >= MAX_CHILDREN) throw new HttpError(400, "too_many_children");
  const cur = getCurriculum(input.curriculumId);
  if (!cur || cur.status === "archived") throw new HttpError(400, "unknown_curriculum");
  if (cur.countryCode !== "INTL" && cur.countryCode !== input.country) throw new HttpError(400, "curriculum_country_mismatch");
  const child = await store.insert("child_profiles", {
    parent_id: parentId,
    nickname: input.nickname,
    age_years: input.age,
    age_recorded_year: new Date().getFullYear(),
    age_group: ageGroupOf(input.age),
    current_grade: input.grade,
    custom_level: input.grade === "custom" ? input.customLevel ?? null : null,
    country_code: input.country,
    curriculum_id: input.curriculumId,
    interface_language: input.language,
    preferred_subjects: input.subjects,
    learning_goal: input.goal,
    avatar_config: input.avatar,
    assessment_completed_at: null,
    created_at: new Date().toISOString(),
  });
  await store.insert("game_profiles", newGameProfile(child.id));
  return child;
}

/** Everything stored about a child, for the parent's data export (GDPR-style portability). */
export async function exportChild(store: Store, childId: string) {
  const tables = ["child_profiles", "game_profiles", "learning_progress", "lesson_attempts", "question_attempts", "child_achievements", "inventory", "child_challenges", "game_sessions", "daily_activity", "ai_messages"] as const;
  const out: Record<string, unknown> = { exported_at: new Date().toISOString() };
  for (const t of tables) out[t] = await store.select(t, (t === "child_profiles" ? { id: childId } : { child_id: childId }) as never);
  return out;
}

export async function deleteChild(store: Store, childId: string) {
  // children of FK cascade in Postgres; local store needs explicit cleanup
  const tables = ["ai_messages", "ai_sessions", "question_attempts", "lesson_attempts", "learning_progress", "game_profiles", "child_achievements", "inventory", "child_challenges", "game_sessions", "daily_activity"] as const;
  for (const t of tables) await store.remove(t, { child_id: childId } as never);
  await store.remove("child_profiles", { id: childId });
}
