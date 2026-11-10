"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Delete, Volume2 } from "lucide-react";
import type { MiniGameProps } from "@/components/minigames/types";
import { Card, Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { sfx, speak } from "@/lib/audio";
import { contentLocale, tx } from "@/lib/i18n/text";
import type { LText } from "@/types/content";

/* ---------------- Content ---------------- */

interface WordItem { word: string; emoji: string }

/** Words grouped by difficulty: [level 1 (3 letters), level 2 (4 letters), level 3 (5-6 letters)]. */
const WORDS: Record<"ru" | "en", [WordItem[], WordItem[], WordItem[]]> = {
  ru: [
    [
      { word: "КОТ", emoji: "🐱" }, { word: "ДОМ", emoji: "🏠" }, { word: "СОК", emoji: "🧃" }, { word: "ЛЕС", emoji: "🌲" },
      { word: "СЫР", emoji: "🧀" }, { word: "МЯЧ", emoji: "⚽" }, { word: "ЖУК", emoji: "🐞" }, { word: "КИТ", emoji: "🐋" },
      { word: "ЛУК", emoji: "🧅" }, { word: "НОС", emoji: "👃" },
    ],
    [
      { word: "ЛУНА", emoji: "🌙" }, { word: "СОВА", emoji: "🦉" }, { word: "ЛИСА", emoji: "🦊" }, { word: "ГРИБ", emoji: "🍄" },
      { word: "ЗОНТ", emoji: "☂️" }, { word: "СЛОН", emoji: "🐘" }, { word: "ТИГР", emoji: "🐯" }, { word: "РЫБА", emoji: "🐠" },
      { word: "ТОРТ", emoji: "🎂" }, { word: "ЗАЯЦ", emoji: "🐰" },
    ],
    [
      { word: "ЛАМПА", emoji: "💡" }, { word: "КНИГА", emoji: "📖" }, { word: "ГРУША", emoji: "🍐" }, { word: "ПЧЕЛА", emoji: "🐝" },
      { word: "ЖИРАФ", emoji: "🦒" }, { word: "БАНАН", emoji: "🍌" }, { word: "АРБУЗ", emoji: "🍉" }, { word: "РАКЕТА", emoji: "🚀" },
      { word: "ЯБЛОКО", emoji: "🍎" }, { word: "МАШИНА", emoji: "🚗" }, { word: "КОРОВА", emoji: "🐄" }, { word: "ЦВЕТОК", emoji: "🌸" },
    ],
  ],
  en: [
    [
      { word: "CAT", emoji: "🐱" }, { word: "DOG", emoji: "🐶" }, { word: "SUN", emoji: "☀️" }, { word: "BUS", emoji: "🚌" },
      { word: "HAT", emoji: "🎩" }, { word: "BEE", emoji: "🐝" }, { word: "COW", emoji: "🐄" }, { word: "PIG", emoji: "🐷" },
      { word: "FOX", emoji: "🦊" }, { word: "OWL", emoji: "🦉" },
    ],
    [
      { word: "FISH", emoji: "🐟" }, { word: "MOON", emoji: "🌙" }, { word: "FROG", emoji: "🐸" }, { word: "STAR", emoji: "⭐" },
      { word: "CAKE", emoji: "🎂" }, { word: "BOOK", emoji: "📖" }, { word: "TREE", emoji: "🌳" }, { word: "DUCK", emoji: "🦆" },
      { word: "BEAR", emoji: "🐻" }, { word: "LION", emoji: "🦁" },
    ],
    [
      { word: "APPLE", emoji: "🍎" }, { word: "HOUSE", emoji: "🏠" }, { word: "TIGER", emoji: "🐯" }, { word: "ZEBRA", emoji: "🦓" },
      { word: "PIZZA", emoji: "🍕" }, { word: "ROCKET", emoji: "🚀" }, { word: "BANANA", emoji: "🍌" }, { word: "FLOWER", emoji: "🌸" },
      { word: "TURTLE", emoji: "🐢" }, { word: "RABBIT", emoji: "🐰" },
    ],
  ],
};
/** Extra letters mixed in at level 3 (not for young children). */
const EXTRA_LETTERS: Record<"ru" | "en", string> = { ru: "АОУИЕКМНРСТЛ", en: "AEIOUTRSNLM" };

const T = {
  build: { ru: "Собери слово", en: "Build the word" },
  round: { ru: "Слово", en: "Word" },
  score: { ru: "Очки", en: "Score", uz: "Ball" },
  repeat: { ru: "Послушать ещё раз", en: "Listen again" },
  undo: { ru: "Убрать последнюю букву", en: "Remove last letter" },
  almost: { ru: "Почти! Попробуй ещё", en: "Almost! Try again" },
  great: { ru: "Молодец!", en: "Great job!", uz: "Barakalla!" },
  done: { ru: "Все слова собраны!", en: "You built all the words!" },
  letter: { ru: "Буква", en: "Letter" },
  slot: { ru: "Место", en: "Slot" },
  empty: { ru: "пусто", en: "empty" },
} satisfies Record<string, LText>;

const WORD_COUNT = 6;
const WORD_COUNT_YOUNG = 5;

/* ---------------- Helpers ---------------- */

function shuffle<V>(arr: readonly V[]): V[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Tile { id: number; ch: string }
interface Round { item: WordItem; tiles: Tile[] }

function makeRounds(lang: "ru" | "en", level: 1 | 2 | 3, young: boolean): Round[] {
  const tier = young ? Math.min(level, 2) - 1 : level - 1;
  const words = shuffle(WORDS[lang][tier]).slice(0, young ? WORD_COUNT_YOUNG : WORD_COUNT);
  return words.map((item) => {
    const chars = item.word.split("");
    if (level === 3 && !young) {
      const extra = EXTRA_LETTERS[lang].split("");
      chars.push(extra[Math.floor(Math.random() * extra.length)], extra[Math.floor(Math.random() * extra.length)]);
    }
    let tiles = shuffle(chars).map((ch, id) => ({ id, ch }));
    // Avoid presenting the word already in order.
    if (tiles.map((t) => t.ch).join("").startsWith(item.word)) tiles = [...tiles.slice(1), tiles[0]];
    return { item, tiles };
  });
}

/* ---------------- Game ---------------- */

export default function WordBuilder({ locale, young, level, onFinish }: MiniGameProps) {
  const lang = contentLocale(locale);
  const t = (k: keyof typeof T) => tx(T[k], locale);

  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]); // tile ids in order
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [roundMistakes, setRoundMistakes] = useState(0);
  const [message, setMessage] = useState<"almost" | "great" | null>(null);
  const [done, setDone] = useState(false);
  const finished = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const slots = useAnimationControls();

  useEffect(() => {
    setRounds(makeRounds(lang, level, young));
  }, [lang, level, young]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const round = rounds?.[index];
  const total = rounds?.length ?? 1;
  const maxScore = total * 2;

  const announce = useCallback(() => {
    if (!round) return;
    speak(young ? `${tx(T.build, locale)}: ${round.item.word.toLocaleLowerCase(lang)}` : round.item.word.toLocaleLowerCase(lang), locale);
  }, [round, locale, young, lang]);

  // Young children hear the word at the start of each round.
  useEffect(() => {
    if (round && young && !done) announce();
  }, [index, rounds === null]);

  useEffect(() => {
    if (done && !finished.current) {
      finished.current = true;
      onFinish({ score, maxScore, mistakes });
    }
  }, [done, score, maxScore, mistakes, onFinish]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const busy = message === "great";

  const check = (ids: number[]) => {
    if (!round) return;
    const built = ids.map((id) => round.tiles.find((x) => x.id === id)?.ch ?? "").join("");
    const word = round.item.word;
    if (built === word) {
      sfx("correct");
      setMessage("great");
      setScore((s) => s + (roundMistakes === 0 ? 2 : 1));
      speak(word.toLocaleLowerCase(lang), locale);
      later(() => {
        setMessage(null);
        setPicked([]);
        setRoundMistakes(0);
        if (index + 1 >= total) setDone(true);
        else setIndex((i) => i + 1);
      }, 1300);
      return;
    }
    sfx("tryAgain");
    setMistakes((m) => m + 1);
    setRoundMistakes((m) => m + 1);
    setMessage("almost");
    void slots.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
    // Keep the correct beginning, return the rest of the tiles.
    let keep = 0;
    while (keep < built.length && built[keep] === word[keep]) keep++;
    later(() => setPicked((p) => p.slice(0, keep)), 700);
  };

  const pick = (tile: Tile) => {
    if (!round || busy || picked.includes(tile.id) || picked.length >= round.item.word.length) return;
    sfx("click");
    if (message === "almost") setMessage(null);
    const next = [...picked, tile.id];
    setPicked(next);
    if (next.length === round.item.word.length) check(next);
  };

  const undo = () => {
    if (busy || picked.length === 0) return;
    sfx("click");
    setPicked((p) => p.slice(0, -1));
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

  const word = round.item.word;
  const len = word.length;
  const slotSize = young ? "size-16 text-4xl" : len > 5 ? "size-12 text-2xl sm:size-14 sm:text-3xl" : "size-14 text-3xl";
  const tileSize = young ? "size-16 text-4xl" : "size-14 text-3xl sm:size-16";

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

      {/* Picture */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <motion.div
          key={word}
          initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
          animate={busy ? { scale: [1, 1.25, 1], rotate: [0, 8, -8, 0], opacity: 1 } : { scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="text-7xl sm:text-8xl"
          role="img"
          aria-label={word.toLocaleLowerCase(lang)}
        >
          {round.item.emoji}
        </motion.div>
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
      <p className="mt-2 text-center font-display text-lg">{t("build")}</p>

      {/* Slots */}
      <motion.div animate={slots} className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2" aria-live="polite">
        {Array.from({ length: len }, (_, i) => {
          const id = picked[i];
          const ch = id === undefined ? "" : (round.tiles.find((x) => x.id === id)?.ch ?? "");
          return (
            <motion.div
              key={i}
              animate={busy ? { y: [0, -10, 0] } : { y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              aria-label={`${t("slot")} ${i + 1}: ${ch || t("empty")}`}
              className={cn(
                "grid place-items-center rounded-2xl font-display font-semibold",
                slotSize,
                ch ? (busy ? "bg-gradient-to-b from-[#a9e8c4] to-[#5fc79a] text-[#0f3d2a]" : "bg-white/90 text-ink") : "border-2 border-dashed border-white/35 bg-black/15",
              )}
            >
              <AnimatePresence>
                {ch && (
                  <motion.span key={id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    {ch}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        <button
          type="button"
          onClick={undo}
          disabled={picked.length === 0 || busy}
          aria-label={t("undo")}
          title={t("undo")}
          className={cn("ml-1 grid place-items-center rounded-2xl glass text-white transition hover:bg-white/15 disabled:opacity-40", young ? "size-16" : "size-12")}
        >
          <Delete className="size-6" aria-hidden />
        </button>
      </motion.div>

      {/* Tiles */}
      <div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
        {round.tiles.map((tile) => {
          const used = picked.includes(tile.id);
          return (
            <motion.button
              key={`${index}-${tile.id}`}
              type="button"
              onClick={() => pick(tile)}
              disabled={used || busy}
              whileTap={{ scale: 0.88 }}
              animate={{ opacity: used ? 0.25 : 1, scale: used ? 0.85 : 1 }}
              aria-label={`${t("letter")} ${tile.ch}`}
              className={cn(
                "grid place-items-center rounded-2xl font-display font-semibold bg-gradient-to-b from-[#ffe08a] to-[#f7bf3c] text-[#4a3505] shadow-[var(--shadow-button)]",
                tileSize,
              )}
            >
              {tile.ch}
            </motion.button>
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
