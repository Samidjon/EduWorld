"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/types/content";
import type { PublicDict } from "@/lib/i18n/public";
import { Logo } from "./Logo";
import { LangSwitcher } from "./LangSwitcher";
import { linkBtn } from "./styles";

export function LandingHeader({ locale, t }: { locale: Locale; t: Pick<PublicDict, "nav" | "common" | "langLabel"> }) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#how", label: t.nav.how },
    { href: "#ages", label: t.nav.ages },
    { href: "#worlds", label: t.nav.worlds },
    { href: "#parents", label: t.nav.parents },
    { href: "#faq", label: t.nav.faq },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="relative z-30">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
        <Link href="/" aria-label="EduWorld" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label={t.nav.label} className="ml-4 hidden xl:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold text-white/85 transition hover:bg-white/10 hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <LangSwitcher locale={locale} label={t.langLabel} />
          </div>
          <Link href="/login" className={linkBtn("glass", "sm")}>
            {t.common.login}
          </Link>
          <span className="hidden md:block">
            <Link href="/register" className={linkBtn("sun", "sm")}>
              {t.common.start}
            </Link>
          </span>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl text-white hover:bg-white/10 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.menu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-3 top-full rounded-3xl border border-white/15 bg-night-900/95 p-4 shadow-[var(--shadow-soft)] backdrop-blur xl:hidden">
          <nav aria-label={t.nav.label}>
            <ul className="grid gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 font-bold text-white hover:bg-white/10">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <LangSwitcher locale={locale} label={t.langLabel} />
            <Link href="/register" className={linkBtn("sun", "sm")}>
              {t.common.start}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
