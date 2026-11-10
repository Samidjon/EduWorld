import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "@/types/content";
import { LANG_COOKIE, normalizeLocale } from "@/lib/i18n/public";

/** Reads the public-site language from the `ew_lang` cookie (default "ru"). */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LANG_COOKIE)?.value);
}
