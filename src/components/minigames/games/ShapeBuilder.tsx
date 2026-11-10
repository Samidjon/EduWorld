"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { MiniGameProps } from "@/components/minigames/types";
import type { Locale } from "@/types/content";
import { Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { sfx, speak } from "@/lib/audio";

type Lang = "ru" | "en";
const langOf = (l: Locale): Lang => (l === "en" ? "en" : "ru");

type ShapeType = "circle" | "square" | "triangle" | "rectangle" | "rhombus" | "hexagon" | "trapezoid";

const NAMES: Record<ShapeType, { ru: string; en: string }> = {
  circle: { ru: "круг", en: "circle" },
  square: { ru: "квадрат", en: "square" },
  triangle: { ru: "треугольник", en: "triangle" },
  rectangle: { ru: "прямоугольник", en: "rectangle" },
  rhombus: { ru: "ромб", en: "rhombus" },
  hexagon: { ru: "шестиугольник", en: "hexagon" },
  trapezoid: { ru: "трапеция", en: "trapezoid" },
};

const COLORS: Record<ShapeType, string> = {
  circle: "#FFD76B",
  square: "#5799E8",
  triangle: "#FF967D",
  rectangle: "#9BDDB7",
  rhombus: "#B8A5EF",
  hexagon: "#F7BF3C",
  trapezoid: "#6FD1E0",
};

const T = {
  ru: {
    picture: "Картинка",
    score: "Очки",
    instruction: "Собери картинку! Выбери фигуру, а потом нажми на место, куда она подходит.",
    listen: "Послушать задание",
    pickFirst: "Сначала выбери фигуру внизу.",
    almost: "Почти! Эта фигура сюда не подходит. Посмотри на форму и попробуй ещё.",
    great: ["Отлично!", "Подходит!", "Молодец!", "Точно!"],
    built: "Картинка собрана!",
    done: "Все картинки собраны!",
    palette: "Фигуры",
    slotEmpty: "Пустое место",
    slotFilled: "Здесь",
    selected: "Выбрано",
    target: "Силуэт картинки",
    pictures: {
      house: "Домик", snowman: "Снеговик", tree: "Ёлочка", car: "Машинка", rocket: "Ракета",
      boat: "Кораблик", kite: "Воздушный змей", lamp: "Лампа", flower: "Цветок-соты",
    },
  },
  en: {
    picture: "Picture",
    score: "Score",
    instruction: "Build the picture! Pick a shape, then tap the place where it fits.",
    listen: "Listen to the task",
    pickFirst: "First pick a shape below.",
    almost: "Almost! That shape doesn't fit here. Look at the outline and try again.",
    great: ["Great!", "It fits!", "Well done!", "Exactly!"],
    built: "Picture complete!",
    done: "All pictures built!",
    palette: "Shapes",
    slotEmpty: "Empty place",
    slotFilled: "Here is a",
    selected: "Selected",
    target: "Picture outline",
    pictures: {
      house: "House", snowman: "Snowman", tree: "Fir tree", car: "Car", rocket: "Rocket",
      boat: "Boat", kite: "Kite", lamp: "Lamp", flower: "Honeycomb flower",
    },
  },
} as const;

type PictureId = keyof (typeof T)["en"]["pictures"];

interface Slot {
  type: ShapeType;
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Picture {
  id: PictureId;
  slots: Slot[];
}

/** Coordinates in a 200x200 viewBox. Slot boxes never overlap so each place is easy to tap. */
const PICTURES: Record<PictureId, Picture> = {
  house: { id: "house", slots: [{ type: "triangle", x: 35, y: 18, w: 120, h: 62 }, { type: "square", x: 50, y: 84, w: 90, h: 90 }, { type: "circle", x: 158, y: 8, w: 36, h: 36 }] },
  snowman: { id: "snowman", slots: [{ type: "circle", x: 72, y: 12, w: 56, h: 56 }, { type: "circle", x: 55, y: 72, w: 90, h: 90 }, { type: "square", x: 10, y: 140, w: 40, h: 40 }] },
  tree: { id: "tree", slots: [{ type: "triangle", x: 40, y: 12, w: 120, h: 108 }, { type: "rectangle", x: 85, y: 124, w: 30, h: 62 }, { type: "circle", x: 150, y: 140, w: 40, h: 40 }] },
  car: { id: "car", slots: [{ type: "square", x: 72, y: 36, w: 56, h: 56 }, { type: "rectangle", x: 24, y: 96, w: 152, h: 46 }, { type: "circle", x: 40, y: 146, w: 40, h: 40 }, { type: "circle", x: 120, y: 146, w: 40, h: 40 }] },
  rocket: { id: "rocket", slots: [{ type: "triangle", x: 70, y: 8, w: 60, h: 48 }, { type: "rectangle", x: 70, y: 60, w: 60, h: 100 }, { type: "triangle", x: 28, y: 120, w: 38, h: 46 }, { type: "triangle", x: 134, y: 120, w: 38, h: 46 }, { type: "circle", x: 80, y: 164, w: 40, h: 32 }] },
  boat: { id: "boat", slots: [{ type: "triangle", x: 70, y: 20, w: 76, h: 90 }, { type: "trapezoid", x: 24, y: 116, w: 152, h: 52 }, { type: "circle", x: 10, y: 10, w: 40, h: 40 }] },
  kite: { id: "kite", slots: [{ type: "rhombus", x: 46, y: 10, w: 100, h: 120 }, { type: "triangle", x: 112, y: 140, w: 32, h: 28 }, { type: "triangle", x: 150, y: 160, w: 32, h: 28 }] },
  lamp: { id: "lamp", slots: [{ type: "trapezoid", x: 50, y: 18, w: 100, h: 60 }, { type: "rectangle", x: 88, y: 82, w: 24, h: 76 }, { type: "rectangle", x: 50, y: 162, w: 100, h: 24 }, { type: "circle", x: 160, y: 20, w: 30, h: 30 }] },
  flower: { id: "flower", slots: [{ type: "hexagon", x: 64, y: 54, w: 72, h: 64 }, { type: "hexagon", x: 2, y: 54, w: 58, h: 52 }, { type: "hexagon", x: 140, y: 54, w: 58, h: 52 }, { type: "rectangle", x: 92, y: 122, w: 16, h: 70 }, { type: "circle", x: 80, y: 8, w: 40, h: 40 }] },
};

function picturesFor(level: 1 | 2 | 3, young: boolean): Picture[] {
  const ids: PictureId[] = level === 1 ? ["house", "snowman", "tree", "car"] : level === 2 ? ["house", "tree", "car", "rocket"] : ["boat", "kite", "lamp", "flower", "rocket"];
  return ids.slice(0, young ? 3 : ids.length).map((id) => PICTURES[id]);
}

function paletteFor(level: 1 | 2 | 3, pic: Picture): ShapeType[] {
  const basic: ShapeType[] = ["circle", "square", "triangle", "rectangle"];
  const extra: ShapeType[] = level === 3 ? ["rhombus", "hexagon", "trapezoid"] : [];
  const all = [...basic, ...extra];
  const needed = new Set(pic.slots.map((s) => s.type));
  // always show the needed shapes + a couple of distractors (keeps the choice meaningful)
  const distract = all.filter((s) => !needed.has(s)).slice(0, level === 1 ? 1 : 2);
  return all.filter((s) => needed.has(s) || distract.includes(s));
}

/** Renders a basic shape inside the box (x, y, w, h). */
function ShapeSvg({ type, x, y, w, h, fill, stroke, dash, strokeWidth = 3 }: { type: ShapeType; x: number; y: number; w: number; h: number; fill: string; stroke: string; dash?: boolean; strokeWidth?: number }) {
  const common = { fill, stroke, strokeWidth, strokeDasharray: dash ? "7 6" : undefined, strokeLinejoin: "round" as const };
  switch (type) {
    case "circle":
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />;
    case "square":
    case "rectangle":
      return <rect x={x} y={y} width={w} height={h} rx={4} {...common} />;
    case "triangle":
      return <polygon points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`} {...common} />;
    case "rhombus":
      return <polygon points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`} {...common} />;
    case "hexagon":
      return <polygon points={`${x + w * 0.25},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x + w * 0.25},${y + h} ${x},${y + h / 2}`} {...common} />;
    case "trapezoid":
      return <polygon points={`${x},${y} ${x + w},${y} ${x + w * 0.8},${y + h} ${x + w * 0.2},${y + h}`} {...common} />;
  }
}

function ShapeIcon({ type, size }: { type: ShapeType; size: number }) {
  const box = type === "rectangle" ? { x: 4, y: 16, w: 52, h: 28 } : type === "trapezoid" ? { x: 4, y: 12, w: 52, h: 36 } : { x: 6, y: 6, w: 48, h: 48 };
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden>
      <ShapeSvg type={type} {...box} fill={COLORS[type]} stroke="#ffffff" strokeWidth={2} />
    </svg>
  );
}

