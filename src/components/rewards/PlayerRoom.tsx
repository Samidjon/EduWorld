"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { GameItem } from "@/types/content";
import type { AvatarConfig, GameProfileRow } from "@/types/db";
import { AvatarView } from "@/components/avatar/AvatarView";
import { Button, ErrorNote } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { api } from "@/lib/client";
import { sfx } from "@/lib/audio";

type Home = GameProfileRow["home_config"];
const WALLPAPERS: Record<Home["wallpaper"], string> = {
  sky: "linear-gradient(180deg,#bfe3ff 0%,#e8f4ff 62%,#e7c9a4 62%,#d9b48a 100%)",
  meadow: "linear-gradient(180deg,#d6f5dc 0%,#f1fbe9 62%,#c9a27a 62%,#b98f66 100%)",
  night: "linear-gradient(180deg,#2b3270 0%,#4b4f9a 62%,#6b4a3a 62%,#5a3d30 100%)",
  candy: "linear-gradient(180deg,#ffd6e8 0%,#fff0f6 62%,#e8b9a0 62%,#d9a68a 100%)",
};

/** Player Home: place owned decor anywhere in the room (tap to select, tap/drag to move). */
export function PlayerRoom({ initial, decor, avatar }: { initial: Home; decor: GameItem[]; avatar: AvatarConfig }) {
  const { t, tl, locale } = useT();
  const router = useRouter();
  const [home, setHome] = useState<Home>(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const room = useRef<HTMLDivElement>(null);
  const dragging = useRef<number | null>(null);

  const posFromEvent = (e: React.PointerEvent) => {
    const r = room.current!.getBoundingClientRect();
    return { x: Math.max(4, Math.min(96, ((e.clientX - r.left) / r.width) * 100)), y: Math.max(8, Math.min(94, ((e.clientY - r.top) / r.height) * 100)) };
  };
  const move = (i: number, p: { x: number; y: number }) => {
    setHome((h) => ({ ...h, placed: h.placed.map((it, j) => (j === i ? { ...it, ...p } : it)) }));
    setState("idle");
  };

  const add = (item: GameItem) => {
    if (home.placed.length >= 30) return;
    sfx("click");
    setHome((h) => ({ ...h, placed: [...h.placed, { itemId: item.id, x: 30 + Math.random() * 40, y: 60 + Math.random() * 25 }] }));
    setSelected(home.placed.length);
    setState("idle");
  };

  async function save() {
    setState("saving");
    try {
      await api("/api/play/home", home);
      setState("saved");
      sfx("correct");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  const art = (id: string) => decor.find((d) => d.id === id)?.art ?? "❓";

  return (
    <div className="space-y-4">
      <div
        ref={room}
        className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-[2rem] shadow-[var(--shadow-soft)]"
        style={{ background: WALLPAPERS[home.wallpaper] }}
        onPointerMove={(e) => dragging.current !== null && move(dragging.current, posFromEvent(e))}
        onPointerUp={() => (dragging.current = null)}
        onClick={(e) => { if (selected !== null && e.target === room.current) move(selected, posFromEvent(e as unknown as React.PointerEvent)); }}
        aria-label={locale === "en" ? "Your room" : "Твоя комната"}
      >
        <div className="absolute left-[8%] top-[10%] h-[30%] w-[22%] rounded-xl border-8 border-white/70 bg-sky/70" aria-hidden />
        <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2"><AvatarView config={avatar} size={110} /></div>
        {home.placed.map((p, i) => (
          <button
            key={i}
            className={cn("absolute -translate-x-1/2 -translate-y-1/2 text-5xl transition-transform", selected === i && "scale-125 drop-shadow-[0_0_8px_#FFD76B]")}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            onPointerDown={(e) => { e.stopPropagation(); setSelected(i); dragging.current = i; }}
            aria-label={tl(decor.find((d) => d.id === p.itemId)?.name)}
          >
            {art(p.itemId)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(WALLPAPERS) as Home["wallpaper"][]).map((w) => (
          <button key={w} onClick={() => { setHome((h) => ({ ...h, wallpaper: w })); setState("idle"); }} aria-pressed={home.wallpaper === w} aria-label={w} className={cn("size-10 rounded-xl border-4", home.wallpaper === w ? "border-sun" : "border-white/20")} style={{ background: WALLPAPERS[w] }} />
        ))}
        {selected !== null && (
          <Button size="sm" variant="coral" onClick={() => { setHome((h) => ({ ...h, placed: h.placed.filter((_, j) => j !== selected) })); setSelected(null); setState("idle"); }}>
            {locale === "en" ? "Remove" : "Убрать"}
          </Button>
        )}
        <Button className="ml-auto" variant="sun" loading={state === "saving"} onClick={save}>{state === "saved" ? `✓ ${t("saved")}` : t("save")}</Button>
      </div>
      {state === "error" && <ErrorNote>{t("errorGeneric")}</ErrorNote>}
      <section className="glass rounded-3xl p-4">
        <h2 className="font-display text-lg">{locale === "en" ? "Your decorations" : "Твои украшения"}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {decor.map((d) => <button key={d.id} onClick={() => add(d)} className="glass rounded-2xl px-3 py-2 text-sm font-bold">{d.art} {tl(d.name)}</button>)}
          {!decor.length && <p className="text-sm opacity-70">{locale === "en" ? "Get decorations in the shop or as rewards." : "Украшения можно получить в магазине или в награду."}</p>}
        </div>
      </section>
    </div>
  );
}
