"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import type { Locale } from "@/types/content";
import { ApiError } from "@/lib/client";
import { PARENT_LANG_COOKIE, PARENT_LOCALES, errorKey, makePT, validationKey, type PT } from "@/lib/i18n/parent";
import { cn } from "@/lib/cn";

const Ctx = createContext<Locale>("ru");

export function ParentLocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

/** Parent-area translation hook. */
export function useP(): { locale: Locale; t: PT; err: (e: unknown) => string; v: (message: string | undefined) => string | undefined } {
  const locale = useContext(Ctx);
  const t = makePT(locale);
  return {
    locale,
    t,
    err: (e) => t(errorKey(e instanceof ApiError ? e.code : undefined)),
    v: (message) => (message === undefined ? undefined : t(validationKey(message))),
  };
}

const LABEL: Record<Locale, string> = { ru: "RU", en: "EN", uz: "UZ" };

/** Sets the `ew_lang` cookie and re-renders server components in the new language. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useP();
  const router = useRouter();
  const [pending, start] = useTransition();
  const choose = (l: Locale) => {
    if (l === locale) return;
    document.cookie = `${PARENT_LANG_COOKIE}=${l}; path=/; max-age=${365 * 86400}; samesite=lax`;
    start(() => router.refresh());
  };
  return (
    <div role="group" aria-label={t("language")} className={cn("inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1", pending && "opacity-60", className)}>
      <Globe className="mx-1 size-4 text-slate-500" aria-hidden />
      {PARENT_LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          aria-pressed={l === locale}
          aria-label={t(l === "ru" ? "langRu" : l === "en" ? "langEn" : "langUz")}
          className={cn("h-8 rounded-xl px-2.5 text-xs font-bold transition", l === locale ? "bg-brand-blue text-white" : "text-ink hover:bg-slate-100")}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
