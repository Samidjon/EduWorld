"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { MiniGameProps } from "@/components/minigames/types";
import { Card, Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { sfx, speak } from "@/lib/audio";
import { tx } from "@/lib/i18n/text";
import type { LText } from "@/types/content";

/* ---------------- Content ---------------- */

/** Things to count. `name` is the plural used in the spoken question ("How many apples?"). */
const OBJECTS: { emoji: string; name: LText }[] = [
  { emoji: "🍎", name: { ru: "яблок", en: "apples" } },
  { emoji: "⭐", name: { ru: "звёздочек", en: "stars" } },
  { emoji: "🐟", name: { ru: "рыбок", en: "fish" } },
  { emoji: "🎈", name: { ru: "шариков", en: "balloons" } },
  { emoji: "🐞", name: { ru: "божьих коровок", en: "ladybugs" } },
  { emoji: "🌸", name: { ru: "цветочков", en: "flowers" } },
  { emoji: "🐥", name: { ru: "цыплят", en: "chicks" } },
  { emoji: "🍓", name: { ru: "ягодок", en: "strawberries" } },
  { emoji: "🚗", name: { ru: "машинок", en: "cars" } },
  { emoji: "🦋", name: { ru: "бабочек", en: "butterflies" } },
  { emoji: "🍪", name: { ru: "печенек", en: "cookies" } },
  { emoji: "🐢", name: { ru: "черепашек", en: "turtles" } },
];

const MAX_BY_LEVEL = [5, 10, 20] as const;

const T = {
  howMany: { ru: "Сколько здесь", en: "How many" },
  count: { ru: "Посчитай!", en: "Count them!" },
  round: { ru: "Раунд", en: "Round", uz: "Raund" },
  score: { ru: "Очки", en: "Score", uz: "Ball" },
  repeat: { ru: "Послушать ещё раз", en: "Listen again" },
  almost: { ru: "Почти! Попробуй ещё", en: "Almost! Try again" },
  great: { ru: "Молодец!", en: "Great job!", uz: "Barakalla!" },
  done: { ru: "Ты отлично считаешь!", en: "You are great at counting!" },
  answer: { ru: "Ответ", en: "Answer" },
  picture: { ru: "Картинка для счёта", en: "Picture to count" },
} satisfies Record<string, LText>;

const ROUNDS = 8;
const ROUNDS_YOUNG = 6;

/* ---------------- Helpers ---------------- */

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
function shuffle<V>(arr: readonly V[]): V[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Spot { x: number; y: number; rot: number }
interface Round { n: number; obj: (typeof OBJECTS)[number]; spots: Spot[]; options: number[] }

/** Scatter `n` items over a jittered grid (percent coordinates) so they never overlap or form a line. */
function scatter(n: number): Spot[] {
  const cols = n <= 4 ? 3 : n <= 9 ? 4 : n <= 12 ? 5 : 6;
  const rows = Math.max(2, Math.ceil((n * 1.4) / cols));
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, n);
  const jitter = n > 10 ? 0.3 : 0.5;
  return cells.map((c) => {
    const cx = c % cols;
    const cy = Math.floor(c / cols);
    return {
      x: ((cx + 0.5 + (Math.random() - 0.5) * jitter) / cols) * 100,
      y: ((cy + 0.5 + (Math.random() - 0.5) * jitter) / rows) * 100,
      rot: rand(-20, 20),
    };
  });
}

function makeRounds(level: 1 | 2 | 3, young: boolean): Round[] {
  const max = young ? Math.min(MAX_BY_LEVEL[level - 1], 10) : MAX_BY_LEVEL[level - 1];
  const min = level === 1 ? 1 : level === 2 ? 3 : 6;
  const optionCount = young ? 3 : 4;
  const objs = shuffle(OBJECTS);
  const count = young ? ROUNDS_YOUNG : ROUNDS;
  let last = -1;
  return Array.from({ length: count }, (_, i) => {
    let n = rand(min, max);
    if (n === last) n = n === max ? n - 1 : n + 1;
    last = n;
    const opts = new Set<number>([n]);
    const spread = max <= 5 ? 2 : 3;
    let guard = 0;
    while (opts.size < optionCount && guard++ < 50) {
      const d = n + rand(-spread, spread);
      if (d >= 1 && d <= Math.max(max, n + spread)) opts.add(d);
    }
    for (let d = 1; opts.size < optionCount; d++) opts.add(d);
    return { n, obj: objs[i % objs.length], spots: scatter(n), options: [...opts].sort((a, b) => a - b) };
  });
}

/* ---------------- Pieces ---------------- */

function OptionButton({ value, wrong, shake, disabled, young, onPick, label }: { value: number; wrong: boolean; shake: number; disabled: boolean; young: boolean; onPick: () => void; label: string }) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (shake > 0) void controls.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.4 } });
  }, [shake, controls]);
  return (
    <motion.button
      type="button"
      animate={controls}
      whileTap={{ scale: 0.9 }}
      onClick={onPick}
      disabled={disabled || wrong}
      aria-label={label}
      className={cn(
        "grid place-items-center rounded-3xl font-display font-semibold transition-colors",
        young ? "min-h-20 text-5xl" : "min-h-16 text-4xl",
        wrong ? "bg-white/10 text-white/40" : "bg-gradient-to-b from-[#6aa9f2] to-[#3f7fdc] text-white shadow-[var(--shadow-button)]",
      )}
    >
      {value}
    </motion.button>
  );
}

/* ---------------- Game ---------------- */

