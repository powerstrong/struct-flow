// Idempotent Pro grant/extend/revoke. Used by admin routes and (future) Toss webhook.

import { getOne, run, nowIso } from "../../infra/d1";
import { newUuid } from "../../infra/ids";

export interface GrantInput {
  userId: string;
  years: number;
  grantedBy: string;
  memo?: string;
  source?: "manual" | "toss";
}

export interface GrantResult {
  entitlementId: string;
  expiresAt: string;
  extended: boolean;
}

function addYears(iso: string, years: number): string {
  const d = new Date(iso);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString();
}

export async function grantPro(env: Env, input: GrantInput): Promise<GrantResult> {
  const now = nowIso();
  // Find latest active entitlement (idempotency anchor).
  const active = await getOne<{ id: string; expires_at: string }>(
    env,
    "SELECT id, expires_at FROM pro_entitlements WHERE user_id = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1",
    input.userId,
    now,
  );

  if (active) {
    // Extend from current expiration to avoid double-click producing 2y.
    const newExpiry = addYears(active.expires_at, input.years);
    await run(
      env,
      "UPDATE pro_entitlements SET expires_at = ?, granted_by = COALESCE(?, granted_by), admin_memo = COALESCE(?, admin_memo), source = COALESCE(?, source) WHERE id = ?",
      newExpiry,
      input.grantedBy,
      input.memo ?? null,
      input.source ?? "manual",
      active.id,
    );
    return { entitlementId: active.id, expiresAt: newExpiry, extended: true };
  }

  const id = newUuid();
  const expiresAt = addYears(now, input.years);
  await run(
    env,
    "INSERT INTO pro_entitlements (id, user_id, plan, status, granted_at, expires_at, granted_by, admin_memo, source) VALUES (?, ?, 'pro-1y', 'active', ?, ?, ?, ?, ?)",
    id,
    input.userId,
    now,
    expiresAt,
    input.grantedBy,
    input.memo ?? null,
    input.source ?? "manual",
  );
  return { entitlementId: id, expiresAt, extended: false };
}

export async function setProExpiresAt(env: Env, userId: string, expiresAt: string): Promise<void> {
  await run(
    env,
    "UPDATE pro_entitlements SET expires_at = ? WHERE user_id = ? AND status = 'active'",
    expiresAt,
    userId,
  );
}

export async function revokePro(env: Env, userId: string): Promise<void> {
  await run(
    env,
    "UPDATE pro_entitlements SET status = 'revoked' WHERE user_id = ? AND status = 'active'",
    userId,
  );
}
