import { z } from "zod";
import { json, badRequest, unauthorized, forbidden, notFound, error } from "../http";
import { getOne, getAll } from "../infra/d1";
import { requireSession } from "../infra/session-store";
import { writeAuditLog } from "../infra/audit";
import { grantPro, revokePro, setProExpiresAt } from "../domain/pro/grantPro";
import { checkProAccess } from "../domain/pro/checkProAccess";

interface AdminCtx {
  adminUserId: string;
}

async function requireAdmin(req: Request, env: Env): Promise<AdminCtx | Response> {
  const session = await requireSession(env, req);
  if (!session) return unauthorized();
  const user = await getOne<{ is_admin: number }>(
    env,
    "SELECT is_admin FROM users WHERE id = ? LIMIT 1",
    session.userId,
  );
  if (!user || user.is_admin !== 1) return forbidden("관리자 권한이 필요합니다.");
  return { adminUserId: session.userId };
}

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: number;
  created_at: string;
}

export async function adminUsersListRoute(req: Request, env: Env): Promise<Response> {
  const ctx = await requireAdmin(req, env);
  if (ctx instanceof Response) return ctx;

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  const rows = q
    ? await getAll<UserRow>(
        env,
        "SELECT id, email, display_name, is_admin, created_at FROM users WHERE LOWER(email) LIKE ? ORDER BY created_at DESC LIMIT 100",
        `%${q}%`,
      )
    : await getAll<UserRow>(
        env,
        "SELECT id, email, display_name, is_admin, created_at FROM users ORDER BY created_at DESC LIMIT 100",
      );

  const summaries = await Promise.all(
    rows.map(async (r) => {
      const pro = await checkProAccess(env, r.id);
      return {
        id: r.id,
        email: r.email,
        displayName: r.display_name,
        isAdmin: r.is_admin === 1,
        proActive: pro.active,
        proExpiresAt: pro.expiresAt,
        createdAt: r.created_at,
      };
    }),
  );
  return json(summaries);
}

const proActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("grant"), years: z.number().int().positive().max(10), memo: z.string().max(500).optional() }),
  z.object({ action: z.literal("extend"), years: z.number().int().positive().max(10), memo: z.string().max(500).optional() }),
  z.object({ action: z.literal("revoke"), memo: z.string().max(500).optional() }),
  z.object({ action: z.literal("set-expires-at"), expiresAt: z.string().datetime(), memo: z.string().max(500).optional() }),
]);

export async function adminProRoute(
  req: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const ctx = await requireAdmin(req, env);
  if (ctx instanceof Response) return ctx;

  const targetUserId = params.id;
  if (!targetUserId) return badRequest("사용자 ID가 필요합니다.");

  const exists = await getOne<{ id: string }>(env, "SELECT id FROM users WHERE id = ? LIMIT 1", targetUserId);
  if (!exists) return notFound();

  const body = await safeJson(req);
  const parsed = proActionSchema.safeParse(body);
  if (!parsed.success) return badRequest("요청이 올바르지 않습니다.", parsed.error.flatten());

  let resultPayload: unknown;
  if (parsed.data.action === "grant" || parsed.data.action === "extend") {
    const out = await grantPro(env, {
      userId: targetUserId,
      years: parsed.data.years,
      grantedBy: ctx.adminUserId,
      memo: parsed.data.memo,
      source: "manual",
    });
    resultPayload = out;
  } else if (parsed.data.action === "revoke") {
    const changed = await revokePro(env, targetUserId);
    if (changed === 0) {
      return error("no_active_entitlement", "활성 Pro 권한이 없습니다.", 409);
    }
    resultPayload = { ok: true, changed };
  } else {
    const changed = await setProExpiresAt(env, targetUserId, parsed.data.expiresAt);
    if (changed === 0) {
      return error("no_active_entitlement", "활성 Pro 권한이 없습니다. 먼저 grant 하세요.", 409);
    }
    resultPayload = { ok: true, expiresAt: parsed.data.expiresAt, changed };
  }

  await writeAuditLog(env, {
    adminId: ctx.adminUserId,
    actionType: `pro:${parsed.data.action}`,
    targetUserId,
    payload: parsed.data,
  });

  const pro = await checkProAccess(env, targetUserId);
  return json({ result: resultPayload, proStatus: pro });
}

export async function adminAuditRoute(req: Request, env: Env): Promise<Response> {
  const ctx = await requireAdmin(req, env);
  if (ctx instanceof Response) return ctx;

  const url = new URL(req.url);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "100", 10), 1), 500);
  const rows = await getAll<{
    id: string;
    admin_user_id: string;
    action_type: string;
    target_user_id: string | null;
    payload_json: string;
    created_at: string;
  }>(
    env,
    "SELECT id, admin_user_id, action_type, target_user_id, payload_json, created_at FROM admin_audit_logs ORDER BY created_at DESC LIMIT ?",
    limit,
  );
  return json(
    rows.map((r) => ({
      id: r.id,
      adminUserId: r.admin_user_id,
      actionType: r.action_type,
      targetUserId: r.target_user_id,
      payloadJson: safeParse(r.payload_json),
      createdAt: r.created_at,
    })),
  );
}

async function safeJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
