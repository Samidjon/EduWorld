"use client";

export class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

/** JSON POST helper for client components. Throws ApiError with the server's error code. */
export async function api<T = unknown>(path: string, body?: unknown, method = "POST"): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body instanceof FormData ? undefined : { "content-type": "application/json" },
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "network");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new ApiError(res.status, data.error ?? "server_error");
  return data;
}
