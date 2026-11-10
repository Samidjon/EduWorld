import { requireChild } from "@/services/context";
import { getItem } from "@/data/items";
import { getGameProfile } from "@/services/game";
import { PlayerRoom } from "@/components/rewards/PlayerRoom";
import { ut } from "@/lib/i18n/ui";
import type { GameItem, Locale } from "@/types/content";

export default async function HomeRoomPage() {
  const ctx = await requireChild();
  const [inv, gp] = await Promise.all([ctx.store.select("inventory", { child_id: ctx.child.id }), getGameProfile(ctx.store, ctx.child.id)]);
  const decor = inv.map((i) => getItem(i.item_id)).filter((x): x is GameItem => !!x && x.type === "decor");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">🏠 {ut(ctx.child.interface_language as Locale, "navHomeRoom")}</h1>
      <PlayerRoom initial={gp.home_config ?? { placed: [], wallpaper: "sky" }} decor={decor} avatar={ctx.child.avatar_config} />
    </div>
  );
}
