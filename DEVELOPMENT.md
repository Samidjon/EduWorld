# EduWorld — Development

## Requirements
Node 20+ (tested on Node 24), npm.

## Run locally (no external services needed)
```bash
npm install
npm run dev            # http://localhost:3000
```
Without Supabase variables the app uses the development JSON store `.data/eduworld-dev.json` (delete it to reset). Without `OPENAI_API_KEY` EduBuddy shows "not connected"; everything else works.

## With Supabase
1. Create a project, copy `.env.example` → `.env.local`, fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `EDUWORLD_SESSION_SECRET`.
2. Apply `supabase/migrations/0001_init.sql`, then `npm run seed:sql` and run `supabase/seed.sql`.
3. Auth → enable email provider; set the site URL / redirect to `<origin>/login`.

## Scripts
| Command | What |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests (`tests/unit`) — engine, checker, generators, progression, AI safety, diagnostic |
| `npm run test:e2e` | Playwright (`tests/e2e`, desktop + mobile) — starts `npm run dev` automatically |
| `npx tsx scripts/validate-content.ts` | validates all lesson content (ids, answers, topics) |
| `npm run seed:sql` | regenerates `supabase/seed.sql` from `src/data` |

## Adding content
1. Add/extend a topic in `src/data/topics.ts` (id, grades, prerequisites).
2. Add a lesson in `src/data/lessons/<subject>.ts` following the `Lesson` type (intro → explanation → example → practice → optional game → check). Use `status: "draft"` until reviewed; only `reviewed`/`published` are served.
3. `npx tsx scripts/validate-content.ts && npm test`, then `npm run seed:sql`.
4. Procedural practice: add a generator to `src/features/learning/generators.ts` (deterministic by seed) and reference it in `lesson.generated`.

## Adding a language
Add the code to `Locale` (`src/types/content.ts`), a column in `src/lib/i18n/ui.ts` (+ parent/public dictionaries), and optionally `uz`-style fields in content (`LText` falls back uz → ru → en).

## Adding a mini-game
Implement `MiniGameProps` (`src/components/minigames/types.ts`) in `components/minigames/games/`, register it in `registry.tsx`, add metadata to `src/data/minigames.ts` and the id to `MiniGameId` + the allow-list in `app/api/play/[action]/route.ts`.

## Conventions
- Server-only modules import `server-only`; secrets only in `lib/env.ts`.
- No learning content inside components. No `any` (except the documented Supabase builder escape hatch).
- Feedback to children is always encouraging; never negative wording.

## Deploy (Vercel + Supabase Cloud)
Set env vars from `.env.example` in Vercel (never the service-role key). `next build` must pass. Choose the Supabase region according to the data-residency rules of your target countries (see SECURITY.md).

## Android APK
The APK is a thin Capacitor wrapper that opens the deployed site (the app is server-rendered, so it needs the site online).
1. Deploy the site (e.g. Vercel) and note its URL.
2. Tools: JDK 21 + Android SDK (platform 35, build-tools 35). Set `JAVA_HOME`, and `android/local.properties` → `sdk.dir=...`.
3. Build:
   ```bash
   EDUWORLD_APP_URL=https://your-site.vercel.app npx cap sync android
   cd android && ./gradlew assembleDebug        # → app/build/outputs/apk/debug/app-debug.apk
   ```
4. Icons: `node scripts/make-android-icons.mjs` (renders Foxy into `android/app/src/main/res/mipmap-*`).
The offline fallback page is `android-shell/index.html`.
