import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/** User-scoped Supabase client (anon key + session cookies) - RLS applies to every query. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component: cookies are read-only there; middleware-less refresh is fine
        }
      },
    },
  });
}
