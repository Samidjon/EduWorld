"use client";

import { useRouter } from "next/navigation";
import { Coin } from "@/components/shared/Coin";
import { useState } from "react";
import type { GameItem } from "@/types/content";
import { ItemIcon, RARITY } from "./ItemCard";
import { Button, Modal } from "@/components/ui";
import { useT } from "@/components/shared/LocaleProvider";
import { api, ApiError } from "@/lib/client";
import { sfx } from "@/lib/audio";

/** Cosmetic shop. Coins are earned by learning; nothing here gives a learning advantage. */
export function Shop({ items, owned, coins }: { items: GameItem[]; owned: string[]; coins: number }) {
  const { t, tl, locale } = useT();
  const router = useRouter();
  const [confirm, setConfirm] = useState<GameItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [balance, setBalance] = useState(coins);
  const [mine, setMine] = useState(new Set(owned));

  async function buy(item: GameItem) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await api<{ coins: number }>("/api/play/buy", { itemId: item.id });
      setBalance(r.coins);
      setMine((s) => new Set(s).add(item.id));
      sfx("coin");
      setConfirm(null);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError && e.code === "not_enough_coins" ? (locale === "en" ? "Not enough coins yet - finish a lesson to earn more!" : "Пока не хватает монет - пройди урок, чтобы заработать!") : t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  const groups = ["hat", "outfit", "accessory", "shoes", "pet", "decor"] as const;
  const groupName = { hat: ["Hats", "Головные уборы"], outfit: ["Clothes", "Одежда"], accessory: ["Accessories", "Аксессуары"], shoes: ["Shoes", "Обувь"], pet: ["Pets", "Питомцы"], decor: ["Room decor", "Для комнаты"] } as const;

  return (
    <div className="space-y-5">
      <p className="glass inline-block rounded-full px-4 py-2 font-display text-xl"><Coin size={20} /> {balance}</p>
      {groups.map((g) => (
        <section key={g}>
          <h2 className="mb-2 font-display text-xl">{groupName[g][locale === "en" ? 0 : 1]}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.filter((i) => i.type === g).map((i) => {
              const have = mine.has(i.id);
              return (
                <div key={i.id} className="glass flex flex-col items-center gap-2 rounded-3xl p-3 text-center">
                  <ItemIcon item={i} size={56} />
                  <p className="text-sm font-bold leading-tight">{tl(i.name)}</p>
                  <span className="text-[11px] font-bold uppercase" style={{ color: RARITY[i.rarity].color }}>{locale === "en" ? RARITY[i.rarity].en : RARITY[i.rarity].ru}</span>
                  {have ? (
                    <span className="text-sm opacity-80">✓ {locale === "en" ? "Owned" : "Есть"}</span>
                  ) : (
                    <Button size="sm" variant={balance >= i.price ? "sun" : "glass"} onClick={() => { setMsg(null); setConfirm(i); }}><Coin size={14} /> {i.price}</Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm ? tl(confirm.name) : ""}>
        {confirm && (
          <div className="space-y-3 text-center">
            <div className="flex justify-center"><ItemIcon item={confirm} size={80} /></div>
            <p>{locale === "en" ? `Buy for ${confirm.price} coins?` : `Купить за ${confirm.price} монет?`}</p>
            {msg && <p className="text-sm text-coral">{msg}</p>}
            <div className="flex justify-center gap-2">
              <Button variant="glass" onClick={() => setConfirm(null)}>{t("cancel")}</Button>
              <Button variant="sun" loading={busy} onClick={() => buy(confirm)}><Coin size={14} /> {confirm.price}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
