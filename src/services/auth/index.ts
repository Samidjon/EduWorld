import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { dataMode, env } from "@/lib/env";
import { hashSecret, randomToken, sha256, verifySecret } from "@/lib/crypto";
import { supabaseServer } from "@/services/supabase/server";
import { LocalStore, localRaw } from "@/services/db/local-store";
import { SupabaseStore } from "@/services/db/supabase-store";
import type { Store } from "@/services/db/store";

/**
 * Authentication adapter.
 * - Supabase mode: Supabase Auth (email + password), session in Supabase cookies.
 * - Local dev mode: scrypt-hashed passwords + opaque session token (stored hashed) in an httpOnly cookie.
 * Only parents have accounts. Children never sign in and have no credentials (see SECURITY.md).
 */

export interface SessionUser { id: string; email: string }
export type AuthResult = { ok: true; needsEmailConfirmation?: boolean } | { ok: false; error: "invalid_credentials" | "email_taken" | "weak_password" | "unknown"; message?: string };

const LOCAL_COOKIE = "ew_session";
const SESSION_DAYS = 14;

export const getStore = cache(async (): Promise<Store> => {
  if (dataMode() === "supabase") return new SupabaseStore(await supabaseServer());
  return new LocalStore();
});

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (dataMode() === "supabase") {
    const sb = await supabaseServer();
    const { data } = await sb.auth.getUser();
    return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
  }
  const token = (await cookies()).get(LOCAL_COOKIE)?.value;
  if (!token) return null;
  const s = localRaw.find("local_sessions", { token_hash: sha256(token) })[0] as { user_id: string; expires_at: string } | undefined;
  if (!s || new Date(s.expires_at) < new Date()) return null;
  const u = localRaw.find("users", { id: s.user_id })[0] as { id: string; email: string } | undefined;
  return u ? { id: u.id, email: u.email } : null;
});

async function setLocalSession(userId: string) {
  const token = randomToken();
  await localRaw.insert("local_sessions", { token_hash: sha256(token), user_id: userId, expires_at: new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString() });
  (await cookies()).set(LOCAL_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: env.isProd, path: "/", maxAge: SESSION_DAYS * 86400 });
}

export async function signUp(email: string, password: string, origin: string): Promise<AuthResult> {
  email = email.trim().toLowerCase();
  if (dataMode() === "supabase") {
    const sb = await supabaseServer();
    const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/login` } });
    if (error) {
      console.warn("[auth] signUp failed:", error.status, error.code, error.message);
      if (/registered|exists/i.test(error.message)) return { ok: false, error: "email_taken" };
      if (error.code === "over_email_send_rate_limit" || error.status === 429) return { ok: false, error: "unknown", message: "email_rate_limit" };
      if (/password/i.test(error.message)) return { ok: false, error: "weak_password", message: error.message };
      return { ok: false, error: "unknown" };
    }
    return { ok: true, needsEmailConfirmation: !data.session };
  }
  if (localRaw.find("users", { email }).length) return { ok: false, error: "email_taken" };
  const user = await localRaw.insert("users", { email, role: "parent", created_at: new Date().toISOString() });
  await localRaw.insert("local_credentials", { user_id: user.id, password_hash: hashSecret(password) });
  await setLocalSession(user.id as string);
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  email = email.trim().toLowerCase();
  if (dataMode() === "supabase") {
    const sb = await supabaseServer();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return error ? { ok: false, error: "invalid_credentials" } : { ok: true };
  }
  const u = localRaw.find("users", { email })[0] as { id: string } | undefined;
  const cred = u && (localRaw.find("local_credentials", { user_id: u.id })[0] as { password_hash: string } | undefined);
  // verify even when the user is missing to keep timing similar
  const ok = verifySecret(password, cred?.password_hash ?? "scrypt$00$00");
  if (!u || !ok) return { ok: false, error: "invalid_credentials" };
  await setLocalSession(u.id);
  return { ok: true };
}

export async function signOut() {
  const jar = await cookies();
  if (dataMode() === "supabase") {
    const sb = await supabaseServer();
    await sb.auth.signOut();
  } else {
    const token = jar.get(LOCAL_COOKIE)?.value;
    if (token) await localRaw.remove("local_sessions", { token_hash: sha256(token) });
    jar.delete(LOCAL_COOKIE);
  }
  jar.delete("ew_child");
  jar.delete("ew_parent_unlock");
}

export async function changePassword(userId: string, current: string, next: string): Promise<AuthResult> {
  if (dataMode() === "supabase") {
    const sb = await supabaseServer();
    const { data } = await sb.auth.getUser();
    const email = data.user?.email;
    if (!email) return { ok: false, error: "unknown" };
    const check = await sb.auth.signInWithPassword({ email, password: current });
    if (check.error) return { ok: false, error: "invalid_credentials" };
    const { error } = await sb.auth.updateUser({ password: next });
    return error ? { ok: false, error: "weak_password", message: error.message } : { ok: true };
  }
  const cred = localRaw.find("local_credentials", { user_id: userId })[0] as { password_hash: string } | undefined;
  if (!verifySecret(current, cred?.password_hash)) return { ok: false, error: "invalid_credentials" };
  await localRaw.remove("local_credentials", { user_id: userId });
  await localRaw.insert("local_credentials", { user_id: userId, password_hash: hashSecret(next) });
  return { ok: true };
}

/** Removes local auth records. In Supabase mode the auth user is deleted by the delete_my_account() SQL function. */
export async function deleteAuthUser(userId: string) {
  if (dataMode() === "supabase") {
    const sb = await supabaseServer();
    const { error } = await sb.rpc("delete_my_account");
    if (error) throw new Error(error.message);
    await sb.auth.signOut();
    return;
  }
  await localRaw.remove("local_credentials", { user_id: userId });
  await localRaw.remove("local_sessions", { user_id: userId });
  await localRaw.remove("users", { id: userId });
  (await cookies()).delete(LOCAL_COOKIE);
}
