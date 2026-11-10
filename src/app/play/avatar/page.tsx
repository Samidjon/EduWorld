import { requireChild } from "@/services/context";
import { getItem } from "@/data/items";
import { AvatarEditor } from "@/components/avatar/AvatarEditor";
import { DEFAULT_AVATAR } from "@/components/avatar/AvatarView";
import { ut } from "@/lib/i18n/ui";
import type { GameItem, Locale } from "@/types/content";

export default async function AvatarPage() {
  const ctx = await requireChild();
  const inv = await ctx.store.select("inventory", { child_id: ctx.child.id });
  const owned = inv.map((i) => getItem(i.item_id)).filter((x): x is GameItem => !!x);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">🎨 {ut(ctx.child.interface_language as Locale, "navAvatar")}</h1>
      <AvatarEditor initial={{ ...DEFAULT_AVATAR, ...ctx.child.avatar_config }} owned={owned} />
    </div>
  );
}
