import { cn } from "@/lib/cn";

export interface BarDatum {
  key: string;
  /** Short axis label (may be empty to skip). */
  label: string;
  value: number;
  /** Full accessible description of the bar. */
  title: string;
}

/**
 * Minimal CSS bar chart (no chart library). Rendered as a list so screen readers get each value.
 * The numeric value is printed above every bar when there is room (`showValues`).
 */
export function Bars({ data, color = "#5799E8", height = 140, showValues = true, ariaLabel }: { data: BarDatum[]; color?: string; height?: number; showValues?: boolean; ariaLabel: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul aria-label={ariaLabel} className="flex items-end gap-1 sm:gap-1.5" style={{ height: height + 40 }}>
      {data.map((d) => {
        const h = Math.round((d.value / max) * height);
        return (
          <li key={d.key} className="flex min-w-0 flex-1 flex-col items-center justify-end" title={d.title}>
            <span className="sr-only">{d.title}</span>
            {showValues && <span aria-hidden className={cn("mb-1 text-[10px] font-bold text-slate-500", d.value === 0 && "opacity-0")}>{d.value}</span>}
            <span aria-hidden className="w-full max-w-10 rounded-t-lg" style={{ height: Math.max(h, d.value > 0 ? 4 : 2), backgroundColor: d.value > 0 ? color : "#E2E8F0" }} />
            <span aria-hidden className="mt-1 h-4 w-full truncate text-center text-[10px] font-semibold text-slate-500">{d.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Horizontal percentage bar (e.g. accuracy by subject). */
export function PercentBar({ value, color = "#5799E8", label }: { value: number; color?: string; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}
