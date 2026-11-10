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

/** Pair items. Short words only so they fit on a small card. */
const ITEMS: { emoji: string; word: LText }[] = [
  { emoji: "🍎", word: { ru: "яблоко", en: "apple" } },
  { emoji: "🐶", word: { ru: "собака", en: "dog" } },
  { emoji: "🐱", word: { ru: "кошка", en: "cat" } },
  { emoji: "🐟", word: { ru: "рыба", en: "fish" } },
  { emoji: "⚽", word: { ru: "мяч", en: "ball" } },
  { emoji: "☀️", word: { ru: "солнце", en: "sun" } },
  { emoji: "⭐", word: { ru: "звезда", en: "star" } },
  { emoji: "🚗", word: { ru: "машина", en: "car" } },
  { emoji: "🌸", word: { ru: "цветок", en: "flower" } },
  { emoji: "🍌", word: { ru: "банан", en: "banana" } },
  { emoji: "🦊", word: { ru: "лиса", en: "fox" } },
  { emoji: "🦉", word: { ru: "сова", en: "owl" } },
  { emoji: "🏠", word: { ru: "дом", en: "house" } },
  { emoji: "🐻", word: { ru: "медведь", en: "bear" } },
];

const PAIRS_BY_LEVEL = [6, 8, 10] as const;
const PAIRS_BY_LEVEL_YOUNG = [4, 6, 6] as const;

const T = {
  instruction: { ru: "Найди пары!", en: "Find the pairs!" },
  instructionWords: { ru: "Найди картинку и её слово!", en: "Match each picture with its word!" },
  pairs: { ru: "Пары", en: "Pairs" },
  moves: { ru: "Ходы", en: "Moves" },
  repeat: { ru: "Послушать ещё раз", en: "Listen again" },
  almost: { ru: "Почти! Попробуй ещё", en: "Almost! Try again" },
  great: { ru: "Пара!", en: "A pair!" },
  done: { ru: "Все пары найдены!", en: "You found all the pairs!" },
  bravo: { ru: "Молодец!", en: "Great job!", uz: "Barakalla!" },
  card: { ru: "Карточка", en: "Card" },
  hidden: { ru: "закрыта", en: "face down" },
  found: { ru: "найдена", en: "matched" },
} satisfies Record<string, LText>;

/* ---------------- Helpers ---------------- */

