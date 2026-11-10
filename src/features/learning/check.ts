import type { Answer, CodeBlock, CodeBlocksQ, Locale, Question } from "@/types/content";
import { answersFor, tx } from "@/lib/i18n/text";

/** Shared answer checker. Runs on the server (authoritative) and on the client (instant UI). */

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,!?;:"'«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parses "3/4", "0,75", "-2", "x=3" into a number. */
export function parseNumeric(raw: string): number | null {
  let s = raw.replace(/\s+/g, "").replace(/,/g, ".").replace(/^[a-z]=/i, "").replace(/−/g, "-");
  if (!s) return null;
  const frac = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(s);
  if (frac) {
    const d = Number(frac[2]);
    return d === 0 ? null : Number(frac[1]) / d;
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  s = s.replace(/^\+/, "");
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null;
}

/** Splits a list answer like "2, 3" / "x=2; x=3" into normalized parts. */
function listParts(raw: string): string[] {
  return raw
    .replace(/−/g, "-")
    .split(/[;,]|\s+and\s+|\s+и\s+/i)
    .map((p) => p.replace(/\s+/g, "").replace(/^[a-z]=/i, ""))
    .filter(Boolean);
}

export function mathEquals(input: string, accepted: string[]): boolean {
  const inNorm = input.replace(/\s+/g, "").replace(/−/g, "-").toLowerCase();
  for (const acc of accepted) {
    const accNorm = acc.replace(/\s+/g, "").toLowerCase();
    if (inNorm === accNorm) return true;
    // list answers (e.g. quadratic roots) - compare as numeric multisets, order-insensitive
    const accParts = listParts(acc);
    const inParts = listParts(input);
    if (accParts.length > 1 && accParts.length === inParts.length) {
      const a = accParts.map(parseNumeric).sort((x, y) => (x ?? 0) - (y ?? 0));
      const b = inParts.map(parseNumeric).sort((x, y) => (x ?? 0) - (y ?? 0));
      if (a.every((v, i) => v !== null && b[i] !== null && Math.abs(v - (b[i] as number)) < 1e-6)) return true;
      continue;
    }
    const av = parseNumeric(acc);
    const iv = parseNumeric(input);
    if (av !== null && iv !== null && Math.abs(av - iv) < 1e-6) return true;
  }
  return false;
}

export type RobotResult = { success: boolean; path: [number, number][]; crashed: boolean; error?: "unbalanced" };

/** Expands repeat blocks and simulates the robot. */
export function runRobot(q: Pick<CodeBlocksQ, "grid">, program: CodeBlock[]): RobotResult {
  const expand = (prog: CodeBlock[], i: number): { out: CodeBlock[]; next: number } | null => {
    const out: CodeBlock[] = [];
    while (i < prog.length) {
      const b = prog[i];
      if (b === "end") return { out, next: i + 1 };
      if (b === "repeat2" || b === "repeat3") {
        const inner = expand(prog, i + 1);
        if (!inner) return null;
        const times = b === "repeat2" ? 2 : 3;
        for (let k = 0; k < times; k++) out.push(...inner.out);
        i = inner.next;
        continue;
      }
      out.push(b);
      i++;
    }
    return { out, next: i };
  };
  // top level: an unmatched "end" is an error
  const ends = program.filter((b) => b === "end").length;
  const reps = program.filter((b) => b === "repeat2" || b === "repeat3").length;
  const { grid } = q;
  if (ends !== reps) return { success: false, path: [grid.start], crashed: false, error: "unbalanced" };
  const flat = expand(program, 0)?.out ?? [];
  let [x, y] = grid.start;
  let dir: number = grid.dir;
  const path: [number, number][] = [[x, y]];
  const isWall = (cx: number, cy: number) => grid.walls.some((w) => w[0] === cx && w[1] === cy);
  for (const b of flat.slice(0, 200)) {
    if (b === "left") dir = (dir + 3) % 4;
    else if (b === "right") dir = (dir + 1) % 4;
    else if (b === "forward") {
      const nx = x + (dir === 1 ? 1 : dir === 3 ? -1 : 0);
      const ny = y + (dir === 2 ? 1 : dir === 0 ? -1 : 0);
      if (nx < 0 || ny < 0 || nx >= grid.width || ny >= grid.height || isWall(nx, ny)) return { success: false, path, crashed: true };
      x = nx;
      y = ny;
      path.push([x, y]);
    }
  }
  return { success: x === grid.goal[0] && y === grid.goal[1], path, crashed: false };
}

export function checkAnswer(q: Question, a: Answer, locale: Locale): boolean {
  if (q.type !== a.type) return false;
  switch (q.type) {
    case "single":
    case "image_selection":
    case "audio_recognition":
      return (a as { index: number }).index === q.answer;
    case "multiple": {
      const got = [...(a as { indexes: number[] }).indexes].sort();
      const want = [...q.answers].sort();
      return got.length === want.length && got.every((v, i) => v === want[i]);
    }
    case "true_false":
      return (a as { value: boolean }).value === q.answer;
    case "drag_drop": {
      const p = (a as { placement: Record<string, string> }).placement;
      return q.items.every((it) => p[it.id] === q.answer[it.id]);
    }
    case "matching": {
      const p = (a as { pairs: Record<string, number> }).pairs;
      return q.pairs.every((_, i) => p[String(i)] === i);
    }
    case "fill_blank": {
      const t = normalizeText((a as { text: string }).text);
      return answersFor(q.accepted, locale).some((acc) => normalizeText(acc) === t);
    }
    case "ordering": {
      const o = (a as { order: number[] }).order;
      return o.length === q.items.length && o.every((v, i) => v === i || normalizeText(tx(q.items[v], locale)) === normalizeText(tx(q.items[i], locale)));
    }
    case "number_input": {
      const v = (a as { value: number }).value;
      return Number.isFinite(v) && Math.abs(v - q.answer) <= (q.tolerance ?? 1e-6);
    }
    case "word_building":
      return normalizeText((a as { text: string }).text).replace(/\s/g, "") === normalizeText(tx(q.word, locale)).replace(/\s/g, "");
    case "math_input":
      return mathEquals((a as { text: string }).text, q.accepted);
    case "drawing":
      return (a as { coverage: number }).coverage >= 0.7;
    case "code_blocks": {
      const prog = (a as { program: CodeBlock[] }).program;
      if (prog.filter((b) => b !== "end").length > q.maxBlocks) return false;
      return runRobot(q, prog).success;
    }
  }
}
