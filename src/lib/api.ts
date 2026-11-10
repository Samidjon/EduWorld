import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { HttpError } from "@/services/context";

/**
 * Wraps a route handler: validates JSON input with zod, maps errors to safe responses
 * (no stack traces or internal messages leak to the client).
 */
export function route<T>(schema: ZodSchema<T> | null, handler: (input: T, req: Request) => Promise<unknown>) {
  return async (req: Request) => {
    try {
      let input = undefined as T;
      if (schema) {
        const len = Number(req.headers.get("content-length") ?? 0);
        if (len > 256_000) throw new HttpError(413, "payload_too_large");
        input = schema.parse(await req.json().catch(() => ({})));
      }
      const data = await handler(input, req);
      return NextResponse.json(data ?? { ok: true });
    } catch (e) {
      return errorResponse(e);
    }
  };
}

export function errorResponse(e: unknown) {
  if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
  if (e instanceof ZodError) return NextResponse.json({ error: "invalid_input", issues: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 400 });
  console.error("[api]", e);
  return NextResponse.json({ error: "server_error" }, { status: 500 });
}
