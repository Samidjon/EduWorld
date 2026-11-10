import "server-only";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { sessionSecret } from "./env";

export function hashSecret(secret: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(secret, salt, 32).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifySecret(secret: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [algo, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const got = scryptSync(secret, salt, 32);
  const want = Buffer.from(hash, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const randomToken = () => randomBytes(32).toString("base64url");

/** Signed, expiring token for small server state (cookies, diagnostic state). */
export function sign(payload: unknown, ttlSeconds: number): string {
  const body = Buffer.from(JSON.stringify({ p: payload, e: Date.now() + ttlSeconds * 1000 })).toString("base64url");
  const mac = createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verify<T>(token: string | undefined | null): T | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const want = createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  const a = Buffer.from(mac), b = Buffer.from(want);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { p, e } = JSON.parse(Buffer.from(body, "base64url").toString()) as { p: T; e: number };
    return Date.now() > e ? null : p;
  } catch {
    return null;
  }
}
