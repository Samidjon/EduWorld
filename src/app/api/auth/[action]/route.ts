import { NextResponse } from "next/server";
import { loginSchema, registerSchema } from "@/lib/validation";
import { signIn, signOut, signUp } from "@/services/auth";
import { errorResponse } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { HttpError, setUnlocked, getParent } from "@/services/context";

export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  try {
    const ip = clientIp(req);
    if (action === "register") {
      rateLimit(`register:${ip}`, 5, 60 * 60_000);
      const body = registerSchema.parse(await req.json().catch(() => ({})));
      const res = await signUp(body.email, body.password, new URL(req.url).origin);
      // Supabase's built-in mailer allows only a few confirmation emails per hour
      if (!res.ok && res.message === "email_rate_limit") return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.error === "email_taken" ? 409 : 400 });
      return NextResponse.json({ ok: true, needsEmailConfirmation: !!res.needsEmailConfirmation });
    }
    if (action === "login") {
      rateLimit(`login:${ip}`, 10, 10 * 60_000);
      const body = loginSchema.parse(await req.json().catch(() => ({})));
      rateLimit(`login:${body.email}`, 8, 10 * 60_000);
      const res = await signIn(body.email, body.password);
      if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 });
      const ctx = await getParent();
      if (ctx?.parent) await setUnlocked(ctx.parent.id);
      return NextResponse.json({ ok: true, onboarded: !!ctx?.parent });
    }
    if (action === "logout") {
      await signOut();
      return NextResponse.json({ ok: true });
    }
    throw new HttpError(404, "not_found");
  } catch (e) {
    return errorResponse(e);
  }
}
