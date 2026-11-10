import Link from "next/link";
import { requireChild } from "@/services/context";
import { MINIGAMES } from "@/data/minigames";
import { currentAge } from "@/services/children";
import { tx } from "@/lib/i18n/text";
import { ut } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";

export default async function GamesPage() {
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  if (!ctx.settings.minigamesEnabled) return <p className="glass rounded-3xl p-6 text-center">{ut(L, "featureDisabled")}</p>;
  const age = currentAge(ctx.child);
  const plays = await ctx.store.select("game_sessions", { child_id: ctx.child.id });
  const best = (id: string) => {
    const g = plays.filter((p) => p.game_id === id);
    return g.length ? Math.round(Math.max(...g.map((p) => p.score / p.max_score)) * 100) : null;
  };
  const sorted = [...MINIGAMES].sort((a, b) => Number(age < a.ages[0] || age > a.ages[1]) - Number(age < b.ages[0] || age > b.ages[1]));
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">🎮 {ut(L, "navGames")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((g) => {
          const b = best(g.id);
          const fits = age >= g.ages[0] && age <= g.ages[1];
          return (
            <Link key={g.id} href={`/play/games/${g.id}`} className="group relative overflow-hidden rounded-[2rem] p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-1" style={{ background: `linear-gradient(145deg, ${g.color}, #2a3170)` }}>
              <span className="text-5xl drop-shadow" aria-hidden>{g.emoji}</span>
              <h2 className="mt-2 font-display text-xl">{tx(g.title, L)}</h2>
              <p className="text-sm opacity-90">{tx(g.skill, L)}</p>
              <div className="mt-3 flex gap-2 text-xs font-bold">
                <span className="rounded-full bg-black/25 px-2 py-1">{g.ages[0]}–{g.ages[1]}</span>
                {b !== null && <span className="rounded-full bg-black/25 px-2 py-1">★ {b}%</span>}
                {fits && <span className="rounded-full bg-sun px-2 py-1 text-ink">{L === "en" ? "For you" : "Для тебя"}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
