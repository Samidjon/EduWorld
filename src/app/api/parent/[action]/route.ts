import { z } from "zod";
import { route } from "@/lib/api";
import { onboardingSchema, pinSchema, settingsSchema, passwordSchema } from "@/lib/validation";
import { hashSecret, verifySecret } from "@/lib/crypto";
import { rateLimit } from "@/lib/rate-limit";
import { apiParent, getParent, getSettings, HttpError, leaveChildMode, saveSettings, setUnlocked } from "@/services/context";
import { changePassword, deleteAuthUser } from "@/services/auth";
import { deleteChild } from "@/services/children";

const handlers: Record<string, (req: Request) => Promise<Response>> = {
  /** Create the parent profile (with explicit consent) + optional parent PIN. */
  onboarding: route(onboardingSchema, async (input) => {
    const ctx = await getParent();
    if (!ctx) throw new HttpError(401, "unauthorized");
    if (ctx.parent) return { ok: true };
    const parent = await ctx.store.insert("parent_profiles", { user_id: ctx.user.id, display_name: input.displayName, consent_at: new Date().toISOString(), created_at: new Date().toISOString() });
    await saveSettings(ctx.store, parent.id, { pinHash: input.pin ? hashSecret(input.pin) : null });
    await setUnlocked(parent.id);
    return { ok: true };
  }),

  /** Unlock the parent area with the PIN (when the device is in child mode). */
  unlock: route(z.object({ pin: pinSchema }), async ({ pin }) => {
    const ctx = await getParent();
    if (!ctx?.parent) throw new HttpError(401, "unauthorized");
    rateLimit(`pin:${ctx.parent.id}`, 5, 5 * 60_000);
    const settings = await getSettings(ctx.store, ctx.parent.id);
    if (settings.pinHash && !verifySecret(pin, settings.pinHash)) throw new HttpError(403, "wrong_pin");
    await setUnlocked(ctx.parent.id);
    await leaveChildMode();
    return { ok: true };
  }),

  settings: route(settingsSchema, async (patch) => {
    const ctx = await apiParent();
    const next = await saveSettings(ctx.store, ctx.parent.id, patch);
    return { ok: true, settings: { ...next, pinHash: undefined, hasPin: !!next.pinHash } };
  }),

  pin: route(z.object({ pin: pinSchema.nullable() }), async ({ pin }) => {
    const ctx = await apiParent();
    await saveSettings(ctx.store, ctx.parent.id, { pinHash: pin ? hashSecret(pin) : null });
    return { ok: true };
  }),

  profile: route(z.object({ displayName: z.string().trim().min(1).max(60) }), async ({ displayName }) => {
    const ctx = await apiParent();
    await ctx.store.update("parent_profiles", { id: ctx.parent.id }, { display_name: displayName });
    return { ok: true };
  }),

  password: route(z.object({ current: z.string().min(1).max(128), next: passwordSchema }), async ({ current, next }) => {
    const ctx = await apiParent();
    rateLimit(`pw:${ctx.user.id}`, 5, 10 * 60_000);
    const res = await changePassword(ctx.user.id, current, next);
    if (!res.ok) throw new HttpError(res.error === "invalid_credentials" ? 403 : 400, res.error);
    return { ok: true };
  }),

  /** Deletes all AI tutor history of one of the parent's children. */
  "delete-ai-history": route(z.object({ childId: z.string().uuid() }), async ({ childId }) => {
    const ctx = await apiParent();
    const [child] = await ctx.store.select("child_profiles", { id: childId, parent_id: ctx.parent.id });
    if (!child) throw new HttpError(404, "not_found");
    await ctx.store.remove("ai_messages", { child_id: childId });
    await ctx.store.remove("ai_sessions", { child_id: childId });
    return { ok: true };
  }),

  /** Deletes the parent account and every child profile + learning data. */
  "delete-account": route(z.object({ confirm: z.literal("DELETE") }), async () => {
    const ctx = await apiParent();
    const children = await ctx.store.select("child_profiles", { parent_id: ctx.parent.id });
    for (const c of children) await deleteChild(ctx.store, c.id);
    await ctx.store.remove("parent_settings", { parent_id: ctx.parent.id });
    await ctx.store.remove("parent_profiles", { id: ctx.parent.id });
    await deleteAuthUser(ctx.user.id);
    return { ok: true };
  }),
};

export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const h = handlers[(await params).action];
  if (!h) return Response.json({ error: "not_found" }, { status: 404 });
  return h(req);
}
