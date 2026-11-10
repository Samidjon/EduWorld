"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { MiniGameProps } from "@/components/minigames/types";
import { Card, Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { sfx, speak } from "@/lib/audio";
import { contentLocale, tx } from "@/lib/i18n/text";
import type { LText } from "@/types/content";

/* ---------------- Content ---------------- */

/** Letters that are easy to tell apart (used for young children and level 1). */
const LETTERS_EASY: Record<"ru" | "en", string[]> = {
  ru: "АБВГДЕЖЗИКЛМНОПРСТУФХЧШЭЮЯ".split(""),
  en: "ABCDEFGHIKLMNOPRSTUVWXYZ".split(""),
};
const LETTERS_ALL: Record<"ru" | "en", string[]> = {
  ru: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split(""),
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
};
/** Look-alike letters, preferred as distractors at level 3. */
const LOOKALIKES: Record<string, string[]> = {
  Б: ["В", "Ь"], В: ["Б", "Р"], Е: ["Ё", "З"], Ё: ["Е"], И: ["Й", "Н"], Й: ["И"], Ш: ["Щ"], Щ: ["Ш", "Ц"], Ц: ["Щ"],
  Ь: ["Ъ", "Б"], Ъ: ["Ь"], Р: ["В"], П: ["Л", "Н"], Л: ["П", "Д"], З: ["Э"], Э: ["З", "Е"], Н: ["И", "П"],
  B: ["D", "P", "R"], D: ["B", "O"], P: ["B", "R", "Q"], Q: ["O", "P"], O: ["Q", "C"], M: ["N", "W"], N: ["M"],
  W: ["M", "V"], E: ["F"], F: ["E"], C: ["G", "O"], G: ["C"], U: ["V"], V: ["U", "W"],
};

const T = {
  find: { ru: "Найди все буквы", en: "Find every letter", uz: "Hamma harflarni top" },
  say: { ru: "Найди букву", en: "Find the letter" },
  caseHint: { ru: "Большие и маленькие — обе подходят!", en: "Big and small ones both count!" },
  round: { ru: "Раунд", en: "Round", uz: "Raund" },
  score: { ru: "Очки", en: "Score", uz: "Ball" },
  repeat: { ru: "Послушать ещё раз", en: "Listen again" },
  almost: { ru: "Почти! Попробуй ещё", en: "Almost! Try again" },
  great: { ru: "Молодец!", en: "Great job!", uz: "Barakalla!" },
  done: { ru: "Все буквы найдены!", en: "You found all the letters!" },
  left: { ru: "Осталось", en: "Left" },
  letter: { ru: "Буква", en: "Letter" },
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

interface Cell { id: number; display: string; target: boolean; found: boolean; float: number }
interface Round { letter: string; cells: Cell[] }

function makeRounds(lang: "ru" | "en", level: 1 | 2 | 3, young: boolean): Round[] {
  const pool = young || level === 1 ? LETTERS_EASY[lang] : LETTERS_ALL[lang];
  const count = young ? [6, 8, 9][level - 1] : [9, 12, 16][level - 1];
  const targetsPer = young ? 2 : level === 1 ? 2 : 3;
  const letters = shuffle(pool).slice(0, young ? ROUNDS_YOUNG : ROUNDS);
  const mixCase = level >= 2;
  const lower = (s: string) => s.toLocaleLowerCase(lang);
  const show = (s: string) => (mixCase && Math.random() < 0.5 ? lower(s) : s);

  return letters.map((letter) => {
    const k = targetsPer + (level === 3 && !young ? rand(0, 1) : 0);
    const others = pool.filter((l) => l !== letter);
    const similar = level === 3 ? (LOOKALIKES[letter] ?? []).filter((l) => others.includes(l)) : [];
    const distractors: string[] = [];
    for (let i = 0; i < count - k; i++) {
      distractors.push(similar.length && Math.random() < 0.4 ? similar[rand(0, similar.length - 1)] : others[rand(0, others.length - 1)]);
    }
    // At mixed-case levels make sure both cases of the target appear.
    const targets = Array.from({ length: k }, (_, i) => (mixCase ? (i === 0 ? letter : i === 1 ? lower(letter) : show(letter)) : letter));
    const cells = shuffle([
      ...targets.map((d) => ({ display: d, target: true })),
      ...distractors.map((d) => ({ display: show(d), target: false })),
    ]).map((c, id) => ({ ...c, id, found: false, float: Math.random() }));
    return { letter, cells };
  });
}

/* ---------------- Pieces ---------------- */

function LetterButton({ cell, shake, young, onTap, label }: { cell: Cell; shake: number; young: boolean; onTap: () => void; label: string }) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (shake > 0) void controls.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.4 } });
  }, [shake, controls]);
  return (
    <motion.div
      animate={cell.found ? { y: 0 } : { y: [0, -6, 0] }}
      transition={{ duration: 2.4 + cell.float * 1.6, repeat: Infinity, ease: "easeInOut", delay: cell.float }}
      className="flex"
    >
      <motion.button
        type="button"
        animate={controls}
        whileTap={{ scale: 0.9 }}
        onClick={onTap}
        disabled={cell.found}
        aria-label={label}
        aria-pressed={cell.found}
        className={cn(
          "relative w-full aspect-square rounded-3xl font-display font-semibold grid place-items-center transition-colors",
          young ? "min-h-16 min-w-16 text-4xl sm:text-5xl" : "min-h-14 min-w-12 text-3xl sm:text-4xl",
          cell.found ? "bg-gradient-to-b from-[#a9e8c4] to-[#5fc79a] text-[#0f3d2a] shadow-[var(--shadow-button)]" : "glass text-white hover:bg-white/15",
        )}
      >
        {cell.display}
        <AnimatePresence>
          {cell.found && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -top-2 -right-1 text-xl"
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
            >
              ⭐
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

/* ---------------- Game ---------------- */

export default function AlphabetFinder({ locale, young, level, onFinish }: MiniGameProps) {
  const lang = contentLocale(locale);
  const t = (k: keyof typeof T) => tx(T[k], locale);

  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [roundMistakes, setRoundMistakes] = useState(0);
  const [shakes, setShakes] = useState<Record<number, number>>({});
  const [message, setMessage] = useState<"almost" | "great" | null>(null);
  const [done, setDone] = useState(false);
  const finished = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Generate on the client only (random content must not differ between server and client render).
  useEffect(() => {
    setRounds(makeRounds(lang, level, young));
  }, [lang, level, young]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const round = rounds?.[index];
  const total = rounds?.length ?? 1;
  const maxScore = total * 2;

  const announce = useCallback(() => {
    if (!round) return;
    speak(`${tx(T.say, locale)} ${round.letter}`, locale);
  }, [round, locale]);

  // Speak the target at the start of every round.
  useEffect(() => {
    if (round && !done) announce();
  }, [index, rounds]);

  useEffect(() => {
    if (done && !finished.current) {
      finished.current = true;
      onFinish({ score, maxScore, mistakes });
    }
  }, [done, score, maxScore, mistakes, onFinish]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const tap = (cell: Cell) => {
    if (!rounds || !round || cell.found || done || message === "great") return;
    if (!cell.target) {
      sfx("tryAgain");
      setMistakes((m) => m + 1);
      setRoundMistakes((m) => m + 1);
      setShakes((s) => ({ ...s, [cell.id]: (s[cell.id] ?? 0) + 1 }));
      setMessage("almost");
      return;
    }
    sfx("correct");
    const cells = round.cells.map((c) => (c.id === cell.id ? { ...c, found: true } : c));
    const next = rounds.map((r, i) => (i === index ? { ...r, cells } : r));
    setRounds(next);
    const remaining = cells.filter((c) => c.target && !c.found).length;
    if (remaining > 0) {
      setMessage(null);
      return;
    }
    setMessage("great");
    setScore((s) => s + (roundMistakes === 0 ? 2 : 1));
    later(() => {
      setMessage(null);
      setRoundMistakes(0);
      setShakes({});
      if (index + 1 >= next.length) setDone(true);
      else setIndex((i) => i + 1);
    }, 1000);
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

  const left = round.cells.filter((c) => c.target && !c.found).length;
  const lowerLetter = round.letter.toLocaleLowerCase(lang);
  const cols = round.cells.length <= 6 ? "grid-cols-3" : round.cells.length <= 9 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className={cn("mx-auto w-full max-w-2xl text-white", young && "young")}>
      {/* HUD */}
      <div className="flex items-center gap-3">
        <span className="shrink-0 font-display text-sm sm:text-base">
          {t("round")} {index + 1}/{total}
        </span>
        <Progress value={(index + (left === 0 ? 1 : 0)) / total} label={`${t("round")} ${index + 1}/${total}`} />
        <span className="shrink-0 font-display text-sm sm:text-base" aria-label={`${t("score")}: ${score}`}>
          ⭐ {score}
        </span>
      </div>

      {/* Target */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center">
        <span className="font-display text-lg sm:text-xl">{t("find")}</span>
        <motion.span
          key={round.letter}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-gradient-to-b from-[#ffe08a] to-[#f7bf3c] px-4 py-1 font-display text-4xl text-[#4a3505] shadow-[var(--shadow-button)]"
          aria-label={`${t("letter")} ${round.letter}`}
        >
          {level >= 2 ? `${round.letter} ${lowerLetter}` : round.letter}
        </motion.span>
        <button
          type="button"
          onClick={announce}
          aria-label={t("repeat")}
          title={t("repeat")}
          className={cn("btn-orb grid place-items-center rounded-full text-white transition active:scale-95", young ? "size-16" : "size-12")}
        >
          <Volume2 className={young ? "size-8" : "size-6"} aria-hidden />
        </button>
      </div>
      {level >= 2 && <p className="mt-1 text-center text-sm opacity-75">{t("caseHint")}</p>}

      {/* Grid */}
      <div className={cn("mx-auto mt-5 grid gap-2 sm:gap-3", cols, young ? "max-w-md" : "max-w-xl")}>
        {round.cells.map((cell) => (
          <LetterButton
            key={`${index}-${cell.id}`}
            cell={cell}
            young={young}
            shake={shakes[cell.id] ?? 0}
            onTap={() => tap(cell)}
            label={`${t("letter")} ${cell.display}`}
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
          {message === null && (
            <motion.p key="left" initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} exit={{ opacity: 0 }} className="text-sm">
              {t("left")}: {left}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
