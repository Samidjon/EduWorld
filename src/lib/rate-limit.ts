import "server-only";
import { HttpError } from "@/services/context";

/**
 * Fixed-window in-memory rate limiter (per server instance). Durable per-day limits for AI are
 * additionally enforced from the database (see services/ai). For multi-instance deployments,
 * swap this for a shared store (e.g. Upstash Redis) - see SECURITY.md.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return;
  }
  b.count++;
  if (b.count > limit) throw new HttpError(429, "rate_limited");
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}
