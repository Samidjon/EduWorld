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
/** Separate text per language (uz uses ru). */
type LT = { ru: string; en: string };

const T = {
  ru: {
    page: "Страница",
    score: "Очки",
    readAloud: "Прочитать страницу вслух",
    readSentence: "Прочитать предложение",
    almost: "Почти! Перечитай выделенное предложение и попробуй ещё раз.",
    great: ["Верно!", "Отлично!", "Молодец!", "Так держать!"],
    theEnd: "Конец истории!",
    done: "Ты прочитал(а) всю историю!",
    answers: "Варианты ответа",
    story: "История",
  },
  en: {
    page: "Page",
    score: "Score",
    readAloud: "Read the page aloud",
    readSentence: "Read this sentence",
    almost: "Almost! Read the highlighted sentence again and try once more.",
    great: ["Correct!", "Great!", "Well done!", "Keep going!"],
    theEnd: "The end!",
    done: "You read the whole story!",
    answers: "Answer choices",
    story: "Story",
  },
} as const;

interface Option {
  text: LT;
  ok: boolean;
  /** Next page id for a correct choice; undefined = story ends. */
  next?: string;
}
interface Page {
  id: string;
  emoji: string;
  sentences: LT[];
  question: LT;
  options: Option[];
  /** Sentence that holds the answer — highlighted after a wrong choice. */
  focus: number;
}
interface Story {
  title: LT;
  start: string;
  /** Pages read on any path (all branches have the same length). */
  length: number;
  pages: Record<string, Page>;
}

/* ---------------- Original stories ---------------- */

const BALLOON: Story = {
  title: { ru: "Лисичка и красный шарик", en: "Foxy and the Red Balloon" },
  start: "p1",
  length: 4,
  pages: {
    p1: {
      id: "p1",
      emoji: "🦊🎈",
      sentences: [
        { ru: "У Лисички есть красный шарик.", en: "Foxy has a red balloon." },
        { ru: "Вдруг ветер уносит его вверх!", en: "Suddenly the wind takes it up!" },
      ],
      question: { ru: "Какого цвета шарик?", en: "What colour is the balloon?" },
      options: [
        { text: { ru: "Красный", en: "Red" }, ok: true, next: "p2" },
        { text: { ru: "Синий", en: "Blue" }, ok: false },
        { text: { ru: "Зелёный", en: "Green" }, ok: false },
      ],
      focus: 0,
    },
    p2: {
      id: "p2",
      emoji: "🌳🎈",
      sentences: [
        { ru: "Шарик застрял на высоком дереве.", en: "The balloon gets stuck in a tall tree." },
        { ru: "Лисичка хочет его вернуть.", en: "Foxy wants it back." },
      ],
      question: { ru: "Что будет дальше?", en: "What happens next?" },
      options: [
        { text: { ru: "Лисичка просит сову Оли помочь", en: "Foxy asks Oli the owl for help" }, ok: true, next: "p3a" },
        { text: { ru: "Лисичка осторожно лезет на низкую ветку", en: "Foxy carefully climbs a low branch" }, ok: true, next: "p3b" },
        { text: { ru: "Лисичка улетает спать на Луну", en: "Foxy flies to sleep on the Moon" }, ok: false },
      ],
      focus: 1,
    },
    p3a: {
      id: "p3a",
      emoji: "🦉🎈",
      sentences: [
        { ru: "Сова Оли взлетает к шарику.", en: "Oli the owl flies up to the balloon." },
        { ru: "Он приносит шарик Лисичке.", en: "He brings it down to Foxy." },
      ],
      question: { ru: "Кто взлетает к шарику?", en: "Who flies up to the balloon?" },
      options: [
        { text: { ru: "Сова Оли", en: "Oli the owl" }, ok: true, next: "p4" },
        { text: { ru: "Рыбка", en: "A fish" }, ok: false },
        { text: { ru: "Черепаха", en: "A turtle" }, ok: false },
      ],
      focus: 0,
    },
    p3b: {
      id: "p3b",
      emoji: "🌿🦊",
      sentences: [
        { ru: "Лисичка встаёт на низкую ветку.", en: "Foxy stands on a low branch." },
        { ru: "Она хватает ниточку. Шарик снова у неё!", en: "She grabs the string. Got it!" },
      ],
      question: { ru: "Куда встаёт Лисичка?", en: "Where does Foxy stand?" },
      options: [
        { text: { ru: "На низкую ветку", en: "On a low branch" }, ok: true, next: "p4" },
        { text: { ru: "На облако", en: "On a cloud" }, ok: false },
        { text: { ru: "На крышу", en: "On a roof" }, ok: false },
      ],
      focus: 0,
    },
    p4: {
      id: "p4",
      emoji: "😊🎈",
      sentences: [
        { ru: "Лисичка привязывает шарик к лапке.", en: "Foxy ties the balloon to her paw." },
        { ru: "Теперь ветер его не унесёт.", en: "Now the wind cannot take it away." },
      ],
      question: { ru: "Зачем Лисичка привязала шарик?", en: "Why does Foxy tie the balloon?" },
      options: [
        { text: { ru: "Чтобы ветер его не унёс", en: "So the wind cannot take it" }, ok: true },
        { text: { ru: "Потому что шарик синий", en: "Because the balloon is blue" }, ok: false },
        { text: { ru: "Чтобы подарить его рыбке", en: "To give it to a fish" }, ok: false },
      ],
      focus: 1,
    },
  },
};

