"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FlaskConical, Minus, Plus, ShieldAlert, Volume2 } from "lucide-react";
import type { MiniGameProps } from "@/components/minigames/types";
import type { Locale } from "@/types/content";
import { Button, Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { sfx, speak } from "@/lib/audio";

type Lang = "ru" | "en";
const langOf = (l: Locale): Lang => (l === "en" ? "en" : "ru");
type LT = { ru: string; en: string };

const T = {
  ru: {
    task: "Опыт",
    score: "Очки",
    safety: "Только в виртуальной лаборатории! Никогда не пробуй это с настоящим электричеством или огнём — попроси взрослого.",
    listen: "Послушать задание",
    step1: "1. Гипотеза: как ты думаешь?",
    step2: "2. Опыт: проверим!",
    step3: "3. Вывод: что мы узнали",
    run: "Провести опыт",
    next: "Дальше",
    finishBtn: "Завершить",
    right: "Твоя догадка подтвердилась! 🎉",
    surprise: "Почти! Результат другой — так учёные и открывают новое. Посмотри, что получилось.",
    sortRight: "Все догадки верны! 🎉",
    sortSome: "Почти! Некоторые предметы удивили. Посмотри на результат.",
    temperature: "Температура",
    warm: "Нагреть",
    cool: "Охладить",
    ice: "Лёд", water: "Вода", steam: "Пар",
    goalTemp: "Цель",
    reached: "Получилось!",
    float: "Плавает", sink: "Тонет",
    conducts: "Лампа горит", insulates: "Не горит",
    predictAll: "Сделай догадку для каждого предмета.",
    switchOn: "Замкнуть выключатель",
    switchOff: "Разомкнуть выключатель",
    bulbOn: "Лампочка горит!",
    bulbOff: "Лампочка не горит.",
    closeIt: "Замкни выключатель, чтобы проверить.",
    done: "Ты настоящий учёный!",
    yourGuess: "Твоя догадка",
    result: "Результат",
    lab: "Лаборатория",
  },
  en: {
    task: "Experiment",
    score: "Score",
    safety: "Only in the virtual lab! Never try this with real electricity or fire — ask an adult.",
    listen: "Listen to the task",
    step1: "1. Hypothesis: what do you think?",
    step2: "2. Experiment: let's test it!",
    step3: "3. Conclusion: what we learned",
    run: "Run the experiment",
    next: "Next",
    finishBtn: "Finish",
    right: "Your guess was right! 🎉",
    surprise: "Almost! The result is different — that's how scientists discover new things. Look what happened.",
    sortRight: "All your guesses were right! 🎉",
    sortSome: "Almost! Some objects surprised us. Look at the result.",
    temperature: "Temperature",
    warm: "Warm up",
    cool: "Cool down",
    ice: "Ice", water: "Water", steam: "Steam",
    goalTemp: "Goal",
    reached: "You did it!",
    float: "Floats", sink: "Sinks",
    conducts: "Bulb lights", insulates: "No light",
    predictAll: "Make a guess for every object.",
    switchOn: "Close the switch",
    switchOff: "Open the switch",
    bulbOn: "The bulb is shining!",
    bulbOff: "The bulb is off.",
    closeIt: "Close the switch to test it.",
    done: "You are a real scientist!",
    yourGuess: "Your guess",
    result: "Result",
    lab: "Lab",
  },
} as const;

type Matter = "ice" | "water" | "steam";
const matterAt = (temp: number): Matter => (temp <= 0 ? "ice" : temp >= 100 ? "steam" : "water");

interface Choice {
  text: LT;
  ok: boolean;
}
interface SortItem {
  emoji: string;
  name: LT;
  /** float task: true = floats. circuit task: true = conducts electricity. */
  yes: boolean;
}
type Task =
  | { kind: "temp"; title: LT; question: LT; choices: Choice[]; start: number; target: Matter; explain: LT }
  | { kind: "switch"; title: LT; question: LT; choices: Choice[]; explain: LT }
  | { kind: "sort"; mode: "float" | "conduct"; title: LT; question: LT; items: SortItem[]; explain: LT };

const MELT: Task = {
  kind: "temp",
  title: { ru: "Тает ли лёд?", en: "Does ice melt?" },
  question: { ru: "Что будет со льдом, если его нагреть?", en: "What happens to ice when we warm it up?" },
  choices: [
    { text: { ru: "Он растает и станет водой", en: "It melts into water" }, ok: true },
    { text: { ru: "Он превратится в камень", en: "It turns into stone" }, ok: false },
    { text: { ru: "Он навсегда останется льдом", en: "It stays ice forever" }, ok: false },
  ],
  start: -10,
  target: "water",
  explain: {
    ru: "Лёд — это вода в твёрдом состоянии. При температуре выше 0 °C лёд тает и становится жидкой водой.",
    en: "Ice is water in a solid state. Above 0 °C ice melts and becomes liquid water.",
  },
};
const BOIL: Task = {
  kind: "temp",
  title: { ru: "Когда вода кипит?", en: "When does water boil?" },
  question: { ru: "При какой температуре вода начинает кипеть и превращаться в пар?", en: "At what temperature does water boil and turn into steam?" },
  choices: [
    { text: { ru: "0 °C", en: "0 °C" }, ok: false },
    { text: { ru: "50 °C", en: "50 °C" }, ok: false },
    { text: { ru: "100 °C", en: "100 °C" }, ok: true },
  ],
  start: 20,
  target: "steam",
  explain: {
    ru: "При 100 °C вода кипит и превращается в пар — это газ. Пар невидимый и очень горячий, поэтому кипяток трогает только взрослый.",
    en: "At 100 °C water boils and turns into steam — a gas. Steam is very hot, so only adults handle boiling water.",
  },
};
const FREEZE: Task = {
  kind: "temp",
  title: { ru: "Вода в морозилке", en: "Water in the freezer" },
  question: { ru: "Что будет с водой, если её сильно охладить?", en: "What happens to water when it gets very cold?" },
  choices: [
    { text: { ru: "Она замёрзнет и станет льдом", en: "It freezes into ice" }, ok: true },
    { text: { ru: "Она станет соком", en: "It turns into juice" }, ok: false },
    { text: { ru: "Она станет горячей", en: "It gets hot" }, ok: false },
  ],
  start: 20,
  target: "ice",
  explain: {
    ru: "При 0 °C и ниже вода замерзает и становится твёрдым льдом. Лёд, вода и пар — это одно и то же вещество в разных состояниях.",
    en: "At 0 °C and below, water freezes into solid ice. Ice, water and steam are the same substance in different states.",
  },
};
const CONDENSE: Task = {
  kind: "temp",
  title: { ru: "Капли на крышке", en: "Drops on the lid" },
  question: { ru: "Что будет с паром, если его охладить?", en: "What happens to steam when it cools down?" },
  choices: [
    { text: { ru: "Он снова станет водой", en: "It turns back into water" }, ok: true },
    { text: { ru: "Он станет песком", en: "It turns into sand" }, ok: false },
    { text: { ru: "Он станет ещё горячее", en: "It gets even hotter" }, ok: false },
  ],
  start: 110,
  target: "water",
  explain: {
    ru: "Когда пар остывает ниже 100 °C, он снова превращается в капельки воды. Это называется конденсация — так появляются капли на крышке кастрюли и облака в небе.",
    en: "When steam cools below 100 °C it turns back into water droplets. This is called condensation — it makes drops on a pot lid and clouds in the sky.",
  },
};
const SWITCH: Task = {
  kind: "switch",
  title: { ru: "Простая электрическая цепь", en: "A simple circuit" },
  question: { ru: "Будет ли гореть лампочка, если выключатель разомкнут (цепь разорвана)?", en: "Will the bulb shine when the switch is open (the loop is broken)?" },
  choices: [
    { text: { ru: "Нет, току нужен замкнутый путь", en: "No, electricity needs a closed loop" }, ok: true },
    { text: { ru: "Да, лампочка горит всегда", en: "Yes, the bulb always shines" }, ok: false },
  ],
  explain: {
    ru: "Электрический ток бежит только по замкнутой цепи: от батарейки по проводу к лампочке и обратно. Выключатель открывает и закрывает этот путь.",
    en: "Electric current flows only around a closed loop: from the battery through the wire to the bulb and back. A switch opens and closes that path.",
  },
};

const FLOAT_ITEMS: SortItem[] = [
  { emoji: "🍎", name: { ru: "Яблоко", en: "Apple" }, yes: true },
  { emoji: "🔑", name: { ru: "Ключ", en: "Key" }, yes: false },
  { emoji: "🪵", name: { ru: "Деревянный брусок", en: "Wooden block" }, yes: true },
  { emoji: "🪨", name: { ru: "Камень", en: "Stone" }, yes: false },
  { emoji: "🦆", name: { ru: "Резиновая уточка", en: "Rubber duck" }, yes: true },
  { emoji: "🔑", name: { ru: "Ключ", en: "Key" }, yes: false },
];
const CONDUCT_ITEMS: SortItem[] = [
  { emoji: "🥄", name: { ru: "Металлическая ложка", en: "Metal spoon" }, yes: true },
  { emoji: "🪵", name: { ru: "Деревянная палочка", en: "Wooden stick" }, yes: false },
  { emoji: "📎", name: { ru: "Скрепка", en: "Paper clip" }, yes: true },
  { emoji: "📏", name: { ru: "Пластиковая линейка", en: "Plastic ruler" }, yes: false },
  { emoji: "🔑", name: { ru: "Металлический ключ", en: "Metal key" }, yes: true },
  { emoji: "🧶", name: { ru: "Шерстяная нитка", en: "Wool thread" }, yes: false },
];

function buildTasks(level: 1 | 2 | 3, young: boolean): Task[] {
  const n = young || level === 1 ? 4 : level === 2 ? 5 : 6;
  const floatTask: Task = {
    kind: "sort",
    mode: "float",
    title: { ru: "Тонет или плавает?", en: "Sink or float?" },
    question: { ru: "Как ты думаешь, какие предметы будут плавать, а какие утонут?", en: "Which objects do you think will float and which will sink?" },
    items: FLOAT_ITEMS.slice(0, n),
    explain: {
      ru: "Плавают предметы, которые легче воды такого же размера: дерево, яблоко, полая уточка с воздухом внутри. Плотные и тяжёлые для своего размера — металл и камень — тонут.",
      en: "Objects that are lighter than the same amount of water float: wood, an apple, a hollow duck full of air. Things that are heavy for their size — metal and stone — sink.",
    },
  };
  const conductTask: Task = {
    kind: "sort",
    mode: "conduct",
    title: { ru: "Проводник или изолятор?", en: "Conductor or insulator?" },
    question: { ru: "Вставим предмет в разрыв цепи. С какими предметами лампочка загорится?", en: "We put each object into the gap in the circuit. Which ones will make the bulb light up?" },
    items: CONDUCT_ITEMS.slice(0, n),
    explain: {
      ru: "Металлы — проводники: они пропускают электрический ток. Дерево, пластик и шерсть — изоляторы: ток через них не идёт. Поэтому провода покрыты пластиком.",
      en: "Metals are conductors: they let electric current pass. Wood, plastic and wool are insulators: current can't pass through them. That's why wires are covered in plastic.",
    },
  };
  if (young) return [MELT, floatTask, SWITCH, conductTask];
  if (level === 1) return [MELT, FREEZE, floatTask, SWITCH, conductTask, BOIL];
  if (level === 2) return [MELT, BOIL, floatTask, SWITCH, FREEZE, conductTask];
  return [MELT, BOIL, FREEZE, floatTask, CONDENSE, SWITCH, conductTask];
}

const taskMax = (t: Task) => (t.kind === "sort" ? t.items.length + 1 : 2);

/* ---------------- Visual pieces ---------------- */

function Beaker({ temp, lang }: { temp: number; lang: Lang }) {
  const state = matterAt(temp);
  const tt = T[lang];
  const level = state === "steam" ? 40 : 90;
  const thermo = Math.max(0, Math.min(1, (temp + 20) / 140));
  const heat = temp > 60;
  return (
    <svg viewBox="0 0 240 200" className="w-full max-w-[320px]" role="img" aria-label={`${tt.temperature} ${temp} °C — ${tt[state]}`}>
      {/* heater plate */}
      <rect x="40" y="178" width="120" height="12" rx="6" fill={heat ? "#ff967d" : "#3f4994"} />
      {/* liquid */}
      {state !== "ice" && <rect x="52" y={170 - level} width="96" height={level} rx="6" fill="#5799e8" opacity="0.8" />}
      {state === "ice" && (
        <g>
          <rect x="56" y="120" width="40" height="40" rx="6" fill="#d8f0ff" stroke="#ffffff" strokeWidth="2" />
          <rect x="100" y="112" width="44" height="48" rx="6" fill="#c7e8ff" stroke="#ffffff" strokeWidth="2" />
          <rect x="74" y="80" width="40" height="36" rx="6" fill="#e6f6ff" stroke="#ffffff" strokeWidth="2" />
        </g>
      )}
      {state === "water" && temp > 60 && [70, 100, 130].map((x, i) => (
        <motion.circle key={x} cx={x} cy={160} r={4} fill="#d8f0ff" animate={{ cy: [160, 100], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.4 }} />
      ))}
      {state === "steam" && [70, 100, 130].map((x, i) => (
        <motion.path key={x} d={`M${x} 120 q 10 -15 0 -30 q -10 -15 0 -30`} stroke="#f3f5ff" strokeWidth="5" fill="none" strokeLinecap="round" animate={{ y: [0, -30], opacity: [0.9, 0] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.5 }} />
      ))}
      {/* glass */}
      <path d="M48 40 V166 a8 8 0 0 0 8 8 H144 a8 8 0 0 0 8 -8 V40" fill="none" stroke="#f3f5ff" strokeWidth="4" strokeLinecap="round" />
      {/* thermometer */}
      <rect x="190" y="30" width="16" height="140" rx="8" fill="#252d66" stroke="#f3f5ff" strokeWidth="2" />
      <rect x="194" y={34 + 132 * (1 - thermo)} width="8" height={132 * thermo} rx="4" fill={temp <= 0 ? "#a8d8f0" : temp >= 100 ? "#ff967d" : "#ffd76b"} />
      <text x="198" y="190" textAnchor="middle" fill="#f3f5ff" fontSize="14" fontWeight="bold">{temp}°</text>
    </svg>
  );
}

function Circuit({ closed, gapItem, lit, lang }: { closed: boolean; gapItem?: string; lit: boolean; lang: Lang }) {
  const tt = T[lang];
  return (
    <svg viewBox="0 0 260 170" className="w-full max-w-[360px]" role="img" aria-label={lit ? tt.bulbOn : tt.bulbOff}>
      {/* wires */}
      <path d="M40 120 V40 H120" stroke="#ffd76b" strokeWidth="5" fill="none" strokeLinejoin="round" />
      <path d="M150 40 H220 V120 H190" stroke="#ffd76b" strokeWidth="5" fill="none" strokeLinejoin="round" />
      <path d="M40 120 H70" stroke="#ffd76b" strokeWidth="5" />
      {/* battery */}
      <rect x="70" y="105" width="56" height="30" rx="6" fill="#9bddb7" />
      <rect x="126" y="113" width="6" height="14" rx="2" fill="#9bddb7" />
      <text x="98" y="125" textAnchor="middle" fontSize="14" fill="#0f3d2a" fontWeight="bold">+ −</text>
      <path d="M132 120 H150" stroke="#ffd76b" strokeWidth="5" />
      {/* switch or gap */}
      {gapItem === undefined ? (
        <g>
          <circle cx="152" cy="120" r="5" fill="#f3f5ff" />
          <circle cx="190" cy="120" r="5" fill="#f3f5ff" />
          <motion.line x1="152" y1="120" x2="190" y2="120" stroke="#f3f5ff" strokeWidth="5" strokeLinecap="round" style={{ originX: "152px", originY: "120px" }} animate={{ rotate: closed ? 0 : -35 }} />
        </g>
      ) : (
        <g>
          <circle cx="152" cy="120" r="5" fill="#f3f5ff" />
          <circle cx="190" cy="120" r="5" fill="#f3f5ff" />
          <text x="171" y="128" textAnchor="middle" fontSize="24">{gapItem}</text>
        </g>
      )}
      {/* bulb */}
      {lit && <motion.circle cx="135" cy="36" r="34" fill="#ffd76b" initial={{ opacity: 0 }} animate={{ opacity: [0.25, 0.45, 0.25] }} transition={{ repeat: Infinity, duration: 1.2 }} />}
      <circle cx="135" cy="32" r="18" fill={lit ? "#fff3c4" : "#3f4994"} stroke="#f3f5ff" strokeWidth="3" />
      <rect x="125" y="48" width="20" height="10" rx="2" fill="#b8a5ef" />
      <path d="M128 34 l4 -6 l3 6 l3 -6 l4 6" stroke={lit ? "#f7bf3c" : "#9aa3d9"} strokeWidth="2" fill="none" />
    </svg>
  );
}

/* ---------------- Main component ---------------- */

type Phase = "predict" | "run" | "explain";

export default function ScienceLab({ locale, young, level, onFinish }: MiniGameProps) {
  const lang = langOf(locale);
  const t = T[lang];
  const [tasks] = useState(() => buildTasks(level, young));
  const maxScore = tasks.reduce((s, x) => s + taskMax(x), 0);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("predict");
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [sortGuess, setSortGuess] = useState<(boolean | null)[]>([]);
  const [temp, setTemp] = useState(0);
  const [closed, setClosed] = useState(false);
  const [sawOpen, setSawOpen] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [verdict, setVerdict] = useState<{ ok: boolean; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  const scoreRef = useRef(0);
  const mistakesRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const task = tasks[idx];

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const addScore = (n: number) => {
    scoreRef.current += n;
    setScore(scoreRef.current);
  };

  const sayTask = useCallback(() => {
    const tk = tasks[idx];
    speak(`${tk.title[lang]}. ${tk.question[lang]}`, lang);
  }, [tasks, idx, lang]);

  // reset per task
  useEffect(() => {
    const tk = tasks[idx];
    setPhase("predict");
    setGuess(null);
    setVerdict(null);
    setRevealed(0);
    setClosed(false);
    setSawOpen(false);
    setSortGuess(tk.kind === "sort" ? tk.items.map(() => null) : []);
    setTemp(tk.kind === "temp" ? tk.start : 0);
    if (young) speak(`${tk.title[lang]}. ${tk.question[lang]}`, lang);
  }, [idx, tasks, young, lang]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    sfx("levelUp");
    onFinish({ score: scoreRef.current, maxScore, mistakes: mistakesRef.current });
  }, [onFinish, maxScore]);

  const startRun = () => {
    if (task.kind === "sort") {
      if (sortGuess.some((g) => g === null)) return;
      setPhase("run");
      sfx("click");
      task.items.forEach((_, i) => later(() => setRevealed(i + 1), 500 + i * 450));
      later(() => {
        const right = task.items.filter((it, i) => sortGuess[i] === it.yes).length;
        const wrong = task.items.length - right;
        addScore(right + 1);
        mistakesRef.current += wrong;
        if (wrong === 0) sfx("correct");
        else sfx("tryAgain");
        setVerdict({ ok: wrong === 0, text: wrong === 0 ? t.sortRight : t.sortSome });
      }, 600 + task.items.length * 450);
      return;
    }
    if (guess === null) return;
    sfx("click");
    setPhase("run");
  };

  const conclude = (ok: boolean) => {
    addScore(ok ? 2 : 1);
    if (ok) sfx("correct");
    else {
      sfx("tryAgain");
      mistakesRef.current += 1;
    }
    setVerdict({ ok, text: ok ? t.right : t.surprise });
  };

  // temperature experiment completes when the target state is reached
  useEffect(() => {
    if (phase !== "run" || task.kind !== "temp" || verdict) return;
    if (matterAt(temp) === task.target) {
      const ok = guess !== null && task.choices[guess].ok;
      const id = setTimeout(() => conclude(ok), 600);
      return () => clearTimeout(id);
    }
  }, [temp, phase, task, verdict, guess, conclude]);

  const toggleSwitch = () => {
    if (task.kind !== "switch" || verdict) return;
    const next = !closed;
    setClosed(next);
    sfx("click");
    if (!next) setSawOpen(true);
    if (next) {
      const ok = guess !== null && task.choices[guess].ok;
      later(() => conclude(ok), 700);
    }
  };

  const goNext = () => {
    if (phase === "run") {
      setPhase("explain");
      speak(task.explain[lang], lang);
      return;
    }
    if (idx + 1 >= tasks.length) finish();
    else setIdx(idx + 1);
  };

  const big = young ? "min-h-16 text-xl" : "min-h-14 text-lg";

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center text-white">
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-7xl" aria-hidden>
          🧪🔬
        </motion.div>
        <p className="font-display text-2xl">{t.done}</p>
        <p className="text-lg">
          {t.score}: {score} / {maxScore}
        </p>
      </div>
    );
  }

  const steps: { key: Phase; label: string }[] = [
    { key: "predict", label: t.step1 },
    { key: "run", label: t.step2 },
    { key: "explain", label: t.step3 },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 text-white">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm whitespace-nowrap">
          {t.task} {idx + 1}/{tasks.length}
        </span>
        <Progress value={(idx + (phase === "explain" ? 1 : 0)) / tasks.length} className="flex-1" label={`${t.task} ${idx + 1}/${tasks.length}`} />
        <span className="font-display text-sm whitespace-nowrap" aria-label={`${t.score}: ${score}`}>
          ⭐ {score}
        </span>
        <button type="button" onClick={sayTask} aria-label={t.listen} className={cn("grid place-items-center rounded-full bg-white/10 hover:bg-white/20", young ? "size-16" : "size-11")}>
          <Volume2 className={young ? "size-7" : "size-5"} aria-hidden />
        </button>
      </div>

      <div role="note" className="flex items-start gap-2 rounded-2xl border border-sun/40 bg-sun/10 px-3 py-2 text-sm text-sun">
        <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
        <span>{t.safety}</span>
      </div>

      <ol className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm" aria-label={t.lab}>
        {steps.map((s) => (
          <li key={s.key} aria-current={phase === s.key ? "step" : undefined} className={cn("rounded-xl px-2 py-1.5 font-display", phase === s.key ? "bg-lavender/30 text-white ring-2 ring-lavender" : "bg-white/5 text-white/60")}>
            {s.label}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.section key={`${idx}-${phase}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass flex flex-col gap-4 rounded-4xl p-4 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl sm:text-2xl">
            <FlaskConical className="size-6 text-mint" aria-hidden /> {task.title[lang]}
          </h2>

          {/* ---------- PREDICT ---------- */}
          {phase === "predict" && (
            <>
              <p className={cn("font-display", young ? "text-xl" : "text-lg")}>{task.question[lang]}</p>
              {task.kind !== "sort" ? (
                <div className="grid gap-3" role="radiogroup" aria-label={t.step1}>
                  {task.choices.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={guess === i}
                      onClick={() => {
                        setGuess(i);
                        sfx("click");
                      }}
                      className={cn("glass rounded-3xl px-4 text-left font-display transition hover:bg-white/15", big, guess === i && "bg-sun/20 ring-4 ring-sun")}
                    >
                      {c.text[lang]}
                    </button>
                  ))}
                </div>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {task.items.map((it, i) => (
                    <li key={it.emoji + i} className="flex items-center gap-2 rounded-2xl bg-white/5 p-2">
                      <span className="text-4xl" aria-hidden>
                        {it.emoji}
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-semibold sm:text-base">{it.name[lang]}</span>
                      {[true, false].map((v) => {
                        const label = task.mode === "float" ? (v ? t.float : t.sink) : v ? t.conducts : t.insulates;
                        const icon = task.mode === "float" ? (v ? "🛟" : "⬇️") : v ? "💡" : "🚫";
                        return (
                          <button
                            key={String(v)}
                            type="button"
                            aria-pressed={sortGuess[i] === v}
                            aria-label={`${it.name[lang]}: ${label}`}
                            title={label}
                            onClick={() => {
                              sfx("click");
                              setSortGuess((g) => g.map((x, j) => (j === i ? v : x)));
                            }}
                            className={cn("grid place-items-center rounded-2xl bg-white/10 text-2xl transition hover:bg-white/20", young ? "size-16" : "size-12", sortGuess[i] === v && "bg-sun/25 ring-4 ring-sun")}
                          >
                            {icon}
                          </button>
                        );
                      })}
                    </li>
                  ))}
                </ul>
              )}
              {task.kind === "sort" && sortGuess.some((g) => g === null) && <p className="text-sm text-white/70">{t.predictAll}</p>}
              <Button
                variant="mint"
                size={young ? "xl" : "lg"}
                onClick={startRun}
                disabled={task.kind === "sort" ? sortGuess.some((g) => g === null) : guess === null}
                className="self-center"
              >
                🔬 {t.run}
              </Button>
            </>
          )}

          {/* ---------- RUN ---------- */}
          {phase === "run" && task.kind === "temp" && (
            <div className="flex flex-col items-center gap-3">
              <p className="font-display text-lg">
                {t.goalTemp}: <span className="text-sun">{t[task.target]}</span> · {t.temperature}: {temp} °C → <span className="text-mint">{t[matterAt(temp)]}</span>
              </p>
              <Beaker temp={temp} lang={lang} />
              <div className="flex w-full max-w-md items-center gap-3">
                <button type="button" aria-label={t.cool} disabled={!!verdict} onClick={() => setTemp((v) => Math.max(-20, v - 10))} className={cn("grid shrink-0 place-items-center rounded-2xl bg-[#5799e8]/40 hover:bg-[#5799e8]/60 disabled:opacity-50", young ? "size-16" : "size-12")}>
                  <Minus className="size-6" aria-hidden />
                </button>
                <input
                  type="range"
                  min={-20}
                  max={120}
                  step={1}
                  value={temp}
                  disabled={!!verdict}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  aria-label={t.temperature}
                  aria-valuetext={`${temp} °C`}
                  className="h-3 min-w-0 flex-1 cursor-pointer accent-[#FFD76B]"
                />
                <button type="button" aria-label={t.warm} disabled={!!verdict} onClick={() => setTemp((v) => Math.min(120, v + 10))} className={cn("grid shrink-0 place-items-center rounded-2xl bg-coral/40 hover:bg-coral/60 disabled:opacity-50", young ? "size-16" : "size-12")}>
                  <Plus className="size-6" aria-hidden />
                </button>
              </div>
            </div>
          )}

          {phase === "run" && task.kind === "switch" && (
            <div className="flex flex-col items-center gap-3">
              <Circuit closed={closed} lit={closed} lang={lang} />
              <p className="font-display text-lg" aria-live="polite">
                {closed ? t.bulbOn : sawOpen ? t.bulbOff : t.closeIt}
              </p>
              <Button variant={closed ? "glass" : "sun"} size={young ? "xl" : "lg"} onClick={toggleSwitch} disabled={!!verdict}>
                {closed ? t.switchOff : t.switchOn}
              </Button>
            </div>
          )}

          {phase === "run" && task.kind === "sort" && task.mode === "float" && (
            <div className="relative mx-auto h-56 w-full max-w-lg overflow-hidden rounded-3xl border-4 border-white/40 bg-gradient-to-b from-transparent from-20% via-[#5799e8]/50 via-20% to-[#3f7fdc]/80" role="img" aria-label={t.result}>
              {task.items.map((it, i) => {
                const shown = i < revealed;
                const x = ((i + 0.5) / task.items.length) * 100;
                return (
                  <motion.span
                    key={i}
                    className="absolute text-4xl"
                    style={{ left: `calc(${x}% - 1.25rem)` }}
                    initial={{ top: "-20%" }}
                    animate={{ top: shown ? (it.yes ? "10%" : "72%") : "-20%" }}
                    transition={{ type: "spring", stiffness: 60, damping: 10 }}
                    aria-hidden
                  >
                    {it.emoji}
                  </motion.span>
                );
              })}
            </div>
          )}

          {phase === "run" && task.kind === "sort" && (
            <ul className="grid gap-2 sm:grid-cols-2" aria-live="polite">
              {task.items.slice(0, revealed).map((it, i) => {
                const label = task.mode === "float" ? (it.yes ? t.float : t.sink) : it.yes ? t.conducts : t.insulates;
                const match = sortGuess[i] === it.yes;
                return (
                  <motion.li key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cn("flex items-center gap-2 rounded-2xl p-2", match ? "bg-mint/15" : "bg-lavender/15")}>
                    {task.mode === "conduct" && (
                      <span className="w-16 shrink-0">
                        <Circuit closed gapItem={it.emoji} lit={it.yes} lang={lang} />
                      </span>
                    )}
                    {task.mode === "float" && <span className="text-3xl" aria-hidden>{it.emoji}</span>}
                    <span className="min-w-0 flex-1 text-sm">
                      <b>{it.name[lang]}</b>: {label}
                    </span>
                    <span aria-label={match ? t.right : t.yourGuess} className="text-xl">{match ? "✅" : "🔄"}</span>
                  </motion.li>
                );
              })}
            </ul>
          )}

          {phase === "run" && verdict && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3" aria-live="polite">
              <p className={cn("rounded-2xl px-4 py-3 text-center font-display text-lg", verdict.ok ? "bg-mint/20 text-mint" : "bg-coral/15 text-coral")}>
                {task.kind === "temp" && `${t.reached} `}
                {verdict.text}
              </p>
              <Button variant="primary" size={young ? "xl" : "lg"} onClick={goNext}>
                {t.next}
              </Button>
            </motion.div>
          )}

          {/* ---------- EXPLAIN ---------- */}
          {phase === "explain" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="text-5xl" aria-hidden>
                  🦉
                </span>
                <p className={cn("leading-relaxed", young ? "text-xl" : "text-lg")}>{task.explain[lang]}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="glass" size={young ? "xl" : "lg"} onClick={() => speak(task.explain[lang], lang)} aria-label={t.listen} icon={<Volume2 className="size-6" aria-hidden />} />
                <Button variant="sun" size={young ? "xl" : "lg"} onClick={goNext}>
                  {idx + 1 >= tasks.length ? t.finishBtn : t.next}
                </Button>
              </div>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
