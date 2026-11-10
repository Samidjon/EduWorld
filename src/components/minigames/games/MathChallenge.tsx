"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { CornerDownLeft, Delete, Timer, Volume2 } from "lucide-react";
import type { MiniGameProps } from "@/components/minigames/types";
import { Card, Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { sfx, speak } from "@/lib/audio";
import { tx } from "@/lib/i18n/text";
import type { LText, Locale } from "@/types/content";

/* ---------------- Content ---------------- */

const DURATION = 60; // seconds; gentle — the sprint simply ends, nothing is "failed"
const MAX_PROBLEMS = 30;

type Op = "+" | "-" | "×" | "÷";
interface Problem { a: number; b: number; op: Op; answer: number }

const OP_WORD: Record<Op, LText> = {
  "+": { ru: "плюс", en: "plus" },
  "-": { ru: "минус", en: "minus" },
  "×": { ru: "умножить на", en: "times" },
  "÷": { ru: "разделить на", en: "divided by" },
};

const T = {
  problem: { ru: "Пример", en: "Problem" },
  score: { ru: "Верно", en: "Correct" },
  time: { ru: "Время", en: "Time" },
  repeat: { ru: "Послушать пример", en: "Listen to the problem" },
  almost: { ru: "Почти!", en: "Almost!" },
  rightIs: { ru: "Правильный ответ", en: "The answer is" },
  next: { ru: "Дальше", en: "Next" },
  great: { ru: "Верно!", en: "Correct!", uz: "To'g'ri!" },
  finished: { ru: "Время вышло — ты молодец!", en: "Time's up — well done!" },
  solved: { ru: "Решено примеров", en: "Problems solved" },
  answer: { ru: "Твой ответ", en: "Your answer" },
  digit: { ru: "Цифра", en: "Digit" },
  erase: { ru: "Стереть цифру", en: "Erase digit" },
  enter: { ru: "Проверить ответ", en: "Check answer" },
  keypad: { ru: "Цифровая клавиатура", en: "Number pad" },
} satisfies Record<string, LText>;

/* ---------------- Helpers ---------------- */

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function makeProblem(level: 1 | 2 | 3): Problem {
  if (level === 1) {
    if (Math.random() < 0.5) {
      const a = rand(0, 9);
      const b = rand(1, 10 - a);
      return { a, b, op: "+", answer: a + b };
    }
    const a = rand(2, 10);
    const b = rand(1, a);
    return { a, b, op: "-", answer: a - b };
  }
  if (level === 2) {
    const r = Math.random();
    if (r < 0.35) {
      const a = rand(3, 15);
      const b = rand(2, 20 - a);
      return { a, b, op: "+", answer: a + b };
    }
    if (r < 0.7) {
      const a = rand(8, 20);
      const b = rand(2, a - 1);
      return { a, b, op: "-", answer: a - b };
    }
    const a = rand(2, 5);
    const b = rand(2, 5);
    return { a, b, op: "×", answer: a * b };
  }
  const a = rand(2, 9);
  const b = rand(2, 9);
  if (Math.random() < 0.5) return { a, b, op: "×", answer: a * b };
  return { a: a * b, b, op: "÷", answer: a };
}

function nextProblem(level: 1 | 2 | 3, prev: Problem | null): Problem {
  let p = makeProblem(level);
  for (let i = 0; i < 5 && prev && p.a === prev.a && p.b === prev.b && p.op === prev.op; i++) p = makeProblem(level);
  return p;
}

function explain(p: Problem, locale: Locale): string {
  const { a, b, answer: c } = p;
  const ru = locale !== "en";
  switch (p.op) {
    case "+":
      return ru ? `${a} + ${b} = ${c}: от ${a} отсчитай вперёд ${b}.` : `${a} + ${b} = ${c}: start at ${a} and count on ${b}.`;
    case "-":
      return ru ? `${a} − ${b} = ${c}, потому что ${c} + ${b} = ${a}.` : `${a} − ${b} = ${c}, because ${c} + ${b} = ${a}.`;
    case "×":
      if (b <= 5) {
        const sum = Array.from({ length: b }, () => a).join(" + ");
        return `${a} × ${b} = ${sum} = ${c}`;
      }
      return ru ? `${a} × ${b} = ${c}: это ${b} раз по ${a}.` : `${a} × ${b} = ${c}: that is ${b} groups of ${a}.`;
    case "÷":
      return ru ? `${a} ÷ ${b} = ${c}, потому что ${c} × ${b} = ${a}.` : `${a} ÷ ${b} = ${c}, because ${c} × ${b} = ${a}.`;
  }
}

/* ---------------- Game ---------------- */

export default function MathChallenge({ locale, young, level, onFinish }: MiniGameProps) {
  const t = (k: keyof typeof T) => tx(T[k], locale);

  const [problem, setProblem] = useState<Problem | null>(null);
  const [input, setInput] = useState("");
  const [count, setCount] = useState(1); // current problem number
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [state, setState] = useState<"answering" | "correct" | "missed">("answering");
  const [done, setDone] = useState(false);
  const finished = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const card = useAnimationControls();

  useEffect(() => {
    setProblem(nextProblem(level, null));
  }, [level]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Gentle timer: pauses while the explanation after a miss is shown.
  useEffect(() => {
    if (done || !problem || state === "missed") return;
    const id = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [done, problem, state]);

  useEffect(() => {
    if (timeLeft === 0 && state !== "missed") setDone(true);
  }, [timeLeft, state]);

  useEffect(() => {
    if (done && !finished.current) {
      finished.current = true;
      onFinish({ score, maxScore: Math.max(1, attempted), mistakes });
    }
  }, [done, score, attempted, mistakes, onFinish]);

  const sayProblem = useCallback(() => {
    if (!problem) return;
    speak(`${problem.a} ${tx(OP_WORD[problem.op], locale)} ${problem.b}`, locale);
  }, [problem, locale]);

  useEffect(() => {
    if (young && problem && !done) sayProblem();
  }, [problem]);

  useEffect(() => {
    if (state === "missed") nextBtn.current?.focus();
  }, [state]);

  const advance = useCallback(() => {
    if (count >= MAX_PROBLEMS || timeLeft === 0) {
      setDone(true);
      return;
    }
    setProblem((p) => nextProblem(level, p));
    setCount((c) => c + 1);
    setInput("");
    setState("answering");
  }, [count, timeLeft, level]);

  const submit = useCallback(() => {
    if (!problem || state !== "answering" || input === "" || done) return;
    setAttempted((n) => n + 1);
    if (Number(input) === problem.answer) {
      sfx("correct");
      setScore((s) => s + 1);
      setState("correct");
      timers.current.push(setTimeout(advance, 650));
    } else {
      sfx("tryAgain");
      setMistakes((m) => m + 1);
      setState("missed");
      void card.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
    }
  }, [problem, state, input, done, advance, card]);

  const press = useCallback(
    (d: string) => {
      if (state !== "answering" || done) return;
      sfx("click");
      setInput((v) => (v.length >= 3 ? v : v === "0" ? d : v + d));
    },
    [state, done],
  );
  const erase = useCallback(() => {
    if (state !== "answering") return;
    setInput((v) => v.slice(0, -1));
  }, [state]);

  // Physical keyboard support.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        press(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        erase();
      } else if (e.key === "Enter") {
        // Let a focused button handle its own Enter (avoids double actions).
        if (target?.tagName === "BUTTON") return;
        e.preventDefault();
        if (state === "missed") advance();
        else submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, press, erase, submit, advance, state]);

  if (!problem) return <div className="min-h-64" aria-busy="true" />;

  if (done) {
    return (
      <Card className="mx-auto max-w-md text-center text-white">
        <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="text-6xl" aria-hidden>
          🏁
        </motion.div>
        <h2 className="mt-2 font-display text-2xl sm:text-3xl">{t("finished")}</h2>
        <p className="mt-3 font-display text-2xl text-sun">
          {t("solved")}: {score} / {Math.max(1, attempted)}
        </p>
      </Card>
    );
  }

  const keySize = young ? "min-h-16 text-3xl" : "min-h-14 text-2xl";
  const keyCls = cn("grid place-items-center rounded-2xl font-display font-semibold glass text-white transition hover:bg-white/15 active:translate-y-[2px] disabled:opacity-40", keySize);

  return (
    <div className={cn("mx-auto w-full max-w-md text-white", young && "young")}>
      {/* HUD */}
      <div className="flex items-center gap-3">
        <span className="shrink-0 font-display text-sm sm:text-base">
          {t("problem")} {count}
        </span>
        <div className="flex flex-1 items-center gap-2">
          <Timer className="size-4 shrink-0 opacity-80" aria-hidden />
          <Progress value={timeLeft / DURATION} color="#9BDDB7" label={`${t("time")}: ${timeLeft}`} />
          <span className="w-8 shrink-0 text-right font-display text-sm tabular-nums" aria-hidden>
            {timeLeft}
          </span>
        </div>
        <span className="shrink-0 font-display text-sm sm:text-base" aria-label={`${t("score")}: ${score}`}>
          ⭐ {score}
        </span>
      </div>

      {/* Problem card */}
      <motion.div animate={card} className="relative mt-4">
        <Card className={cn("text-center transition-colors", state === "correct" && "ring-4 ring-mint/70", state === "missed" && "ring-4 ring-coral/50")}>
          <div className="flex items-center justify-center gap-3">
            <p className="font-display text-4xl tabular-nums sm:text-5xl" aria-live="polite">
              {problem.a} {problem.op === "-" ? "−" : problem.op} {problem.b} ={" "}
              <span
                className={cn(
                  "inline-block min-w-[2.5ch] rounded-xl px-2",
                  state === "correct" ? "bg-mint text-[#0f3d2a]" : state === "missed" ? "bg-white/15 line-through decoration-coral/80" : "bg-black/25",
                )}
                aria-label={`${t("answer")}: ${input || "?"}`}
              >
                {input || "?"}
              </span>
            </p>
            <button
              type="button"
              onClick={sayProblem}
              aria-label={t("repeat")}
              title={t("repeat")}
              className={cn("btn-orb grid shrink-0 place-items-center rounded-full text-white transition active:scale-95", young ? "size-16" : "size-11")}
            >
              <Volume2 className={young ? "size-8" : "size-5"} aria-hidden />
            </button>
          </div>
          <AnimatePresence>
            {state === "correct" && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-3 flex justify-center gap-6 text-2xl"
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -10, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <span>⭐</span>
                <span>✨</span>
                <span>⭐</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Feedback */}
      <div className="mt-3 min-h-10 text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {state === "correct" && (
            <motion.p key="ok" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="font-display text-xl text-mint">
              {t("great")} 🎉
            </motion.p>
          )}
          {state === "missed" && (
            <motion.div key="miss" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1">
              <p className="font-display text-lg text-coral">
                {t("almost")} {t("rightIs")}: <span className="text-sun">{problem.answer}</span>
              </p>
              <p className="text-sm opacity-85">{explain(problem, locale)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keypad / next */}
      {state === "missed" ? (
        <button
          ref={nextBtn}
          type="button"
          onClick={advance}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#ffe08a] to-[#f7bf3c] font-display text-xl font-semibold text-[#4a3505] shadow-[var(--shadow-button)]",
            young ? "min-h-16" : "min-h-14",
          )}
        >
          {t("next")} →
        </button>
      ) : (
        <div role="group" aria-label={t("keypad")} className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button key={d} type="button" onClick={() => press(d)} aria-label={`${t("digit")} ${d}`} className={keyCls} disabled={state !== "answering"}>
              {d}
            </button>
          ))}
          <button type="button" onClick={erase} aria-label={t("erase")} title={t("erase")} className={keyCls} disabled={state !== "answering" || input === ""}>
            <Delete className="size-7" aria-hidden />
          </button>
          <button type="button" onClick={() => press("0")} aria-label={`${t("digit")} 0`} className={keyCls} disabled={state !== "answering"}>
            0
          </button>
          <button
            type="button"
            onClick={submit}
            aria-label={t("enter")}
            title={t("enter")}
            disabled={state !== "answering" || input === ""}
            className={cn(
              "grid place-items-center rounded-2xl bg-gradient-to-b from-[#a9e8c4] to-[#5fc79a] text-[#0f3d2a] shadow-[var(--shadow-button)] transition active:translate-y-[2px] disabled:opacity-40",
              keySize,
            )}
          >
            <CornerDownLeft className="size-7" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
