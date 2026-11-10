import { describe, expect, it } from "vitest";
import { applyAnswer, applyLessonResult, applyReviewResult, emptyProgress, gradeLevel, isWorldUnlocked, prerequisitesMet, recommend, topoOrder } from "@/features/adaptive-learning/engine";
import { TOPICS, TOPIC_MAP } from "@/data/topics";
import { WORLDS } from "@/data/worlds";
import type { LearningProgressRow } from "@/types/db";

const p0 = () => emptyProgress("c1", "math.addition-20");
const mastered = (topic: string): LearningProgressRow => ({ ...emptyProgress("c1", topic), status: "mastered", mastery_level: 0.9, attempts_count: 6 });

describe("grade vs age", () => {
  it("uses the actual grade, not the age", () => {
    expect(gradeLevel("2", null, 9)).toBe(2); // 9 years old, grade 2
    expect(gradeLevel("none", null, 6)).toBe(-1);
    expect(gradeLevel("prep", null, 6)).toBe(0);
    expect(gradeLevel("custom", 4, 12)).toBe(4);
  });
});

describe("mastery updates", () => {
  it("never marks needs_review after a single mistake", () => {
    const p = applyAnswer(p0(), false);
    expect(p.status).not.toBe("needs_review");
    expect(p.attempts_count).toBe(1);
  });

  it("marks needs_review only after repeated weak results", () => {
    let p = p0();
    for (let i = 0; i < 5; i++) p = applyAnswer(p, false);
    expect(p.status).toBe("needs_review");
  });

  it("reaches mastered after consistent correct answers", () => {
    let p = p0();
    for (let i = 0; i < 8; i++) p = applyAnswer(p, true);
    expect(p.status).toBe("mastered");
    expect(p.mastery_level).toBeGreaterThan(0.8);
  });

  it("hint-assisted answers count less", () => {
    const a = applyAnswer(p0(), true);
    const b = applyAnswer(p0(), true, { hintUsed: true });
    expect(b.mastery_level).toBeLessThan(a.mastery_level);
  });

  it("lesson pass sets mastered and schedules a review", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const p = applyLessonResult(p0(), 0.9, 0.8, now);
    expect(p.status).toBe("mastered");
    expect(p.next_review_at).toBe("2026-01-02T00:00:00.000Z");
  });

  it("successful reviews space out further", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const p = applyReviewResult({ ...mastered("math.addition-20"), review_stage: 1 }, 1, now);
    expect(p.review_stage).toBe(2);
    expect(p.next_review_at).toBe("2026-01-08T00:00:00.000Z");
  });
});

describe("skill graph", () => {
  it("every prerequisite exists", () => {
    for (const t of TOPICS) for (const pre of t.prerequisites) expect(TOPIC_MAP.has(pre), `${t.id} -> ${pre}`).toBe(true);
  });

  it("multiplication requires equal groups which requires addition", () => {
    const mult = TOPIC_MAP.get("math.multiplication")!;
    expect(prerequisitesMet(mult, new Map())).toBe(false);
    expect(prerequisitesMet(mult, new Map([["math.equal-groups", mastered("math.equal-groups")]]))).toBe(true);
    expect(TOPIC_MAP.get("math.equal-groups")!.prerequisites).toContain("math.addition-20");
  });

  it("topological order puts prerequisites first", () => {
    const order = topoOrder(TOPICS).map((t) => t.id);
    for (const t of TOPICS) for (const pre of t.prerequisites) expect(order.indexOf(pre)).toBeLessThan(order.indexOf(t.id));
  });
});

describe("recommendations", () => {
  it("recommends only topics with met prerequisites near the grade", () => {
    const recs = recommend({ topics: TOPICS, progress: [], grade: 1 });
    for (const r of recs) expect(TOPIC_MAP.get(r.topicId)!.prerequisites.length).toBe(0);
  });

  it("puts due reviews first", () => {
    const due = { ...mastered("early.counting"), next_review_at: "2000-01-01T00:00:00Z" };
    const recs = recommend({ topics: TOPICS, progress: [due], grade: 1, now: new Date("2026-01-01") });
    expect(recs[0]).toMatchObject({ topicId: "early.counting", reason: "review_due" });
  });

  it("goes back to weak foundations for a struggling topic", () => {
    const struggling: LearningProgressRow = { ...emptyProgress("c1", "math.multiplication"), status: "needs_review", attempts_count: 6, mastery_level: 0.3 };
    const recs = recommend({ topics: TOPICS, progress: [struggling], grade: 3 });
    expect(recs[0].reason).toBe("foundation");
    expect(recs[0].topicId).toBe("math.equal-groups");
  });

  it("does not recommend topics the diagnostic already placed as known", () => {
    const placed = (topic: string): LearningProgressRow => ({ ...emptyProgress("c1", topic), status: "learning", mastery_level: 0.75, placed_by_assessment: true });
    const known = ["early.numbers", "early.counting", "early.compare-quantities", "math.addition-20", "math.subtraction-20", "math.compare-numbers"].map(placed);
    const recs = recommend({ topics: TOPICS, progress: known, grade: 3 });
    for (const k of known) expect(recs.map((r) => r.topicId)).not.toContain(k.topic_id);
    expect(recs.length).toBeGreaterThan(0);
  });

  it("respects parent subject restrictions", () => {
    const recs = recommend({ topics: TOPICS, progress: [], grade: 2, allowedSubjects: ["science"] });
    expect(recs.every((r) => TOPIC_MAP.get(r.topicId)!.subject === "science")).toBe(true);
  });
});

describe("world unlocking", () => {
  const numberia = WORLDS.find((w) => w.slug === "numberia")!;
  it("is locked for a new preschooler", () => {
    expect(isWorldUnlocked(numberia, new Map(), -1, true)).toBe(false);
  });
  it("opens after mastering the required skill", () => {
    expect(isWorldUnlocked(numberia, new Map([["early.counting", mastered("early.counting")]]), -1, true)).toBe(true);
  });
  it("opens by grade only after the diagnostic", () => {
    expect(isWorldUnlocked(numberia, new Map(), 5, false)).toBe(false);
    expect(isWorldUnlocked(numberia, new Map(), 5, true)).toBe(true);
  });
});