const RIVER: Story = {
  title: { ru: "Лисичка и Поющий водопад", en: "Foxy and the Singing Waterfall" },
  start: "p1",
  length: 5,
  pages: {
    p1: {
      id: "p1",
      emoji: "🗺️🦊",
      sentences: [
        { ru: "Однажды солнечным утром Лисичка нашла под камнем старую карту.", en: "One sunny morning Foxy found an old map under a stone." },
        { ru: "На карте была тропинка к Поющему водопаду.", en: "The map showed a path to the Singing Waterfall." },
        { ru: "Лисичка взяла с собой яблоко, верёвку и маленький фонарик.", en: "Foxy packed an apple, a rope and a little lamp." },
      ],
      question: { ru: "Что Лисичка нашла под камнем?", en: "What did Foxy find under the stone?" },
      options: [
        { text: { ru: "Старую карту", en: "An old map" }, ok: true, next: "p2" },
        { text: { ru: "Торт", en: "A cake" }, ok: false },
        { text: { ru: "Ботинок", en: "A shoe" }, ok: false },
      ],
      focus: 0,
    },
    p2: {
      id: "p2",
      emoji: "🌊🌉",
      sentences: [
        { ru: "Тропинка привела к широкой реке.", en: "The path led to a wide river." },
        { ru: "Вода была быстрой, а в середине — глубокой.", en: "The water was fast, and it was deep in the middle." },
        { ru: "Рядом из воды торчали большие плоские камни, а чуть дальше стоял деревянный мост.", en: "Nearby, big flat stones stuck out of the water, and a little further there was a wooden bridge." },
      ],
      question: { ru: "Как Лисичке лучше перебраться через реку?", en: "How should Foxy cross the river?" },
      options: [
        { text: { ru: "Пойти к деревянному мосту", en: "Walk to the wooden bridge" }, ok: true, next: "p3a" },
        { text: { ru: "Прыгать по большим плоским камням", en: "Hop across the big flat stones" }, ok: true, next: "p3b" },
        { text: { ru: "Плыть прямо через глубокую быструю воду", en: "Swim straight through the deep, fast water" }, ok: false },
      ],
      focus: 1,
    },
    p3a: {
      id: "p3a",
      emoji: "🌉🦔",
      sentences: [
        { ru: "Мост скрипел, но был крепким.", en: "The bridge creaked, but it was strong." },
        { ru: "Лисичка держалась за перила и шла медленно.", en: "Foxy held the rail and walked slowly." },
        { ru: "На другом берегу ей помахал ёжик.", en: "On the other side a hedgehog waved hello." },
      ],
      question: { ru: "Кто помахал Лисичке?", en: "Who waved to Foxy?" },
      options: [
        { text: { ru: "Ёжик", en: "A hedgehog" }, ok: true, next: "p4" },
        { text: { ru: "Кит", en: "A whale" }, ok: false },
        { text: { ru: "Медведь", en: "A bear" }, ok: false },
      ],
      focus: 2,
    },
    p3b: {
      id: "p3b",
      emoji: "🪨🦊",
      sentences: [
        { ru: "Лисичка прыгала с камня на камень.", en: "Foxy jumped from stone to stone." },
        { ru: "Один камень был мокрым и скользким, поэтому она ступала очень осторожно.", en: "One stone was wet and slippery, so she stepped very carefully." },
        { ru: "Скоро она была на другом берегу.", en: "Soon she was on the other side." },
      ],
      question: { ru: "Почему Лисичка ступала осторожно?", en: "Why did Foxy step carefully?" },
      options: [
        { text: { ru: "Камень был скользким", en: "The stone was slippery" }, ok: true, next: "p4" },
        { text: { ru: "Камень был горячим", en: "The stone was hot" }, ok: false },
        { text: { ru: "Она хотела спать", en: "She was sleepy" }, ok: false },
      ],
      focus: 1,
    },
    p4: {
      id: "p4",
      emoji: "🌲🌙",
      sentences: [
        { ru: "В лесу стало темнеть.", en: "It was getting dark in the forest." },
        { ru: "Где-то впереди пел водопад.", en: "Somewhere ahead the waterfall was singing." },
        { ru: "Лисичка открыла рюкзак.", en: "Foxy opened her backpack." },
      ],
      question: { ru: "Что Лисичка достанет из рюкзака?", en: "What will Foxy take out of her backpack?" },
      options: [
        { text: { ru: "Маленький фонарик", en: "The little lamp" }, ok: true, next: "p5" },
        { text: { ru: "Большого снеговика", en: "A big snowman" }, ok: false },
        { text: { ru: "Зонтик от солнца", en: "A sun umbrella" }, ok: false },
      ],
      focus: 0,
    },
    p5: {
      id: "p5",
      emoji: "💧✨",
      sentences: [
        { ru: "С фонариком Лисичка нашла Поющий водопад.", en: "With her lamp shining, Foxy found the Singing Waterfall." },
        { ru: "Капельки сверкали, как звёзды.", en: "Tiny drops sparkled like stars." },
        { ru: "Лисичка села, съела яблоко и слушала музыку воды.", en: "Foxy sat down, ate her apple and listened to the music of the water." },
      ],
      question: { ru: "Что Лисичка съела у водопада?", en: "What did Foxy eat at the waterfall?" },
      options: [
        { text: { ru: "Яблоко", en: "An apple" }, ok: true },
        { text: { ru: "Морковку", en: "A carrot" }, ok: false },
        { text: { ru: "Суп", en: "Soup" }, ok: false },
      ],
      focus: 2,
    },
  },
};

