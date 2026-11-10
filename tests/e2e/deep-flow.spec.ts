import { expect, test, type APIRequestContext } from "@playwright/test";
import type { Answer, Question } from "../../src/types/content";
import { getLesson } from "../../src/data/content";

/**
 * Deep functional pass over every feature through the real API (same code + database as the
 * site). Answers are built from the content so lessons can be passed "perfectly".
 */

test.describe.configure({ timeout: 240_000 });

function correct(q: Question, locale: "ru" | "en" = "ru"): Answer {
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
    case "code_blocks": return { type: q.type, program: [] };
  }
}

async function post<T = Record<string, unknown>>(req: APIRequestContext, path: string, data?: unknown, expectOk = true): Promise<T & { _status: number }> {
  const r = await req.post(path, { data });
  const body = await r.json().catch(() => ({}));
  if (expectOk) expect(r.status(), `${path}: ${JSON.stringify(body)}`).toBeLessThan(400);
  return { ...body, _status: r.status() };
}

async function passLesson(req: APIRequestContext, lessonId: string) {
  const lesson = getLesson(lessonId)!;
  const start = await post<{ attemptId: string }>(req, "/api/play/lesson-start", { lessonId });
  for (const q of lesson.check) {
    if (q.type === "code_blocks") continue; // solved separately in robot tests
    const r = await post<{ correct: boolean }>(req, "/api/play/answer", { questionId: q.id, answer: correct(q), attemptId: start.attemptId });
    expect(r.correct, `${q.id} (${q.type}) should be accepted`).toBe(true);
  }
  return post<{ score: number; mastered: boolean; reward: { xp: number; coins: number } }>(req, "/api/play/lesson-finish", { attemptId: start.attemptId });
}

