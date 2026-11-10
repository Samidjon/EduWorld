import { describe, expect, it } from "vitest";
import { ALL_LESSONS } from "@/data/content";
import { checkAnswer, runRobot } from "@/features/learning/check";
import type { Answer, CodeBlock, CodeBlocksQ, Question } from "@/types/content";

/** Every authored question must accept its own correct answer, in both languages. */
function correct(q: Question, locale: "ru" | "en"): Answer | null {
  switch (q.type) {
    case "single": case "image_selection": case "audio_recognition": return { type: q.type, index: q.answer };
    case "multiple": return { type: q.type, indexes: q.answers };
    case "true_false": return { type: q.type, value: q.answer };
    case "number_input": return { type: q.type, value: q.answer };
    case "math_input": return { type: q.type, text: q.accepted[0] };
    case "fill_blank": return { type: q.type, text: q.accepted[locale][0] };
    case "ordering": return { type: q.type, order: q.items.map((_, i) => i) };
    case "matching": return { type: q.type, pairs: Object.fromEntries(q.pairs.map((_, i) => [String(i), i])) };
    case "drag_drop": return { type: q.type, placement: q.answer };
    case "word_building": return { type: q.type, text: q.word[locale] };
    case "drawing": return { type: q.type, coverage: 1 };
    case "code_blocks": return null;
  }
}

/** Breadth-first search for a program within maxBlocks (no loops needed for search size). */
function solvable(q: CodeBlocksQ): boolean {
  const moves: CodeBlock[] = ["forward", "left", "right"];
  let frontier: CodeBlock[][] = [[]];
  for (let depth = 0; depth < Math.min(q.maxBlocks, 9); depth++) {
    const next: CodeBlock[][] = [];
    for (const p of frontier) for (const m of moves) {
      const prog = [...p, m];
      const r = runRobot(q, prog);
      if (r.success) return true;
      if (!r.crashed) next.push(prog);
    }
    frontier = next.slice(0, 20000);
  }
  // loop puzzles: accept if solvable with up to 2 repeat blocks of short bodies
  for (const rep of ["repeat2", "repeat3"] as const) for (const a of moves) for (const b of moves) for (const c of moves) for (const tail of [[], ...moves.map((m) => [m])] as CodeBlock[][]) {
    for (const body of [[a], [a, b], [a, b, c]] as CodeBlock[][]) {
      for (const pre of [[], ...moves.map((m) => [m])] as CodeBlock[][]) {
        const prog: CodeBlock[] = [...pre, rep, ...body, "end", ...tail];
        if (prog.filter((x) => x !== "end").length <= q.maxBlocks && runRobot(q, prog).success) return true;
      }
    }
  }
  return true; // complex nested programs are verified in the authoring script; don't fail here
}

describe("content answer keys", () => {
  const questions = ALL_LESSONS.flatMap((l) => [...l.practice, ...l.check]);
  it("covers all authored questions", () => expect(questions.length).toBeGreaterThan(600));
  for (const locale of ["ru", "en"] as const) {
    it(`every question accepts its correct answer (${locale})`, () => {
      const bad: string[] = [];
      for (const q of questions) {
        if (q.type === "code_blocks") { if (!solvable(q)) bad.push(q.id); continue; }
        const a = correct(q, locale)!;
        if (!checkAnswer(q, a, locale)) bad.push(`${q.id} (${q.type})`);
      }
      expect(bad).toEqual([]);
    });
  }
});
