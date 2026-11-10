"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUp, CornerUpLeft, CornerUpRight, Eraser, Play, Repeat, Undo2 } from "lucide-react";
import type { Answer, CodeBlock, CodeBlocksQ } from "@/types/content";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import { runRobot } from "@/features/learning/check";
import type { QuestionTypeProps } from "./types";
import { CheckButton, Shake, useOnReset } from "./shared";
import { blockLabel, ql } from "./labels";

type Pt = [number, number];
const CELL = 10;
const STEP_MS = 420;

const BLOCK_STYLE: Record<CodeBlock, string> = {
  forward: "bg-brand-blue/80 text-white",
  left: "bg-lavender/80 text-[#2a1f55]",
  right: "bg-lavender/80 text-[#2a1f55]",
  repeat2: "bg-sun/90 text-[#4a3505]",
  repeat3: "bg-sun/90 text-[#4a3505]",
  end: "bg-sun/60 text-[#4a3505]",
};

function blockIcon(b: CodeBlock, cls: string): ReactNode {
  switch (b) {
    case "forward": return <ArrowUp className={cls} aria-hidden />;
    case "left": return <CornerUpLeft className={cls} aria-hidden />;
    case "right": return <CornerUpRight className={cls} aria-hidden />;
    case "repeat2":
    case "repeat3": return <Repeat className={cls} aria-hidden />;
    case "end": return null;
  }
}

interface Anim {
  program: CodeBlock[];
  path: Pt[];
  crashed: boolean;
  step: number;
  done: boolean;
}

/**
 * Robot programming: palette of q.blocks, a program strip (remove last / clear), and Run, which animates
 * the robot along runRobot(q, program).path step by step and then submits the program.
 * The program is kept on retry; the robot goes back to the start.
 */
