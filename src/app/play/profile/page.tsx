import Link from "next/link";
import { requireChild } from "@/services/context";
import { Coin } from "@/components/shared/Coin";
import { childStats, getGameProfile } from "@/services/game";
import { xpToNext } from "@/features/progression/rules";
import { AvatarView } from "@/components/avatar/AvatarView";
import { ut, type UIKey } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";

export default async function ProfilePage() {
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  const [gp, s] = await Promise.all([getGameProfile(ctx.store, ctx.child.id), childStats(ctx.store, ctx.child)]);
  const links: { href: string; key: UIKey; emoji: string; show?: boolean }[] = [
    { href: "/play/avatar", key: "navAvatar", emoji: "🎨" },
    { href: "/play/inventory", key: "navInventory", emoji: "🎒" },
    { href: "/play/shop", key: "navShop", emoji: "🛍️", show: ctx.settings.shopEnabled },
    { href: "/play/home", key: "navHomeRoom", emoji: "🏠" },
    { href: "/play/achievements", key: "navAchievements", emoji: "🏆" },
    { href: "/play/skills", key: "navSkills", emoji: "🌳" },
    { href: "/play/roadmap", key: "navRoadmap", emoji: "🧭" },
    { href: "/play/journal", key: "navJournal", emoji: "📔" },
  ];
  const stats = [
    { label: ut(L, "level"), value: gp.level, emoji: "⭐" },
    { label: ut(L, "xp"), value: `${gp.xp}/${xpToNext(gp.level)}`, emoji: "✨" },
    { label: ut(L, "coins"), value: gp.coins, emoji: <Coin size={28} /> },
    { label: ut(L, "streak"), value: gp.streak, emoji: "🔥" },
    { label: ut(L, "lessons"), value: s.lessonsCompleted, emoji: "📘" },
    { label: ut(L, "mastered"), value: s.topicsMastered, emoji: "🌟" },
  ];
  return (
    <div className="space-y-5">
      <section className="glass flex flex-col items-center gap-2 rounded-[2rem] p-6 sm:flex-row sm:gap-6">
        <div className="rounded-[2rem] bg-gradient-to-b from-sky/30 to-lavender/30 p-3"><AvatarView config={ctx.child.avatar_config} size={130} /></div>
        <div className="text-center sm:text-left">
          <h1 className="font-display text-4xl">{ctx.child.nickname}</h1>
          <p className="opacity-80">{ut(L, "level")} {gp.level} · {L === "en" ? "longest streak" : "лучшая серия"} {gp.longest_streak} 🔥</p>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((x) => (
          <div key={x.label} className="glass rounded-3xl p-4 text-center">
            <div className="text-2xl" aria-hidden>{x.emoji}</div>
            <div className="font-display text-2xl">{x.value}</div>
            <div className="text-xs opacity-75">{x.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {links.filter((l) => l.show !== false).map((l) => (
          <Link key={l.href} href={l.href} className="glass flex flex-col items-center gap-1 rounded-3xl p-4 font-semibold hover:bg-white/15">
            <span className="text-3xl" aria-hidden>{l.emoji}</span>
            {ut(L, l.key)}
          </Link>
        ))}
      </div>
    </div>
  );
}
