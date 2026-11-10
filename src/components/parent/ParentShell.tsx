"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BarChart3, LayoutDashboard, LogOut, Settings, UserRound, Users } from "lucide-react";
import { ErrorNote } from "@/components/ui";
import { cn } from "@/lib/cn";
import { api } from "@/lib/client";
import type { ParentKey } from "@/lib/i18n/parent";
import { LanguageSwitcher, useP } from "./i18n";

const NAV: { href: string; match: string; key: ParentKey; icon: typeof Users }[] = [
  { href: "/parent/dashboard", match: "/parent/dashboard", key: "navOverview", icon: LayoutDashboard },
  { href: "/parent/children", match: "/parent/children", key: "navChildren", icon: Users },
  { href: "/parent/analytics", match: "/parent/analytics", key: "navAnalytics", icon: BarChart3 },
  { href: "/parent/settings", match: "/parent/settings", key: "navSettings", icon: Settings },
  { href: "/parent/account", match: "/parent/account", key: "navAccount", icon: UserRound },
];

export function LogoutButton({ className, compact }: { className?: string; compact?: boolean }) {
  const { t, err } = useP();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const logout = async () => {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/logout");
      window.location.href = "/";
    } catch (e) {
      setError(err(e));
      setBusy(false);
    }
  };
  return (
    <div className={className}>
      <button
        type="button"
        onClick={logout}
        disabled={busy}
        aria-label={t("logout")}
        className="inline-flex h-10 items-center gap-2 rounded-2xl px-3 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
      >
        <LogOut className="size-4" aria-hidden />
        <span className={cn(compact && "sr-only sm:not-sr-only")}>{busy ? t("loggingOut") : t("logout")}</span>
      </button>
      {error && <div className="mt-2"><ErrorNote>{error}</ErrorNote></div>}
    </div>
  );
}

function Brand() {
  const { t } = useP();
  return (
    <Link href="/parent/dashboard" className="flex items-center gap-2 font-display text-lg text-ink">
      <span className="grid size-9 place-items-center rounded-2xl bg-brand-blue text-white" aria-hidden>E</span>
      <span>
        EduWorld <span className="block text-xs font-sans font-bold text-slate-500 -mt-0.5">{t("parentArea")}</span>
      </span>
    </Link>
  );
}

/** Light, calm shell for the parent area: sidebar on desktop, top bar + bottom tab bar on mobile. */
export function ParentShell({ showNav, displayName, children }: { showNav: boolean; displayName?: string; children: ReactNode }) {
  const { t } = useP();
  const path = usePathname();
  const active = (m: string) => path === m || path.startsWith(m + "/");

  return (
    <div className="min-h-dvh bg-[#F7F8FC] text-ink">
      {showNav && (
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
          <Brand />
          {displayName && <p className="mt-6 truncate rounded-2xl bg-cream px-3 py-2 text-sm font-semibold">{displayName}</p>}
          <nav aria-label={t("mainNav")} className="mt-6 flex flex-1 flex-col gap-1">
            {NAV.map(({ href, match, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={active(match) ? "page" : undefined}
                className={cn("flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-bold transition", active(match) ? "bg-brand-blue/10 text-brand-blue" : "text-slate-600 hover:bg-slate-100")}
              >
                <Icon className="size-5" aria-hidden />
                {t(key)}
              </Link>
            ))}
          </nav>
          <div className="space-y-3">
            <LanguageSwitcher />
            <LogoutButton />
          </div>
        </aside>
      )}

      <header className={cn("sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur", showNav && "lg:hidden")}>
        <Brand />
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          {showNav && <LogoutButton compact />}
        </div>
      </header>

      <main className={cn("mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8", showNav && "pb-28 lg:pb-10 lg:pl-72 lg:max-w-none lg:pr-10")}>
        <div className={cn(showNav && "lg:max-w-5xl")}>{children}</div>
      </main>

      {showNav && (
        <nav aria-label={t("mainNav")} className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          {NAV.map(({ href, match, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(match) ? "page" : undefined}
              className={cn("flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-bold", active(match) ? "text-brand-blue" : "text-slate-500")}
            >
              <Icon className="size-5" aria-hidden />
              <span className="truncate max-w-full">{t(key)}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

/** Page heading used across parent pages. */
export function PageHeader({ title, intro, action }: { title: string; intro?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {intro && <p className="mt-1 max-w-2xl text-slate-600">{intro}</p>}
      </div>
      {action}
    </div>
  );
}
