import type { AvatarConfig, GradeCode } from "@/types/db";
import type { PT, ParentKey } from "@/lib/i18n/parent";
import { GOALS } from "@/lib/validation";

/** Display helpers shared by parent pages (isomorphic). */

export function levelLabel(level: number, t: PT): string {
  if (level < 0) return t("levelPreschool");
  if (level === 0) return t("levelPrep");
  return t("levelN", { n: level });
}

export function gradeLabel(grade: GradeCode, customLevel: number | null | undefined, t: PT): string {
  if (grade === "none") return t("gradeNone");
  if (grade === "prep") return t("gradePrep");
  if (grade === "custom") return customLevel === null || customLevel === undefined ? t("gradeCustom") : t("gradeCustomLevel", { level: levelLabel(customLevel, t) });
  return t("gradeN", { n: grade });
}

/**
 * A *suggestion* only (shown to the parent, never applied automatically):
 * the most common grade for an age in systems where school starts at 6-7.
 */
export function suggestedGrade(age: number): GradeCode {
  if (age <= 5) return "none";
  if (age === 6) return "prep";
  const g = Math.min(11, age - 6);
  return String(g) as GradeCode;
}

export type Goal = (typeof GOALS)[number];
export const goalLabel = (goal: string, t: PT): string => ((GOALS as readonly string[]).includes(goal) ? t(`goal_${goal}` as ParentKey) : goal);

export const BASES: { id: AvatarConfig["base"]; key: ParentKey }[] = [
  { id: "fox", key: "baseFox" },
  { id: "bunny", key: "baseBunny" },
  { id: "bear", key: "baseBear" },
  { id: "owl", key: "baseOwl" },
  { id: "cat", key: "baseCat" },
  { id: "panda", key: "basePanda" },
];

export const LANG_KEYS: Record<"ru" | "en" | "uz", ParentKey> = { ru: "langRu", en: "langEn", uz: "langUz" };

export function formatDate(iso: string | null | undefined, locale: string, withTime = false): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00Z" : iso);
  if (Number.isNaN(d.getTime())) return "";
  const loc = locale === "uz" ? "uz-UZ" : locale === "en" ? "en-GB" : "ru-RU";
  return d.toLocaleDateString(loc, withTime ? { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" });
}
