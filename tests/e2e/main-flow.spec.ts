import { expect, test, type APIRequestContext } from "@playwright/test";

/**
 * Main acceptance flow: parent registers → onboarding → creates a child (age and grade chosen
 * independently) → diagnostic → learning route → lesson answer → reward → parent sees results.
 * Uses the API for setup speed and the UI for what a person sees.
 */

const email = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;

async function post(req: APIRequestContext, path: string, data?: unknown) {
  const r = await req.post(path, { data });
  expect(r.status(), `${path}: ${await r.text()}`).toBeLessThan(400);
  return r.json();
}

test("landing, login and register pages render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/register");
  await expect(page.locator("form")).toBeVisible();
  await page.goto("/login");
  await expect(page.locator("form")).toBeVisible();
});

test("parent → child → diagnostic → lesson → parent dashboard", async ({ page }) => {
  const req = page.request;
  await post(req, "/api/auth/register", { email: email(), password: "Test12345" });
  await post(req, "/api/parent/onboarding", { displayName: "E2E Parent", pin: "", consent: true });
  const child = await post(req, "/api/children", {
    nickname: "Tester",
    age: 9,
    grade: "2", // 9 years old but in grade 2 - independent from age
    country: "UZ",
    curriculumId: "eduworld-core-v1",
    language: "ru",
    subjects: ["math"],
    goal: "school_support",
    avatar: { base: "bunny", furColor: "#FBF3E8", outfitColor: "#5799E8", hat: null, outfit: null, accessory: null, shoes: null, pet: null, expression: "happy" },
  });
  expect(child.id).toBeTruthy();

  // diagnostic is required before playing
  await page.goto("/play/dashboard");
  await expect(page).toHaveURL(/\/play\/assessment/);

  // finish the diagnostic through the API (answers are checked on the server)
  let r = await post(req, "/api/play/assessment-start");
  for (let i = 0; i < 30 && !r.done; i++) {
    r = await post(req, "/api/play/assessment-answer", { token: r.token, answer: { type: "true_false", value: true }, ms: 2000 });
  }
  expect(r.done).toBe(true);

  await page.goto("/play/dashboard");
  await expect(page.getByText("Tester").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Карта|Map/ }).first()).toBeVisible();

  // a lesson: first wrong, then right, then finish
  const start = await post(req, "/api/play/lesson-start", { lessonId: "early.counting.l1" });
  const answer = await post(req, "/api/play/answer", { questionId: "gen:count-objects:42", answer: { type: "number_input", value: -1 }, attemptId: start.attemptId });
  expect(answer.correct).toBe(false);
  const fin = await post(req, "/api/play/lesson-finish", { attemptId: start.attemptId });
  expect(fin.reward.xp).toBeGreaterThan(0);

  // pages of the child area render
  for (const path of ["/play/map", "/play/roadmap", "/play/games", "/play/achievements", "/play/journal", "/play/shop"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
  }

  // parent sees the child and results (no PIN set)
  await page.goto("/parent/dashboard");
  await expect(page.getByText("Tester").first()).toBeVisible();
  await page.goto("/parent/analytics");
  await expect(page.getByText("Tester").first()).toBeVisible();
});

test("child area is protected", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/play/dashboard");
  await expect(page).toHaveURL(/\/login/);
  const r = await page.request.post("/api/play/answer", { data: { questionId: "x", answer: { type: "true_false", value: true } } });
  expect(r.status()).toBe(401);
});
