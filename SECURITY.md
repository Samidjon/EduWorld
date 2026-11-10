# EduWorld — Security & Privacy

EduWorld is a product for children. These rules are mandatory for every change.

## Accounts and roles
- Only **parents/guardians (18+)** create accounts (Supabase Auth, email + password ≥ 8 chars with a letter and a digit). Children never have credentials, email or public profiles.
- A device switches to **child mode** with a signed (HMAC-SHA256) httpOnly cookie bound to the parent's profile. The parent area then requires the parent **PIN** (scrypt-hashed, 5 attempts / 5 min).
- Every page and API route resolves the parent from the session and verifies child ownership (`services/context.ts`). This is on top of Postgres **Row Level Security** (`supabase/migrations/0001_init.sql`): per-child tables are readable/writable only when `is_my_child(child_id)`.
- The **service-role key is never used** by the app. The OpenAI key is server-only.

## Data minimisation
- Child profile: nickname (validated against emails/phone numbers/links), age in whole years + year recorded (**no birth date**), grade, country, language, preferences, avatar.
- Answers: minimal payload for mistake analysis, nulled after 180 days (`purge_old_answers()`); AI messages deleted after 90 days and stored only when the parent allows (`aiSaveHistory`). Uploaded photos are **never stored**.
- Parents can export all of a child's data (JSON) and delete a child or the whole account (cascade).
- No ads, no tracking pixels, no public chat, no friend lists, no leaderboards comparing children.

## API protection
- zod validation on every input; JSON bodies limited to 256 KB; uniform error responses without stack traces.
- Rate limits: register 5/h/IP, login 10/10 min/IP + 8/10 min/email, play actions 120/min/child, games 12/min, AI 6/min + 15–40/day/child (durable count from the DB), PIN 5/5 min.
- The in-memory limiter is per instance; for multi-instance deployments use a shared store (e.g. Upstash Redis) — `lib/rate-limit.ts` is the single place to change.
- Security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (`next.config.ts`).
- Rewards are computed on the server from stored first attempts; clients cannot post scores for lessons/bosses. Mini-game results are clamped and rewards capped per day.

## EduBuddy helper
Currently EduBuddy is a **knowledge-base chat bot** (`src/features/chatbot`, `/api/tutor/ask`): answers come only from prepared, reviewed text, nothing is sent to external services and questions are not stored. The same local safety rules apply (self-harm → caring reply, unsafe topics refused, personal data → privacy reminder). Unknown questions get an honest "I don't know yet".

## AI tutor (switched off - `AI_TUTOR_ENABLED = false`)
Pipeline in `app/api/ai/chat/route.ts`:
1. Parent toggles (`aiEnabled`, `aiPhotoEnabled`) and limits.
2. Local rules (`services/ai/safety.ts`, unit-tested): self-harm → caring reply pointing to a trusted adult/emergency number; unsafe/romantic topics → refusal; personal data is **redacted** before it reaches the model or storage.
3. Images: ≤ 4 MB, MIME verified by magic bytes (PNG/JPEG/WebP only), processed in memory.
4. OpenAI moderation (`omni-moderation-latest`) on input text + image, the model, then moderation on the output.
5. Age-adapted system prompt: teach step by step, never just give the final answer, never ask for personal info, no romance/role-play, stay on learning.
The learning programme never depends on AI; it is an optional helper.

## Legal
Before launch, review requirements for the target countries (e.g. COPPA in the US, GDPR/UK-GDPR Art. 8 parental consent, Russian 152-FZ data localisation, Uzbekistan's personal data law incl. localisation). Onboarding records explicit parental consent (`parent_profiles.consent_at`). Hosting region and DPAs must be chosen accordingly.

## Reporting
Report vulnerabilities privately to the maintainers; do not open public issues containing children's data.