const STAR: Story = {
  title: { ru: "Лисичка и загадочная звезда", en: "Foxy and the Mysterious Star" },
  start: "p1",
  length: 5,
  pages: {
    p1: {
      id: "p1",
      emoji: "🔭🌟",
      sentences: [
        { ru: "На крыше старой библиотеки Лисичка и Луна смотрели в телескоп.", en: "On the roof of the old library, Foxy and Luna were looking through a telescope." },
        { ru: "Вдруг одна звезда мигнула три раза и медленно поплыла к холмам.", en: "Suddenly one star blinked three times and slowly drifted towards the hills." },
        { ru: "«Падающая звезда?» — прошептала Лисичка.", en: "\"A falling star?\" whispered Foxy." },
        { ru: "«Нет, — задумчиво ответила Луна, — падающие звёзды летят быстро, а эта движется очень медленно».", en: "\"No,\" Luna said thoughtfully, \"falling stars are fast, and this one is moving very slowly.\"" },
      ],
      question: { ru: "Почему Луна решила, что это не падающая звезда?", en: "Why does Luna think it is not a falling star?" },
      options: [
        { text: { ru: "Она движется очень медленно", en: "It is moving very slowly" }, ok: true, next: "p2" },
        { text: { ru: "Она зелёного цвета", en: "It is green" }, ok: false },
        { text: { ru: "Она поёт песню", en: "It is singing a song" }, ok: false },
      ],
      focus: 3,
    },
    p2: {
      id: "p2",
      emoji: "⛰️🔀",
      sentences: [
        { ru: "Друзья пошли за огоньком к подножию холмов.", en: "The friends followed the light to the foot of the hills." },
        { ru: "Там тропинка разделилась на две.", en: "There the path split in two." },
        { ru: "Левая вела через тёмный шумный лес.", en: "The left path went through a dark, noisy forest." },
        { ru: "Правая поднималась вдоль тихого ручья, который блестел в лунном свете.", en: "The right path climbed along a quiet stream that sparkled in the moonlight." },
      ],
      question: { ru: "Какой путь могут выбрать друзья?", en: "Which way could the friends go?" },
      options: [
        { text: { ru: "Вдоль тихого ручья", en: "Along the quiet stream" }, ok: true, next: "p3a" },
        { text: { ru: "Через лес, с фонарём Луны", en: "Through the forest, with Luna's lantern" }, ok: true, next: "p3b" },
        { text: { ru: "Улететь к звезде на бумажном самолётике", en: "Fly to the star on a paper plane" }, ok: false },
      ],
      focus: 1,
    },
    p3a: {
      id: "p3a",
      emoji: "🏞️🐸",
      sentences: [
        { ru: "У ручья квакали лягушки, будто считали до десяти.", en: "By the stream, frogs croaked as if they were counting to ten." },
        { ru: "Лисичке показалось, что огонёк плывёт прямо по воде.", en: "Foxy thought the light was floating right on the water." },
        { ru: "Луна засмеялась: «Присмотрись, это всего лишь отражение. Сам огонёк прячется за холмом».", en: "Luna laughed: \"Look closer, it is only a reflection. The real light is hiding behind the hill.\"" },
      ],
      question: { ru: "Что объяснила Луна?", en: "What did Luna explain?" },
      options: [
        { text: { ru: "В воде было только отражение", en: "It was only a reflection in the water" }, ok: true, next: "p4" },
        { text: { ru: "Лягушки умеют летать", en: "Frogs can fly" }, ok: false },
        { text: { ru: "Ручей сделан из молока", en: "The stream is made of milk" }, ok: false },
      ],
      focus: 2,
    },
    p3b: {
      id: "p3b",
      emoji: "🌲🏮",
      sentences: [
        { ru: "В лесу ухали совы, а под лапами шуршали листья.", en: "In the forest owls hooted and leaves rustled under their paws." },
        { ru: "От фонаря Луны падали длинные тени, похожие на великанов.", en: "Luna's lantern made long shadows that looked like giants." },
        { ru: "Лисичке стало не по себе, но она вспомнила: тени никому не могут навредить.", en: "Foxy felt nervous, but she remembered that shadows cannot hurt anyone." },
        { ru: "Скоро друзья вышли на поляну за холмом.", en: "Soon the friends reached a clearing behind the hill." },
      ],
      question: { ru: "Почему «великаны» были не страшными?", en: "Why were the \"giants\" not scary?" },
      options: [
        { text: { ru: "Это были просто тени", en: "They were only shadows" }, ok: true, next: "p4" },
        { text: { ru: "Они крепко спали", en: "They were fast asleep" }, ok: false },
        { text: { ru: "Они были из конфет", en: "They were made of candy" }, ok: false },
      ],
      focus: 2,
    },
    p4: {
      id: "p4",
      emoji: "🪁✉️",
      sentences: [
        { ru: "На вершине холма друзья нашли маленького светящегося воздушного змея, застрявшего в кустах.", en: "On top of the hill the friends discovered a tiny glowing kite stuck in a bush." },
        { ru: "К его хвосту была привязана записка.", en: "A note was tied to its tail." },
        { ru: "«Дорогой друг! Мой змей улетел во время праздника. Пожалуйста, верни его. — Бруно».", en: "\"Dear finder, my kite flew away during the festival. Please bring it back. — Bruno.\"" },
      ],
      question: { ru: "Что лучше сделать друзьям со змеем?", en: "What should the friends do with the kite?" },
      options: [
        { text: { ru: "Аккуратно освободить его и вернуть Бруно", en: "Gently free it and return it to Bruno" }, ok: true, next: "p5" },
        { text: { ru: "Спрятать его в пещере навсегда", en: "Hide it in a cave forever" }, ok: false },
        { text: { ru: "Бросить его в ручей", en: "Throw it into the stream" }, ok: false },
      ],
      focus: 2,
    },
    p5: {
      id: "p5",
      emoji: "🎉🪁",
      sentences: [
        { ru: "Утром Лисичка и Луна принесли змея на праздник.", en: "The next morning Foxy and Luna brought the kite to the festival." },
        { ru: "Бруно так обрадовался, что подпрыгнул, как пружинка.", en: "Bruno was so happy that he bounced like a spring." },
        { ru: "Они запустили змея вместе, и он засиял ярче прежнего.", en: "They flew the kite together, and it glowed brighter than ever." },
        { ru: "Лисичка поняла: любую загадку интереснее разгадывать вместе с друзьями.", en: "Foxy realised that a mystery is more fun when you solve it with friends." },
      ],
      question: { ru: "Что поняла Лисичка?", en: "What did Foxy realise?" },
      options: [
        { text: { ru: "Загадки интереснее разгадывать с друзьями", en: "Mysteries are more fun with friends" }, ok: true },
        { text: { ru: "Воздушные змеи страшные", en: "Kites are scary" }, ok: false },
        { text: { ru: "Звёзды сделаны из бумаги", en: "Stars are made of paper" }, ok: false },
      ],
      focus: 3,
    },
  },
};

