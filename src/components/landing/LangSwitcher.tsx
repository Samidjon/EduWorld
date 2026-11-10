"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/types/content";
import { LANG_COOKIE, PUBLIC_LOCALES } from "@/lib/i18n/public";

const SHORT: Record<Locale, string> = { ru: "RU", en: "EN", uz: "UZ" };
const FULL: Record<Locale, string> = { ru: "Русский", en: "English", uz: "O‘zbekcha" };

/** RU / EN / UZ switcher: stores the choice in the `ew_lang` cookie and re-renders server components. */
export function LangSwitcher({ locale, label, tone = "dark" }: { locale: Locale; label: string; tone?: "dark" | "light" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (l: Locale) => {
    if (l === locale) return;
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
    startTransition(() => router.refresh());
  };

  return (
    <div
      role="group"
      aria-label={label}
      aria-busy={pending}
      className={`inline-flex rounded-full p-1 text-xs font-extrabold ${tone === "dark" ? "bg-white/10 border border-white/15" : "bg-white border border-slate-200 shadow-sm"}`}
    >
      {PUBLIC_LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={active}
            aria-label={FULL[l]}
            title={FULL[l]}
            onClick={() => choose(l)}
            className={`min-w-9 rounded-full px-2.5 py-1.5 transition ${
              active ? "bg-sun text-[#4a3505]" : tone === "dark" ? "text-white/80 hover:text-white hover:bg-white/10" : "text-ink/70 hover:bg-slate-100"
            }`}
          >
            {SHORT[l]}
          </button>
        );
      })}
    </div>
  );
}
