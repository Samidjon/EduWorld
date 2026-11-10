import type { Question } from "@/types/content";
import { rng } from "@/lib/rng";

/**
 * Procedural question generators. A generated question id has the form
 * `gen:<generatorId>:<seed>` and can be deterministically re-created on the server
 * to check the answer, so correct answers never have to be trusted from the client.
 */

type Gen = { topicId: string; make: (seed: number, id: string) => Question };

const FRUITS = ["🍎", "🍐", "🍊", "🍓", "🍌", "🍒", "⭐", "🌼"];

const num = (id: string, prompt: string, promptRu: string, answer: number, explanation: [string, string], difficulty: 1 | 2 | 3 | 4 | 5, extra: Partial<Question> = {}): Question =>
  ({
    id,
    type: "number_input",
    prompt: { en: prompt, ru: promptRu },
    answer,
    difficulty,
    explanation: { en: explanation[0], ru: explanation[1] },
    hint: { en: "Take it step by step. You can use your fingers or draw dots.", ru: "Давай по шагам. Можно считать на пальцах или нарисовать точки." },
    ...extra,
  }) as Question;

export const GENERATORS: Record<string, Gen> = {
  "count-objects": {
    topicId: "early.counting",
    make: (seed, id) => {
      const r = rng(seed);
      const n = r.int(2, 9);
      const e = r.pick(FRUITS);
      return num(id, "How many are there?", "Сколько здесь предметов?", n, [`There are ${n}.`, `Здесь ${n}.`], 1, {
        audio: true,
        visual: { kind: "emoji", items: Array(n).fill(e) },
      });
    },
  },
  "add-within-10": {
    topicId: "math.addition-20",
    make: (seed, id) => {
      const r = rng(seed);
      const a = r.int(1, 6), b = r.int(1, 10 - a);
      return num(id, `${a} + ${b} = ?`, `${a} + ${b} = ?`, a + b, [`${a} + ${b} = ${a + b}. Start at ${a} and count on ${b}.`, `${a} + ${b} = ${a + b}. Начни с ${a} и досчитай ещё ${b}.`], 1, {
        audio: true,
        visual: { kind: "emoji", items: [...Array(a).fill("🍎"), ...Array(b).fill("🍐")], caption: { en: `${a} and ${b}`, ru: `${a} и ${b}` } },
      });
    },
  },
  "add-within-20": {
    topicId: "math.addition-20",
    make: (seed, id) => {
      const r = rng(seed);
      const a = r.int(3, 12), b = r.int(2, 20 - a);
      return num(id, `${a} + ${b} = ?`, `${a} + ${b} = ?`, a + b, [`${a} + ${b} = ${a + b}. Tip: make a ten first.`, `${a} + ${b} = ${a + b}. Совет: сначала дополни до десяти.`], 2);
    },
  },
  "sub-within-20": {
    topicId: "math.subtraction-20",
    make: (seed, id) => {
      const r = rng(seed);
      const a = r.int(6, 20), b = r.int(1, a - 1);
      return num(id, `${a} − ${b} = ?`, `${a} − ${b} = ?`, a - b, [`${a} − ${b} = ${a - b}. Count back ${b} from ${a}.`, `${a} − ${b} = ${a - b}. Отсчитай назад ${b} от ${a}.`], 2);
    },
  },
  "compare-numbers": {
    topicId: "math.compare-numbers",
    make: (seed, id) => {
      const r = rng(seed);
      const a = r.int(1, 99);
      let b = r.int(1, 99);
      if (r.next() < 0.15) b = a;
      const answer = a > b ? 0 : a < b ? 1 : 2;
      return {
        id, type: "single", difficulty: 1,
        prompt: { en: `Which sign goes between ${a} and ${b}?`, ru: `Какой знак поставить между ${a} и ${b}?` },
        options: [{ en: ">", ru: ">" }, { en: "<", ru: "<" }, { en: "=", ru: "=" }],
        answer,
        visual: { kind: "equation", text: `${a} ☐ ${b}` },
        hint: { en: "Compare the tens first, then the ones.", ru: "Сначала сравни десятки, потом единицы." },
        explanation: { en: `${a} ${[">", "<", "="][answer]} ${b}. The open side of the sign faces the bigger number.`, ru: `${a} ${[">", "<", "="][answer]} ${b}. Знак «открыт» в сторону большего числа.` },
      };
    },
  },
  "place-value": {
    topicId: "math.place-value",
    make: (seed, id) => {
      const r = rng(seed);
      const h = r.int(1, 9), t = r.int(0, 9), o = r.int(0, 9);
      const n = h * 100 + t * 10 + o;
      return num(id, `How many tens are in ${n}? (the tens digit)`, `Какая цифра стоит в разряде десятков в числе ${n}?`, t, [`${n} = ${h} hundreds, ${t} tens, ${o} ones.`, `${n} = ${h} сот., ${t} дес., ${o} ед.`], 2);
    },
  },
  "mult-table": {
    topicId: "math.multiplication",
    make: (seed, id) => {
      const r = rng(seed);
      const a = r.int(2, 9), b = r.int(2, 9);
      return num(id, `${a} × ${b} = ?`, `${a} × ${b} = ?`, a * b, [`${a} × ${b} = ${a * b}: ${a} groups of ${b}.`, `${a} × ${b} = ${a * b}: ${a} группы по ${b}.`], 2, {
        visual: a * b <= 30 ? { kind: "groups", emoji: r.pick(FRUITS), groups: a, per: b } : undefined,
      });
    },
  },
  "div-table": {
    topicId: "math.division",
    make: (seed, id) => {
      const r = rng(seed);
      const a = r.int(2, 9), b = r.int(2, 9);
      return num(id, `${a * b} ÷ ${a} = ?`, `${a * b} : ${a} = ?`, b, [`${a} × ${b} = ${a * b}, so ${a * b} ÷ ${a} = ${b}.`, `${a} × ${b} = ${a * b}, значит ${a * b} : ${a} = ${b}.`], 3);
    },
  },
  "fraction-compare": {
    topicId: "math.fractions",
    make: (seed, id) => {
      const r = rng(seed);
      const d = r.pick([3, 4, 5, 6, 8]);
      const a = r.int(1, d - 1);
      let b = r.int(1, d - 1);
      if (a === b) b = a === 1 ? 2 : a - 1;
      const bigger = a > b ? 0 : 1;
      return {
        id, type: "single", difficulty: 3,
        prompt: { en: "Which fraction is bigger?", ru: "Какая дробь больше?" },
        options: [{ en: `${a}/${d}`, ru: `${a}/${d}` }, { en: `${b}/${d}`, ru: `${b}/${d}` }],
        answer: bigger,
        visual: { kind: "fraction", num: Math.max(a, b), den: d },
        hint: { en: "Same denominator: compare the numerators.", ru: "Знаменатели одинаковые - сравни числители." },
        explanation: { en: `Both are cut into ${d} parts, so more parts means bigger.`, ru: `Целое разделено на ${d} частей в обоих случаях, поэтому больше та дробь, где больше частей.` },
      };
    },
  },
  "decimal-add": {
    topicId: "math.decimals",
    make: (seed, id) => {
      const r = rng(seed);
      const a = r.int(1, 89) / 10, b = r.int(1, 89) / 10;
      const s = Math.round((a + b) * 10) / 10;
      return num(id, `${a} + ${b} = ?`, `${String(a).replace(".", ",")} + ${String(b).replace(".", ",")} = ?`, s, [`Line up the decimal points: ${a} + ${b} = ${s}.`, `Запиши запятую под запятой: ответ ${String(s).replace(".", ",")}.`], 3, { tolerance: 0.001 } as Partial<Question>);
    },
  },
  "percent-of": {
    topicId: "math.percentages",
    make: (seed, id) => {
      const r = rng(seed);
      const p = r.pick([10, 20, 25, 50, 75]);
      const n = r.pick([20, 40, 60, 80, 100, 120, 200]);
      return num(id, `What is ${p}% of ${n}?`, `Сколько составляет ${p}% от ${n}?`, (p * n) / 100, [`${p}% = ${p}/100, so ${n} × ${p}/100 = ${(p * n) / 100}.`, `${p}% = ${p}/100, значит ${n} · ${p}/100 = ${(p * n) / 100}.`], 3);
    },
  },
  "negative-add": {
    topicId: "math.negative-numbers",
    make: (seed, id) => {
      const r = rng(seed);
      const a = r.int(-10, 10), b = r.int(-10, 10);
      const bs = b < 0 ? `(${b})` : `${b}`;
      return num(id, `${a} + ${bs} = ?`, `${a} + ${bs} = ?`, a + b, [`Move ${Math.abs(b)} steps ${b < 0 ? "left" : "right"} from ${a} on the number line: ${a + b}.`, `Сдвинься от ${a} на ${Math.abs(b)} шагов ${b < 0 ? "влево" : "вправо"} по числовой прямой: ${a + b}.`], 3, {
        visual: { kind: "numberline", from: -10, to: 10, marks: [a] },
      });
    },
  },
  "linear-eq": {
    topicId: "math.equations",
    make: (seed, id) => {
      const r = rng(seed);
      const k = r.int(2, 9), x = r.int(-6, 9), b = r.int(-10, 10);
      const rhs = k * x + b;
      const bs = b >= 0 ? `+ ${b}` : `− ${-b}`;
      return {
        id, type: "math_input", difficulty: 3,
        prompt: { en: `Solve: ${k}x ${bs} = ${rhs}`, ru: `Реши уравнение: ${k}x ${bs} = ${rhs}` },
        accepted: [`x=${x}`, `${x}`],
        hint: { en: "Move the number to the other side, then divide by the coefficient.", ru: "Перенеси число в другую часть, затем раздели на коэффициент." },
        explanation: { en: `${k}x = ${rhs - b}, x = ${x}.`, ru: `${k}x = ${rhs - b}, x = ${x}.` },
      };
    },
  },
  power: {
    topicId: "math.powers",
    make: (seed, id) => {
      const r = rng(seed);
      const a = r.int(2, 6), n = a <= 3 ? r.int(2, 5) : r.int(2, 3);
      return num(id, `${a}^${n} = ?`, `${a}^${n} = ?`, a ** n, [`${a}^${n} means ${Array(n).fill(a).join(" × ")} = ${a ** n}.`, `${a}^${n} - это ${Array(n).fill(a).join(" · ")} = ${a ** n}.`], 3);
    },
  },
  "area-rect": {
    topicId: "math.area-perimeter",
    make: (seed, id) => {
      const r = rng(seed);
      const w = r.int(2, 12), h = r.int(2, 9);
      return num(id, `A rectangle is ${w} cm by ${h} cm. What is its area (cm²)?`, `Прямоугольник ${w} см на ${h} см. Чему равна его площадь (см²)?`, w * h, [`Area = length × width = ${w} × ${h} = ${w * h} cm².`, `Площадь = длина × ширина = ${w} · ${h} = ${w * h} см².`], 3);
    },
  },
  "perimeter-rect": {
    topicId: "math.area-perimeter",
    make: (seed, id) => {
      const r = rng(seed);
      const w = r.int(2, 15), h = r.int(2, 10);
      return num(id, `A rectangle is ${w} cm by ${h} cm. What is its perimeter (cm)?`, `Прямоугольник ${w} см на ${h} см. Чему равен его периметр (см)?`, 2 * (w + h), [`Perimeter = 2 × (${w} + ${h}) = ${2 * (w + h)} cm.`, `Периметр = 2 · (${w} + ${h}) = ${2 * (w + h)} см.`], 3);
    },
  },
  mean: {
    topicId: "math.statistics",
    make: (seed, id) => {
      const r = rng(seed);
      const m = r.int(3, 15);
      const d = r.int(1, 3);
      const vals = r.shuffle([m - d, m, m + d, m - 1, m + 1]);
      return num(id, `Find the mean of ${vals.join(", ")}.`, `Найди среднее арифметическое чисел ${vals.join(", ")}.`, m, [`Sum = ${5 * m}, divide by 5 → ${m}.`, `Сумма = ${5 * m}, делим на 5 → ${m}.`], 3);
    },
  },
  "quadratic-roots": {
    topicId: "math.quadratics",
    make: (seed, id) => {
      const r = rng(seed);
      const p = r.int(-6, 6), q = r.int(-6, 6);
      const b = -(p + q), c = p * q;
      const bs = b === 0 ? "" : b > 0 ? ` + ${b}x` : ` − ${-b}x`;
      const cs = c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`;
      const lo = Math.min(p, q), hi = Math.max(p, q);
      return {
        id, type: "math_input", difficulty: 4,
        prompt: { en: `Solve x²${bs}${cs} = 0. Enter the roots separated by a comma (smaller first).`, ru: `Реши x²${bs}${cs} = 0. Введи корни через запятую (сначала меньший).` },
        accepted: lo === hi ? [`${lo}`, `x=${lo}`] : [`${lo},${hi}`, `${lo};${hi}`, `x=${lo},x=${hi}`],
        hint: { en: "Find two numbers whose sum is −b and product is c (Vieta).", ru: "Найди два числа, сумма которых равна −b, а произведение c (теорема Виета)." },
        explanation: { en: `x² ${bs} ${cs} = (x − ${p})(x − ${q}), roots ${lo} and ${hi}.`, ru: `x² ${bs} ${cs} = (x − ${p})(x − ${q}), корни ${lo} и ${hi}.` },
      };
    },
  },
};

export function generateQuestion(generatorId: string, seed: number): Question | null {
  const g = GENERATORS[generatorId];
  if (!g) return null;
  return g.make(seed, `gen:${generatorId}:${seed}`);
}

export function parseGeneratedId(id: string): { generator: string; seed: number } | null {
  const m = /^gen:([a-z0-9-]+):(\d+)$/.exec(id);
  if (!m || !GENERATORS[m[1]]) return null;
  return { generator: m[1], seed: Number(m[2]) };
}
