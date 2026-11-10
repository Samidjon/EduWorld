"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import type { QuestionTypeProps } from "./types";

export type Status = QuestionTypeProps["status"];

/* ---------------- Stable shuffling ---------------- */

/** FNV-1a string hash -> 32-bit seed. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG. */
export function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic permutation of 0..n-1 seeded by a string (usually q.id).
 * `avoidIdentity` rotates the result when it happens to equal the original order,
 * so ordering-style questions never show the solution as the starting state.
 */
export function shuffledIndexes(n: number, seed: string, avoidIdentity = false): number[] {
  const rnd = seededRandom(hashString(seed));
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = idx[i];
    idx[i] = idx[j];
    idx[j] = tmp;
  }
  if (avoidIdentity && n > 1 && idx.every((v, i) => v === i)) {
    const first = idx.shift();
    if (first !== undefined) idx.push(first);
  }
  return idx;
}

/* ---------------- Retry handling ---------------- */

/** Runs `onReset` (synchronously, during render) whenever `resetKey` changes. */
export function useOnReset(resetKey: number, onReset: () => void) {
  const [seen, setSeen] = useState(resetKey);
  if (seen !== resetKey) {
    setSeen(resetKey);
    onReset();
  }
}

/* ---------------- Visual helpers ---------------- */

/** Gentle horizontal wobble when the answer was wrong. */
export function Shake({ status, className, children }: { status: Status; className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      animate={status === "wrong" ? { x: [0, -10, 10, -6, 6, -2, 0] } : { x: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Base look of a tappable card on the dark glass theme. */
export function tileCls(young: boolean): string {
  return cn(
    "glass rounded-3xl text-white font-semibold transition select-none",
    "disabled:cursor-default enabled:active:scale-[0.98]",
    young ? "min-h-16 px-5 py-3 text-xl" : "min-h-12 px-4 py-2.5 text-base sm:text-lg",
  );
}

/** Highlight for a card: selected / correct / wrong. Status colours only apply to selected cards. */
export function choiceCls(selected: boolean, status: Status): string {
  if (selected && status === "correct") return "bg-mint/30! ring-4 ring-mint border-mint!";
  if (selected && status === "wrong") return "bg-coral/20! ring-4 ring-coral/70 border-coral/60!";
  if (selected) return "bg-white/20! ring-4 ring-sun border-sun/70!";
  return "enabled:hover:bg-white/15!";
}

/** Highlight for a whole answer area (used when the answer is a composition, not a single choice). */
export function areaCls(status: Status): string {
  if (status === "correct") return "ring-4 ring-mint bg-mint/15";
  if (status === "wrong") return "ring-4 ring-coral/60 bg-coral/10";
  return "";
}

export function CheckButton({ onClick, disabled, label, icon }: { onClick: () => void; disabled: boolean; label?: string; icon?: ReactNode }) {
  const { t, young } = useT();
  return (
    <Button
      type="button"
      variant="sun"
      size={young ? "xl" : "lg"}
      onClick={onClick}
      disabled={disabled}
      icon={icon ?? <Check className="size-5" aria-hidden />}
      className="w-full sm:w-auto sm:min-w-44"
    >
      {label ?? t("check")}
    </Button>
  );
}

/** Pair colours for matching (inline styles so Tailwind does not need to see dynamic classes). */
export const PAIR_COLORS = ["#ffd76b", "#9bddb7", "#b8a5ef", "#a8d8f0", "#ff967d", "#f7a8d8", "#c6e86b", "#ffb86b", "#7fd6e8", "#e0c3ff"];
