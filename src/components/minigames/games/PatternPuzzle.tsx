"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { MiniGameProps } from "@/components/minigames/types";
import type { Locale } from "@/types/content";
import { Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { sfx, speak } from "@/lib/audio";

type Lang = "ru" | "en";
const langOf = (l: Locale): Lang => (l === "en" ? "en" : "ru");

const T = {
  ru: {
    round: "Раунд",
    score: "Очки",
    instruction: "Что пропущено? Найди, что стоит на месте вопроса.",
    listen: "Послушать задание",
    almost: "Почти! Посмотри на узор ещё раз и попробуй снова.",
    great: ["Отлично!", "Молодец!", "Супер!", "Здорово!"],
    missing: "Пропущенный элемент",
    choose: "Выбери ответ",
    option: "Вариант",
    pattern: "Узор",
    done: "Все узоры разгаданы!",
  },
  en: {
    round: "Round",
    score: "Score",
    instruction: "What is missing? Find what goes in place of the question mark.",
    listen: "Listen to the task",
    almost: "Almost! Look at the pattern again and try once more.",
    great: ["Great!", "Well done!", "Super!", "Awesome!"],
    missing: "Missing item",
    choose: "Choose an answer",
    option: "Option",
    pattern: "Pattern",
    done: "All patterns solved!",
  },
} as const;

/** A token in a sequence. `glyph` is what is shown, `name` is read by screen readers. */
interface Token {
  glyph: string;
  name: { ru: string; en: string };
  number?: boolean;
}

const SHAPES: Token[] = [
  { glyph: "⭐", name: { ru: "звезда", en: "star" } },
  { glyph: "🔺", name: { ru: "треугольник", en: "triangle" } },
  { glyph: "🟦", name: { ru: "квадрат", en: "square" } },
  { glyph: "⚪", name: { ru: "круг", en: "circle" } },
  { glyph: "💚", name: { ru: "сердечко", en: "heart" } },
  { glyph: "🔶", name: { ru: "ромб", en: "rhombus" } },
];
const COLORS: Token[] = [
  { glyph: "🔴", name: { ru: "красный", en: "red" } },
  { glyph: "🔵", name: { ru: "синий", en: "blue" } },
  { glyph: "🟢", name: { ru: "зелёный", en: "green" } },
  { glyph: "🟡", name: { ru: "жёлтый", en: "yellow" } },
  { glyph: "🟣", name: { ru: "фиолетовый", en: "purple" } },
  { glyph: "🟠", name: { ru: "оранжевый", en: "orange" } },
];
const CRITTERS: Token[] = [
  { glyph: "🦊", name: { ru: "лиса", en: "fox" } },
  { glyph: "🐸", name: { ru: "лягушка", en: "frog" } },
  { glyph: "🐝", name: { ru: "пчела", en: "bee" } },
  { glyph: "🍎", name: { ru: "яблоко", en: "apple" } },
  { glyph: "🌙", name: { ru: "луна", en: "moon" } },
];

type PatternKind = "AB" | "ABB" | "ABC" | "AABB" | "+2" | "+5";

interface Round {
  seq: Token[];
  missingIdx: number;
  options: Token[];
  answer: number; // index in options
}

const rnd = (n: number) => Math.floor(Math.random() * n);
function shuffle<X>(arr: X[]): X[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const numToken = (n: number): Token => ({ glyph: String(n), name: { ru: String(n), en: String(n) }, number: true });

function kindsFor(level: 1 | 2 | 3): PatternKind[] {
  if (level === 1) return ["AB", "AB", "ABB"];
  if (level === 2) return ["AB", "ABB", "ABC", "AABB"];
  return ["ABB", "ABC", "AABB", "+2", "+5"];
}

function makeRound(kind: PatternKind, level: 1 | 2 | 3, young: boolean): Round {
  const optionCount = young ? 3 : 4;
  const length = young ? 6 : level === 1 ? 6 : 8;
  // Missing item: at the end for the easiest level, anywhere after the first cycle otherwise.
  const pickMissing = (cycle: number) => (level === 1 ? length - 1 : cycle + rnd(length - cycle));

  if (kind === "+2" || kind === "+5") {
    const step = kind === "+2" ? 2 : 5;
    const start = step === 2 ? 1 + rnd(9) : 5 * rnd(4);
    const len = young ? 5 : 6;
    const seq = Array.from({ length: len }, (_, i) => numToken(start + i * step));
    const missingIdx = 1 + rnd(len - 1);
    const right = start + missingIdx * step;
    const wrongs = new Set<number>();
    for (const d of shuffle([1, -1, step + 1, -(step + 1), 2 * step, -2 * step, 3, -3])) {
      const v = right + d;
      if (v >= 0 && v !== right && !wrongs.has(v)) wrongs.add(v);
      if (wrongs.size >= optionCount - 1) break;
    }
    const opts = shuffle([right, ...wrongs]).map(numToken);
    return { seq, missingIdx, options: opts, answer: opts.findIndex((o) => o.glyph === String(right)) };
  }

  const pools = level === 1 ? [COLORS, SHAPES] : [COLORS, SHAPES, CRITTERS];
  const pool = shuffle(pools[rnd(pools.length)]);
  const [a, b, c] = pool;
  const unit: Token[] = kind === "AB" ? [a, b] : kind === "ABB" ? [a, b, b] : kind === "ABC" ? [a, b, c] : [a, a, b, b];
  const seqLen = Math.max(length, unit.length * 2);
  const seq = Array.from({ length: seqLen }, (_, i) => unit[i % unit.length]);
  const missingIdx = pickMissing(unit.length);
  const right = seq[missingIdx];
  const distractors = pool.filter((t) => t.glyph !== right.glyph);
  // Prefer tokens from the pattern itself as distractors (makes the child really look at order).
  const inPattern = distractors.filter((t) => unit.some((u) => u.glyph === t.glyph));
  const others = distractors.filter((t) => !unit.some((u) => u.glyph === t.glyph));
  const wrong = [...inPattern, ...shuffle(others)].slice(0, optionCount - 1);
  const options = shuffle([right, ...wrong]);
  return { seq, missingIdx, options, answer: options.findIndex((o) => o.glyph === right.glyph) };
}

function makeRounds(level: 1 | 2 | 3, young: boolean): Round[] {
  const count = young ? 6 : 8;
  const kinds = kindsFor(level);
  return Array.from({ length: count }, (_, i) => makeRound(kinds[i % kinds.length], level, young));
}

export default function PatternPuzzle({ locale, young, level, onFinish }: MiniGameProps) {
  const lang = langOf(locale);
  const t = T[lang];
  const [rounds] = useState(() => makeRounds(level, young));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [roundMiss, setRoundMiss] = useState(false);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "try"; text: string } | null>(null);
  const [wrongPicks, setWrongPicks] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  const shake = useAnimationControls();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const round = rounds[idx];
  const total = rounds.length;

  const sayInstruction = useCallback(() => speak(t.instruction, lang), [t.instruction, lang]);

  useEffect(() => {
    if (young) sayInstruction();
  }, [young, sayInstruction]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const finish = useCallback(
    (finalScore: number, finalMistakes: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setFinished(true);
      sfx("levelUp");
      onFinish({ score: finalScore, maxScore: total, mistakes: finalMistakes });
    },
    [onFinish, total],
  );

  const pick = (i: number) => {
    if (solved || finished) return;
    if (i === round.answer) {
      sfx("correct");
      const gained = roundMiss ? 0 : 1;
      const newScore = score + gained;
      setScore(newScore);
      setSolved(true);
      setMessage({ kind: "ok", text: t.great[rnd(t.great.length)] });
      timer.current = setTimeout(() => {
        if (idx + 1 >= total) {
          finish(newScore, mistakes);
          return;
        }
        setIdx(idx + 1);
        setSolved(false);
        setRoundMiss(false);
        setWrongPicks([]);
        setMessage(null);
      }, 1100);
    } else {
      sfx("tryAgain");
      setMistakes((m) => m + 1);
      setRoundMiss(true);
      setWrongPicks((w) => (w.includes(i) ? w : [...w, i]));
      setMessage({ kind: "try", text: t.almost });
      void shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
    }
  };

  const cell = young ? "min-w-16 min-h-16 text-4xl" : "min-w-12 min-h-12 sm:min-w-14 sm:min-h-14 text-3xl";

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center text-white">
        <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="text-7xl" aria-hidden>
          🧩
        </motion.div>
        <p className="font-display text-2xl">{t.done}</p>
        <p className="text-lg">
          {t.score}: {score} / {total}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-5 text-white mx-auto">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm whitespace-nowrap">
          {t.round} {idx + 1}/{total}
        </span>
        <Progress value={(idx + (solved ? 1 : 0)) / total} className="flex-1" label={`${t.round} ${idx + 1}/${total}`} />
        <span className="font-display text-sm whitespace-nowrap" aria-label={`${t.score}: ${score}`}>
          ⭐ {score}
        </span>
        <button
          type="button"
          onClick={sayInstruction}
          aria-label={t.listen}
          className={cn("grid place-items-center rounded-full bg-white/10 hover:bg-white/20 transition", young ? "size-16" : "size-11")}
        >
          <Volume2 className={young ? "size-7" : "size-5"} aria-hidden />
        </button>
      </div>

      <p className={cn("font-display text-center", young ? "text-2xl" : "text-lg")}>{t.instruction}</p>

      <motion.div animate={shake} className="glass rounded-4xl p-3 sm:p-5">
        <ol aria-label={t.pattern} className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {round.seq.map((tok, i) => {
            const isMissing = i === round.missingIdx;
            return (
              <li
                key={i}
                aria-label={isMissing ? t.missing : tok.name[lang]}
                className={cn(
                  "grid place-items-center rounded-2xl font-display",
                  cell,
                  isMissing ? (solved ? "bg-mint/30 ring-4 ring-mint" : "border-4 border-dashed border-sun/80 bg-sun/10") : "bg-white/10",
                  tok.number && "text-2xl sm:text-3xl px-2",
                )}
              >
                {isMissing && !solved ? (
                  <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="text-sun">
                    ?
                  </motion.span>
                ) : (
                  <motion.span initial={isMissing ? { scale: 0 } : false} animate={{ scale: 1 }}>
                    {tok.glyph}
                  </motion.span>
                )}
              </li>
            );
          })}
        </ol>
      </motion.div>

      <div role="group" aria-label={t.choose} className={cn("grid gap-3 sm:gap-4", round.options.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4")}>
        {round.options.map((opt, i) => {
          const wrong = wrongPicks.includes(i);
          const right = solved && i === round.answer;
          return (
            <motion.button
              key={`${idx}-${i}`}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => pick(i)}
              aria-label={`${t.option} ${i + 1}: ${opt.name[lang]}`}
              disabled={solved}
              className={cn(
                "glass rounded-3xl grid place-items-center font-display transition",
                young ? "min-h-24 text-5xl" : "min-h-20 text-4xl",
                opt.number && "text-3xl",
                wrong && "opacity-50",
                right && "ring-4 ring-mint bg-mint/25",
                !solved && "hover:bg-white/15",
              )}
            >
              {opt.glyph}
            </motion.button>
          );
        })}
      </div>

      <div className="min-h-14" aria-live="polite">
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message.text + idx}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "rounded-2xl px-4 py-3 text-center font-display text-lg",
                message.kind === "ok" ? "bg-mint/20 text-mint" : "bg-coral/15 text-coral",
              )}
            >
              {message.kind === "ok" ? "🎉 " : "💡 "}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
