import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Coin } from "@/components/shared/Coin";
import { requireChild } from "@/services/context";
import { challengesFor, childOverview } from "@/services/child-view";
import { tx } from "@/lib/i18n/text";
import { ut } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";
import { Character } from "@/components/characters/Character";
import { RingStatic } from "@/components/shared/RingStatic";

export default async function DashboardPage() {
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  const t = (k: Parameters<typeof ut>[1], v?: Record<string, string | number>) => ut(L, k, v);
  const { recs, worlds, pmap } = await childOverview(ctx.store, ctx.child, ctx.settings);
  const { daily, weekly } = await challengesFor(ctx.store, ctx.child.id, ctx.settings);
  const top = recs[0];
  const reasonLabel = { review_due: t("reviewDue"), needs_review: t("needsReview"), foundation: t("reasonFoundation"), next_step: t("reasonNext"), stretch: t("reasonStretch") } as const;

  const quick = [
    { href: "/play/map", emoji: "🗺️", label: t("navMap"), color: "from-[#6aa9f2] to-[#3f63c9]" },
    ...(ctx.settings.minigamesEnabled ? [{ href: "/play/games", emoji: "🎮", label: t("navGames"), color: "from-[#8fd4ff] to-[#4a8de0]" }] : []),
    ...(ctx.settings.aiEnabled ? [{ href: "/play/tutor", emoji: "🦉", label: "EduBuddy", color: "from-[#c3a6ff] to-[#7c5cd6]" }] : []),
    { href: "/play/journal", emoji: "✏️", label: t("navJournal"), color: "from-[#ffb199] to-[#e8735a]" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-center font-display text-3xl sm:text-4xl">{t("hello", { name: ctx.child.nickname })} <span aria-hidden>👋</span></h1>

      <div className="flex justify-center gap-4 sm:gap-6">
        {quick.map((q) => (
          <Link key={q.href} href={q.href} className="group flex flex-col items-center gap-1.5">
            <span className={`grid size-16 sm:size-20 place-items-center rounded-full bg-gradient-to-b ${q.color} text-3xl shadow-[var(--shadow-button)] ring-4 ring-white/10 transition group-hover:scale-105`} aria-hidden>{q.emoji}</span>
            <span className="text-sm font-semibold opacity-90">{q.label}</span>
          </Link>
        ))}
      </div>

      {top && top.lesson && (
        <Link href={`/play/lessons/${top.lesson.id}`} className="block">
          <section className="relative overflow-hidden rounded-[2rem] p-5 sm:p-6 shadow-[var(--shadow-soft)]" style={{ background: "linear-gradient(135deg, #3a6fd0 0%, #2f8fa8 55%, #4bb38a 100%)" }}>
            <div className="relative z-10 max-w-[60%]">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">{t("continueLearning")} · {reasonLabel[top.reason]}</p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl">{tx(top.topic.title, L)}</h2>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-night-950/50 px-3 py-1.5">
                <span className="font-bold">{Math.round((top.progress?.mastery_level ?? 0.3) * 100)}%</span>
                <RingStatic value={top.progress?.mastery_level ?? 0.3} />
              </div>
            </div>
            <span className="btn-orb absolute right-5 top-5 z-10 grid size-12 place-items-center rounded-full"><ArrowRight aria-hidden /></span>
            <div className="absolute -bottom-6 right-0 sm:right-6"><Character id={top.lesson.character} size={150} animation="idle" /></div>
          </section>
        </Link>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-2xl">{t("recommended")}</h2>
          <div className="space-y-3">
            {recs.slice(1, 5).map((r) => (
              <Link key={r.topicId} href={r.reason === "review_due" ? `/play/review/${r.topicId}` : `/play/lessons/${r.lesson!.id}`} className="glass flex items-center gap-3 rounded-3xl p-4 transition hover:bg-white/15">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: worlds.find((w) => w.world.slug === r.topic.world)?.world.palette.from }} aria-hidden>
                  {worlds.find((w) => w.world.slug === r.topic.world)?.world.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{tx(r.topic.title, L)}</span>
                  <span className="text-sm text-lavender">{reasonLabel[r.reason]} · {r.lesson!.durationMin} {t("minutes")}</span>
                </span>
                <ArrowRight className="size-5 opacity-60" aria-hidden />
              </Link>
            ))}
            {recs.length <= 1 && <p className="glass rounded-3xl p-4 opacity-80">🗺️ {t("navMap")} →</p>}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-2xl">{t("dailyChallenges")}</h2>
          <div className="glass space-y-3 rounded-3xl p-4">
            {daily.map((d) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>{d.done ? "✅" : d.data.kind === "games" ? "🎮" : d.data.kind === "review" ? "🔁" : d.data.kind === "correct" ? "🎯" : "📘"}</span>
                <div className="flex-1">
                  <p className="font-semibold">{tx(d.data.title, L)}</p>
                  <div className="mt-1 h-2 rounded-full bg-black/25"><div className="h-2 rounded-full bg-sun" style={{ width: `${(d.progress / d.data.target) * 100}%` }} /></div>
                </div>
                <span className="text-xs opacity-80">+{d.data.reward.coins} <Coin size={12} /></span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3">
              <p className="font-semibold">🏁 {t("weeklyGoal")}: {weekly.done} / {weekly.goal} {t("lessons").toLowerCase()}</p>
              <div className="mt-1 h-2 rounded-full bg-black/25"><div className="h-2 rounded-full bg-mint" style={{ width: `${Math.min(1, weekly.done / weekly.goal) * 100}%` }} /></div>
            </div>
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 font-display text-2xl">{t("worlds")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {worlds.map(({ world, unlocked, mastered, total }) => (
            <Link key={world.slug} href={unlocked ? `/play/worlds/${world.slug}` : "/play/map"} className="relative overflow-hidden rounded-3xl p-4 shadow-[var(--shadow-soft)]" style={{ background: `linear-gradient(140deg, ${world.palette.from}, ${world.palette.to})`, opacity: unlocked ? 1 : 0.55 }}>
              <span className="text-3xl" aria-hidden>{unlocked ? world.emoji : "🔒"}</span>
              <p className="mt-1 font-display text-lg text-white drop-shadow">{tx(world.name, L)}</p>
              <p className="text-xs text-white/90">{mastered}/{total} {t("mastered").toLowerCase()}</p>
            </Link>
          ))}
        </div>
        <p className="sr-only">{pmap.size}</p>
      </section>
    </div>
  );
}