test("every feature works end to end", async ({ page }) => {
  const req = page.request;
  const email = `deep-${Date.now()}@example.test`;
  await post(req, "/api/auth/register", { email, password: "Deep12345" });
  await post(req, "/api/parent/onboarding", { displayName: "Deep Test", pin: "4321", consent: true });

  // parent pages render while unlocked
  for (const p of ["/parent/dashboard", "/parent/children", "/parent/children/new", "/parent/analytics", "/parent/settings", "/parent/account"]) {
    expect((await page.goto(p))?.status(), p).toBe(200);
  }

  const child = await post<{ id: string }>(req, "/api/children", {
    nickname: "Deepy", age: 6, grade: "prep", country: "RU", curriculumId: "eduworld-core-v1", language: "ru", subjects: ["early", "math"], goal: "school_readiness",
    avatar: { base: "fox", furColor: "#F38A3A", outfitColor: "#5799E8", hat: null, outfit: null, accessory: null, shoes: null, pet: null, expression: "happy" },
  });

  // child mode locks the parent area behind the PIN
  await page.goto("/parent/dashboard");
  await expect(page).toHaveURL(/\/parent\/unlock/);
  expect((await post(req, "/api/parent/settings", { dailyLimitMinutes: 30 }, false))._status).toBe(403);

  // diagnostic (preschooler: visual/audio questions)
  let d = await post<{ token: string; question: Question; done?: boolean }>(req, "/api/play/assessment-start");
  for (let i = 0; i < 30 && !d.done; i++) d = await post(req, "/api/play/assessment-answer", { token: d.token, answer: correct(d.question), ms: 3000 });
  expect(d.done).toBe(true);

  // lessons answered perfectly → mastered + rewards
  for (const id of ["early.letters.l1", "early.counting.l1", "early.colors-shapes.l1"]) {
    const r = await passLesson(req, id);
    expect(r.score, id).toBe(1);
    expect(r.mastered, id).toBe(true);
    expect(r.reward.xp, id).toBeGreaterThan(0);
  }

  // boss of Little Steps is now unlocked and can be won
  const boss = await post<{ attemptId: string; questions: Question[] }>(req, "/api/play/boss-start", { bossId: "boss.little-steps.rainbow-riddler" });
  expect(boss.questions.length).toBeGreaterThan(0);
  for (const q of boss.questions) await post(req, "/api/play/answer", { questionId: q.id, answer: correct(q), attemptId: boss.attemptId });
  const bossEnd = await post<{ won: boolean; reward: { item?: string } }>(req, "/api/play/boss-finish", { attemptId: boss.attemptId });
  expect(bossEnd.won).toBe(true);
  expect(bossEnd.reward.item).toBe("hat.rainbow-cap");

  // spaced review
  const rev = await post<{ attemptId: string; questions: Question[] }>(req, "/api/play/review-start", { topicId: "early.counting" });
  for (const q of rev.questions) await post(req, "/api/play/answer", { questionId: q.id, answer: correct(q), attemptId: rev.attemptId });
  expect((await post<{ score: number }>(req, "/api/play/review-finish", { attemptId: rev.attemptId })).score).toBe(1);

  // mini-game reward, shop, avatar, room
  expect((await post<{ reward: { xp: number } }>(req, "/api/play/minigame", { gameId: "memory-match", score: 8, maxScore: 10 })).reward.xp).toBeGreaterThan(0);
  const buy = await post<{ coins: number }>(req, "/api/play/buy", { itemId: "decor.plant" });
  expect(buy.coins).toBeGreaterThanOrEqual(0);
  expect((await post(req, "/api/play/buy", { itemId: "decor.plant" }, false))._status).toBe(409); // already owned
  expect((await post(req, "/api/play/buy", { itemId: "pet.baby-dragon" }, false))._status).toBe(400); // reward-only
  await post(req, "/api/play/avatar", { base: "fox", furColor: "#F38A3A", outfitColor: "#5799E8", hat: "hat.rainbow-cap", outfit: null, accessory: null, shoes: null, pet: null, expression: "wink" });
  expect((await post(req, "/api/play/avatar", { base: "fox", furColor: "#F38A3A", outfitColor: "#5799E8", hat: "hat.crown", outfit: null, accessory: null, shoes: null, pet: null, expression: "happy" }, false))._status).toBe(400); // not owned
  await post(req, "/api/play/home", { placed: [{ itemId: "decor.plant", x: 30, y: 70 }], wallpaper: "meadow" });

  // EduBuddy knowledge base
  expect((await post<{ known: boolean }>(req, "/api/tutor/ask", { message: "что такое дроби" })).known).toBe(true);
  expect((await post<{ known: boolean; reply: string }>(req, "/api/tutor/ask", { message: "кто выиграл чемпионат мира" })).reply).toMatch(/не знаю/);

  // every child page renders
  for (const p of ["/play/dashboard", "/play/map", "/play/worlds/little-steps", "/play/worlds/numberia", "/play/lessons/early.letters.l1", "/play/lessons/early.letters.l1/learn", "/play/games", "/play/games/logic-maze", "/play/boss/boss.little-steps.rainbow-riddler", "/play/review/early.counting", "/play/roadmap", "/play/skills", "/play/journal", "/play/achievements", "/play/avatar", "/play/inventory", "/play/shop", "/play/home", "/play/profile", "/play/tutor"]) {
    expect((await page.goto(p))?.status(), p).toBe(200);
  }
  await page.goto("/play/achievements");
  await expect(page.getByText(/Первый урок/).first()).toBeVisible();

  // unlock the parent area: wrong PIN refused, right PIN accepted
  expect((await post(req, "/api/parent/unlock", { pin: "0000" }, false))._status).toBe(403);
  await post(req, "/api/parent/unlock", { pin: "4321" });
  await post(req, "/api/parent/settings", { dailyLimitMinutes: 45, allowedSubjects: ["math"] });
  await page.goto("/parent/analytics");
  await expect(page.getByText("Deepy").first()).toBeVisible();

  // edit, export, delete child; delete account
  expect((await req.patch(`/api/children/${child.id}`, { data: { nickname: "Deepy2" } })).status()).toBe(200);
  const exp = await req.get(`/api/children/${child.id}`);
  expect(exp.status()).toBe(200);
  const data = await exp.json();
  expect(data.learning_progress.length).toBeGreaterThan(0);
  expect((await req.delete(`/api/children/${child.id}`)).status()).toBe(200);
  await post(req, "/api/parent/delete-account", { confirm: "DELETE" });
  expect((await req.post("/api/auth/login", { data: { email, password: "Deep12345" } })).status()).toBe(401);
});
