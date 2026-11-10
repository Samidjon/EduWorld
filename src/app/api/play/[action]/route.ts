import { z } from "zod";
import { route } from "@/lib/api";
import { answerRequestSchema, answerSchema, avatarSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sign, verify } from "@/lib/crypto";
import { apiChild, HttpError } from "@/services/context";
import { bossQuestions, bossUnlocked, finishBoss, finishLesson, finishReview, getProgress, recordAnswer, reviewQuestions, saveProgress, startAttempt } from "@/services/learning";
import { evaluateAchievements, getGameProfile, grant, progressChallenges } from "@/services/game";
import { getLesson, questionPool, resolveQuestion, TOPIC_MAP } from "@/data/content";
import { generateQuestion } from "@/features/learning/generators";
import { getItem } from "@/data/items";
import { gameReward, isoDate } from "@/features/progression/rules";
import { diagnosticFinished, diagnosticResult, initDiagnostic, pickQuestion, recordDiagnosticAnswer, type DiagnosticState } from "@/features/assessment/diagnostic";
import { applyAnswer, gradeLevel } from "@/features/adaptive-learning/engine";
import { checkAnswer } from "@/features/learning/check";
import { currentAge } from "@/services/children";
import type { Locale, MiniGameId } from "@/types/content";

const MINIGAMES: MiniGameId[] = ["alphabet-finder", "word-builder", "number-counting", "math-challenge", "memory-match", "pattern-puzzle", "logic-maze", "shape-builder", "reading-adventure", "science-lab", "robot-coder"];

type DiagToken = { s: DiagnosticState; q: string; t: string; a: string; cid: string };

async function limited() {
  const ctx = await apiChild();
  rateLimit(`play:${ctx.child.id}`, 120, 60_000);
  if (ctx.settings.dailyLimitMinutes > 0) {
    const [row] = await ctx.store.select("daily_activity", { child_id: ctx.child.id, date: isoDate() });
    if ((row?.minutes ?? 0) >= ctx.settings.dailyLimitMinutes) throw new HttpError(423, "daily_limit");
  }
  return ctx;
}

