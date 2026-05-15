// Single fetch wrapper. All API calls go through here. Same-origin via Vite proxy in dev.

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
    ...init,
  });
  const text = await res.text();
  const body: unknown = text ? safeParse(text) : null;
  if (!res.ok) {
    const errBody = body as ErrorBody | null;
    throw new ApiError(
      res.status,
      errBody?.error?.code ?? "unknown",
      errBody?.error?.message ?? `HTTP ${res.status}`,
      errBody?.error?.details,
    );
  }
  return body as T;
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
