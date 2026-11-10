import type { LAnswers, LText, Locale } from "@/types/content";

/** Resolve a localized content string. uz falls back to ru, then en. */
export function tx(t: LText | undefined, locale: Locale): string {
  if (!t) return "";
  if (locale === "uz") return t.uz ?? t.ru ?? t.en;
  return t[locale] ?? t.en;
}

export function answersFor(a: LAnswers, locale: Locale): string[] {
  if (locale === "uz") return a.uz ?? a.ru;
  return a[locale];
}

/** Content language used for language-specific lessons (uz content falls back to ru). */
export function contentLocale(locale: Locale): "en" | "ru" {
  return locale === "en" ? "en" : "ru";
}
