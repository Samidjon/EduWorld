"use client";

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";

export { cn } from "@/lib/cn";
import { cn } from "@/lib/cn";

type Variant = "primary" | "sun" | "mint" | "coral" | "glass" | "ghost" | "light" | "danger";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-gradient-to-b from-[#6aa9f2] to-[#3f7fdc] text-white shadow-[var(--shadow-button)]",
  sun: "bg-gradient-to-b from-[#ffe08a] to-[#f7bf3c] text-[#4a3505] shadow-[var(--shadow-button)]",
  mint: "bg-gradient-to-b from-[#a9e8c4] to-[#5fc79a] text-[#0f3d2a] shadow-[var(--shadow-button)]",
  coral: "bg-gradient-to-b from-[#ffad97] to-[#ff7a5c] text-white shadow-[var(--shadow-button)]",
  glass: "glass text-white hover:bg-white/15",
  ghost: "bg-transparent hover:bg-white/10 text-current",
  light: "bg-white text-ink border border-slate-200 hover:bg-slate-50 shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700",
};
const SIZES = { sm: "h-9 px-3 text-sm rounded-xl", md: "h-11 px-5 text-base rounded-2xl", lg: "h-14 px-7 text-lg rounded-2xl", xl: "h-16 px-8 text-xl rounded-3xl" };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof SIZES;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "primary", size = "md", loading, icon, className, children, disabled, ...rest }, ref) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide transition active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none select-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export function OrbButton({ className, children, label, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button aria-label={label} title={label} className={cn("btn-orb grid place-items-center rounded-full size-12 text-white transition active:scale-95", className)} {...rest}>
      {children}
    </button>
  );
}

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass rounded-4xl p-5 shadow-[var(--shadow-soft)]", className)} {...rest} />;
}

export function LightCard({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm", className)} {...rest} />;
}

export function Progress({ value, className, color = "#FFD76B", label }: { value: number; className?: string; color?: string; label?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} className={cn("h-3 w-full rounded-full bg-black/25 overflow-hidden", className)}>
      <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}, #fff6)` , backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${v * 100}%` }} transition={{ duration: 0.6 }} />
    </div>
  );
}

export function Ring({ value, size = 44, stroke = 5, color = "#5BC0F8", children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-bold">{children}</div>
    </div>
  );
}

export function Pill({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold", className)} {...rest} />;
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-6 animate-spin", className)} aria-label="Loading" />;
}

export function Modal({ open, onClose, children, title, light }: { open: boolean; onClose: () => void; children: ReactNode; title?: string; light?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn("relative w-full max-w-md rounded-4xl p-6 shadow-2xl max-h-[90dvh] overflow-y-auto", light ? "bg-white text-ink" : "bg-night-800 text-white border border-white/10")}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-1 opacity-70 hover:opacity-100">
              <X className="size-5" />
            </button>
            {title && <h2 className="font-display text-2xl mb-3 pr-8">{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p role="alert" className="rounded-xl bg-red-500/15 border border-red-400/40 px-3 py-2 text-sm text-red-700 dark:text-red-200">{children}</p>;
}

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-bold">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs opacity-70">{hint}</span>}
      {error && <span role="alert" className="block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export const inputCls = "w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-ink outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/20";
