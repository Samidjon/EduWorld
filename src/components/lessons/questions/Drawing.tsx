"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { Eraser } from "lucide-react";
import type { DrawingQ } from "@/types/content";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import type { QuestionTypeProps } from "./types";
import { CheckButton, Shake } from "./shared";
import { ql } from "./labels";

type Pt = [number, number];

/** Path coordinates are 0..100; a small margin keeps strokes near the edge drawable. */
const PAD = 6;
const VIEW = 100 + PAD * 2;
const SAMPLE_STEP = 3;
const RADIUS = 8; // ~8% of the 100-unit box

/** Points every `step` units along a polyline (including both ends). */
export function samplePolyline(path: Pt[], step = SAMPLE_STEP): Pt[] {
  if (path.length === 0) return [];
  const out: Pt[] = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const [x0, y0] = path[i - 1];
    const [x1, y1] = path[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(len / step));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}

function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/**
 * Share of sampled path points that have drawn ink within RADIUS.
 * Strokes are treated as segments (not only their raw points) so fast finger moves still count.
 */
export function traceCoverage(path: Pt[], strokes: Pt[][]): number {
  const samples = samplePolyline(path);
  if (samples.length === 0) return 0;
  let hit = 0;
  for (const s of samples) {
    let near = false;
    for (const st of strokes) {
      if (st.length === 1 && Math.hypot(s[0] - st[0][0], s[1] - st[0][1]) <= RADIUS) near = true;
      for (let i = 1; i < st.length && !near; i++) if (distToSegment(s, st[i - 1], st[i]) <= RADIUS) near = true;
      if (near) break;
    }
    if (near) hit++;
  }
  return hit / samples.length;
}

const toPoints = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Trace the dotted path with a finger / mouse / pen. Drawing is kept on retry (Clear to start over). */
export default function Drawing({ q, onSubmit, disabled, status }: QuestionTypeProps<DrawingQ>) {
  const { t, tl, locale, young } = useT();
  const svgRef = useRef<SVGSVGElement>(null);
  const drawing = useRef(false);
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const guide = useMemo(() => toPoints(q.path), [q.path]);

  const toLocal = (e: PointerEvent<SVGSVGElement>): Pt | null => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return null;
    const x = ((e.clientX - r.left) / r.width) * VIEW - PAD;
    const y = ((e.clientY - r.top) / r.height) * VIEW - PAD;
    return [x, y];
  };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    const p = toLocal(e);
    if (!p) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    setStrokes((s) => [...s, [p]]);
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drawing.current || disabled) return;
    const p = toLocal(e);
    if (!p) return;
    setStrokes((s) => {
      if (s.length === 0) return s;
      const last = s[s.length - 1];
      const prev = last[last.length - 1];
      if (Math.hypot(p[0] - prev[0], p[1] - prev[1]) < 0.8) return s;
      return [...s.slice(0, -1), [...last, p]];
    });
  };
  const onUp = () => {
    drawing.current = false;
  };

  const submit = () => {
    const coverage = Math.round(traceCoverage(q.path, strokes) * 1000) / 1000;
    onSubmit({ type: "drawing", coverage });
  };

  const inkColor = status === "correct" ? "#9bddb7" : status === "wrong" ? "#ff967d" : "#ffd76b";
  const start = q.path[0];
  const label = tl(q.label);

  return (
    <div className="space-y-4">
      <p className={cn("text-center text-white/75", young ? "text-lg" : "text-sm")}>
        {label ? <span className="font-display text-white">{label} · </span> : null}
        {ql(locale, "drawHere")}
      </p>
      <Shake status={status} className="mx-auto w-full max-w-sm">
        <svg
          ref={svgRef}
          viewBox={`${-PAD} ${-PAD} ${VIEW} ${VIEW}`}
          role="img"
          aria-label={`${ql(locale, "drawingArea")}${label ? `: ${label}` : ""}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onLostPointerCapture={onUp}
          className={cn(
            "glass block aspect-square w-full rounded-4xl touch-none select-none",
            disabled ? "cursor-default" : "cursor-crosshair",
            status === "correct" && "ring-4 ring-mint",
            status === "wrong" && "ring-4 ring-coral/60",
          )}
        >
          <polyline points={guide} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 4" />
          {start && <circle cx={start[0]} cy={start[1]} r={3.2} fill="#9bddb7" stroke="white" strokeWidth={0.8} />}
          {strokes.map((st, i) =>
            st.length === 1 ? (
              <circle key={i} cx={st[0][0]} cy={st[0][1]} r={2.2} fill={inkColor} />
            ) : (
              <polyline key={i} points={toPoints(st)} fill="none" stroke={inkColor} strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
            ),
          )}
        </svg>
      </Shake>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="glass"
          size={young ? "lg" : "md"}
          disabled={disabled || strokes.length === 0}
          onClick={() => setStrokes([])}
          icon={<Eraser className="size-5" aria-hidden />}
        >
          {t("clear")}
        </Button>
        <CheckButton disabled={disabled || strokes.length === 0} onClick={submit} />
      </div>
    </div>
  );
}
