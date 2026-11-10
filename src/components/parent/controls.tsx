"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Toggle chip (single or multi select). Uses aria-pressed so screen readers announce the state. */
export function Chip({ selected, onClick, children, className, big, label }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string; big?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl border font-bold transition focus-visible:ring-4 focus-visible:ring-brand-blue/20",
        big ? "h-16 min-w-16 px-4 text-xl" : "min-h-11 px-4 py-2 text-sm",
        selected ? "border-brand-blue bg-brand-blue text-white shadow-sm" : "border-slate-200 bg-white text-ink hover:border-brand-blue/50 hover:bg-slate-50",
        className,
      )}
    >
      {selected && !big && <Check className="size-4" aria-hidden />}
      {children}
    </button>
  );
}

/** Accessible on/off switch with a label and optional hint. */
export function Toggle({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="font-bold">{label}</p>
        {hint && <p className="text-sm text-slate-500">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn("relative h-8 w-14 shrink-0 rounded-full transition disabled:opacity-50", checked ? "bg-brand-blue" : "bg-slate-300")}
      >
        <span className={cn("absolute top-1 size-6 rounded-full bg-white shadow transition-all", checked ? "left-7" : "left-1")} />
      </button>
    </div>
  );
}

export function SuccessNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
      <Check className="size-4" aria-hidden />
      {children}
    </p>
  );
}

export function Swatch({ color, selected, onClick, label }: { color: string; selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      className={cn("size-11 rounded-full border-4 transition", selected ? "border-brand-blue scale-110" : "border-white shadow ring-1 ring-slate-200")}
      style={{ backgroundColor: color }}
    />
  );
}
