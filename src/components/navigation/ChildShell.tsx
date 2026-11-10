"use client";

import Link from "next/link";
import { Coin } from "@/components/shared/Coin";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, BookOpen, Gamepad2, Home, Map, MessageCircleQuestion, Lock, Music, VolumeX, Trophy, Route, Shirt, Backpack, NotebookPen, Network, Store, Sofa } from "lucide-react";
import type { AvatarConfig } from "@/types/db";
import type { LText } from "@/types/content";
import { AvatarView } from "@/components/avatar/AvatarView";
import { Character } from "@/components/characters/Character";
import { Button, Modal, Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { api } from "@/lib/client";
import { isMuted, setMuted } from "@/lib/audio";
import type { UIKey } from "@/lib/i18n/ui";

interface Props {
  nickname: string;
  avatar: AvatarConfig;
  level: number;
  xp: number;
  xpNext: number;
  coins: number;
  streak: number;
  notifications: { id: string; icon: string; title: LText; at: string }[];
  features: { ai: boolean; games: boolean; shop: boolean };
  assessmentDone: boolean;
  children: React.ReactNode;
}

const MAIN: { href: string; key: UIKey; icon: typeof Home; feature?: "ai" | "games" }[] = [
  { href: "/play/dashboard", key: "navHome", icon: Home },
  { href: "/play/map", key: "navMap", icon: Map },
  { href: "/play/games", key: "navGames", icon: Gamepad2, feature: "games" },
  { href: "/play/tutor", key: "navTutor", icon: MessageCircleQuestion, feature: "ai" },
  { href: "/play/profile", key: "navMe", icon: Shirt },
];

const MORE: { href: string; key: UIKey; icon: typeof Home; feature?: "shop" }[] = [
  { href: "/play/roadmap", key: "navRoadmap", icon: Route },
  { href: "/play/skills", key: "navSkills", icon: Network },
  { href: "/play/journal", key: "navJournal", icon: NotebookPen },
  { href: "/play/achievements", key: "navAchievements", icon: Trophy },
  { href: "/play/avatar", key: "navAvatar", icon: Shirt },
  { href: "/play/inventory", key: "navInventory", icon: Backpack },
  { href: "/play/shop", key: "navShop", icon: Store, feature: "shop" },
  { href: "/play/home", key: "navHomeRoom", icon: Sofa },
];

export function ChildShell(p: Props) {
  const { t, tl, young } = useT();
  const path = usePathname();
  const router = useRouter();
  const [bellOpen, setBellOpen] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [breakOpen, setBreakOpen] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const sessionStart = useRef(Date.now());
  const inAssessment = path.startsWith("/play/assessment");

  useEffect(() => setMutedState(isMuted()), []);

  // activity heartbeat: once a minute while the page is visible
  useEffect(() => {
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const r = await api<{ limitReached: boolean; breakDue: boolean }>("/api/play/activity", { sessionMinutes: Math.round((Date.now() - sessionStart.current) / 60000) });
        if (r.limitReached) setLimitReached(true);
        else if (r.breakDue) setBreakOpen(true);
      } catch { /* offline: try next minute */ }
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const active = (href: string) => path === href || path.startsWith(href + "/");
  const main = MAIN.filter((m) => !m.feature || p.features[m.feature]);
  const more = MORE.filter((m) => !m.feature || p.features[m.feature]);

  return (
    <div className={cn("bg-adventure min-h-dvh", young && "young")}>
      {/* top bar */}
      <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3">
        <div className="glass mx-auto flex max-w-6xl items-center gap-3 rounded-3xl px-3 py-2 sm:px-4">
          <Link href="/play/profile" className="flex items-center gap-2 min-w-0" aria-label={p.nickname}>
            <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-sky/40 to-brand-blue/40">
              <AvatarView config={p.avatar} size={44} showPet={false} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-lg leading-tight">{p.nickname}</span>
              <span className="flex items-center gap-2 whitespace-nowrap text-xs opacity-80">
                {t("level")} {p.level}
                <Progress value={p.xp / p.xpNext} className="hidden h-1.5 w-24 sm:block" label={t("xp")} />
              </span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <span className="flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-sm font-bold" title={t("coins")}>
              <Coin size={16} />
              {p.coins}
            </span>
            <span className="hidden sm:flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-sm font-bold" title={t("streak")}>
              <span aria-hidden>🔥</span>
              {p.streak}
            </span>
            <button onClick={() => { setMuted(!muted); setMutedState(!muted); }} className="rounded-full p-2 hover:bg-white/10" aria-label={muted ? "Включить звук и музыку" : "Выключить звук и музыку"}>
              {muted ? <VolumeX className="size-5" /> : <Music className="size-5" />}
            </button>
            <div className="relative">
              <button onClick={() => setBellOpen((o) => !o)} className="relative rounded-full p-2 hover:bg-white/10" aria-label="Notifications" aria-expanded={bellOpen}>
                <Bell className="size-5" />
                {p.notifications.length > 0 && <span className="absolute right-1 top-1 size-2.5 rounded-full bg-coral" />}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-night-800 border border-white/10 p-3 shadow-xl">
                  {p.notifications.length === 0 ? (
                    <p className="text-sm opacity-70 p-2">—</p>
                  ) : (
                    <ul className="space-y-2">
                      {p.notifications.map((n) => (
                        <li key={n.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-2 text-sm">
                          <span className="text-xl" aria-hidden>{n.icon}</span>
                          <span className="font-semibold">{t("newAchievement")} {tl(n.title)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <Link href="/parent/dashboard" className="rounded-full p-2 hover:bg-white/10" aria-label={t("parentArea")} title={t("parentArea")}>
              <Lock className="size-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-3 sm:px-6 pb-28 lg:pb-10 pt-4">
        {/* desktop side nav */}
        {!inAssessment && p.assessmentDone && (
          <nav className="hidden lg:block w-56 shrink-0" aria-label="Main">
            <div className="glass sticky top-24 rounded-3xl p-3 space-y-1">
              {[...main, ...more].map((m) => (
                <Link key={m.href} href={m.href} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold transition", active(m.href) ? "bg-white/15" : "opacity-80 hover:bg-white/10 hover:opacity-100")}>
                  <m.icon className="size-5" aria-hidden />
                  {t(m.key)}
                </Link>
              ))}
            </div>
          </nav>
        )}
        <main className="min-w-0 flex-1">{p.children}</main>
      </div>

      {/* mobile bottom nav */}
      {!inAssessment && p.assessmentDone && (
        <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))]" aria-label="Main">
          <div className="glass mx-auto flex max-w-md items-center justify-around rounded-3xl bg-night-900/80 px-2 py-2">
            {main.map((m) => (
              <Link key={m.href} href={m.href} aria-label={t(m.key)} className={cn("grid place-items-center rounded-full transition", active(m.href) ? "size-14 bg-gradient-to-b from-lavender to-[#7c5cd6] shadow-lg" : "size-12 opacity-70")}>
                <m.icon className="size-6" aria-hidden />
                {!young && <span className="sr-only">{t(m.key)}</span>}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <Modal open={breakOpen} onClose={() => setBreakOpen(false)} title={t("timeForBreak")}>
        <div className="flex flex-col items-center gap-3 text-center">
          <Character id="luna" animation="wave" size={120} />
          <p>{t("breakText")}</p>
          <Button variant="mint" onClick={() => setBreakOpen(false)}>{t("continue")}</Button>
        </div>
      </Modal>

      {limitReached && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-night-950/95 p-6 text-center">
          <div className="flex max-w-sm flex-col items-center gap-4">
            <Character id="foxy" emotion="happy" animation="wave" size={150} />
            <p className="font-display text-2xl">{t("dailyLimitReached")}</p>
            <Button variant="glass" onClick={() => router.push("/parent/dashboard")} icon={<Lock className="size-4" />}>{t("parentArea")}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const MORE_LINKS = MORE;
export { BookOpen };
