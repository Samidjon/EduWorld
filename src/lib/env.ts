import "server-only";

/** Server-side environment. Secrets are read only here and never sent to the browser. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  openaiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  sessionSecret: process.env.EDUWORLD_SESSION_SECRET ?? "",
  allowLocalStore: process.env.EDUWORLD_ALLOW_LOCAL_STORE === "true",
  isProd: process.env.NODE_ENV === "production",
};

export const supabaseConfigured = () => !!(env.supabaseUrl && env.supabaseAnonKey);

/** Local JSON store is a development convenience only. */
export function dataMode(): "supabase" | "local" {
  if (supabaseConfigured()) return "supabase";
  if (env.isProd && !env.allowLocalStore) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return "local";
}

export function sessionSecret(): string {
  if (env.sessionSecret.length >= 32) return env.sessionSecret;
  if (env.isProd) throw new Error("EDUWORLD_SESSION_SECRET must be set (>= 32 chars) in production.");
  return "dev-only-insecure-secret-change-me-0123456789";
}

/**
 * AI (OpenAI) tutor switch. OFF for now: EduBuddy answers only from the prepared knowledge base
 * (src/features/chatbot). The OpenAI route stays in the code and returns 404 while this is false.
 */
export const AI_TUTOR_ENABLED = false;

export const aiConfigured = () => AI_TUTOR_ENABLED && !!env.openaiKey;