interface Drag {
  type: ShapeType;
  x: number;
  y: number;
  moved: boolean;
  startX: number;
  startY: number;
}

export default function ShapeBuilder({ locale, young, level, onFinish }: MiniGameProps) {
  const lang = langOf(locale);
  const t = T[lang];
  const [pictures] = useState(() => picturesFor(level, young));
  const maxScore = pictures.reduce((s, p) => s + p.slots.length, 0);

  const [idx, setIdx] = useState(0);
  const [filled, setFilled] = useState<boolean[]>(() => pictures[0].slots.map(() => false));
  const [selected, setSelected] = useState<ShapeType | null>(null);
  const [score, setScore] = useState(0);
  const [missedSlots, setMissedSlots] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{ kind: "ok" | "try"; text: string } | null>(null);
  const [complete, setComplete] = useState(false);
  const [finished, setFinished] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const finishedRef = useRef(false);
  const scoreRef = useRef(0);
  const mistakesRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shake = useAnimationControls();

  const pic = pictures[idx];
  const palette = paletteFor(level, pic);

  const sayInstruction = useCallback(() => speak(t.instruction, lang), [t.instruction, lang]);
  useEffect(() => {
    if (young) sayInstruction();
  }, [young, sayInstruction]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    sfx("levelUp");
    onFinish({ score: scoreRef.current, maxScore, mistakes: mistakesRef.current });
  }, [onFinish, maxScore]);

  const choose = (type: ShapeType) => {
    if (complete) return;
    setSelected(type);
    sfx("click");
    speak(NAMES[type][lang], lang);
  };

  const place = (slotIdx: number, type: ShapeType | null) => {
    if (complete || filled[slotIdx]) return;
    if (!type) {
      setMessage({ kind: "try", text: t.pickFirst });
      if (young) speak(t.pickFirst, lang);
      return;
    }
    const slot = pic.slots[slotIdx];
    if (slot.type !== type) {
      sfx("tryAgain");
      mistakesRef.current += 1;
      setMissedSlots((m) => new Set(m).add(slotIdx));
      setMessage({ kind: "try", text: t.almost });
      void shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      return;
    }
    sfx("correct");
    if (!missedSlots.has(slotIdx)) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
    const next = filled.map((f, i) => f || i === slotIdx);
    setFilled(next);
    const name = NAMES[type][lang];
    const praise = t.great[Math.floor(Math.random() * t.great.length)];
    setMessage({ kind: "ok", text: `${praise} ${name[0].toUpperCase()}${name.slice(1)}!` });
    speak(`${praise} ${name}`, lang);
    if (next.every(Boolean)) {
      setComplete(true);
      setSelected(null);
      setTimeout(() => {
        sfx("unlock");
        setMessage({ kind: "ok", text: `🎉 ${t.built}` });
      }, 400);
      timer.current = setTimeout(() => {
        if (idx + 1 >= pictures.length) {
          finish();
          return;
        }
        const ni = idx + 1;
        setIdx(ni);
        setFilled(pictures[ni].slots.map(() => false));
        setMissedSlots(new Set());
        setComplete(false);
        setMessage(null);
      }, 2000);
    } else if (!filled.some((f, i) => !f && i !== slotIdx && pic.slots[i].type === type)) {
      setSelected(null);
    }
  };

  /* ---- drag & drop with pointer events (tap-select still works) ---- */
  const onPointerDown = (type: ShapeType, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (complete) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setDrag({ type, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, moved: d.moved || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 12 } : d));
    };
    const up = (e: PointerEvent) => {
      const d = drag;
      setDrag(null);
      if (!d) return;
      const moved = d.moved || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 12;
      if (!moved) return; // a tap: handled by onClick (select)
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el instanceof Element ? el.closest("[data-slot]") : null;
      if (slotEl) {
        const i = Number(slotEl.getAttribute("data-slot"));
        setSelected(d.type);
        place(i, d.type);
      }
    };
    const cancel = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
    // re-binding on every drag change keeps `place` fresh; the drag is short-lived
  });

  const iconSize = young ? 52 : 40;

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center text-white">
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-7xl" aria-hidden>
          🔷🔺🟡
        </motion.div>
        <p className="font-display text-2xl">{t.done}</p>
        <p className="text-lg">
          {t.score}: {score} / {maxScore}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 text-white select-none">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm whitespace-nowrap">
          {t.picture} {idx + 1}/{pictures.length}
        </span>
        <Progress value={(idx + (complete ? 1 : 0)) / pictures.length} className="flex-1" label={`${t.picture} ${idx + 1}/${pictures.length}`} />
        <span className="font-display text-sm whitespace-nowrap" aria-label={`${t.score}: ${score}`}>
          ⭐ {score}
        </span>
        <button type="button" onClick={sayInstruction} aria-label={t.listen} className={cn("grid place-items-center rounded-full bg-white/10 hover:bg-white/20", young ? "size-16" : "size-11")}>
          <Volume2 className={young ? "size-7" : "size-5"} aria-hidden />
        </button>
      </div>

      <p className={cn("text-center font-display", young ? "text-xl" : "text-base")}>
        <span className="text-sun">{t.pictures[pic.id]}</span> · {t.instruction}
      </p>

      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
        <motion.div animate={shake} className="glass relative w-full max-w-[420px] rounded-4xl p-2">
          <div className="relative aspect-square w-full">
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" role="img" aria-label={`${t.target}: ${t.pictures[pic.id]}`}>
              {pic.slots.map((s, i) =>
                filled[i] ? (
                  <motion.g key={`${idx}-${i}-f`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ transformOrigin: `${s.x + s.w / 2}px ${s.y + s.h / 2}px` }}>
                    <ShapeSvg type={s.type} x={s.x} y={s.y} w={s.w} h={s.h} fill={COLORS[s.type]} stroke="#ffffff" />
                  </motion.g>
                ) : (
                  <ShapeSvg key={`${idx}-${i}-e`} type={s.type} x={s.x} y={s.y} w={s.w} h={s.h} fill="rgba(10,14,40,0.45)" stroke="rgba(255,255,255,0.55)" dash />
                ),
              )}
            </svg>
            {pic.slots.map((s, i) => (
              <button
                key={`${idx}-slot-${i}`}
                type="button"
                data-slot={i}
                onClick={() => place(i, selected)}
                disabled={filled[i] || complete}
                aria-label={filled[i] ? `${t.slotFilled} ${NAMES[s.type][lang]}` : `${t.slotEmpty} ${i + 1}`}
                className={cn(
                  "absolute rounded-xl transition",
                  !filled[i] && selected && "hover:bg-white/10 focus-visible:bg-white/10",
                  !filled[i] && selected && young && "animate-pulse",
                )}
                style={{ left: `${(s.x / 200) * 100}%`, top: `${(s.y / 200) * 100}%`, width: `${(s.w / 200) * 100}%`, height: `${(s.h / 200) * 100}%`, minWidth: 28, minHeight: 28 }}
              />
            ))}
          </div>
        </motion.div>

        <div role="group" aria-label={t.palette} className="grid w-full max-w-[420px] grid-cols-3 gap-3 md:w-56 md:grid-cols-2">
          {palette.map((type) => (
            <button
              key={type}
              type="button"
              onPointerDown={(e) => onPointerDown(type, e)}
              onClick={() => choose(type)}
              aria-pressed={selected === type}
              aria-label={`${NAMES[type][lang]}${selected === type ? ` (${t.selected})` : ""}`}
              className={cn(
                "glass flex touch-none flex-col items-center justify-center gap-1 rounded-3xl p-2 transition hover:bg-white/15",
                young ? "min-h-24" : "min-h-20",
                selected === type && "ring-4 ring-sun bg-sun/15",
              )}
            >
              <ShapeIcon type={type} size={iconSize} />
              <span className={cn("font-display leading-tight text-center", young ? "text-base" : "text-xs sm:text-sm")}>{NAMES[type][lang]}</span>
            </button>
          ))}
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
              className={cn("rounded-2xl px-4 py-3 text-center font-display text-lg", message.kind === "ok" ? "bg-mint/20 text-mint" : "bg-coral/15 text-coral")}
            >
              {message.kind === "try" ? "💡 " : ""}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {drag?.moved && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 opacity-90" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <ShapeIcon type={drag.type} size={64} />
        </div>
      )}
    </div>
  );
}
