# EduWorld — Learn. Play. Explore. Grow.

An educational adventure for children aged 4–17: every school subject is a world to explore, with real lessons, an adaptive learning route, RPG progression, an AI tutor and a parent dashboard.

**Education first, gameplay second.**

## What's inside

| Area | Status |
|---|---|
| Parent registration, login, onboarding with consent + PIN | ✅ |
| Child profiles — age **and** grade chosen independently, country, curriculum (with draft/reviewed status), language, subjects, goal, avatar | ✅ |
| Initial adaptive diagnostic (math / reading / logic) → personal learning route | ✅ |
| Content: 6 worlds, 75 topics in a prerequisite skill graph, **83 lessons / 648 authored questions** in RU + EN, plus 18 procedural generators | ✅ |
| Lesson structure: intro → explanation → visual example → practice → game → check → feedback → reward → saved progress | ✅ |
| 14 question types incl. drag & drop, matching, drawing/tracing, math input, audio recognition, code blocks | ✅ |
| Adaptive engine: mastery, spaced review, back-to-basics, prerequisites, parent subject limits | ✅ unit-tested |
| 11 mini-games (Alphabet Finder, Word Builder, Count It, Math Sprint, Memory Match, Pattern Puzzle, Logic Maze (Phaser 3), Shape Builder, Reading Adventure, Science Lab, Robot Coder) | ✅ |
| RPG: XP/levels, coins (cosmetics only), streaks without punishment, 18 achievements, 10 friendly bosses, daily & weekly challenges, collections, pets, player room, skill tree, journal | ✅ |
| Avatar editor, shop, inventory | ✅ |
| EduBuddy helper: chat bot with a prepared knowledge base (EduWorld FAQ + all 75 topics from the lesson explanations), says "I don't know yet" for anything else; no AI, questions are not stored | ✅ |
| Parent dashboard, analytics, schedule/limits, privacy & AI settings, export, deletion | ✅ |
| Supabase schema + RLS + seed | ✅ written — needs a Supabase project to apply |
| RU / EN / UZ interface | ✅ (UZ content falls back to RU) |

## Music & voice
- Background music loops on every page (`public/assets/audio/background-music.mp3`, not in git - put your own track there). The read-aloud voice helper is switched off (`src/lib/voice.ts`).
- The OpenAI tutor is switched off (`src/lib/env.ts` → `AI_TUTOR_ENABLED`).

## Quick start
```bash
npm install
npm run dev     # http://localhost:3000 — works offline with a local dev store
npm test        # unit tests
```
Then: **Sign up → onboarding → add a child → starting adventure → play**.
For production: see [DEVELOPMENT.md](DEVELOPMENT.md) (Supabase + Vercel) and [.env.example](.env.example).

## Docs
- [ARCHITECTURE.md](ARCHITECTURE.md) — layers, adaptive engine, data flow
- [DATABASE.md](DATABASE.md) — schema, RLS, seeding
- [SECURITY.md](SECURITY.md) — child safety, privacy, AI rules
- [ASSET_GUIDE.md](ASSET_GUIDE.md) — characters (Foxy, Oli, Bruno, Luna) and visual style
- [DEVELOPMENT.md](DEVELOPMENT.md) — setup, scripts, adding content/languages/games

## Honest notes
- The curriculum is EduWorld's own **Core Skills Framework**. Country programme mappings (UZ, RU, KZ, US, GB) are marked **draft** and are not presented as official programmes until reviewed against the source.
- Learning content was written for this release and validated automatically (`scripts/validate-content.ts`), but should still be reviewed by teachers before real classroom use.
- Uzbek interface strings exist; Uzbek learning content currently falls back to Russian.
