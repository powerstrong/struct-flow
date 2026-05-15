// Session DB persistence — wraps infra/auth.ts (crypto) and infra/d1.ts (storage).

import { getOne, run, nowIso } from "./d1";
import {
  createSessionRecord,
  readSessionCookie,
  type CreatedSession,
} from "./auth";
import { sha256Hex } from "./ids";

export async function createSession(env: Env, userId: string): Promise<CreatedSession> {
  const rec = await createSessionRecord();
  await run(
    env,
    "INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
    rec.sessionId,
    userId,
    rec.tokenHash,
    rec.expiresAt,
    nowIso(),
  );
  return rec;
}

export interface SessionUser {
  userId: string;
  sessionId: string;
}

export async function verifySession(env: Env, token: string): Promise<SessionUser | null> {
  const tokenHash = await sha256Hex(token);
  const row = await getOne<{ id: string; user_id: string; expires_at: string }>(
    env,
    "SELECT id, user_id, expires_at FROM sessions WHERE token_hash = ? LIMIT 1",
    tokenHash,
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await deleteSession(env, row.id);
    return null;
  }
  return { userId: row.user_id, sessionId: row.id };
}

export async function deleteSession(env: Env, sessionId: string): Promise<void> {
  await run(env, "DELETE FROM sessions WHERE id = ?", sessionId);
}

export async function requireSession(env: Env, req: Request): Promise<SessionUser | null> {
  const token = readSessionCookie(req);
  if (!token) return null;
  return verifySession(env, token);
}