function shuffle<V>(arr: readonly V[]): V[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface MemCard { id: number; pair: number; kind: "emoji" | "word"; emoji: string; word: LText }

function makeDeck(level: 1 | 2 | 3, young: boolean): MemCard[] {
  const pairs = (young ? PAIRS_BY_LEVEL_YOUNG : PAIRS_BY_LEVEL)[level - 1];
  const items = shuffle(ITEMS).slice(0, pairs);
  const withWords = level === 3;
  const cards = items.flatMap((it, pair) => [
    { pair, kind: "emoji" as const, emoji: it.emoji, word: it.word },
    { pair, kind: withWords ? ("word" as const) : ("emoji" as const), emoji: it.emoji, word: it.word },
  ]);
  return shuffle(cards).map((c, id) => ({ ...c, id }));
}

/* ---------------- Pieces ---------------- */

function MemoryCard({
  card,
  open,
  matched,
  shake,
  young,
  label,
  onFlip,
  text,
}: {
  card: MemCard;
  open: boolean;
  matched: boolean;
  shake: number;
  young: boolean;
  label: string;
  onFlip: () => void;
  text: string;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (shake > 0) void controls.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
  }, [shake, controls]);
  const face = open || matched;
  return (
    <motion.button
      type="button"
      onClick={onFlip}
      animate={controls}
      whileTap={face ? undefined : { scale: 0.94 }}
      aria-label={label}
      aria-pressed={face}
      aria-disabled={face}
      className={cn("relative aspect-square w-full rounded-2xl sm:rounded-3xl", young ? "min-h-16 min-w-16" : "min-h-14")}
      style={{ perspective: 800 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={{ rotateY: face ? 180 : 0, scale: matched ? [1, 1.12, 1] : 1 }}
        transition={{ rotateY: { duration: 0.45, ease: "easeInOut" }, scale: { duration: 0.4, delay: 0.3 } }}
      >
        {/* Back of the card */}
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center rounded-2xl bg-gradient-to-br from-[#8a78e0] to-[#5b4bc4] text-3xl shadow-[var(--shadow-button)] ring-1 ring-white/20 sm:rounded-3xl"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <span className="opacity-80">✨</span>
        </span>
        {/* Face */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 grid place-items-center rounded-2xl p-1 text-center shadow-[var(--shadow-button)] sm:rounded-3xl",
            matched ? "bg-gradient-to-b from-[#c4f0d6] to-[#7fd3ab] text-[#0f3d2a]" : "bg-cream text-ink",
          )}
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {card.kind === "emoji" ? (
            <span className={young ? "text-4xl sm:text-5xl" : "text-3xl sm:text-5xl"}>{card.emoji}</span>
          ) : (
            <span className="break-words font-display text-sm font-semibold leading-tight sm:text-lg">{text}</span>
          )}
        </span>
      </motion.div>
    </motion.button>
  );
}

/* ---------------- Game ---------------- */

export default function MemoryMatch({ locale, young, level, onFinish }: MiniGameProps) {
  const t = (k: keyof typeof T) => tx(T[k], locale);

  const [deck, setDeck] = useState<MemCard[] | null>(null);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]); // pair ids
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [shakes, setShakes] = useState<Record<number, number>>({});
  const [message, setMessage] = useState<"almost" | "great" | null>(null);
  const [done, setDone] = useState(false);
  const finished = useRef(false);
  const locked = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setDeck(makeDeck(level, young));
  }, [level, young]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pairs = deck ? deck.length / 2 : 1;
  const maxScore = pairs * 2;
  // One point per pair + a bonus point per pair, reduced by extra (mismatched) moves.
  const score = matched.length + Math.max(0, matched.length === pairs ? pairs - mistakes : 0);

  const instruction = level === 3 ? T.instructionWords : T.instruction;
  const announce = useCallback(() => speak(tx(instruction, locale), locale), [instruction, locale]);

  useEffect(() => {
    if (young && deck) announce();
  }, [deck === null]);

  useEffect(() => {
    if (done && !finished.current) {
      finished.current = true;
      onFinish({ score, maxScore, mistakes });
    }
  }, [done, score, maxScore, mistakes, onFinish]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const flip = (card: MemCard) => {
    if (!deck || locked.current || done || open.includes(card.id) || matched.includes(card.pair)) return;
    sfx("click");
    if (young && card.kind === "word") speak(tx(card.word, locale), locale);
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) {
      if (message === "almost") setMessage(null);
      return;
    }
    setMoves((m) => m + 1);
    const [a, b] = next.map((id) => deck.find((c) => c.id === id)).filter((c): c is MemCard => c !== undefined);
    locked.current = true;
    if (a && b && a.pair === b.pair) {
      sfx("correct");
      setMessage("great");
      speak(tx(a.word, locale), locale);
      const nowMatched = [...matched, a.pair];
      setMatched(nowMatched);
      later(() => {
        setOpen([]);
        locked.current = false;
        setMessage(null);
        if (nowMatched.length === deck.length / 2) later(() => setDone(true), 700);
      }, 600);
      return;
    }
    sfx("tryAgain");
    setMistakes((m) => m + 1);
    setMessage("almost");
    later(() => setShakes((s) => ({ ...s, [next[0]]: (s[next[0]] ?? 0) + 1, [next[1]]: (s[next[1]] ?? 0) + 1 })), 450);
    later(() => {
      setOpen([]);
      locked.current = false;
    }, young ? 1400 : 1100);
  };

  if (!deck) return <div className="min-h-64" aria-busy="true" />;

  if (done) {
    return (
      <Card className="mx-auto max-w-md text-center text-white">
        <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="text-6xl" aria-hidden>
          🎉
        </motion.div>
        <h2 className="mt-2 font-display text-3xl">{t("bravo")}</h2>
        <p className="mt-1 opacity-80">{t("done")}</p>
        <p className="mt-3 font-display text-2xl text-sun">
          ⭐ {score} / {maxScore}
        </p>
        <p className="mt-1 text-sm opacity-75">
          {t("moves")}: {moves}
        </p>
      </Card>
    );
  }

  const cols = deck.length <= 8 ? "grid-cols-4" : deck.length <= 16 ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-5";
  const maxW = deck.length <= 8 ? "max-w-md" : deck.length <= 12 ? "max-w-lg" : "max-w-xl";

  return (
    <div className={cn("mx-auto w-full max-w-2xl text-white", young && "young")}>
      {/* HUD */}
      <div className="flex items-center gap-3">
        <span className="shrink-0 font-display text-sm sm:text-base">
          {t("pairs")} {matched.length}/{pairs}
        </span>
        <Progress value={matched.length / pairs} label={`${t("pairs")} ${matched.length}/${pairs}`} />
        <span className="shrink-0 font-display text-sm sm:text-base">
          {t("moves")}: {moves}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <p className="font-display text-lg sm:text-xl">{tx(instruction, locale)}</p>
        <button
          type="button"
          onClick={announce}
          aria-label={t("repeat")}
          title={t("repeat")}
          className={cn("btn-orb grid shrink-0 place-items-center rounded-full text-white transition active:scale-95", young ? "size-16" : "size-11")}
        >
          <Volume2 className={young ? "size-8" : "size-5"} aria-hidden />
        </button>
      </div>

      {/* Board */}
      <div className={cn("mx-auto mt-4 grid gap-2 sm:gap-3", cols, maxW)}>
        {deck.map((card, i) => {
          const isOpen = open.includes(card.id);
          const isMatched = matched.includes(card.pair);
          const name = tx(card.word, locale);
          const label = `${t("card")} ${i + 1}: ${isOpen || isMatched ? (card.kind === "word" ? name : `${card.emoji} ${name}`) : t("hidden")}${isMatched ? `, ${t("found")}` : ""}`;
          return (
            <MemoryCard
              key={card.id}
              card={card}
              open={isOpen}
              matched={isMatched}
              shake={shakes[card.id] ?? 0}
              young={young}
              label={label}
              text={name}
              onFlip={() => flip(card)}
            />
          );
        })}
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
