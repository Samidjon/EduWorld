# EduWorld — Architecture

> **Education first, gameplay second.** Every game system is driven by real learning results.

## Layers

```
src/
  app/                 Next.js App Router: pages (server components) + API routes
    play/              child area (game UI)          ── guarded by requireChild()
    parent/            parent area (calm UI)         ── guarded by requireParent()/requireParentArea()
    api/               auth, parent, children, play (learning + rewards), ai/chat
  components/          UI only (ui kit, characters, lessons/questions, minigames, avatar, rewards, world-map, parent)
  features/            pure domain logic, unit-tested, no I/O
    adaptive-learning/ mastery model, recommendations, world unlocking, skill-graph order
    assessment/        initial diagnostic staircase (+ AssessmentFlow UI)
    learning/          answer checking (shared client/server), procedural generators
    progression/       XP/levels, streaks, rewards, achievements, daily challenges
    chatbot/           EduBuddy knowledge base + keyword/stem matcher (pure, tested)
    ai-tutor/          EduBuddy chat UI
  services/            server-only orchestration (store + domain logic)
    db/                Store interface; SupabaseStore (RLS) and LocalStore (dev JSON)
    auth/              Supabase Auth adapter / local dev adapter
    context.ts         request context + authorization guards
    learning.ts, game.ts, children.ts, child-view.ts, analytics.ts
    ai/safety.ts       child-safety rules for the AI tutor (pure, tested)
  data/                CONTENT LAYER: topics (skill graph), lessons, worlds, bosses, items,
                       achievements, curricula, mini-game metadata — versioned in git
  lib/                 env, crypto, api helpers, rate limiting, i18n, audio, validation (zod)
  types/               content model + DB row types
supabase/migrations    schema + RLS        supabase/seed.sql  generated from src/data
```

## Key decisions

| Topic | Decision |
|---|---|
| Content | Authored as typed data in `src/data` (never inside components). `src/data/content.ts` is the single read API and serves only `reviewed`/`published` lessons. `npm run seed:sql` mirrors it into Postgres. |
| Answer checking | `features/learning/check.ts` runs on the client for instant UI **and** on the server (authoritative). Scores and rewards are computed only on the server from stored first attempts. Generated questions (`gen:<id>:<seed>`) are re-created on the server from the seed. |
| Age vs grade | Independent parameters. `gradeLevel()` uses the actual grade (or a parent-estimated level for "individual programme"); age only adapts the UI (≤7 → large targets, audio, fewer words). |
| Adaptive engine | Exponentially-smoothed mastery per topic; "needs review" only after ≥4 attempts with a weak recent window; lesson check pass → mastered + spaced review (1/3/7/14/30 days); recommendations respect prerequisites, go back to weak foundations, and honour parent subject limits. |
| Diagnostic | Per-domain staircase (math, reading, logic) starting one band **below** the grade; preschoolers get visual/audio types only. Result places lower topics as "understood" (`placed_by_assessment`). State travels in an HMAC-signed token. |
| Worlds | A world opens when its skill topics are understood, or after the diagnostic when the grade is high enough (`WorldDef.unlockTopics/unlockGrade`). |
| Game economy | XP/levels, coins for cosmetics only, deterministic reward chests, daily/weekly goals, no loot boxes, streaks never punish (they simply restart). Mini-game rewards are capped per day so lessons stay the main source. |
| Children & roles | Only parents have accounts. A device enters "child mode" via a signed cookie bound to the parent; the parent area then needs the parent PIN. Every query is scoped by parent ownership (server checks + RLS). |
| Data mode | `SupabaseStore` with the user-scoped client (RLS applies). Without Supabase env vars in development, `LocalStore` persists to `.data/eduworld-dev.json` so the app can run and be tested offline. Production refuses to start without Supabase unless explicitly overridden. |
| i18n | Interface strings in `src/lib/i18n/{ui,parent,public}.ts` (ru/en/uz); content strings are `LText {en, ru, uz?}` with uz → ru → en fallback. |
| Performance | Mini-games are code-split (`next/dynamic`, Phaser loaded only by Logic Maze); map and characters are inline SVG; content lookups are in-memory maps; journal is paginated. |

## Request flow (answering a question)

1. `QuestionRunner` → `POST /api/play/answer {questionId, answer, attemptId, hintUsed}`
2. `apiChild()` resolves parent session → child cookie → ownership check, rate limit, daily limit
3. `resolveQuestion()` (authored or generated) → `checkAnswer()` → `question_attempts` insert
4. `applyAnswer()` updates topic mastery → `learning_progress` upsert → daily challenge progress
5. `POST /api/play/lesson-finish` scores first tries on check questions → `applyLessonResult()` → rewards → achievements
