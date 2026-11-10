import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { errorResponse } from "@/lib/api";
import { AI_TUTOR_ENABLED, aiConfigured, env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { apiChild, HttpError } from "@/services/context";
import { currentAge } from "@/services/children";
import { isoDate } from "@/features/progression/rules";
import { checkChildMessage, containsPersonalInfo, MAX_IMAGE_BYTES, redactPersonalInfo, SAFE_REPLIES, sniffImage, systemPrompt } from "@/services/ai/safety";

export const runtime = "nodejs";

const GRADE_LABEL: Record<string, string> = { none: "preschool", prep: "preparatory group", custom: "individual programme" };
const DAILY_LIMIT_YOUNG = 15;
const DAILY_LIMIT = 40;

/**
 * EduBuddy chat. Server-only: the OpenAI key never reaches the browser.
 * Pipeline: auth → parent toggles → rate limits → local safety rules → PII redaction →
 * OpenAI moderation (text + image) → model → output moderation → optional storage.
 * Uploaded photos are validated by magic bytes and size and are NOT stored.
 */
export async function POST(req: Request) {
  try {
    // The AI tutor is switched off for now; EduBuddy uses the prepared knowledge base (/api/tutor/ask).
    if (!AI_TUTOR_ENABLED) throw new HttpError(404, "ai_disabled");
    const ctx = await apiChild();
    const { child, settings, store } = ctx;
    const locale = child.interface_language;
    if (!settings.aiEnabled) throw new HttpError(403, "feature_disabled");
    if (!aiConfigured()) throw new HttpError(503, "ai_not_configured");
    rateLimit(`ai:${child.id}`, 6, 60_000);

    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > MAX_IMAGE_BYTES + 64_000) throw new HttpError(413, "payload_too_large");
    const form = await req.formData();
    const message = z.string().max(4000).parse(form.get("message") ?? "");
    const sessionIdRaw = form.get("sessionId");
    const file = form.get("image");

    const age = currentAge(child);
    const today = isoDate();
    const usedToday = (await store.select("ai_messages", { child_id: child.id, role: "user" }, { gte: ["created_at", today] })).length;
    if (usedToday >= (age <= 7 ? DAILY_LIMIT_YOUNG : DAILY_LIMIT)) throw new HttpError(429, "daily_ai_limit");

    // local safety rules first (cheap, deterministic)
    const verdict = checkChildMessage(message || (file ? "photo" : ""));
    if (!verdict.ok) return NextResponse.json({ reply: SAFE_REPLIES[verdict.reason === "self_harm" ? "self_harm" : verdict.reason][locale], blocked: true });

    let imageDataUrl: string | null = null;
    if (file instanceof File && file.size > 0) {
      if (!settings.aiPhotoEnabled) throw new HttpError(403, "photo_disabled");
      if (file.size > MAX_IMAGE_BYTES) throw new HttpError(413, "image_too_large");
      const buf = new Uint8Array(await file.arrayBuffer());
      const mime = sniffImage(buf);
      if (!mime) throw new HttpError(415, "unsupported_image");
      imageDataUrl = `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
    }

    const hadPII = containsPersonalInfo(message);
    const clean = redactPersonalInfo(message);
    const openai = new OpenAI({ apiKey: env.openaiKey });

    const mod = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: [{ type: "text", text: clean || "photo of homework" }, ...(imageDataUrl ? [{ type: "image_url" as const, image_url: { url: imageDataUrl } }] : [])],
    });
    if (mod.results.some((r) => r.flagged)) {
      const selfHarm = mod.results.some((r) => r.categories["self-harm"] || r.categories["self-harm/intent"]);
      return NextResponse.json({ reply: SAFE_REPLIES[selfHarm ? "self_harm" : "unsafe_topic"][locale], blocked: true });
    }

    // session (owned by this child)
    let sessionId = typeof sessionIdRaw === "string" && z.string().uuid().safeParse(sessionIdRaw).success ? sessionIdRaw : null;
    if (sessionId && !(await store.select("ai_sessions", { id: sessionId, child_id: child.id })).length) sessionId = null;
    if (!sessionId) sessionId = (await store.insert("ai_sessions", { child_id: child.id, created_at: new Date().toISOString() })).id;
    const history = (await store.select("ai_messages", { session_id: sessionId, child_id: child.id }, { orderBy: "created_at", desc: true, limit: 10 })).reverse();

    const gradeLabel = GRADE_LABEL[child.current_grade] ?? `grade ${child.current_grade}`;
    const userText = (clean || (locale === "en" ? "Help me with this task from the photo." : "Помоги мне с заданием на фото.")) + (hadPII ? "\n[Note to tutor: the child shared personal info; it was hidden. Remind them gently to keep it private.]" : "");

    const completion = await openai.chat.completions.create({
      model: env.openaiModel,
      temperature: 0.4,
      max_tokens: age <= 7 ? 250 : 700,
      messages: [
        { role: "system", content: systemPrompt({ age, gradeLabel, locale, nickname: child.nickname }) },
        ...history.map((m) => ({ role: m.role, content: m.content }) as const),
        imageDataUrl
          ? { role: "user", content: [{ type: "text", text: userText }, { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } }] }
          : { role: "user", content: userText },
      ],
    });
    let reply = completion.choices[0]?.message?.content?.trim() || SAFE_REPLIES.empty[locale];

    // output check
    const outMod = await openai.moderations.create({ model: "omni-moderation-latest", input: reply });
    if (outMod.results.some((r) => r.flagged)) reply = SAFE_REPLIES.unsafe_topic[locale];
    reply = redactPersonalInfo(reply);

    const now = new Date().toISOString();
    // the user message is always counted (for daily limits); content is kept only if the parent allows it
    const keep = settings.aiSaveHistory;
    await store.insert("ai_messages", { session_id: sessionId, child_id: child.id, role: "user", content: keep ? clean.slice(0, 4000) || "[photo]" : "[not saved]", flagged: hadPII, created_at: now });
    await store.insert("ai_messages", { session_id: sessionId, child_id: child.id, role: "assistant", content: keep ? reply.slice(0, 8000) : "[not saved]", flagged: false, created_at: new Date(Date.now() + 1).toISOString() });

    return NextResponse.json({ reply, sessionId });
  } catch (e) {
    if (e instanceof OpenAI.APIError) {
      console.error("[ai] provider error", e.status);
      return NextResponse.json({ error: "ai_unavailable" }, { status: 502 });
    }
    return errorResponse(e);
  }
}
