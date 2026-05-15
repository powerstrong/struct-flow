// Single source of truth for Pro access checks (AGENTS.md rule #7).

import { getOne, nowIso } from "../../infra/d1";

export interface ProStatus {
  active: boolean;
  expiresAt: string | null;
}

export async function checkProAccess(env: Env, userId: string): Promise<ProStatus> {
  const now = nowIso();
  const row = await getOne<{ expires_at: string }>(
    env,
    "SELECT expires_at FROM pro_entitlements WHERE user_id = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1",
    userId,
    now,
  );
  if (!row) return { active: false, expiresAt: null };
  return { active: true, expiresAt: row.expires_at };
}

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
