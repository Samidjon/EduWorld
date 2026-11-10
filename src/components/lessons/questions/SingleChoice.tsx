"use client";

import { useMemo, useState } from "react";
import type { SingleChoiceQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import type { QuestionTypeProps } from "./types";
import { Shake, choiceCls, shuffledIndexes, tileCls, useOnReset } from "./shared";

/** Option cards; submits on tap. */
export default function SingleChoice({ q, onSubmit, disabled, resetKey, status }: QuestionTypeProps<SingleChoiceQ>) {
  const { tl, young } = useT();
  const order = useMemo(() => shuffledIndexes(q.options.length, q.id), [q.id, q.options.length]);
  const [chosen, setChosen] = useState<number | null>(null);
  useOnReset(resetKey, () => setChosen(null));

  const pick = (i: number) => {
    if (disabled) return;
    sfx("click");
    setChosen(i);
    onSubmit({ type: "single", index: i });
  };

  return (
    <Shake status={status}>
      <div role="group" className={cn("grid gap-3", q.options.length > 2 && !young ? "sm:grid-cols-2" : "")}>
        {order.map((i) => {
          const sel = chosen === i;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              aria-pressed={sel}
              onClick={() => pick(i)}
              className={cn(tileCls(young), "w-full text-left break-words", choiceCls(sel, sel ? status : null))}
            >
              {tl(q.options[i])}
            </button>
          );
        })}
      </div>
    </Shake>
  );
}
