import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, getStore, type SessionUser } from "@/services/auth";
import type { Store } from "@/services/db/store";
import type { ChildProfileRow, ParentProfileRow, ParentSettings } from "@/types/db";
import { sign, verify } from "@/lib/crypto";
import { env } from "@/lib/env";

/**
 * Request context + authorization helpers. Every page and API route resolves the parent from
 * the authenticated session and checks that a child profile belongs to that parent before use
 * (defence in depth on top of RLS).
 */

export const CHILD_COOKIE = "ew_child";
export const UNLOCK_COOKIE = "ew_parent_unlock";

export const DEFAULT_SETTINGS: ParentSettings = {
  pinHash: null,
  aiEnabled: true,
  aiPhotoEnabled: true,
  aiSaveHistory: true,
  minigamesEnabled: true,
  shopEnabled: true,
  dailyLimitMinutes: 60,
  breakEveryMinutes: 20,
  allowedSubjects: [],
  weeklyGoalLessons: 5,
  notifications: { weeklyReport: true, achievements: true },
  schedule: null,
};

export const getParent = cache(async (): Promise<{ user: SessionUser; store: Store; parent: ParentProfileRow | null } | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  const store = await getStore();
  const [parent] = await store.select("parent_profiles", { user_id: user.id });
  return { user, store, parent: parent ?? null };
});

export async function getSettings(store: Store, parentId: string): Promise<ParentSettings> {
  const [row] = await store.select("parent_settings", { parent_id: parentId });
  return { ...DEFAULT_SETTINGS, ...(row?.settings_json ?? {}) };
}

export async function saveSettings(store: Store, parentId: string, patch: Partial<ParentSettings>) {
  const [row] = await store.select("parent_settings", { parent_id: parentId });
  const next = { ...DEFAULT_SETTINGS, ...(row?.settings_json ?? {}), ...patch };
  if (row) await store.update("parent_settings", { id: row.id }, { settings_json: next });
  else await store.insert("parent_settings", { parent_id: parentId, settings_json: next });
  return next;
}

/** Page guard: signed-in parent with a completed onboarding. */
export async function requireParent() {
  const ctx = await getParent();
  if (!ctx) redirect("/login");
  if (!ctx.parent) redirect("/parent/onboarding");
  return { ...ctx, parent: ctx.parent };
}

/** Parent area guard: when a PIN is set and the device is in child mode, require the PIN. */
export async function requireParentArea() {
  const ctx = await requireParent();
  const settings = await getSettings(ctx.store, ctx.parent.id);
  const jar = await cookies();
  const unlocked = verify<{ pid: string }>(jar.get(UNLOCK_COOKIE)?.value)?.pid === ctx.parent.id;
  const inChildMode = !!jar.get(CHILD_COOKIE)?.value;
  if (settings.pinHash && inChildMode && !unlocked) redirect("/parent/unlock");
  return { ...ctx, settings };
}

export async function setUnlocked(parentId: string) {
  (await cookies()).set(UNLOCK_COOKIE, sign({ pid: parentId }, 2 * 3600), { httpOnly: true, sameSite: "lax", secure: env.isProd, path: "/", maxAge: 2 * 3600 });
}

export async function enterChildMode(parentId: string, childId: string) {
  const jar = await cookies();
  jar.set(CHILD_COOKIE, sign({ pid: parentId, cid: childId }, 30 * 86400), { httpOnly: true, sameSite: "lax", secure: env.isProd, path: "/", maxAge: 30 * 86400 });
  jar.delete(UNLOCK_COOKIE);
}

export async function leaveChildMode() {
  (await cookies()).delete(CHILD_COOKIE);
}

export async function getOwnedChild(store: Store, parentId: string, childId: string): Promise<ChildProfileRow | null> {
  const [child] = await store.select("child_profiles", { id: childId, parent_id: parentId });
  return child ?? null;
}

export const getChildContext = cache(async () => {
  const ctx = await getParent();
  if (!ctx?.parent) return null;
  const token = verify<{ pid: string; cid: string }>((await cookies()).get(CHILD_COOKIE)?.value);
  if (!token || token.pid !== ctx.parent.id) return null;
  const child = await getOwnedChild(ctx.store, ctx.parent.id, token.cid);
  if (!child) return null;
  const settings = await getSettings(ctx.store, ctx.parent.id);
  return { ...ctx, parent: ctx.parent, child, settings };
});

/** Page guard for the child area. */
export async function requireChild(opts: { allowNoAssessment?: boolean } = {}) {
  const ctx = await getChildContext();
  if (!ctx) {
    const p = await getParent();
    redirect(p ? "/parent/dashboard" : "/login");
  }
  if (!opts.allowNoAssessment && !ctx.child.assessment_completed_at) redirect("/play/assessment");
  return ctx;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** API guard for child endpoints. */
export async function apiChild() {
  const ctx = await getChildContext();
  if (!ctx) throw new HttpError(401, "not_in_child_mode");
  return ctx;
}

/** API guard for parent endpoints. */
export async function apiParent() {
  const ctx = await getParent();
  if (!ctx) throw new HttpError(401, "unauthorized");
  if (!ctx.parent) throw new HttpError(403, "onboarding_required");
  const settings = await getSettings(ctx.store, ctx.parent.id);
  const jar = await cookies();
  const unlocked = verify<{ pid: string }>(jar.get(UNLOCK_COOKIE)?.value)?.pid === ctx.parent.id;
  if (settings.pinHash && jar.get(CHILD_COOKIE)?.value && !unlocked) throw new HttpError(403, "parent_locked");
  return { ...ctx, parent: ctx.parent, settings };
}
