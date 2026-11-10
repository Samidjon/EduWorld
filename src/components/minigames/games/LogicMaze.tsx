"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Volume2 } from "lucide-react";
import type PhaserNS from "phaser";
import type { MiniGameProps } from "@/components/minigames/types";
import type { Locale } from "@/types/content";
import { Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { sfx, speak } from "@/lib/audio";

type Lang = "ru" | "en";
const langOf = (l: Locale): Lang => (l === "en" ? "en" : "ru");

const T = {
  ru: {
    maze: "Лабиринт",
    score: "Очки",
    stars: "Звёзды",
    instruction: "Проведи Лисичку к флажку. Собери по пути звёздочки!",
    listen: "Послушать задание",
    loading: "Строим лабиринт…",
    bump: "Ой, тут стенка! Попробуй другую дорожку.",
    star: "Звёздочка! ⭐",
    finish: "Ура! Лисичка дошла до флажка!",
    next: "Следующий лабиринт…",
    done: "Все лабиринты пройдены!",
    up: "Вверх",
    down: "Вниз",
    left: "Влево",
    right: "Вправо",
    board: "Игровое поле лабиринта. Управляй стрелками на клавиатуре или кнопками ниже.",
  },
  en: {
    maze: "Maze",
    score: "Score",
    stars: "Stars",
    instruction: "Help Foxy reach the flag. Collect the stars on the way!",
    listen: "Listen to the task",
    loading: "Building the maze…",
    bump: "Oops, a wall! Try another path.",
    star: "A star! ⭐",
    finish: "Hooray! Foxy reached the flag!",
    next: "Next maze…",
    done: "All mazes done!",
    up: "Up",
    down: "Down",
    left: "Left",
    right: "Right",
    board: "Maze board. Use the keyboard arrows or the buttons below.",
  },
} as const;

/* ---------------- Maze generation (recursive backtracker) ---------------- */

/** walls[y][x] = [top, right, bottom, left] */
type CellWalls = [boolean, boolean, boolean, boolean];
interface Maze {
  size: number;
  walls: CellWalls[][];
  stars: [number, number][];
  goal: [number, number];
}

const DIRS: { dx: number; dy: number; wall: 0 | 1 | 2 | 3; opposite: 0 | 1 | 2 | 3 }[] = [
  { dx: 0, dy: -1, wall: 0, opposite: 2 },
  { dx: 1, dy: 0, wall: 1, opposite: 3 },
  { dx: 0, dy: 1, wall: 2, opposite: 0 },
  { dx: -1, dy: 0, wall: 3, opposite: 1 },
];

function generateMaze(size: number, starCount: number): Maze {
  const walls: CellWalls[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => [true, true, true, true] as CellWalls));
  const visited = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const stack: [number, number][] = [[0, 0]];
  visited[0][0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const options = DIRS.filter((d) => {
      const nx = x + d.dx;
      const ny = y + d.dy;
      return nx >= 0 && ny >= 0 && nx < size && ny < size && !visited[ny][nx];
    });
    if (!options.length) {
      stack.pop();
      continue;
    }
    const d = options[Math.floor(Math.random() * options.length)];
    const nx = x + d.dx;
    const ny = y + d.dy;
    walls[y][x][d.wall] = false;
    walls[ny][nx][d.opposite] = false;
    visited[ny][nx] = true;
    stack.push([nx, ny]);
  }
  const goal: [number, number] = [size - 1, size - 1];
  const free: [number, number][] = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!(x === 0 && y === 0) && !(x === goal[0] && y === goal[1])) free.push([x, y]);
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  return { size, walls, stars: free.slice(0, starCount), goal };
}

/* ---------------- Phaser bridge ---------------- */

type Move = 0 | 1 | 2 | 3;
interface Bridge {
  move: ((d: Move) => void) | null;
  onBump: () => void;
  onStar: () => void;
  onGoal: () => void;
}

const CELL = 64;

