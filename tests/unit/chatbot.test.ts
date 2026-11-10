import { describe, expect, it } from "vitest";
import { KNOWLEDGE } from "@/features/chatbot/knowledge";
import { findAnswer, stem } from "@/features/chatbot/match";

const id = (q: string) => findAnswer(q, KNOWLEDGE, "ru").entry?.id ?? null;

describe("knowledge-base chatbot", () => {
  it("stems Russian and English word forms together", () => {
    expect(stem("дроби")).toBe(stem("дробь"));
    expect(stem("умножения")).toBe(stem("умножить"));
    expect(stem("fractions")).toBe(stem("fraction"));
  });

  it("answers prepared questions in Russian and English", () => {
    const cases: [string, string][] = [
      ["привет", "hello"],
      ["как дела", "how-are-you"],
      ["что такое дроби", "topic:math.fractions"],
      ["объясни таблицу умножения", "topic:math.multiplication"],
      ["как найти периметр", "topic:math.area-perimeter"],
      ["что такое существительное", "topic:reading.parts-of-speech"],
      ["расскажи про круговорот воды", "topic:science.water-cycle"],
      ["теорема пифагора", "topic:math.geometry"],
      ["как заработать монеты", "coins"],
      ["как открыть новый мир", "worlds"],
      ["what is a fraction", "topic:math.fractions"],
      ["how do i get coins", "coins"],
      ["я не понимаю тему", "mistakes"],
    ];
    for (const [q, want] of cases) expect(id(q), q).toBe(want);
  });

  it("says it doesn't know instead of guessing", () => {
    for (const q of ["кто президент франции", "какая погода завтра", "почему небо голубое", "как называется столица узбекистана", "расскажи анекдот", "", "???"]) {
      expect(id(q), q).toBeNull();
    }
  });

  it("every topic has a prepared answer with a lesson link", () => {
    const topics = KNOWLEDGE.filter((e) => e.id.startsWith("topic:"));
    expect(topics.length).toBeGreaterThanOrEqual(70);
    for (const t of topics) {
      expect(t.answer.ru.length, t.id).toBeGreaterThan(40);
      expect(t.link?.href, t.id).toMatch(/^\/play\/lessons\//);
    }
  });
});
