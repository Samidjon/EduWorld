"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { OrderingQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import type { QuestionTypeProps } from "./types";
import { CheckButton, Shake, areaCls, shuffledIndexes, tileCls } from "./shared";
import { ql } from "./labels";

/**
 * Shuffled cards: tap a card to move it into the answer row, tap it there to take it back,
 * use the arrows to reorder. Answer = original indexes in the chosen order. Kept on retry.
 */
export default function Ordering({ q, onSubmit, disabled, status }: QuestionTypeProps<OrderingQ>) {
  const { tl, locale, young } = useT();
  const n = q.items.length;
  const shuffled = useMemo(() => shuffledIndexes(n, q.id, true), [q.id, n]);
  const [chosen, setChosen] = useState<number[]>([]);
  const pool = shuffled.filter((i) => !chosen.includes(i));

  const add = (i: number) => {
    if (disabled) return;
    sfx("click");
    setChosen((c) => [...c, i]);
  };
  const remove = (i: number) => {
    if (disabled) return;
    setChosen((c) => c.filter((x) => x !== i));
  };
  const move = (pos: number, delta: -1 | 1) => {
    if (disabled) return;
    setChosen((c) => {
      const to = pos + delta;
      if (to < 0 || to >= c.length) return c;
      const next = [...c];
      const tmp = next[pos];
      next[pos] = next[to];
      next[to] = tmp;
      return next;
    });
  };

  const arrowCls = cn(
    "grid shrink-0 place-items-center rounded-2xl bg-white/10 text-white transition enabled:hover:bg-white/20 disabled:opacity-30",
    young ? "size-16" : "size-11",
  );

  return (
    <div className="space-y-4">
      <p className={cn("text-center text-white/75", young ? "text-lg" : "text-sm")}>{ql(locale, "tapInOrder")}</p>

      {pool.length > 0 && (
        <div role="group" aria-label={ql(locale, "itemsLeft")} className="flex flex-wrap justify-center gap-2">
          {pool.map((i) => (
            <motion.button
              layout
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => add(i)}
              className={cn(tileCls(young), "max-w-full break-words enabled:hover:bg-white/15!")}
            >
              {tl(q.items[i])}
            </motion.button>
          ))}
        </div>
      )}

      <Shake status={status}>
        <ol aria-label={ql(locale, "yourOrder")} className={cn("space-y-2 rounded-3xl border-2 border-dashed border-white/15 p-2 min-h-20", areaCls(status))}>
          <AnimatePresence initial={false}>
            {chosen.map((i, pos) => (
              <motion.li
                layout
                key={i}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full bg-sun font-bold text-[#4a3505]", young ? "size-10 text-xl" : "size-8")}>
                  {pos + 1}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(i)}
                  aria-label={`${pos + 1}. ${tl(q.items[i])} - ${ql(locale, "removeItem")}`}
                  className={cn(tileCls(young), "min-w-0 flex-1 text-left break-words enabled:hover:bg-white/15!")}
                >
                  {tl(q.items[i])}
                </button>
                <button type="button" disabled={disabled || pos === 0} onClick={() => move(pos, -1)} aria-label={`${ql(locale, "moveUp")}: ${tl(q.items[i])}`} className={arrowCls}>
                  <ArrowUp className="size-5" aria-hidden />
                </button>
                <button type="button" disabled={disabled || pos === chosen.length - 1} onClick={() => move(pos, 1)} aria-label={`${ql(locale, "moveDown")}: ${tl(q.items[i])}`} className={arrowCls}>
                  <ArrowDown className="size-5" aria-hidden />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
          {chosen.length === 0 && <li className="grid min-h-14 place-items-center text-sm text-white/45">{ql(locale, "yourOrder")}</li>}
        </ol>
      </Shake>

      <div className="flex justify-center">
        <CheckButton disabled={disabled || chosen.length !== n} onClick={() => onSubmit({ type: "ordering", order: [...chosen] })} />
      </div>
    </div>
  );
}