export default function NumberCounting({ locale, young, level, onFinish }: MiniGameProps) {
  const t = (k: keyof typeof T) => tx(T[k], locale);

  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<Record<number, number>>({}); // option -> shake count
  const [message, setMessage] = useState<"almost" | "great" | null>(null);
  const [done, setDone] = useState(false);
  const finished = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setRounds(makeRounds(level, young));
  }, [level, young]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const round = rounds?.[index];
  const total = rounds?.length ?? 1;
  const maxScore = total * 2;

  const announce = useCallback(() => {
    if (!round) return;
    speak(`${tx(T.howMany, locale)} ${tx(round.obj.name, locale)}?`, locale);
  }, [round, locale]);

  useEffect(() => {
    if (round && young && !done) announce();
  }, [index, rounds === null]);

  useEffect(() => {
    if (done && !finished.current) {
      finished.current = true;
      onFinish({ score, maxScore, mistakes });
    }
  }, [done, score, maxScore, mistakes, onFinish]);

  const busy = message === "great";

  const pickOption = (v: number) => {
    if (!round || busy || done) return;
    if (v !== round.n) {
      sfx("tryAgain");
      setMistakes((m) => m + 1);
      setWrong((w) => ({ ...w, [v]: (w[v] ?? 0) + 1 }));
      setMessage("almost");
      return;
    }
    sfx("correct");
    setMessage("great");
    speak(String(round.n), locale);
    setScore((s) => s + (Object.keys(wrong).length === 0 ? 2 : 1));
    timers.current.push(
      setTimeout(() => {
        setMessage(null);
        setWrong({});
        if (index + 1 >= total) setDone(true);
        else setIndex((i) => i + 1);
      }, 1100),
    );
  };

  if (!rounds || !round) return <div className="min-h-64" aria-busy="true" />;

  if (done) {
    return (
      <Card className="mx-auto max-w-md text-center text-white">
        <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="text-6xl" aria-hidden>
          🎉
        </motion.div>
        <h2 className="mt-2 font-display text-3xl">{t("great")}</h2>
        <p className="mt-1 opacity-80">{t("done")}</p>
        <p className="mt-3 font-display text-2xl text-sun">
          ⭐ {score} / {maxScore}
        </p>
      </Card>
    );
  }

  const emojiSize = round.n <= 5 ? "text-5xl sm:text-6xl" : round.n <= 10 ? "text-4xl sm:text-5xl" : round.n <= 12 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-4xl";

  return (
    <div className={cn("mx-auto w-full max-w-2xl text-white", young && "young")}>
      {/* HUD */}
      <div className="flex items-center gap-3">
        <span className="shrink-0 font-display text-sm sm:text-base">
          {t("round")} {index + 1}/{total}
        </span>
        <Progress value={(index + (busy ? 1 : 0)) / total} label={`${t("round")} ${index + 1}/${total}`} />
        <span className="shrink-0 font-display text-sm sm:text-base" aria-label={`${t("score")}: ${score}`}>
          ⭐ {score}
        </span>
      </div>

      {/* Question */}
      <div className="mt-4 flex items-center justify-center gap-3 text-center">
        <p className="font-display text-lg sm:text-xl">
          {t("howMany")} {tx(round.obj.name, locale)}? {round.obj.emoji}
        </p>
        <button
          type="button"
          onClick={announce}
          aria-label={t("repeat")}
          title={t("repeat")}
          className={cn("btn-orb grid shrink-0 place-items-center rounded-full text-white transition active:scale-95", young ? "size-16" : "size-12")}
        >
          <Volume2 className={young ? "size-8" : "size-6"} aria-hidden />
        </button>
      </div>

      {/* Scatter field */}
      <div
        role="img"
        aria-label={`${t("picture")}: ${t("count")}`}
        className="glass relative mx-auto mt-4 aspect-[4/3] w-full max-w-lg overflow-hidden rounded-4xl sm:aspect-[16/10]"
      >
        <div className="absolute inset-[6%]">
          {round.spots.map((s, i) => (
            <motion.span
              key={`${index}-${i}`}
              aria-hidden
              className={cn("absolute -translate-x-1/2 -translate-y-1/2 select-none", emojiSize)}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              initial={{ scale: 0, rotate: 0 }}
              animate={busy ? { scale: [1, 1.3, 1], rotate: s.rot } : { scale: 1, rotate: s.rot }}
              transition={{ delay: busy ? i * 0.04 : i * 0.05, type: "spring", stiffness: 300, damping: 15 }}
            >
              {round.obj.emoji}
            </motion.span>
          ))}
        </div>
        <AnimatePresence>
          {busy && (
            <motion.div
              className="absolute inset-0 grid place-items-center"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="rounded-full bg-gradient-to-b from-[#a9e8c4] to-[#5fc79a] px-8 py-3 font-display text-6xl text-[#0f3d2a] shadow-[var(--shadow-button)]">
                {round.n}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Options */}
      <div className={cn("mx-auto mt-5 grid max-w-lg gap-3", round.options.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4")}>
        {round.options.map((v) => (
          <OptionButton
            key={`${index}-${v}`}
            value={v}
            young={young}
            wrong={wrong[v] !== undefined}
            shake={wrong[v] ?? 0}
            disabled={busy}
            onPick={() => pickOption(v)}
            label={`${t("answer")} ${v}`}
          />
        ))}
      </div>

      {/* Feedback */}
      <div className="mt-4 min-h-10 text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {message === "almost" && (
            <motion.p key="almost" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-display text-lg text-coral">
              {t("almost")} 💪
            </motion.p>
          )}
          {message === "great" && (
            <motion.p key="great" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="font-display text-xl text-mint">
              {t("great")} 🎉
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
