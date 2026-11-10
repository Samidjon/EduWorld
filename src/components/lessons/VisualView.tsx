"use client";

import type { Visual } from "@/types/content";
import { useT } from "@/components/shared/LocaleProvider";

/** Renders a lesson/question visual example (emoji groups, fractions, number lines, code...). */
export function VisualView({ v }: { v: Visual }) {
  const { tl } = useT();
  const caption = "caption" in v && v.caption ? <p className="mt-2 text-center text-sm opacity-80">{tl(v.caption)}</p> : null;
  switch (v.kind) {
    case "emoji":
      return (
        <div>
          <div className="flex flex-wrap justify-center gap-2 text-4xl" aria-label={`${v.items.length}`}>{v.items.map((e, i) => <span key={i}>{e}</span>)}</div>
          {caption}
        </div>
      );
    case "groups":
      return (
        <div>
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: v.groups }, (_, g) => (
              <div key={g} className="flex flex-wrap justify-center gap-1 rounded-2xl border-2 border-dashed border-white/30 p-2 text-2xl max-w-32">
                {Array.from({ length: v.per }, (_, i) => <span key={i}>{v.emoji}</span>)}
              </div>
            ))}
          </div>
          {caption}
        </div>
      );
    case "equation":
      return <div><p className="text-center font-display text-4xl tracking-wide">{v.text}</p>{caption}</div>;
    case "fraction": {
      const r = 46, cx = 50, cy = 50;
      return (
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 100 100" className="size-32" role="img" aria-label={`${v.num}/${v.den}`}>
            {Array.from({ length: v.den }, (_, i) => {
              const a0 = (i / v.den) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / v.den) * 2 * Math.PI - Math.PI / 2;
              const large = a1 - a0 > Math.PI ? 1 : 0;
              const d = v.den === 1 ? `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z` : `M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`;
              return <path key={i} d={d} fill={i < v.num ? "#FFD76B" : "rgba(255,255,255,0.12)"} stroke="#1b2250" strokeWidth="2" />;
            })}
          </svg>
          <p className="font-display text-2xl">{v.num}/{v.den}</p>
          {caption}
        </div>
      );
    }
    case "numberline": {
      const span = v.to - v.from || 1;
      const x = (n: number) => 10 + ((n - v.from) / span) * 280;
      return (
        <div>
          <svg viewBox="0 0 300 60" className="w-full max-w-lg mx-auto" role="img" aria-label="number line">
            <line x1="5" y1="30" x2="295" y2="30" stroke="white" strokeWidth="2" />
            {Array.from({ length: span + 1 }, (_, i) => v.from + i).filter((n) => span <= 20 || n % 5 === 0).map((n) => (
              <g key={n}><line x1={x(n)} y1="24" x2={x(n)} y2="36" stroke="white" strokeWidth="1.5" /><text x={x(n)} y="52" fontSize="9" fill="white" textAnchor="middle">{n}</text></g>
            ))}
            {v.marks.map((m) => <circle key={m} cx={x(m)} cy="30" r="6" fill="#FFD76B" />)}
          </svg>
          {caption}
        </div>
      );
    }
    case "text":
      return <div className="rounded-2xl bg-cream/95 p-4 text-ink leading-relaxed whitespace-pre-line">{tl(v.text)}</div>;
    case "code":
      return <div><pre className="overflow-x-auto rounded-2xl bg-black/50 p-4 text-sm text-mint"><code>{v.code}</code></pre>{caption}</div>;
  }
}
