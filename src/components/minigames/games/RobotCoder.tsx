"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ArrowUp, CornerUpLeft, CornerUpRight, Play, Repeat, Trash2, Volume2, X } from "lucide-react";
import type { MiniGameProps } from "@/components/minigames/types";
import type { CodeBlock, CodeBlocksQ, Locale } from "@/types/content";
import { Button, Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { sfx, speak } from "@/lib/audio";
import { runRobot } from "@/features/learning/check";

type Lang = "ru" | "en";
const langOf = (l: Locale): Lang => (l === "en" ? "en" : "ru");

const T = {
  ru: {
    level: "Уровень",
    score: "Очки",
    instruction: "Составь программу, чтобы робот доехал до батарейки. Нажимай на блоки, потом «Запуск».",
    listen: "Послушать задание",
    palette: "Блоки",
    program: "Программа",
    empty: "Программа пуста — нажми на блок",
    run: "Запуск",
    clear: "Очистить",
    remove: "Убрать блок",
    blocks: "Блоки",
    tooMany: "Слишком много блоков! Попробуй цикл 🔁 — он повторяет команды.",
    noOpenRepeat: "Блок «конец» нужен только после «повторить».",
    crash: "Бум! Робот задел стенку. Ничего страшного — поправим программу 🔧",
    short: "Почти! Робот остановился не у батарейки. Попробуй ещё.",
    unbalanced: "Почти! У каждого «повторить» должен быть свой «конец».",
    success: ["Ура! Робот заряжен! 🔋", "Отличная программа!", "Ты настоящий программист!"],
    hint: "Подсказка: начни так —",
    done: "Все уровни TechTown пройдены!",
    board: "Поле: робот, стенки и батарейка",
    robotAt: "Робот",
    names: { forward: "вперёд", left: "налево", right: "направо", repeat2: "повторить 2", repeat3: "повторить 3", end: "конец" } as Record<CodeBlock, string>,
  },
  en: {
    level: "Level",
    score: "Score",
    instruction: "Build a program so the robot reaches the battery. Tap the blocks, then Run.",
    listen: "Listen to the task",
    palette: "Blocks",
    program: "Program",
    empty: "The program is empty — tap a block",
    run: "Run",
    clear: "Clear",
    remove: "Remove block",
    blocks: "Blocks",
    tooMany: "Too many blocks! Try a loop 🔁 — it repeats commands.",
    noOpenRepeat: "The “end” block goes only after a “repeat”.",
    crash: "Bump! The robot touched a wall. No problem — let's fix the program 🔧",
    short: "Almost! The robot stopped before the battery. Try again.",
    unbalanced: "Almost! Every “repeat” needs its own “end”.",
    success: ["Hooray! The robot is charged! 🔋", "Great program!", "You are a real coder!"],
    hint: "Hint: start with —",
    done: "All TechTown levels complete!",
    board: "Board: robot, walls and battery",
    robotAt: "Robot",
    names: { forward: "forward", left: "turn left", right: "turn right", repeat2: "repeat 2", repeat3: "repeat 3", end: "end" } as Record<CodeBlock, string>,
  },
} as const;

interface Level {
  grid: CodeBlocksQ["grid"];
  maxBlocks: number;
  blocks: CodeBlock[];
  /** A known solution (verified with runRobot); used for the hint. */
  solution: CodeBlock[];
}

const F: CodeBlock = "forward";
const L: CodeBlock = "left";
const R: CodeBlock = "right";
const R2: CodeBlock = "repeat2";
const R3: CodeBlock = "repeat3";
const E: CodeBlock = "end";
const BASIC: CodeBlock[] = [F, L, R];
const ALL: CodeBlock[] = [F, L, R, R2, R3, E];

const lv = (w: number, h: number, start: [number, number], dir: 0 | 1 | 2 | 3, goal: [number, number], walls: [number, number][], maxBlocks: number, blocks: CodeBlock[], solution: CodeBlock[]): Level => ({
  grid: { width: w, height: h, start, dir, goal, walls },
  maxBlocks,
  blocks,
  solution,
});

/** 5 levels per difficulty; later ones only fit in maxBlocks with loops. */
const LEVELS: Record<1 | 2 | 3, Level[]> = {
  1: [
    lv(4, 4, [0, 3], 0, [0, 1], [[2, 2]], 4, BASIC, [F, F]),
    lv(4, 4, [0, 3], 1, [3, 3], [[1, 1]], 5, BASIC, [F, F, F]),
    lv(4, 4, [0, 3], 0, [2, 1], [[1, 3], [1, 2]], 6, BASIC, [F, F, R, F, F]),
    lv(4, 4, [0, 0], 2, [2, 3], [[0, 3], [1, 1]], 8, BASIC, [F, F, L, F, F, R, F]),
    lv(5, 5, [0, 4], 1, [4, 4], [[1, 3], [3, 3]], 3, [F, R2, E], [R2, F, F, E]),
  ],
  2: [
    lv(5, 5, [0, 4], 0, [0, 1], [[1, 1], [1, 2]], 2, [F, L, R, R3, E], [R3, F, E]),
    lv(5, 5, [0, 4], 0, [2, 2], [[0, 2], [1, 4], [2, 3]], 5, ALL, [R2, F, R, F, L, E]),
    lv(5, 5, [0, 0], 1, [3, 3], [[0, 1], [1, 1], [2, 1]], 5, ALL, [R3, F, E, R, R3, F, E]),
    lv(5, 5, [0, 4], 1, [3, 1], [[0, 3], [2, 4], [3, 3]], 5, ALL, [R3, F, L, F, R, E]),
    lv(5, 5, [0, 4], 0, [4, 0], [[1, 3], [2, 2], [3, 1]], 7, ALL, [R2, F, F, E, R, R2, F, F, E]),
  ],
  3: [
    lv(6, 6, [0, 5], 0, [4, 1], [[1, 4], [3, 2], [3, 3], [1, 2]], 7, ALL, [R2, F, F, R, F, F, L, E]),
    lv(6, 6, [0, 0], 1, [0, 3], [[0, 1], [1, 1], [2, 1], [1, 2], [2, 2], [0, 2]], 5, ALL, [R3, F, F, F, R, E]),
    lv(6, 6, [0, 5], 1, [4, 1], [[0, 4], [2, 5], [3, 4], [4, 3], [5, 2]], 6, ALL, [R2, R2, F, L, F, R, E, E]),
    lv(6, 6, [0, 5], 0, [3, 5], [[1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5]], 6, ALL, [R2, R3, F, E, R, E, R3, F, E]),
    lv(6, 6, [5, 5], 3, [1, 1], [[4, 4], [2, 2], [4, 2], [2, 4], [0, 3]], 7, ALL, [R2, F, F, R, F, F, L, E]),
  ],
};

const BLOCK_STYLE: Record<CodeBlock, string> = {
  forward: "bg-gradient-to-b from-[#6aa9f2] to-[#3f7fdc] text-white",
  left: "bg-gradient-to-b from-[#a9e8c4] to-[#5fc79a] text-[#0f3d2a]",
  right: "bg-gradient-to-b from-[#a9e8c4] to-[#5fc79a] text-[#0f3d2a]",
  repeat2: "bg-gradient-to-b from-[#ffe08a] to-[#f7bf3c] text-[#4a3505]",
  repeat3: "bg-gradient-to-b from-[#ffe08a] to-[#f7bf3c] text-[#4a3505]",
  end: "bg-gradient-to-b from-[#cbbdf5] to-[#9c86e6] text-[#24194d]",
};

function BlockIcon({ b, className }: { b: CodeBlock; className?: string }) {
  const c = cn("size-5 shrink-0", className);
  if (b === "forward") return <ArrowUp className={c} aria-hidden />;
  if (b === "left") return <CornerUpLeft className={c} aria-hidden />;
  if (b === "right") return <CornerUpRight className={c} aria-hidden />;
  if (b === "end") return <X className={c} aria-hidden />;
  return <Repeat className={c} aria-hidden />;
}

const CELL = 50;
const DIR_ANGLE = [0, 90, 180, 270];

export default function RobotCoder({ locale, young, level, onFinish }: MiniGameProps) {
  const lang = langOf(locale);
  const t = T[lang];
  const [levels] = useState(() => LEVELS[level].slice(0, young ? 4 : 5));
  const maxScore = levels.length * 2;

  const [idx, setIdx] = useState(0);
  const [program, setProgram] = useState<CodeBlock[]>([]);
  const [robot, setRobot] = useState<{ x: number; y: number; dir: number }>(() => ({ x: levels[0].grid.start[0], y: levels[0].grid.start[1], dir: levels[0].grid.dir }));
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [levelMisses, setLevelMisses] = useState(0);
  const [message, setMessage] = useState<{ kind: "ok" | "try" | "info"; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  const scoreRef = useRef(0);
  const mistakesRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const robotShake = useAnimationControls();

  const cur = levels[idx];
  const { grid } = cur;
  const used = program.filter((b) => b !== "end").length;
  const openRepeats = program.filter((b) => b === "repeat2" || b === "repeat3").length - program.filter((b) => b === "end").length;

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const sayInstruction = useCallback(() => speak(t.instruction, lang), [t.instruction, lang]);
  useEffect(() => {
    if (young) sayInstruction();
  }, [young, sayInstruction]);

  const resetRobot = useCallback(() => {
    setRobot({ x: grid.start[0], y: grid.start[1], dir: grid.dir });
  }, [grid]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    sfx("levelUp");
    onFinish({ score: scoreRef.current, maxScore, mistakes: mistakesRef.current });
  }, [onFinish, maxScore]);

  const add = (b: CodeBlock) => {
    if (running || solved) return;
    if (b === "end") {
      if (openRepeats <= 0) {
        setMessage({ kind: "info", text: t.noOpenRepeat });
        return;
      }
    } else if (used >= cur.maxBlocks) {
      setMessage({ kind: "info", text: t.tooMany });
      if (young) speak(t.tooMany, lang);
      return;
    }
    sfx("click");
    setMessage(null);
    setProgram((p) => [...p, b]);
  };

  const removeAt = (i: number) => {
    if (running || solved) return;
    sfx("click");
    setProgram((p) => p.filter((_, j) => j !== i));
  };

  const gentleMiss = (text: string) => {
    sfx("tryAgain");
    mistakesRef.current += 1;
    setLevelMisses((m) => m + 1);
    setMessage({ kind: "try", text });
    if (young) speak(text, lang);
  };

  const run = () => {
    if (running || solved || program.length === 0) return;
    clearTimers();
    resetRobot();
    setMessage(null);
    const result = runRobot({ grid }, program);
    if (result.error === "unbalanced") {
      gentleMiss(t.unbalanced);
      return;
    }
    setRunning(true);
    let dir: number = grid.dir;
    const STEP = young ? 520 : 420;
    result.path.slice(1).forEach(([x, y], i) => {
      const [px, py] = result.path[i];
      const dx = x - px;
      const dy = y - py;
      dir = dx === 1 ? 1 : dx === -1 ? 3 : dy === 1 ? 2 : 0;
      const d = dir;
      later(() => {
        sfx("click");
        setRobot({ x, y, dir: d });
      }, (i + 1) * STEP);
    });
    const endAt = result.path.length * STEP + 100;
    later(() => {
      if (result.success) {
        sfx("correct");
        const gained = levelMisses === 0 ? 2 : 1;
        scoreRef.current += gained;
        setScore(scoreRef.current);
        setSolved(true);
        setRunning(false);
        setMessage({ kind: "ok", text: t.success[Math.floor(Math.random() * t.success.length)] });
        later(() => {
          if (idx + 1 >= levels.length) {
            finish();
            return;
          }
          const ni = idx + 1;
          const nl = levels[ni];
          setIdx(ni);
          setProgram([]);
          setSolved(false);
          setLevelMisses(0);
          setMessage(null);
          setRobot({ x: nl.grid.start[0], y: nl.grid.start[1], dir: nl.grid.dir });
        }, 1600);
        return;
      }
      if (result.crashed) {
        void robotShake.start({ x: [0, -6, 6, -4, 4, 0], rotate: [0, -8, 8, 0], transition: { duration: 0.5 } });
        gentleMiss(t.crash);
      } else {
        gentleMiss(t.short);
      }
      later(() => {
        resetRobot();
        setRunning(false);
      }, 1200);
    }, endAt);
  };

  const clear = () => {
    if (running || solved) return;
    sfx("click");
    setProgram([]);
    setMessage(null);
    resetRobot();
  };

  // indentation depth for each program block
  const depths: number[] = [];
  {
    let d = 0;
    for (const b of program) {
      if (b === "end") d = Math.max(0, d - 1);
      depths.push(d);
      if (b === "repeat2" || b === "repeat3") d++;
    }
  }

  const isWall = (x: number, y: number) => grid.walls.some((w) => w[0] === x && w[1] === y);

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center text-white">
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-7xl" aria-hidden>
          🤖🔋
        </motion.div>
        <p className="font-display text-2xl">{t.done}</p>
        <p className="text-lg">
          {t.score}: {score} / {maxScore}
        </p>
      </div>
    );
  }

  const blockBtn = young ? "min-h-16 px-4 text-lg" : "min-h-12 px-3 text-base";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 text-white">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm whitespace-nowrap">
          {t.level} {idx + 1}/{levels.length}
        </span>
        <Progress value={(idx + (solved ? 1 : 0)) / levels.length} className="flex-1" label={`${t.level} ${idx + 1}/${levels.length}`} />
        <span className="font-display text-sm whitespace-nowrap" aria-label={`${t.score}: ${score}`}>
          ⭐ {score}
        </span>
        <button type="button" onClick={sayInstruction} aria-label={t.listen} className={cn("grid place-items-center rounded-full bg-white/10 hover:bg-white/20", young ? "size-16" : "size-11")}>
          <Volume2 className={young ? "size-7" : "size-5"} aria-hidden />
        </button>
      </div>

      <p className={cn("text-center font-display", young ? "text-xl" : "text-base")}>{t.instruction}</p>

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        {/* Board */}
        <div className="glass mx-auto w-full max-w-[400px] shrink-0 rounded-4xl p-3">
          <svg viewBox={`0 0 ${grid.width * CELL} ${grid.height * CELL}`} className="w-full" role="img" aria-label={`${t.board}. ${t.robotAt}: ${robot.x + 1}, ${robot.y + 1}`}>
            {Array.from({ length: grid.height }).map((_, y) =>
              Array.from({ length: grid.width }).map((__, x) => (
                <rect key={`${x}-${y}`} x={x * CELL + 2} y={y * CELL + 2} width={CELL - 4} height={CELL - 4} rx={8} fill={isWall(x, y) ? "#7a5a8c" : (x + y) % 2 ? "#2c3574" : "#252d66"} stroke={isWall(x, y) ? "#b8a5ef" : "none"} strokeWidth={2} />
              )),
            )}
            {grid.walls.map(([x, y]) => (
              <text key={`w${x}-${y}`} x={x * CELL + CELL / 2} y={y * CELL + CELL / 2 + 9} textAnchor="middle" fontSize={26} aria-hidden>
                🧱
              </text>
            ))}
            <circle cx={grid.goal[0] * CELL + CELL / 2} cy={grid.goal[1] * CELL + CELL / 2} r={CELL * 0.4} fill="#9bddb7" opacity={0.25} />
            <text x={grid.goal[0] * CELL + CELL / 2} y={grid.goal[1] * CELL + CELL / 2 + 10} textAnchor="middle" fontSize={28} aria-hidden>
              🔋
            </text>
            <motion.g animate={{ x: robot.x * CELL, y: robot.y * CELL }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
              <motion.g animate={robotShake}>
                <circle cx={CELL / 2} cy={CELL / 2} r={CELL * 0.42} fill={solved ? "#ffd76b" : "#5799e8"} opacity={0.35} />
                <text x={CELL / 2} y={CELL / 2 + 10} textAnchor="middle" fontSize={28} aria-hidden>
                  🤖
                </text>
                <g transform={`rotate(${DIR_ANGLE[robot.dir]} ${CELL / 2} ${CELL / 2})`}>
                  <polygon points={`${CELL / 2 - 7},${8} ${CELL / 2 + 7},${8} ${CELL / 2},${0}`} fill="#ffd76b" />
                </g>
              </motion.g>
            </motion.g>
          </svg>
        </div>

        {/* Code area */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div role="group" aria-label={t.palette} className="flex flex-wrap gap-2">
            {cur.blocks.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => add(b)}
                disabled={running || solved}
                aria-label={t.names[b]}
                className={cn("inline-flex items-center gap-1.5 rounded-2xl font-display font-semibold shadow-[var(--shadow-button)] transition active:translate-y-[2px] disabled:opacity-50", BLOCK_STYLE[b], blockBtn)}
              >
                <BlockIcon b={b} /> {t.names[b]}
              </button>
            ))}
          </div>

          <div className="glass rounded-3xl p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-display">{t.program}</span>
              <span className={cn("font-display", used >= cur.maxBlocks ? "text-sun" : "text-white/70")}>
                {t.blocks}: {used}/{cur.maxBlocks}
              </span>
            </div>
            {program.length === 0 ? (
              <p className="py-4 text-center text-sm text-white/60">{t.empty}</p>
            ) : (
              <ol className="flex flex-col gap-1.5" aria-label={t.program}>
                {program.map((b, i) => (
                  <motion.li key={`${i}-${b}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ paddingLeft: depths[i] * 20 }}>
                    <button
                      type="button"
                      onClick={() => removeAt(i)}
                      disabled={running || solved}
                      aria-label={`${t.remove}: ${i + 1}. ${t.names[b]}`}
                      className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 font-display text-sm font-semibold", BLOCK_STYLE[b], young && "min-h-14 text-base")}
                    >
                      <span className="opacity-60">{i + 1}.</span>
                      <BlockIcon b={b} className="size-4" /> {t.names[b]}
                      <X className="size-3.5 opacity-60" aria-hidden />
                    </button>
                  </motion.li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="mint" size={young ? "xl" : "lg"} onClick={run} disabled={running || solved || program.length === 0} icon={<Play className="size-5" aria-hidden />}>
              {t.run}
            </Button>
            <Button variant="glass" size={young ? "xl" : "lg"} onClick={clear} disabled={running || solved || program.length === 0} icon={<Trash2 className="size-5" aria-hidden />}>
              {t.clear}
            </Button>
          </div>

          {levelMisses >= 2 && !solved && (
            <p className="rounded-2xl bg-lavender/15 px-3 py-2 text-sm">
              💡 {t.hint} <b>{cur.solution.slice(0, 2).map((b) => t.names[b]).join(", ")}</b>…
            </p>
          )}
        </div>
      </div>

      <div className="min-h-14" aria-live="polite">
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message.text}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "rounded-2xl px-4 py-3 text-center font-display text-lg",
                message.kind === "ok" ? "bg-mint/20 text-mint" : message.kind === "try" ? "bg-coral/15 text-coral" : "bg-sun/10 text-sun",
              )}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