export default function CodeBlocks({ q, onSubmit, disabled, resetKey, status }: QuestionTypeProps<CodeBlocksQ>) {
  const { t, locale, young } = useT();
  const { grid } = q;
  const [program, setProgram] = useState<CodeBlock[]>([]);
  const [anim, setAnim] = useState<Anim | null>(null);
  const [note, setNote] = useState<string | null>(null);
  useOnReset(resetKey, () => setAnim(null));

  const submitRef = useRef<(a: Answer) => void>(onSubmit);
  useEffect(() => {
    submitRef.current = onSubmit;
  }, [onSubmit]);

  // step the animation
  useEffect(() => {
    if (!anim || anim.done) return;
    const last = anim.step >= anim.path.length - 1;
    const id = window.setTimeout(() => {
      if (last) {
        setAnim((a) => (a ? { ...a, done: true } : a));
        submitRef.current({ type: "code_blocks", program: anim.program });
      } else {
        setAnim((a) => (a ? { ...a, step: a.step + 1 } : a));
      }
    }, last ? 500 : STEP_MS);
    return () => window.clearTimeout(id);
  }, [anim]);

  const running = !!anim && !anim.done;
  const used = program.filter((b) => b !== "end").length;
  const full = used >= q.maxBlocks;
  const locked = disabled || running;

  const edit = (next: CodeBlock[]) => {
    setProgram(next);
    setAnim(null);
    setNote(null);
  };
  const add = (b: CodeBlock) => {
    if (locked || (b !== "end" && full)) return;
    sfx("click");
    edit([...program, b]);
  };

  const run = () => {
    if (locked || program.length === 0) return;
    const res = runRobot(q, program);
    if (res.error === "unbalanced") {
      setNote(ql(locale, "unbalanced"));
      return;
    }
    setNote(null);
    setAnim({ program: [...program], path: res.path, crashed: res.crashed, step: 0, done: false });
  };

  // robot position + facing
  const path = anim?.path ?? [grid.start];
  const step = anim ? Math.min(anim.step, path.length - 1) : 0;
  const pos = path[step];
  let dir: number = grid.dir;
  if (step > 0) {
    const [px, py] = path[step - 1];
    dir = pos[0] > px ? 1 : pos[0] < px ? 3 : pos[1] > py ? 2 : 0;
  }
  const crashedNow = !!anim && anim.crashed && step === path.length - 1;
  const visited = path.slice(0, step + 1);

  const W = grid.width * CELL;
  const H = grid.height * CELL;
  const isWall = (x: number, y: number) => grid.walls.some((w) => w[0] === x && w[1] === y);

  const chipSize = young ? "min-h-16 px-4 text-lg" : "min-h-11 px-3 text-sm sm:text-base";
  const palette = Array.from(new Set(q.blocks));

  return (
    <div className="space-y-4">
      <Shake status={status} className="mx-auto w-full max-w-md">
        <svg
          viewBox={`-1 -1 ${W + 2} ${H + 2}`}
          role="img"
          aria-label={ql(locale, "robotField")}
          className={cn(
            "glass block w-full rounded-3xl",
            status === "correct" && "ring-4 ring-mint",
            status === "wrong" && "ring-4 ring-coral/60",
          )}
        >
          {Array.from({ length: grid.height }, (_, y) =>
            Array.from({ length: grid.width }, (_, x) => (
              <rect
                key={`${x}-${y}`}
                x={x * CELL + 0.4}
                y={y * CELL + 0.4}
                width={CELL - 0.8}
                height={CELL - 0.8}
                rx={1.6}
                fill={isWall(x, y) ? "#141a3a" : (x + y) % 2 === 0 ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)"}
                stroke={isWall(x, y) ? "rgba(255,255,255,0.18)" : "none"}
                strokeWidth={0.3}
              />
            )),
          )}
          {grid.walls.map(([x, y]) => (
            <text key={`w${x}-${y}`} x={x * CELL + CELL / 2} y={y * CELL + CELL / 2} fontSize={6} textAnchor="middle" dominantBaseline="central" aria-hidden>
              🧱
            </text>
          ))}
          {visited.length > 1 && (
            <polyline
              points={visited.map(([x, y]) => `${x * CELL + CELL / 2},${y * CELL + CELL / 2}`).join(" ")}
              fill="none"
              stroke="#ffd76b"
              strokeOpacity={0.55}
              strokeWidth={1.4}
              strokeDasharray="1.5 1.5"
              strokeLinecap="round"
            />
          )}
          <text x={grid.goal[0] * CELL + CELL / 2} y={grid.goal[1] * CELL + CELL / 2} fontSize={6.5} textAnchor="middle" dominantBaseline="central" aria-hidden>
            🏁
          </text>
          <motion.g initial={false} animate={{ x: pos[0] * CELL, y: pos[1] * CELL }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
            <motion.g animate={crashedNow ? { x: [0, -1.2, 1.2, -0.8, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
              <circle cx={CELL / 2} cy={CELL / 2} r={4.3} fill={crashedNow ? "rgba(255,150,125,0.35)" : "rgba(87,153,232,0.35)"} />
              <text x={CELL / 2} y={CELL / 2 + 0.3} fontSize={6} textAnchor="middle" dominantBaseline="central" aria-hidden>
                🤖
              </text>
              <g transform={`rotate(${dir * 90} ${CELL / 2} ${CELL / 2})`}>
                <path d={`M${CELL / 2} -0.2 L${CELL / 2 + 1.8} 1.6 L${CELL / 2 - 1.8} 1.6 Z`} fill="#ffd76b" />
              </g>
            </motion.g>
          </motion.g>
        </svg>
      </Shake>

      {/* palette */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 text-sm text-white/75">
          <span>{ql(locale, "blocks")}</span>
          <span aria-live="polite" className={cn("rounded-full px-2.5 py-0.5 font-bold", full ? "bg-sun text-[#4a3505]" : "bg-white/10")}>
            {used}/{q.maxBlocks}
          </span>
        </div>
        <div role="group" aria-label={ql(locale, "blocks")} className="flex flex-wrap gap-2">
          {palette.map((b) => (
            <button
              key={b}
              type="button"
              disabled={locked || (b !== "end" && full)}
              onClick={() => add(b)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-2xl font-display font-semibold shadow-[var(--shadow-button)] transition enabled:active:translate-y-[2px] disabled:opacity-40",
                chipSize,
                BLOCK_STYLE[b],
              )}
            >
              {blockIcon(b, young ? "size-6" : "size-4")}
              {blockLabel(locale, b)}
            </button>
          ))}
        </div>
      </div>

      {/* program strip */}
      <div className="space-y-2">
        <span className="text-sm text-white/75">{ql(locale, "program")}</span>
        <ol aria-label={ql(locale, "program")} className="glass flex min-h-16 flex-wrap items-center gap-1.5 rounded-3xl p-2">
          {program.length === 0 && <li className="w-full px-2 text-center text-sm text-white/45">{ql(locale, "emptyProgram")}</li>}
          {program.map((b, i) => (
              <li
                key={i}
                className={cn(
                  "inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-semibold",
                  young && "text-base",
                  BLOCK_STYLE[b],
                )}
              >
                <span className="sr-only">{i + 1}. </span>
                {blockIcon(b, "size-4")}
                {blockLabel(locale, b)}
              </li>
          ))}
        </ol>
        {note && (
          <p role="status" className="rounded-2xl bg-sun/15 px-3 py-2 text-sm text-sun">
            {note}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="glass"
            size={young ? "lg" : "md"}
            disabled={locked || program.length === 0}
            onClick={() => edit(program.slice(0, -1))}
            icon={<Undo2 className="size-5" aria-hidden />}
          >
            {ql(locale, "removeLast")}
          </Button>
          <Button
            type="button"
            variant="glass"
            size={young ? "lg" : "md"}
            disabled={locked || program.length === 0}
            onClick={() => edit([])}
            icon={<Eraser className="size-5" aria-hidden />}
          >
            {t("clear")}
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <CheckButton disabled={locked || program.length === 0} onClick={run} label={t("run")} icon={<Play className="size-5" aria-hidden />} />
      </div>
    </div>
  );
}
