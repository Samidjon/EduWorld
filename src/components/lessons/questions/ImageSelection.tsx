"use client";

import { useMemo, useState } from "react";
import type { ImageSelectionQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import type { QuestionTypeProps } from "./types";
import { Shake, choiceCls, shuffledIndexes, useOnReset } from "./shared";

/**
 * Big emoji tiles; submits the original option index on tap.
 * Identical emojis are distinct buttons (keyed by original index) and their accessible names
 * include the position on screen. Labels are not shown visually so the text does not give the answer away.
 */
export default function ImageSelection({ q, onSubmit, disabled, resetKey, status }: QuestionTypeProps<ImageSelectionQ>) {
  const { tl, young } = useT();
  const order = useMemo(() => shuffledIndexes(q.options.length, q.id), [q.id, q.options.length]);
  const [chosen, setChosen] = useState<number | null>(null);
  useOnReset(resetKey, () => setChosen(null));

  const pick = (i: number) => {
    if (disabled) return;
    sfx("click");
    setChosen(i);
    onSubmit({ type: "image_selection", index: i });
  };

  const cols = q.options.length === 4 ? "grid-cols-2" : q.options.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";

  return (
    <Shake status={status}>
      <div role="group" className={cn("grid gap-3", cols)}>
        {order.map((i, pos) => {
          const sel = chosen === i;
          const opt = q.options[i];
          const label = `${tl(opt.label)} (${pos + 1})`;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              aria-pressed={sel}
              aria-label={label}
              title={tl(opt.label)}
              onClick={() => pick(i)}
              className={cn(
                "glass relative grid aspect-square w-full place-items-center rounded-3xl transition select-none enabled:active:scale-95",
                young ? "min-h-28" : "min-h-24",
                choiceCls(sel, sel ? status : null),
              )}
            >
              <span aria-hidden className={cn("leading-none", young ? "text-6xl sm:text-7xl" : "text-5xl sm:text-6xl")}>
                {opt.emoji}
              </span>
              <span aria-hidden className="absolute left-2 top-2 grid size-6 place-items-center rounded-full bg-black/25 text-xs font-bold text-white/80">
                {pos + 1}
              </span>
            </button>
          );
        })}
      </div>
    </Shake>
  );
}
