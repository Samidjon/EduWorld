"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AvatarConfig } from "@/types/db";
import type { GameItem } from "@/types/content";
import { AvatarView, FUR_COLORS, OUTFIT_COLORS } from "./AvatarView";
import { Button, ErrorNote } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { api } from "@/lib/client";
import { sfx } from "@/lib/audio";

const BASES: { id: AvatarConfig["base"]; emoji: string }[] = [
  { id: "fox", emoji: "🦊" }, { id: "bunny", emoji: "🐰" }, { id: "bear", emoji: "🐻" }, { id: "owl", emoji: "🦉" }, { id: "cat", emoji: "🐱" }, { id: "panda", emoji: "🐼" },
];
const SLOTS = ["hat", "outfit", "accessory", "shoes", "pet"] as const;
const SLOT_LABEL: Record<(typeof SLOTS)[number], { en: string; ru: string }> = {
  hat: { en: "Hats", ru: "Головные уборы" }, outfit: { en: "Clothes", ru: "Одежда" }, accessory: { en: "Accessories", ru: "Аксессуары" }, shoes: { en: "Shoes", ru: "Обувь" }, pet: { en: "Pets", ru: "Питомцы" },
};

export function AvatarEditor({ initial, owned }: { initial: AvatarConfig; owned: GameItem[] }) {
  const { t, tl, locale } = useT();
  const router = useRouter();
  const [cfg, setCfg] = useState<AvatarConfig>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const set = (patch: Partial<AvatarConfig>) => { sfx("click"); setCfg((c) => ({ ...c, ...patch })); setState("idle"); };
  const L = (o: { en: string; ru: string }) => (locale === "en" ? o.en : o.ru);

  async function save() {
    setState("saving");
    try {
      await api("/api/play/avatar", cfg);
      setState("saved");
      sfx("correct");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-[280px_1fr]">
      <div className="glass sticky top-24 h-fit rounded-[2rem] p-5 text-center">
        <div className="mx-auto w-fit rounded-[2rem] bg-gradient-to-b from-sky/30 to-lavender/30 p-4"><AvatarView config={cfg} size={170} /></div>
        <Button className="mt-4 w-full" variant="sun" loading={state === "saving"} onClick={save}>{state === "saved" ? `✓ ${t("saved")}` : t("save")}</Button>
        {state === "error" && <div className="mt-2"><ErrorNote>{t("errorGeneric")}</ErrorNote></div>}
      </div>
      <div className="space-y-5">
        <section>
          <h2 className="mb-2 font-display text-xl">{locale === "en" ? "Who are you?" : "Кто ты?"}</h2>
          <div className="flex flex-wrap gap-2">
            {BASES.map((b) => (
              <button key={b.id} onClick={() => set({ base: b.id })} aria-pressed={cfg.base === b.id} className={cn("grid size-16 place-items-center rounded-2xl text-3xl", cfg.base === b.id ? "bg-white/25 ring-2 ring-sun" : "glass")}>{b.emoji}</button>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-2 font-display text-xl">{locale === "en" ? "Colours" : "Цвета"}</h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="fur colour">
            {FUR_COLORS.map((c) => <button key={c} aria-label={c} aria-pressed={cfg.furColor === c} onClick={() => set({ furColor: c })} className={cn("size-11 rounded-full border-4", cfg.furColor === c ? "border-sun" : "border-white/20")} style={{ background: c }} />)}
          </div>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="outfit colour">
            {OUTFIT_COLORS.map((c) => <button key={c} aria-label={c} aria-pressed={cfg.outfitColor === c && !cfg.outfit} onClick={() => set({ outfitColor: c, outfit: null })} className={cn("size-11 rounded-2xl border-4", cfg.outfitColor === c && !cfg.outfit ? "border-sun" : "border-white/20")} style={{ background: c }} />)}
          </div>
        </section>
        <section>
          <h2 className="mb-2 font-display text-xl">{locale === "en" ? "Face" : "Выражение"}</h2>
          <div className="flex gap-2">
            {(["happy", "wink", "cool"] as const).map((e) => <button key={e} onClick={() => set({ expression: e })} aria-pressed={cfg.expression === e} className={cn("rounded-2xl px-4 py-2 text-2xl", cfg.expression === e ? "bg-white/25 ring-2 ring-sun" : "glass")}>{{ happy: "😊", wink: "😉", cool: "😎" }[e]}</button>)}
          </div>
        </section>
        {SLOTS.map((slot) => {
          const items = owned.filter((i) => i.type === slot);
          return (
            <section key={slot}>
              <h2 className="mb-2 font-display text-xl">{L(SLOT_LABEL[slot])}</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => set({ [slot]: null })} aria-pressed={!cfg[slot]} className={cn("rounded-2xl px-4 py-2 text-sm font-bold", !cfg[slot] ? "bg-white/25 ring-2 ring-sun" : "glass")}>{locale === "en" ? "None" : "Без"}</button>
                {items.map((i) => (
                  <button key={i.id} onClick={() => set({ [slot]: i.id })} aria-pressed={cfg[slot] === i.id} className={cn("rounded-2xl px-3 py-2 text-sm font-bold", cfg[slot] === i.id ? "bg-white/25 ring-2 ring-sun" : "glass")}>
                    {i.art.startsWith("#") ? <span className="mr-1 inline-block size-3 rounded-full align-middle" style={{ background: i.art }} /> : i.art.length <= 3 ? `${i.art} ` : ""}
                    {tl(i.name)}
                  </button>
                ))}
                {!items.length && <span className="text-sm opacity-60">{locale === "en" ? "Earn or buy items in the shop!" : "Получай награды или покупай в магазине!"}</span>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
