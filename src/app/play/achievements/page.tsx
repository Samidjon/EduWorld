import { requireChild } from "@/services/context";
import { ACHIEVEMENTS } from "@/data/achievements";
import { Coin } from "@/components/shared/Coin";
import { childStats } from "@/services/game";
import { achievementProgress } from "@/features/progression/rules";
import { tx } from "@/lib/i18n/text";
import { ut } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";

export default async function AchievementsPage() {
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  const [have, stats] = await Promise.all([ctx.store.select("child_achievements", { child_id: ctx.child.id }), childStats(ctx.store, ctx.child)]);
  const got = new Map(have.map((a) => [a.achievement_id, a.unlocked_at]));
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">🏆 {ut(L, "navAchievements")} <span className="text-lg opacity-70">{got.size}/{ACHIEVEMENTS.length}</span></h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = got.has(a.id);
          const prog = achievementProgress(a, stats);
          return (
            <div key={a.id} className={`glass flex items-center gap-3 rounded-3xl p-4 ${unlocked ? "ring-2 ring-sun/60" : ""}`}>
              <span className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl ${unlocked ? "bg-sun/30" : "bg-black/25 grayscale opacity-60"}`} aria-hidden>{a.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{tx(a.name, L)}</p>
                <p className="text-sm opacity-80">{tx(a.description, L)}</p>
                {!unlocked && <div className="mt-2 h-2 rounded-full bg-black/25"><div className="h-2 rounded-full bg-lavender" style={{ width: `${prog * 100}%` }} /></div>}
                <p className="mt-1 text-xs opacity-70">{unlocked ? "✅" : ""} {a.reward.xp ? `+${a.reward.xp} ${ut(L, "xp")} ` : ""}{a.reward.coins ? <>+{a.reward.coins} <Coin size={12} /></> : null}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