const handlers: Record<string, (req: Request) => Promise<Response>> = {
  answer: route(answerRequestSchema, async (input) => {
    const ctx = await limited();
    return recordAnswer(ctx.store, ctx.child, input);
  }),

  "lesson-start": route(z.object({ lessonId: z.string().max(120) }), async ({ lessonId }) => {
    const ctx = await limited();
    const lesson = getLesson(lessonId);
    if (!lesson) throw new HttpError(404, "lesson_not_found");
    const topic = TOPIC_MAP.get(lesson.topicId)!;
    if (ctx.settings.allowedSubjects.length && !ctx.settings.allowedSubjects.includes(topic.subject)) throw new HttpError(403, "subject_disabled");
    const att = await startAttempt(ctx.store, ctx.child, "lesson", lesson.id, lesson.topicId);
    // adaptive extra practice: generated questions sized by current mastery
    const p = await getProgress(ctx.store, ctx.child.id, lesson.topicId);
    const extra = (lesson.generated ?? []).flatMap((g) => {
      const n = p.mastery_level >= 0.8 ? 1 : p.mastery_level < 0.4 ? g.count + 1 : g.count;
      return Array.from({ length: n }, (_, i) => generateQuestion(g.generator, (Date.now() + i * 7919) % 1_000_000_007)).filter(Boolean);
    });
    return { attemptId: att.id, generated: extra };
  }),

  "lesson-finish": route(z.object({ attemptId: z.string().uuid() }), async ({ attemptId }) => {
    const ctx = await limited();
    return finishLesson(ctx.store, ctx.child, attemptId);
  }),

  "boss-start": route(z.object({ bossId: z.string().max(80) }), async ({ bossId }) => {
    const ctx = await limited();
    const { boss, unlocked } = await bossUnlocked(ctx.store, ctx.child.id, bossId);
    if (!boss) throw new HttpError(404, "boss_not_found");
    if (!unlocked) throw new HttpError(403, "boss_locked");
    const att = await startAttempt(ctx.store, ctx.child, "boss", boss.id, boss.topics[0]);
    return { attemptId: att.id, questions: bossQuestions(boss.id, att.id) };
  }),

  "boss-finish": route(z.object({ attemptId: z.string().uuid() }), async ({ attemptId }) => {
    const ctx = await limited();
    return finishBoss(ctx.store, ctx.child, attemptId);
  }),

  "review-start": route(z.object({ topicId: z.string().max(80) }), async ({ topicId }) => {
    const ctx = await limited();
    if (!TOPIC_MAP.has(topicId) || !questionPool(topicId).length) throw new HttpError(404, "topic_not_found");
    const att = await startAttempt(ctx.store, ctx.child, "review", `review:${topicId}`, topicId);
    return { attemptId: att.id, questions: reviewQuestions(topicId, att.id) };
  }),

  "review-finish": route(z.object({ attemptId: z.string().uuid() }), async ({ attemptId }) => {
    const ctx = await limited();
    return finishReview(ctx.store, ctx.child, attemptId);
  }),

  /* ---------- Initial diagnostic ---------- */
  "assessment-start": route(null, async () => {
    const ctx = await limited();
    const age = currentAge(ctx.child);
    const grade = gradeLevel(ctx.child.current_grade, ctx.child.custom_level, age);
    const state = initDiagnostic(grade, age, TOPIC_MAP, Math.floor(Math.random() * 1e9));
    const att = await startAttempt(ctx.store, ctx.child, "assessment", "assessment", "assessment");
    const pick = pickQuestion(state, questionPool);
    if (!pick) throw new HttpError(500, "no_questions");
    const token: DiagToken = { s: state, q: pick.q.id, t: pick.topicId, a: att.id, cid: ctx.child.id };
    return { token: sign(token, 3600), question: pick.q, domain: state.current, young: state.young, progress: 0 };
  }),

  "assessment-answer": route(z.object({ token: z.string().max(20000), answer: answerSchema, ms: z.number().int().min(0).max(600000) }), async ({ token, answer, ms }) => {
    const ctx = await limited();
    const tk = verify<DiagToken>(token);
    if (!tk || tk.cid !== ctx.child.id) throw new HttpError(400, "invalid_token");
    const resolved = resolveQuestion(tk.q);
    if (!resolved) throw new HttpError(400, "invalid_question");
    const correct = checkAnswer(resolved.q, answer, ctx.child.interface_language as Locale);
    await ctx.store.insert("question_attempts", { child_id: ctx.child.id, question_id: tk.q, topic_id: tk.t, lesson_attempt_id: tk.a, answer_data: null, is_correct: correct, hint_used: false, created_at: new Date().toISOString() });
    const p = await getProgress(ctx.store, ctx.child.id, tk.t);
    await saveProgress(ctx.store, applyAnswer(p, correct));
    const state = recordDiagnosticAnswer(tk.s, tk.q, correct, ms);
    const total = state.young ? 9 : 15;
    if (!diagnosticFinished(state)) {
      const pick = pickQuestion(state, questionPool);
      if (pick) {
        const next: DiagToken = { ...tk, s: state, q: pick.q.id, t: pick.topicId };
        return { correct, done: false, token: sign(next, 3600), question: pick.q, domain: state.current, progress: Math.min(0.95, state.answered / total) };
      }
    }
    // finished: place topics and build the personal route
    const result = diagnosticResult(state, TOPIC_MAP);
    for (const topicId of result.placedTopics) {
      const cur = await getProgress(ctx.store, ctx.child.id, topicId);
      if (cur.status === "mastered") continue;
      await saveProgress(ctx.store, { ...cur, mastery_level: Math.max(cur.mastery_level, 0.75), placed_by_assessment: true, status: "learning" });
    }
    const now = new Date().toISOString();
    await ctx.store.update("lesson_attempts", { id: tk.a }, { completed: true, completed_at: now, score: state.answered ? Object.values(state.domains).reduce((s, d) => s + d.correct, 0) / state.answered : 0 });
    await ctx.store.update("child_profiles", { id: ctx.child.id }, { assessment_completed_at: now });
    await grant(ctx.store, ctx.child.id, 50, 30);
    const achievements = await evaluateAchievements(ctx.store, { ...ctx.child, assessment_completed_at: now });
    return { correct, done: true, result, reward: { xp: 50, coins: 30, achievements } };
  }),

  /* ---------- Games & rewards ---------- */
  minigame: route(z.object({ gameId: z.string(), score: z.number().int().min(0).max(1000), maxScore: z.number().int().min(1).max(1000) }), async ({ gameId, score, maxScore }) => {
    const ctx = await limited();
    if (!ctx.settings.minigamesEnabled) throw new HttpError(403, "feature_disabled");
    if (!MINIGAMES.includes(gameId as MiniGameId)) throw new HttpError(404, "game_not_found");
    rateLimit(`game:${ctx.child.id}`, 12, 60_000);
    const today = isoDate();
    const rewardedToday = (await ctx.store.select("game_sessions", { child_id: ctx.child.id }, { gte: ["created_at", today] })).filter((g) => g.xp_awarded > 0).length;
    const r = gameReward(Math.min(score, maxScore), maxScore, rewardedToday);
    await ctx.store.insert("game_sessions", { child_id: ctx.child.id, game_id: gameId, score: Math.min(score, maxScore), max_score: maxScore, xp_awarded: r.xp, coins_awarded: r.coins, created_at: new Date().toISOString() });
    const { levelsGained } = await grant(ctx.store, ctx.child.id, r.xp, r.coins);
    const challenges = await progressChallenges(ctx.store, ctx.child.id, "games", 1);
    const achievements = await evaluateAchievements(ctx.store, ctx.child);
    return { reward: { xp: r.xp, coins: r.coins, levelUp: levelsGained, achievements, challenges }, capped: r.xp === 0 };
  }),

  buy: route(z.object({ itemId: z.string().max(60) }), async ({ itemId }) => {
    const ctx = await limited();
    if (!ctx.settings.shopEnabled) throw new HttpError(403, "feature_disabled");
    const item = getItem(itemId);
    if (!item || item.rewardOnly || item.price <= 0) throw new HttpError(400, "not_for_sale");
    const [owned] = await ctx.store.select("inventory", { child_id: ctx.child.id, item_id: itemId });
    if (owned) throw new HttpError(409, "already_owned");
    const gp = await getGameProfile(ctx.store, ctx.child.id);
    if (gp.coins < item.price) throw new HttpError(400, "not_enough_coins");
    await ctx.store.update("game_profiles", { id: gp.id }, { coins: gp.coins - item.price });
    await ctx.store.insert("inventory", { child_id: ctx.child.id, item_id: itemId, quantity: 1, acquired_at: new Date().toISOString() });
    const achievements = await evaluateAchievements(ctx.store, ctx.child);
    return { ok: true, coins: gp.coins - item.price, achievements };
  }),

  avatar: route(avatarSchema, async (cfg) => {
    const ctx = await limited();
    const owned = new Set((await ctx.store.select("inventory", { child_id: ctx.child.id })).map((i) => i.item_id));
    for (const slot of ["hat", "outfit", "accessory", "shoes", "pet"] as const) {
      const id = cfg[slot];
      if (id && (!owned.has(id) || getItem(id)?.type !== slot)) throw new HttpError(400, "item_not_owned");
    }
    await ctx.store.update("child_profiles", { id: ctx.child.id }, { avatar_config: cfg });
    return { ok: true };
  }),

  home: route(z.object({ placed: z.array(z.object({ itemId: z.string().max(60), x: z.number().min(0).max(100), y: z.number().min(0).max(100) })).max(30), wallpaper: z.enum(["sky", "meadow", "night", "candy"]) }), async (cfg) => {
    const ctx = await limited();
    const owned = new Set((await ctx.store.select("inventory", { child_id: ctx.child.id })).map((i) => i.item_id));
    if (cfg.placed.some((p) => !owned.has(p.itemId) || getItem(p.itemId)?.type !== "decor")) throw new HttpError(400, "item_not_owned");
    const gp = await getGameProfile(ctx.store, ctx.child.id);
    await ctx.store.update("game_profiles", { id: gp.id }, { home_config: cfg });
    return { ok: true };
  }),

  /** Heartbeat sent once a minute while the child area is visible: enforces daily limit & breaks. */
  activity: route(z.object({ sessionMinutes: z.number().int().min(0).max(600) }), async ({ sessionMinutes }) => {
    const ctx = await apiChild();
    rateLimit(`hb:${ctx.child.id}`, 3, 50_000);
    const date = isoDate();
    const [row] = await ctx.store.select("daily_activity", { child_id: ctx.child.id, date });
    const minutes = (row?.minutes ?? 0) + 1;
    if (row) await ctx.store.update("daily_activity", { id: row.id }, { minutes });
    else await ctx.store.insert("daily_activity", { child_id: ctx.child.id, date, minutes });
    const s = ctx.settings;
    return {
      minutesToday: minutes,
      limitReached: s.dailyLimitMinutes > 0 && minutes >= s.dailyLimitMinutes,
      breakDue: s.breakEveryMinutes > 0 && sessionMinutes > 0 && sessionMinutes % s.breakEveryMinutes === 0,
    };
  }),
};

export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const h = handlers[(await params).action];
  if (!h) return Response.json({ error: "not_found" }, { status: 404 });
  return h(req);
}
