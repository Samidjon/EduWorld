"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { MatchingQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import type { QuestionTypeProps } from "./types";
import { CheckButton, PAIR_COLORS, Shake, areaCls, choiceCls, shuffledIndexes, tileCls } from "./shared";
import { ql } from "./labels";

/**
 * Left column fixed, right column shuffled. Tap a left card then a right card (or the other way round)
 * to pair them; paired cards share a colour. Tapping a paired card selects it again to re-pair.
 * Answer: { [leftIndex]: rightOriginalIndex }.
 */
export default function Matching({ q, onSubmit, disabled, status }: QuestionTypeProps<MatchingQ>) {
  const { tl, locale, young } = useT();
  const n = q.pairs.length;
  const rightOrder = useMemo(() => shuffledIndexes(n, q.id, true), [q.id, n]);
  /** left index -> right original index */
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [selRight, setSelRight] = useState<number | null>(null);

  const leftOfRight = (r: number): number | null => {
    for (const [l, rr] of Object.entries(pairs)) if (rr === r) return Number(l);
    return null;
  };

  const link = (l: number, r: number) => {
    setPairs((p) => {
      const next: Record<number, number> = {};
      for (const [k, v] of Object.entries(p)) if (Number(k) !== l && v !== r) next[Number(k)] = v;
      next[l] = r;
      return next;
    });
    setSelLeft(null);
    setSelRight(null);
    sfx("click");
  };

  const tapLeft = (l: number) => {
    if (disabled) return;
    if (selRight !== null) return link(l, selRight);
    setSelLeft((s) => (s === l ? null : l));
  };
  const tapRight = (r: number) => {
    if (disabled) return;
    if (selLeft !== null) return link(selLeft, r);
    setSelRight((s) => (s === r ? null : r));
  };

  const allPaired = Object.keys(pairs).length === n;

  const colorStyle = (leftIdx: number | null): CSSProperties | undefined => {
    if (leftIdx === null || status) return undefined;
    const c = PAIR_COLORS[leftIdx % PAIR_COLORS.length];
    return { borderColor: c, backgroundColor: `${c}33`, boxShadow: `inset 6px 0 0 ${c}` };
  };

  const submit = () => {
    const out: Record<string, number> = {};
    for (const [l, r] of Object.entries(pairs)) out[String(l)] = r;
    onSubmit({ type: "matching", pairs: out });
  };

  const cardCls = cn(tileCls(young), "w-full text-left break-words hyphens-auto border-2");

  return (
    <div className="space-y-4">
      <p className={cn("text-center text-white/75", young ? "text-lg" : "text-sm")}>{ql(locale, "matchHint")}</p>
      <Shake status={status}>
        <div className={cn("grid grid-cols-2 gap-2 rounded-3xl p-1 sm:gap-4", areaCls(status))}>
          <div role="group" className="flex min-w-0 flex-col gap-2">
            {q.pairs.map((p, l) => {
              const paired = pairs[l] !== undefined;
              const sel = selLeft === l;
              const partner = paired ? q.pairs[pairs[l]] : undefined;
              return (
                <button
                  key={l}
                  type="button"
                  disabled={disabled}
                  aria-pressed={sel}
                  aria-label={`${tl(p.left)}${partner ? ` - ${ql(locale, "pairedWith")} ${tl(partner.right)}` : ""}`}
                  onClick={() => tapLeft(l)}
                  style={colorStyle(paired ? l : null)}
                  className={cn(cardCls, choiceCls(sel, null))}
                >
                  {tl(p.left)}
                </button>
              );
            })}
          </div>
          <div role="group" className="flex min-w-0 flex-col gap-2">
            {rightOrder.map((r) => {
              const l = leftOfRight(r);
              const sel = selRight === r;
              return (
                <button
                  key={r}
                  type="button"
                  disabled={disabled}
                  aria-pressed={sel}
                  aria-label={`${tl(q.pairs[r].right)}${l !== null ? ` - ${ql(locale, "pairedWith")} ${tl(q.pairs[l].left)}` : ""}`}
                  onClick={() => tapRight(r)}
                  style={colorStyle(l)}
                  className={cn(cardCls, choiceCls(sel, null))}
                >
                  {tl(q.pairs[r].right)}
                </button>
              );
            })}
          </div>
        </div>
      </Shake>
      <div className="flex justify-center">
        <CheckButton disabled={disabled || !allPaired} onClick={submit} />
      </div>
    </div>
  );
}
