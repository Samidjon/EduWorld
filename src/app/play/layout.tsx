import type { Metadata } from "next";
import { requireChild } from "@/services/context";
import { getGameProfile } from "@/services/game";
import { xpToNext } from "@/features/progression/rules";
import { currentAge } from "@/services/children";
import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { ChildShell } from "@/components/navigation/ChildShell";
import { getAchievement } from "@/data/achievements";
import type { Locale } from "@/types/content";

export const metadata: Metadata = { title: "Play" };
export const dynamic = "force-dynamic";

export default async function PlayLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireChild({ allowNoAssessment: true });
  const gp = await getGameProfile(ctx.store, ctx.child.id);
  const since = new Date(Date.now() - 3 * 86400_000).toISOString();
  const recent = await ctx.store.select("child_achievements", { child_id: ctx.child.id }, { gte: ["unlocked_at", since], orderBy: "unlocked_at", desc: true, limit: 8 });
  const notifications = recent.map((a) => {
    const def = getAchievement(a.achievement_id);
    return { id: a.id, icon: def?.icon ?? "⭐", title: def?.name ?? { en: "Achievement", ru: "Достижение" }, at: a.unlocked_at };
  });
  const locale = ctx.child.interface_language as Locale;
  const young = currentAge(ctx.child) <= 7;
  return (
    <LocaleProvider locale={locale} young={young}>
      <ChildShell
        nickname={ctx.child.nickname}
        avatar={ctx.child.avatar_config}
        level={gp.level}
        xp={gp.xp}
        xpNext={xpToNext(gp.level)}
        coins={gp.coins}
        streak={gp.streak}
        notifications={notifications}
        features={{ ai: ctx.settings.aiEnabled, games: ctx.settings.minigamesEnabled, shop: ctx.settings.shopEnabled }}
        assessmentDone={!!ctx.child.assessment_completed_at}
      >
        {children}
      </ChildShell>
    </LocaleProvider>
  );
}
