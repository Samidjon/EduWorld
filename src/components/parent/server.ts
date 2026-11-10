import "server-only";
import { cookies } from "next/headers";
import { CHILD_COOKIE, UNLOCK_COOKIE, getSettings } from "@/services/context";
import type { Store } from "@/services/db/store";
import { verify } from "@/lib/crypto";
import { makePT, parentLocaleFrom, type PT } from "@/lib/i18n/parent";
import type { Locale } from "@/types/content";

/** Parent UI language from the `ew_lang` cookie (default "ru"). */
export async function getParentLocale(): Promise<Locale> {
  return parentLocaleFrom(await cookies());
}

/** Server-side translator for parent pages. */
export async function getParentT(): Promise<{ locale: Locale; t: PT }> {
  const locale = await getParentLocale();
  return { locale, t: makePT(locale) };
}

/** Mirrors requireParentArea(): true when a PIN is set, the device is in child mode and not unlocked. */
export async function isParentLocked(store: Store, parentId: string): Promise<boolean> {
  const settings = await getSettings(store, parentId);
  if (!settings.pinHash) return false;
  const jar = await cookies();
  const unlocked = verify<{ pid: string }>(jar.get(UNLOCK_COOKIE)?.value)?.pid === parentId;
  return !!jar.get(CHILD_COOKIE)?.value && !unlocked;
}
