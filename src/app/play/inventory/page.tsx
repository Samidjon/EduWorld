import Link from "next/link";
import { requireChild } from "@/services/context";
import { ITEMS } from "@/data/items";
import { ItemIcon, RARITY } from "@/components/rewards/ItemCard";
import { tx } from "@/lib/i18n/text";
import { ut } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";

/** Backpack + Collections: owned items and how many of each collection are found. */
export default async function InventoryPage() {
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  const inv = await ctx.store.select("inventory", { child_id: ctx.child.id });
  const owned = new Set(inv.map((i) => i.item_id));
  const groups = [
    { type: "hat", label: L === "en" ? "Hats" : "Головные уборы" },
    { type: "outfit", label: L === "en" ? "Clothes" : "Одежда" },
    { type: "accessory", label: L === "en" ? "Accessories" : "Аксессуары" },
    { type: "shoes", label: L === "en" ? "Shoes" : "Обувь" },
    { type: "pet", label: L === "en" ? "Pets" : "Питомцы" },
    { type: "decor", label: L === "en" ? "Room decor" : "Для комнаты" },
  ] as const;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">🎒 {ut(L, "navInventory")}</h1>
        <span className="glass rounded-full px-3 py-1 text-sm font-bold">{owned.size}/{ITEMS.length}</span>
        <Link href="/play/avatar" className="glass ml-auto rounded-full px-4 py-2 text-sm font-bold">🎨 {ut(L, "navAvatar")}</Link>
        <Link href="/play/home" className="glass rounded-full px-4 py-2 text-sm font-bold">🏠 {ut(L, "navHomeRoom")}</Link>
      </div>
      {groups.map((g) => {
        const all = ITEMS.filter((i) => i.type === g.type);
        const have = all.filter((i) => owned.has(i.id)).length;
        return (
          <section key={g.type} className="glass rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">{g.label}</h2>
              <span className="text-sm font-bold opacity-80">{L === "en" ? "Collection" : "Коллекция"} {have}/{all.length}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
              {all.map((i) => (
                <div key={i.id} className={`flex flex-col items-center gap-1 rounded-2xl p-2 text-center ${owned.has(i.id) ? "bg-white/10" : "opacity-40 grayscale"}`} title={tx(i.name, L)}>
                  <ItemIcon item={i} size={44} />
                  <span className="text-[11px] leading-tight">{owned.has(i.id) ? tx(i.name, L) : "???"}</span>
                  <span className="size-1.5 rounded-full" style={{ background: RARITY[i.rarity].color }} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
