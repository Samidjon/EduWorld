import { describe, expect, it } from "vitest";
import { checkAnswer, mathEquals, parseNumeric, runRobot } from "@/features/learning/check";
import { GENERATORS, generateQuestion, parseGeneratedId } from "@/features/learning/generators";
import type { CodeBlocksQ, Question } from "@/types/content";
import { ALL_LESSONS } from "@/data/content";

const base = { prompt: { en: "q", ru: "q" }, explanation: { en: "e", ru: "e" }, difficulty: 1 as const };

describe("answer checking", () => {
  it("single / true_false / number", () => {
    expect(checkAnswer({ ...base, id: "a", type: "single", options: [{ en: "1", ru: "1" }, { en: "2", ru: "2" }], answer: 1 }, { type: "single", index: 1 }, "ru")).toBe(true);
    expect(checkAnswer({ ...base, id: "b", type: "true_false", answer: false }, { type: "true_false", value: true }, "ru")).toBe(false);
    expect(checkAnswer({ ...base, id: "c", type: "number_input", answer: 3.7, tolerance: 0.001 }, { type: "number_input", value: 3.7 }, "en")).toBe(true);
  });

  it("rejects an answer of a different type", () => {
    expect(checkAnswer({ ...base, id: "b", type: "true_false", answer: true }, { type: "single", index: 0 }, "ru")).toBe(false);
  });

  it("fill_blank is case-insensitive and treats ё as е", () => {
    const q: Question = { ...base, id: "f", type: "fill_blank", text: { en: "___", ru: "___" }, accepted: { en: ["Cat"], ru: ["ёжик"] } };
    expect(checkAnswer(q, { type: "fill_blank", text: " cat " }, "en")).toBe(true);
    expect(checkAnswer(q, { type: "fill_blank", text: "Ежик" }, "ru")).toBe(true);
    expect(checkAnswer(q, { type: "fill_blank", text: "Ежик" }, "uz")).toBe(true); // uz falls back to ru
  });

  it("math input compares numerically and handles lists", () => {
    expect(parseNumeric("3/4")).toBe(0.75);
    expect(parseNumeric("0,75")).toBe(0.75);
    expect(mathEquals("0.75", ["3/4"])).toBe(true);
    expect(mathEquals("x = -2", ["x=-2"])).toBe(true);
    expect(mathEquals("3, -1", ["-1,3"])).toBe(true);
    expect(mathEquals("4", ["3/4"])).toBe(false);
  });

  it("matching & ordering", () => {
    const m: Question = { ...base, id: "m", type: "matching", pairs: [{ left: { en: "a", ru: "a" }, right: { en: "A", ru: "A" } }, { left: { en: "b", ru: "b" }, right: { en: "B", ru: "B" } }] };
    expect(checkAnswer(m, { type: "matching", pairs: { "0": 0, "1": 1 } }, "en")).toBe(true);
    expect(checkAnswer(m, { type: "matching", pairs: { "0": 1, "1": 0 } }, "en")).toBe(false);
    const o: Question = { ...base, id: "o", type: "ordering", items: [{ en: "1", ru: "1" }, { en: "2", ru: "2" }, { en: "3", ru: "3" }] };
    expect(checkAnswer(o, { type: "ordering", order: [0, 1, 2] }, "en")).toBe(true);
    expect(checkAnswer(o, { type: "ordering", order: [1, 0, 2] }, "en")).toBe(false);
  });
});

describe("robot simulator", () => {
  const q: CodeBlocksQ = { ...base, id: "r", type: "code_blocks", grid: { width: 4, height: 4, start: [0, 3], dir: 0, goal: [2, 1], walls: [[1, 3]] }, blocks: ["forward", "left", "right", "repeat2", "end"], maxBlocks: 5 };
  it("reaches the goal with loops", () => {
    expect(runRobot(q, ["repeat2", "forward", "end", "right", "forward", "forward"]).success).toBe(true);
    expect(checkAnswer(q, { type: "code_blocks", program: ["repeat2", "forward", "end", "right", "repeat2", "forward", "end"] }, "en")).toBe(true);
  });
  it("crashes into walls and edges", () => {
    expect(runRobot(q, ["right", "forward"]).crashed).toBe(true);
    expect(runRobot(q, ["left", "forward"]).crashed).toBe(true);
  });
  it("enforces maxBlocks and balanced loops", () => {
    expect(checkAnswer(q, { type: "code_blocks", program: ["forward", "forward", "right", "forward", "forward"] }, "en")).toBe(true);
    expect(checkAnswer(q, { type: "code_blocks", program: ["forward", "forward", "right", "forward", "forward", "left", "right"] }, "en")).toBe(false);
    expect(runRobot(q, ["repeat2", "forward"]).error).toBe("unbalanced");
  });
});

describe("generators", () => {
  it("are deterministic and self-consistent", () => {
    for (const id of Object.keys(GENERATORS)) {
      for (const seed of [1, 42, 99999]) {
        const a = generateQuestion(id, seed)!;
        const b = generateQuestion(id, seed)!;
        expect(a).toEqual(b);
        expect(parseGeneratedId(a.id)).toEqual({ generator: id, seed });
        // the generated answer is accepted by the checker
        if (a.type === "number_input") expect(checkAnswer(a, { type: "number_input", value: a.answer }, "ru")).toBe(true);
        if (a.type === "single") expect(checkAnswer(a, { type: "single", index: a.answer }, "ru")).toBe(true);
        if (a.type === "math_input") expect(checkAnswer(a, { type: "math_input", text: a.accepted[0] }, "ru")).toBe(true);
      }
    }
  });

  it("lessons only reference existing generators", () => {
    for (const l of ALL_LESSONS) for (const g of l.generated ?? []) expect(GENERATORS[g.generator], `${l.id}: ${g.generator}`).toBeDefined();
  });
});
