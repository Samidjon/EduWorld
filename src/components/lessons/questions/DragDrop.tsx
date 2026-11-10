"use client";

import { useMemo, useState, type DragEvent } from "react";
import type { DragDropQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import type { QuestionTypeProps } from "./types";
import { CheckButton, Shake, areaCls, choiceCls, shuffledIndexes, tileCls } from "./shared";
import { ql } from "./labels";

const POOL = "__pool__";

/**
 * Sort items into buckets. Works by tap (tap item, then tap a bucket / the card area)
 * and by HTML5 drag-and-drop on desktop. Placement is kept after a wrong answer.
 */
export default function DragDrop({ q, onSubmit, disabled, status }: QuestionTypeProps<DragDropQ>) {
  const { t, tl, locale, young } = useT();
  const order = useMemo(() => shuffledIndexes(q.items.length, q.id), [q.id, q.items.length]);
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const items = order.map((i) => q.items[i]);
  const pool = items.filter((it) => !placement[it.id]);
  const allPlaced = q.items.every((it) => placement[it.id]);

  const place = (itemId: string, target: string) => {
    setPlacement((p) => {
      const next = { ...p };
      if (target === POOL) delete next[itemId];
      else next[itemId] = target;
      return next;
    });
    setSelected(null);
    sfx("click");
  };

  const tapItem = (id: string) => {
    if (disabled) return;
    setSelected((s) => (s === id ? null : id));
  };
  const tapTarget = (target: string) => {
    if (disabled || !selected) return;
    place(selected, target);
  };

  const dragProps = (id: string) => ({
    draggable: !disabled,
    onDragStart: (e: DragEvent<HTMLButtonElement>) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      setSelected(id);
    },
    onDragEnd: () => setOver(null),
  });
  const dropProps = (target: string) => ({
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (disabled) return;
      e.preventDefault();
      setOver(target);
    },
    onDragLeave: () => setOver((o) => (o === target ? null : o)),
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      setOver(null);
      const id = e.dataTransfer.getData("text/plain");
      if (!disabled && q.items.some((it) => it.id === id)) place(id, target);
    },
  });

  const itemBtn = (it: DragDropQ["items"][number], inBucket: string | null) => {
    const sel = selected === it.id;
    const bucket = inBucket ? q.buckets.find((b) => b.id === inBucket) : undefined;
    return (
      <button
        key={it.id}
        type="button"
        disabled={disabled}
        aria-pressed={sel}
        aria-label={`${tl(it.label)}${bucket ? ` - ${ql(locale, "placedIn")} ${tl(bucket.label)}` : ""}${sel ? ` (${ql(locale, "selected")})` : ""}`}
        onClick={() => tapItem(it.id)}
        {...dragProps(it.id)}
        className={cn(tileCls(young), "max-w-full break-words cursor-grab", choiceCls(sel, null), young ? "min-w-16" : "")}
      >
        {tl(it.label)}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <p className={cn("text-center text-white/75", young ? "text-lg" : "text-sm")}>{t("tapToPlace")}</p>

      {/* card pool (also a drop target to take a card back) */}
      <div
        role="group"
        aria-label={ql(locale, "itemsLeft")}
        onClick={(e) => {
          if (e.target === e.currentTarget) tapTarget(POOL);
        }}
        {...dropProps(POOL)}
        className={cn(
          "flex min-h-20 flex-wrap justify-center gap-2 rounded-3xl border-2 border-dashed border-white/15 p-3 transition",
          over === POOL && "border-sun/70 bg-white/5",
        )}
      >
        {pool.map((it) => itemBtn(it, null))}
        {pool.length === 0 && selected && (
          <button type="button" onClick={() => tapTarget(POOL)} className="rounded-2xl px-4 py-2 text-sm text-white/70 hover:bg-white/10">
            {ql(locale, "removeItem")}
          </button>
        )}
      </div>

      <Shake status={status}>
        <div className={cn("grid gap-3", q.buckets.length >= 2 ? "sm:grid-cols-2" : "", q.buckets.length >= 3 ? "lg:grid-cols-3" : "")}>
          {q.buckets.map((b) => {
            const inside = items.filter((it) => placement[it.id] === b.id);
            const ready = !!selected && !disabled;
            return (
              <div
                key={b.id}
                {...dropProps(b.id)}
                className={cn(
                  "glass flex flex-col gap-2 rounded-3xl p-3 transition",
                  ready && "ring-2 ring-sun/50",
                  over === b.id && "ring-4 ring-sun",
                  areaCls(status),
                )}
              >
                <button
                  type="button"
                  disabled={disabled || !selected}
                  onClick={() => tapTarget(b.id)}
                  aria-label={`${tl(b.label)}${selected ? ` - ${t("dragHere")}` : ""}`}
                  className={cn(
                    "w-full rounded-2xl bg-white/10 px-3 font-display font-semibold text-white transition enabled:hover:bg-white/20 disabled:cursor-default",
                    young ? "min-h-16 text-xl" : "min-h-12 text-lg",
                  )}
                >
                  {tl(b.label)}
                </button>
                <div className="flex min-h-14 flex-wrap gap-2">
                  {inside.map((it) => itemBtn(it, b.id))}
                  {inside.length === 0 && <span className="m-auto text-sm text-white/45">{t("dragHere")}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Shake>

      <div className="flex justify-center">
        <CheckButton disabled={disabled || !allPlaced} onClick={() => onSubmit({ type: "drag_drop", placement: { ...placement } })} />
      </div>
    </div>
  );
}
