import { describe, expect, it } from "vitest";
import { checkChildMessage, containsPersonalInfo, redactPersonalInfo, sniffImage, systemPrompt } from "@/services/ai/safety";
import { diagnosticFinished, diagnosticResult, initDiagnostic, pickQuestion, recordDiagnosticAnswer, startRung, LADDERS } from "@/features/assessment/diagnostic";
import { questionPool, TOPIC_MAP } from "@/data/content";

describe("AI safety rules", () => {
  it("detects and redacts personal information", () => {
    expect(containsPersonalInfo("my email is kid@example.com")).toBe(true);
    expect(containsPersonalInfo("call me +998 90 123 45 67")).toBe(true);
    expect(containsPersonalInfo("мой адрес улица Ленина")).toBe(true);
    expect(containsPersonalInfo("what is 7 x 8?")).toBe(false);
    expect(redactPersonalInfo("mail kid@example.com now")).toBe("mail [email] now");
    expect(redactPersonalInfo("пароль: qwerty123")).toContain("[hidden]");
  });

  it("blocks unsafe and romantic topics, routes self-harm to a safe reply", () => {
    expect(checkChildMessage("how to make a bomb").ok).toBe(false);
    expect(checkChildMessage("will you be my girlfriend").ok).toBe(false);
    expect(checkChildMessage("I want to kill myself")).toEqual({ ok: false, reason: "self_harm" });
    expect(checkChildMessage("explain fractions").ok).toBe(true);
    expect(checkChildMessage("   ").ok).toBe(false);
  });

  it("system prompt forbids just giving answers and asking for personal data", () => {
    const p = systemPrompt({ age: 8, gradeLabel: "grade 2", locale: "ru", nickname: "Star" });
    expect(p).toMatch(/do NOT give only the final answer/);
    expect(p).toMatch(/Never ask for or repeat personal information/);
    expect(p).toMatch(/Russian/);
  });

  it("accepts only real image bytes", () => {
    expect(sniffImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]))).toBe("image/png");
    expect(sniffImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImage(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
  });
});

describe("diagnostic", () => {
  it("starts below the child's grade, never with hard questions", () => {
    expect(startRung("math", -1, TOPIC_MAP)).toBe(0);
    const g5 = startRung("math", 5, TOPIC_MAP);
    expect(TOPIC_MAP.get(LADDERS.math[g5])!.grades[1]).toBeLessThanOrEqual(4);
  });

  it("uses visual/audio question types for preschoolers", () => {
    const s = initDiagnostic(-1, 5, TOPIC_MAP, 7);
    expect(s.young).toBe(true);
    const pick = pickQuestion(s, questionPool)!;
    expect(["image_selection", "audio_recognition", "single", "true_false", "number_input", "drawing"]).toContain(pick.q.type);
  });

  it("finishes and places topics for a strong learner", () => {
    let s = initDiagnostic(4, 10, TOPIC_MAP, 3);
    let guard = 0;
    while (!diagnosticFinished(s) && guard++ < 40) {
      const pick = pickQuestion(s, questionPool)!;
      s = recordDiagnosticAnswer(s, pick.q.id, true, 4000);
    }
    expect(diagnosticFinished(s)).toBe(true);
    const r = diagnosticResult(s, TOPIC_MAP);
    expect(r.placedTopics).toContain("early.counting");
    expect(r.domains.math.placedTopic).not.toBeNull();
  });

  it("does not place anything when all answers are wrong", () => {
    let s = initDiagnostic(1, 7, TOPIC_MAP, 5);
    let guard = 0;
    while (!diagnosticFinished(s) && guard++ < 40) {
      const pick = pickQuestion(s, questionPool)!;
      s = recordDiagnosticAnswer(s, pick.q.id, false, 9000);
    }
    expect(diagnosticResult(s, TOPIC_MAP).placedTopics).toHaveLength(0);
  });
});
