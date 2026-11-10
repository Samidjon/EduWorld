"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import type { MultipleChoiceQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import type { QuestionTypeProps } from "./types";
import { CheckButton, Shake, choiceCls, shuffledIndexes, tileCls } from "./shared";

/** Toggle cards + Check. Selection is kept after a wrong answer so the child can adjust it. */
export default function MultipleChoice({ q, onSubmit, disabled, status }: QuestionTypeProps<MultipleChoiceQ>) {
  const { tl, young } = useT();
  const order = useMemo(() => shuffledIndexes(q.options.length, q.id), [q.id, q.options.length]);
  const [picked, setPicked] = useState<number[]>([]);

  const toggle = (i: number) => {
    if (disabled) return;
    sfx("click");
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };

  return (
    <div className="space-y-4">
      <Shake status={status}>
        <div role="group" className={cn("grid gap-3", !young ? "sm:grid-cols-2" : "")}>
          {order.map((i) => {
            const sel = picked.includes(i);
            return (
              <button
                key={i}
                type="button"
                role="checkbox"
                aria-checked={sel}
                disabled={disabled}
                onClick={() => toggle(i)}
                className={cn(tileCls(young), "w-full text-left flex items-center gap-3", choiceCls(sel, status))}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid shrink-0 place-items-center rounded-lg border-2 border-white/50",
                    young ? "size-8" : "size-6",
                    sel && "bg-sun border-sun text-[#4a3505]",
                  )}
                >
                  {sel && <Check className={young ? "size-6" : "size-4"} strokeWidth={3} />}
                </span>
                <span className="min-w-0 break-words">{tl(q.options[i])}</span>
              </button>
            );
          })}
        </div>
      </Shake>
      <div className="flex justify-center">
        <CheckButton disabled={disabled || picked.length === 0} onClick={() => onSubmit({ type: "multiple", indexes: [...picked].sort((a, b) => a - b) })} />
      </div>
    </div>
  );
}
