"use client";

import { useMemo, useState } from "react";
import { Eraser, Undo2 } from "lucide-react";
import type { WordBuildingQ } from "@/types/content";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import type { QuestionTypeProps } from "./types";
import { CheckButton, Shake, areaCls, shuffledIndexes } from "./shared";
import { ql } from "./labels";

/**
 * Shuffled letter tiles of tl(q.word); tap them in order. Undo removes the last letter,
 * Clear removes all. Letters are shown upper-case (so a capital first letter is no clue).
 * The built word is kept on retry - the child can undo the wrong letters.
 */
export default function WordBuilding({ q, onSubmit, disabled, status }: QuestionTypeProps<WordBuildingQ>) {
  const { t, tl, locale, young } = useT();
  const word = tl(q.word);
  const letters = useMemo(() => Array.from(word.replace(/\s+/g, "")).map((c) => c.toLocaleUpperCase()), [word]);
  const tiles = useMemo(() => {
    let order = shuffledIndexes(letters.length, `${q.id}:${locale}`, true);
    // if the shuffle still spells the word (repeated letters), rotate until it doesn't (when possible)
    const spelled = (o: number[]) => o.map((i) => letters[i]).join("") === letters.join("");
    for (let k = 0; k < letters.length && spelled(order); k++) order = [...order.slice(1), order[0]];
    return order;
  }, [letters, q.id, locale]);
  const [picked, setPicked] = useState<number[]>([]);

  const tap = (i: number) => {
    if (disabled || picked.includes(i)) return;
    sfx("click");
    setPicked((p) => [...p, i]);
  };

  const built = picked.map((i) => letters[i]).join("");
  const done = picked.length === letters.length && letters.length > 0;
  const tileSize = young ? "size-16 text-3xl" : "size-12 text-2xl sm:size-14";

  return (
    <div className="space-y-4">
      <p className={cn("text-center text-white/75", young ? "text-lg" : "text-sm")}>{ql(locale, "tapLetters")}</p>

      <Shake status={status}>
        <div
          aria-label={`${ql(locale, "yourWord")}: ${built || ql(locale, "emptySlot")}`}
          aria-live="polite"
          role="status"
          className={cn("flex min-h-16 flex-wrap justify-center gap-1.5 rounded-3xl border-2 border-dashed border-white/15 p-2", areaCls(status))}
        >
          {letters.map((_, slot) => {
            const idx = picked[slot];
            const ch = idx !== undefined ? letters[idx] : "";
            return (
              <span
                key={slot}
                aria-hidden
                className={cn(
                  "grid place-items-center rounded-2xl font-display font-bold",
                  young ? "size-14 text-3xl" : "size-11 text-2xl",
                  ch ? "bg-sun text-[#4a3505]" : "border-2 border-white/20 bg-white/5",
                )}
              >
                {ch}
              </span>
            );
          })}
        </div>
      </Shake>

      <div role="group" aria-label={ql(locale, "letter")} className="flex flex-wrap justify-center gap-2">
        {tiles.map((i, pos) => {
          const used = picked.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={disabled || used}
              onClick={() => tap(i)}
              aria-label={`${ql(locale, "letter")} ${letters[i]} (${pos + 1})`}
              className={cn(
                "glass grid place-items-center rounded-2xl font-display font-bold text-white transition enabled:hover:bg-white/15! enabled:active:scale-95",
                tileSize,
                used && "opacity-25",
              )}
            >
              {letters[i]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="glass"
          size={young ? "lg" : "md"}
          disabled={disabled || picked.length === 0}
          onClick={() => setPicked((p) => p.slice(0, -1))}
          icon={<Undo2 className="size-5" aria-hidden />}
        >
          {ql(locale, "undo")}
        </Button>
        <Button
          type="button"
          variant="glass"
          size={young ? "lg" : "md"}
          disabled={disabled || picked.length === 0}
          onClick={() => setPicked([])}
          icon={<Eraser className="size-5" aria-hidden />}
        >
          {t("clear")}
        </Button>
      </div>

      <div className="flex justify-center">
        <CheckButton disabled={disabled || !done} onClick={() => onSubmit({ type: "word_building", text: built.toLocaleLowerCase() })} />
      </div>
    </div>
  );
}
