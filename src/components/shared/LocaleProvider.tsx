"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { LText, Locale } from "@/types/content";
import { tx } from "@/lib/i18n/text";
import { ut, type UIKey } from "@/lib/i18n/ui";

interface Ctx { locale: Locale; young: boolean }
const LocaleCtx = createContext<Ctx>({ locale: "ru", young: false });

export function LocaleProvider({ locale, young = false, children }: Ctx & { children: ReactNode }) {
  return <LocaleCtx.Provider value={{ locale, young }}>{children}</LocaleCtx.Provider>;
}

/** Translation hook: t("key") for interface strings, tl(ltext) for content strings. */
export function useT() {
  const { locale, young } = useContext(LocaleCtx);
  return {
    locale,
    young,
    t: (key: UIKey, vars?: Record<string, string | number>) => ut(locale, key, vars),
    tl: (text: LText | undefined) => tx(text, locale),
  };
}
