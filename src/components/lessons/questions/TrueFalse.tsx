"use client";

import { useState } from "react";
import type { TrueFalseQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import type { QuestionTypeProps } from "./types";
import { Shake, choiceCls, tileCls, useOnReset } from "./shared";

/** Two big buttons; submits on tap. */
export default function TrueFalse({ onSubmit, disabled, resetKey, status }: QuestionTypeProps<TrueFalseQ>) {
  const { t, young } = useT();
  const [chosen, setChosen] = useState<boolean | null>(null);
  useOnReset(resetKey, () => setChosen(null));

  const pick = (v: boolean) => {
    if (disabled) return;
    sfx("click");
    setChosen(v);
    onSubmit({ type: "true_false", value: v });
  };

  const opts: { v: boolean; emoji: string; label: string }[] = [
    { v: true, emoji: "👍", label: t("trueW") },
    { v: false, emoji: "👎", label: t("falseW") },
  ];

  return (
    <Shake status={status}>
      <div role="group" className="grid grid-cols-2 gap-3">
        {opts.map((o) => {
          const sel = chosen === o.v;
          return (
            <button
              key={String(o.v)}
              type="button"
              disabled={disabled}
              aria-pressed={sel}
              onClick={() => pick(o.v)}
              className={cn(
                tileCls(young),
                "flex flex-col items-center justify-center gap-1 font-display",
                young ? "min-h-32 text-2xl" : "min-h-24 text-xl",
                choiceCls(sel, sel ? status : null),
              )}
            >
              <span aria-hidden className={young ? "text-5xl" : "text-4xl"}>{o.emoji}</span>
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    </Shake>
  );
}
