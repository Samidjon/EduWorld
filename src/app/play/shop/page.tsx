import { requireChild } from "@/services/context";
import { ITEMS } from "@/data/items";
import { getGameProfile } from "@/services/game";
import { Shop } from "@/components/rewards/Shop";
import { ut } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";

export default async function ShopPage() {
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  if (!ctx.settings.shopEnabled) return <p className="glass rounded-3xl p-6 text-center">{ut(L, "featureDisabled")}</p>;
  const [inv, gp] = await Promise.all([ctx.store.select("inventory", { child_id: ctx.child.id }), getGameProfile(ctx.store, ctx.child.id)]);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">🛍️ {ut(L, "navShop")}</h1>
      <p className="text-sm opacity-80">{L === "en" ? "Everything here is just for fun and style. Coins come only from learning." : "Здесь всё только для красоты и веселья. Монеты зарабатываются только учёбой."}</p>
      <Shop items={ITEMS.filter((i) => !i.rewardOnly && i.price > 0)} owned={inv.map((i) => i.item_id)} coins={gp.coins} />
    </div>
  );
}
