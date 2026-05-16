// Session DB persistence — wraps infra/auth.ts (crypto) and infra/d1.ts (storage).
// Sessions are rolling: idle TTL slides on near-expiry requests, capped by absolute_max_at.

import { getOne, run, nowIso } from "./d1";
import {
  createSessionRecord,
  readSessionCookie,
  buildSessionCookie,
  cookieSecureFromEnv,
  SESSION_IDLE_TTL_MS,
  SESSION_RENEW_THRESHOLD_MS,
  type CreatedSession,
} from "./auth";
import { sha256Hex } from "./ids";

export async function createSession(env: Env, userId: string): Promise<CreatedSession> {
  const rec = await createSessionRecord();
  await run(
    env,
    "INSERT INTO sessions (id, user_id, token_hash, expires_at, absolute_max_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    rec.sessionId,
    userId,
    rec.tokenHash,
    rec.expiresAt,
    rec.absoluteMaxAt,
    nowIso(),
  );
  return rec;
}

export interface SessionUser {
  userId: string;
  sessionId: string;
  /** Set when the session was rolled on this request — caller must attach to response. */
  refreshCookie?: string;
}

interface SessionRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  absolute_max_at: string | null;
}

export async function verifySession(env: Env, token: string): Promise<SessionUser | null> {
  const tokenHash = await sha256Hex(token);
  const row = await getOne<SessionRow>(
    env,
    "SELECT id, user_id, expires_at, absolute_max_at FROM sessions WHERE token_hash = ? LIMIT 1",
    tokenHash,
  );
  if (!row) return null;

  const now = Date.now();
  const idleEnd = new Date(row.expires_at).getTime();
  const absoluteEnd = row.absolute_max_at
    ? new Date(row.absolute_max_at).getTime()
    : idleEnd; // legacy rows: no slide

  if (now >= absoluteEnd || now >= idleEnd) {
    await deleteSession(env, row.id);
    return null;
  }

  let refreshCookie: string | undefined;
  if (row.absolute_max_at && idleEnd - now <= SESSION_RENEW_THRESHOLD_MS) {
    const nextIdleEnd = Math.min(now + SESSION_IDLE_TTL_MS, absoluteEnd);
    const nextIdleIso = new Date(nextIdleEnd).toISOString();
    // Conditional update: only slides forward, avoiding write amplification when
    // concurrent requests race and one already extended past nextIdleIso.
    const res = await run(
      env,
      "UPDATE sessions SET expires_at = ? WHERE id = ? AND expires_at < ?",
      nextIdleIso,
      row.id,
      nextIdleIso,
    );
    if ((res.meta?.changes ?? 0) > 0) {
      const maxAgeSec = Math.max(1, Math.floor((nextIdleEnd - now) / 1000));
      refreshCookie = buildSessionCookie(token, { secure: cookieSecureFromEnv(env) }, maxAgeSec);
    }
  }

  return { userId: row.user_id, sessionId: row.id, refreshCookie };
}

export async function deleteSession(env: Env, sessionId: string): Promise<void> {
  await run(env, "DELETE FROM sessions WHERE id = ?", sessionId);
}

export async function requireSession(env: Env, req: Request): Promise<SessionUser | null> {
  const token = readSessionCookie(req);
  if (!token) return null;
  return verifySession(env, token);
}

/** Append a refresh Set-Cookie header to a response if the session was rolled. */
export function attachRefresh(res: Response, refreshCookie: string | undefined): Response {
  if (!refreshCookie) return res;
  const headers = new Headers(res.headers);
  headers.append("set-cookie", refreshCookie);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