const STORIES: Story[] = [BALLOON, RIVER, STAR];

function pickStory(level: 1 | 2 | 3, young: boolean): Story {
  if (young) return level === 3 ? RIVER : BALLOON;
  return STORIES[level - 1];
}

function shuffle<X>(arr: X[]): X[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ReadingAdventure({ locale, young, level, onFinish }: MiniGameProps) {
  const lang = langOf(locale);
  const t = T[lang];
  const [story] = useState(() => pickStory(level, young));
  const [pageId, setPageId] = useState(story.start);
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState<number[]>(() => shuffle(story.pages[story.start].options.map((_, i) => i)));
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(false);
  const [wrong, setWrong] = useState<number[]>([]);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [answered, setAnswered] = useState<number | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "try"; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  const scoreRef = useRef(0);
  const mistakesRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentenceRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shake = useAnimationControls();

  const page = story.pages[pageId];

  const readPage = useCallback(() => {
    const p = story.pages[pageId];
    speak(`${p.sentences.map((s) => s[lang]).join(" ")} ${p.question[lang]}`, lang);
  }, [story, pageId, lang]);

  useEffect(() => {
    if (young) readPage();
  }, [young, readPage]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    sfx("levelUp");
    onFinish({ score: scoreRef.current, maxScore: story.length, mistakes: mistakesRef.current });
  }, [onFinish, story.length]);

  const choose = (optIdx: number) => {
    if (answered !== null || finished) return;
    const opt = page.options[optIdx];
    if (!opt.ok) {
      sfx("tryAgain");
      mistakesRef.current += 1;
      setMissed(true);
      setWrong((w) => (w.includes(optIdx) ? w : [...w, optIdx]));
      setHighlight(page.focus);
      setMessage({ kind: "try", text: t.almost });
      void shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      sentenceRefs.current[page.focus]?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (young) speak(page.sentences[page.focus][lang], lang);
      return;
    }
    sfx("correct");
    if (!missed) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
    setAnswered(optIdx);
    setHighlight(null);
    setMessage({ kind: "ok", text: t.great[Math.floor(Math.random() * t.great.length)] });
    timer.current = setTimeout(() => {
      if (!opt.next) {
        finish();
        return;
      }
      const nextPage = story.pages[opt.next];
      setPageId(opt.next);
      setStep((s) => s + 1);
      setOrder(shuffle(nextPage.options.map((_, i) => i)));
      setMissed(false);
      setWrong([]);
      setAnswered(null);
      setMessage(null);
      window.scrollTo?.({ top: 0, behavior: "smooth" });
    }, 1200);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center text-white">
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-7xl" aria-hidden>
          📖🦊
        </motion.div>
        <p className="font-display text-2xl">{t.theEnd}</p>
        <p className="text-lg">{t.done}</p>
        <p className="text-lg">
          {t.score}: {score} / {story.length}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 text-white">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm whitespace-nowrap">
          {t.page} {step + 1}/{story.length}
        </span>
        <Progress value={(step + (answered !== null ? 1 : 0)) / story.length} className="flex-1" label={`${t.page} ${step + 1}/${story.length}`} />
        <span className="font-display text-sm whitespace-nowrap" aria-label={`${t.score}: ${score}`}>
          ⭐ {score}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.article
          key={pageId}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="glass rounded-4xl p-4 sm:p-6"
          aria-label={story.title[lang]}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-lavender">{t.story}</p>
              <h2 className="font-display text-xl sm:text-2xl">{story.title[lang]}</h2>
            </div>
            <button
              type="button"
              onClick={readPage}
              aria-label={t.readAloud}
              className={cn("grid shrink-0 place-items-center rounded-full bg-sun text-[#4a3505] shadow-[var(--shadow-button)] transition active:scale-95", young ? "size-16" : "size-12")}
            >
              <Volume2 className={young ? "size-8" : "size-6"} aria-hidden />
            </button>
          </div>
          <div className="mb-3 text-center text-5xl sm:text-6xl" aria-hidden>
            {page.emoji}
          </div>
          <div className={cn("space-y-1 leading-relaxed", young ? "text-xl" : level === 3 ? "text-base sm:text-lg" : "text-lg")}>
            {page.sentences.map((s, i) => (
              <button
                key={i}
                ref={(el) => {
                  sentenceRefs.current[i] = el;
                }}
                type="button"
                onClick={() => speak(s[lang], lang)}
                aria-label={`${t.readSentence}: ${s[lang]}`}
                className={cn(
                  "block w-full rounded-xl px-2 py-1 text-left transition hover:bg-white/10",
                  highlight === i && "bg-sun/20 ring-2 ring-sun",
                )}
              >
                {s[lang]}
              </button>
            ))}
          </div>
        </motion.article>
      </AnimatePresence>

      <motion.div animate={shake} className="flex flex-col gap-3">
        <p className={cn("font-display text-center text-sun", young ? "text-2xl" : "text-xl")}>{page.question[lang]}</p>
        <div role="group" aria-label={t.answers} className="grid gap-3">
          {order.map((oi) => {
            const opt = page.options[oi];
            const isWrong = wrong.includes(oi);
            const isRight = answered === oi;
            return (
              <motion.button
                key={`${pageId}-${oi}`}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => choose(oi)}
                disabled={answered !== null}
                aria-label={opt.text[lang]}
                className={cn(
                  "glass rounded-3xl px-4 text-left font-display transition hover:bg-white/15",
                  young ? "min-h-16 text-xl" : "min-h-14 text-lg",
                  isWrong && "opacity-50",
                  isRight && "bg-mint/25 ring-4 ring-mint",
                )}
              >
                {opt.text[lang]}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <div className="min-h-14" aria-live="polite">
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message.text + pageId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("rounded-2xl px-4 py-3 text-center font-display text-lg", message.kind === "ok" ? "bg-mint/20 text-mint" : "bg-coral/15 text-coral")}
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
