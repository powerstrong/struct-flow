import { z } from "zod";
import { json, badRequest, unauthorized, error } from "../http";
import { getOne, run, nowIso } from "../infra/d1";
import {
  hashPassword,
  verifyPassword,
  buildSessionCookie,
  buildClearSessionCookie,
  cookieSecureFromEnv,
  readSessionCookie,
} from "../infra/auth";
import { createSession, deleteSession, verifySession } from "../infra/session-store";
import { newUuid } from "../infra/ids";
import { checkProAccess } from "../domain/pro/checkProAccess";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const passwordSchema = z.string().min(8).max(200);

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(1).max(60).optional(),
  agreeDisclaimer: z.literal(true),
});

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  display_name: string | null;
  is_admin: number;
}

async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export async function signupRoute(req: Request, env: Env): Promise<Response> {
  const body = await readJson(req);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("입력값이 올바르지 않습니다.", parsed.error.flatten());
  }
  const { email, password, displayName } = parsed.data;

  const existing = await getOne<UserRow>(
    env,
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    email,
  );
  if (existing) {
    return error("email_taken", "이미 가입된 이메일입니다.", 409);
  }

  const { hash, salt } = await hashPassword(password);
  const userId = newUuid();
  await run(
    env,
    "INSERT INTO users (id, email, password_hash, salt, display_name, is_admin, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
    userId,
    email,
    hash,
    salt,
    displayName ?? null,
    nowIso(),
  );

  const session = await createSession(env, userId);
  return json(
    { id: userId, email, displayName: displayName ?? null, isAdmin: false, proActive: false, proExpiresAt: null },
    201,
    { "set-cookie": buildSessionCookie(session.token, { secure: cookieSecureFromEnv(env) }) },
  );
}

export async function loginRoute(req: Request, env: Env): Promise<Response> {
  const body = await readJson(req);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("입력값이 올바르지 않습니다.", parsed.error.flatten());
  }
  const { email, password } = parsed.data;

  const user = await getOne<UserRow>(
    env,
    "SELECT id, email, password_hash, salt, display_name, is_admin FROM users WHERE email = ? LIMIT 1",
    email,
  );
  if (!user) {
    return error("invalid_credentials", "이메일 또는 비밀번호가 올바르지 않습니다.", 401);
  }
  const ok = await verifyPassword(password, user.password_hash, user.salt);
  if (!ok) {
    return error("invalid_credentials", "이메일 또는 비밀번호가 올바르지 않습니다.", 401);
  }

  const session = await createSession(env, user.id);
  const pro = await checkProAccess(env, user.id);
  return json(
    {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      isAdmin: user.is_admin === 1,
      proActive: pro.active,
      proExpiresAt: pro.expiresAt,
    },
    200,
    { "set-cookie": buildSessionCookie(session.token, { secure: cookieSecureFromEnv(env) }) },
  );
}

export async function logoutRoute(req: Request, env: Env): Promise<Response> {
  const token = readSessionCookie(req);
  if (token) {
    const session = await verifySession(env, token);
    if (session) await deleteSession(env, session.sessionId);
  }
  return json(
    { ok: true },
    200,
    { "set-cookie": buildClearSessionCookie({ secure: cookieSecureFromEnv(env) }) },
  );
}

export async function meRoute(req: Request, env: Env): Promise<Response> {
  const token = readSessionCookie(req);
  if (!token) return unauthorized();
  const session = await verifySession(env, token);
  if (!session) return unauthorized();
  const user = await getOne<UserRow>(
    env,
    "SELECT id, email, display_name, is_admin FROM users WHERE id = ? LIMIT 1",
    session.userId,
  );
  if (!user) return unauthorized();
  const pro = await checkProAccess(env, user.id);
  return json({
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    isAdmin: user.is_admin === 1,
    proActive: pro.active,
    proExpiresAt: pro.expiresAt,
  });
}