export default function LogicMaze({ locale, young, level, onFinish }: MiniGameProps) {
  const lang = langOf(locale);
  const t = T[lang];
  const size = level === 1 ? 5 : level === 2 ? 7 : 9;
  const starCount = young ? 2 : level === 1 ? 3 : level === 2 ? 4 : 5;
  const totalMazes = young ? 1 : 2;
  const maxScore = totalMazes * (starCount + 1);

  const [mazeIdx, setMazeIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [starsHere, setStarsHere] = useState(0);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "try" | "info"; text: string } | null>(null);
  const [finished, setFinished] = useState(false);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<PhaserNS.Game | null>(null);
  const sceneRef = useRef<PhaserNS.Scene | null>(null);
  const mazeRef = useRef<Maze>(generateMaze(size, starCount));
  const scoreRef = useRef(0);
  const finishedRef = useRef(false);
  const lockedRef = useRef(false);
  const mazeIdxRef = useRef(0);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((m: { kind: "ok" | "try" | "info"; text: string }, ms = 1600) => {
    setMessage(m);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMessage(null), ms);
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    sfx("levelUp");
    onFinish({ score: scoreRef.current, maxScore, mistakes: 0 });
  }, [onFinish, maxScore]);

  // Callbacks used by the Phaser scene. Kept in a ref so the scene always calls the latest version.
  const bridge = useRef<Bridge>({ move: null, onBump: () => {}, onStar: () => {}, onGoal: () => {} });
  bridge.current.onBump = () => {
    sfx("tryAgain");
    flash({ kind: "try", text: t.bump }, 1300);
  };
  bridge.current.onStar = () => {
    sfx("coin");
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setStarsHere((s) => s + 1);
    flash({ kind: "ok", text: t.star }, 900);
  };
  bridge.current.onGoal = () => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    sfx("correct");
    scoreRef.current += 1;
    setScore(scoreRef.current);
    const last = mazeIdxRef.current + 1 >= totalMazes;
    flash({ kind: "ok", text: last ? t.finish : `${t.finish} ${t.next}` }, 1800);
    nextTimer.current = setTimeout(() => {
      if (last) {
        finish();
        return;
      }
      mazeIdxRef.current += 1;
      setMazeIdx(mazeIdxRef.current);
      setStarsHere(0);
      mazeRef.current = generateMaze(size, starCount);
      lockedRef.current = false;
      sceneRef.current?.scene.restart();
    }, 1800);
  };

  const sayInstruction = useCallback(() => speak(t.instruction, lang), [t.instruction, lang]);
  useEffect(() => {
    if (young) sayInstruction();
  }, [young, sayInstruction]);

  /* ---- Create / destroy the Phaser game ---- */
  useEffect(() => {
    let cancelled = false;
    const br = bridge;
    const mazeSrc = mazeRef;

    void (async () => {
      const mod = await import("phaser");
      if (cancelled || !hostRef.current) return;
      const modWithDefault = mod as unknown as { default?: typeof PhaserNS };
      const Phaser: typeof PhaserNS = modWithDefault.default ?? (mod as unknown as typeof PhaserNS);

      class MazeScene extends Phaser.Scene {
        private px = 0;
        private py = 0;
        private moving = false;
        private fox: PhaserNS.GameObjects.Container | null = null;
        private starObjs: { x: number; y: number; obj: PhaserNS.GameObjects.Star }[] = [];

        constructor() {
          super("maze");
        }

        create() {
          const maze = mazeSrc.current;
          const n = maze.size;
          const g = this.add.graphics();
          this.px = 0;
          this.py = 0;
          this.moving = false;
          this.starObjs = [];

          // floor
          g.fillStyle(0x252d66, 1);
          g.fillRoundedRect(0, 0, n * CELL, n * CELL, 18);
          for (let y = 0; y < n; y++)
            for (let x = 0; x < n; x++) {
              g.fillStyle((x + y) % 2 ? 0x2c3574 : 0x29316d, 1);
              g.fillRect(x * CELL + 3, y * CELL + 3, CELL - 6, CELL - 6);
            }

          // goal flag
          const gx = maze.goal[0] * CELL + CELL / 2;
          const gy = maze.goal[1] * CELL + CELL / 2;
          g.fillStyle(0x9bddb7, 0.25);
          g.fillCircle(gx, gy, CELL * 0.4);
          g.fillStyle(0xf3f5ff, 1);
          g.fillRect(gx - 12, gy - 22, 4, 44);
          g.fillStyle(0xff967d, 1);
          g.fillTriangle(gx - 8, gy - 22, gx + 18, gy - 13, gx - 8, gy - 4);

          // stars
          for (const [sx, sy] of maze.stars) {
            const s = this.add.star(sx * CELL + CELL / 2, sy * CELL + CELL / 2, 5, 9, 20, 0xffd76b);
            s.setStrokeStyle(2, 0xfff3c4);
            this.tweens.add({ targets: s, angle: 360, duration: 6000, repeat: -1 });
            this.tweens.add({ targets: s, scale: 1.12, duration: 700, yoyo: true, repeat: -1 });
            this.starObjs.push({ x: sx, y: sy, obj: s });
          }

          // walls
          g.lineStyle(6, 0xb8a5ef, 1);
          for (let y = 0; y < n; y++)
            for (let x = 0; x < n; x++) {
              const w = maze.walls[y][x];
              const x0 = x * CELL;
              const y0 = y * CELL;
              if (w[0]) g.lineBetween(x0, y0, x0 + CELL, y0);
              if (w[1]) g.lineBetween(x0 + CELL, y0, x0 + CELL, y0 + CELL);
              if (w[2]) g.lineBetween(x0, y0 + CELL, x0 + CELL, y0 + CELL);
              if (w[3]) g.lineBetween(x0, y0, x0, y0 + CELL);
            }

          // fox: orange circle with ears, white muzzle and eyes
          const f = this.add.graphics();
          f.fillStyle(0xf07a2a, 1);
          f.fillTriangle(-20, -6, -14, -26, -4, -14);
          f.fillTriangle(20, -6, 14, -26, 4, -14);
          f.fillCircle(0, 0, 19);
          f.fillStyle(0xfff3e6, 1);
          f.fillEllipse(0, 8, 22, 14);
          f.fillStyle(0x1b2250, 1);
          f.fillCircle(-7, -3, 3);
          f.fillCircle(7, -3, 3);
          f.fillCircle(0, 6, 3);
          this.fox = this.add.container(CELL / 2, CELL / 2, [f]);

          br.current.move = (d) => this.tryMove(d);

          const kb = this.input.keyboard;
          if (kb) {
            kb.addCapture("UP,DOWN,LEFT,RIGHT");
            kb.on("keydown-UP", () => this.tryMove(0));
            kb.on("keydown-RIGHT", () => this.tryMove(1));
            kb.on("keydown-DOWN", () => this.tryMove(2));
            kb.on("keydown-LEFT", () => this.tryMove(3));
          }
          this.events.once("shutdown", () => {
            this.input.keyboard?.removeAllListeners();
          });
        }

        tryMove(d: Move) {
          if (this.moving || !this.fox) return;
          const maze = mazeSrc.current;
          const dir = DIRS[d];
          const fox = this.fox;
          if (maze.walls[this.py][this.px][dir.wall]) {
            // friendly wobble towards the wall and back
            this.moving = true;
            const bx = this.px * CELL + CELL / 2;
            const by = this.py * CELL + CELL / 2;
            this.tweens.add({
              targets: fox,
              x: bx + dir.dx * 8,
              y: by + dir.dy * 8,
              angle: { from: -8, to: 8 },
              duration: 80,
              yoyo: true,
              repeat: 1,
              onComplete: () => {
                fox.setPosition(bx, by);
                fox.setAngle(0);
                this.moving = false;
              },
            });
            br.current.onBump();
            return;
          }
          this.px += dir.dx;
          this.py += dir.dy;
          this.moving = true;
          this.tweens.add({
            targets: fox,
            x: this.px * CELL + CELL / 2,
            y: this.py * CELL + CELL / 2,
            duration: 150,
            ease: "Sine.easeOut",
            onComplete: () => {
              this.moving = false;
              this.arrive();
            },
          });
        }

        arrive() {
          const hit = this.starObjs.find((s) => s.x === this.px && s.y === this.py);
          if (hit) {
            this.starObjs = this.starObjs.filter((s) => s !== hit);
            this.tweens.add({ targets: hit.obj, scale: 2, alpha: 0, duration: 350, onComplete: () => hit.obj.destroy() });
            br.current.onStar();
          }
          const maze = mazeSrc.current;
          if (this.px === maze.goal[0] && this.py === maze.goal[1] && this.fox) {
            this.tweens.add({ targets: this.fox, y: this.fox.y - 14, duration: 180, yoyo: true, repeat: 2 });
            br.current.onGoal();
          }
        }
      }

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current,
        width: size * CELL,
        height: size * CELL,
        transparent: true,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
        scene: MazeScene,
        banner: false,
        audio: { noAudio: true },
      });
      gameRef.current = game;
      game.events.once("ready", () => {
        if (cancelled) return;
        sceneRef.current = game.scene.getScene("maze");
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      br.current.move = null;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [size]);

  useEffect(
    () => () => {
      if (msgTimer.current) clearTimeout(msgTimer.current);
      if (nextTimer.current) clearTimeout(nextTimer.current);
    },
    [],
  );

  const press = (d: Move) => {
    if (finishedRef.current || lockedRef.current) return;
    bridge.current.move?.(d);
  };

  const btn = cn(
    "glass grid place-items-center rounded-2xl text-white transition active:scale-95 hover:bg-white/15",
    young ? "size-20" : "size-16",
  );
  const icon = young ? "size-9" : "size-7";

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center text-white">
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-7xl" aria-hidden>
          🦊🏁
        </motion.div>
        <p className="font-display text-2xl">{t.done}</p>
        <p className="text-lg">
          {t.score}: {score} / {maxScore}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 text-white">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm whitespace-nowrap">
          {t.maze} {mazeIdx + 1}/{totalMazes}
        </span>
        <Progress value={(mazeIdx * (starCount + 1) + starsHere) / maxScore} className="flex-1" label={`${t.maze} ${mazeIdx + 1}/${totalMazes}`} />
        <span className="font-display text-sm whitespace-nowrap" aria-label={`${t.stars}: ${starsHere}/${starCount}`}>
          ⭐ {starsHere}/{starCount}
        </span>
        <button
          type="button"
          onClick={sayInstruction}
          aria-label={t.listen}
          className={cn("grid place-items-center rounded-full bg-white/10 hover:bg-white/20", young ? "size-16" : "size-11")}
        >
          <Volume2 className={young ? "size-7" : "size-5"} aria-hidden />
        </button>
      </div>

      <p className={cn("text-center font-display", young ? "text-xl" : "text-base")}>{t.instruction}</p>

      <div className="relative w-full">
        <div ref={hostRef} role="img" aria-label={t.board} className="mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-3xl" />
        {!ready && <div className="absolute inset-0 grid place-items-center font-display text-white/80">{t.loading}</div>}
        <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center" aria-live="polite">
          <AnimatePresence>
            {message && (
              <motion.div
                key={message.text}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "rounded-2xl px-4 py-2 font-display text-base shadow-lg backdrop-blur",
                  message.kind === "try" ? "bg-[#3b2a52]/90 text-coral" : "bg-[#1f3b3a]/90 text-mint",
                )}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-3 justify-items-center gap-2 self-center" role="group" aria-label={t.maze}>
        <span />
        <button type="button" className={btn} aria-label={t.up} onClick={() => press(0)}>
          <ArrowUp className={icon} aria-hidden />
        </button>
        <span />
        <button type="button" className={btn} aria-label={t.left} onClick={() => press(3)}>
          <ArrowLeft className={icon} aria-hidden />
        </button>
        <button type="button" className={btn} aria-label={t.down} onClick={() => press(2)}>
          <ArrowDown className={icon} aria-hidden />
        </button>
        <button type="button" className={btn} aria-label={t.right} onClick={() => press(1)}>
          <ArrowRight className={icon} aria-hidden />
        </button>
      </div>
    </div>
  );
}
