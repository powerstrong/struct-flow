// admin_audit_logs writer. Every admin mutation should call writeAuditLog.

import { run, nowIso } from "./d1";
import { newUuid } from "./ids";

export interface AuditEntry {
  adminId: string;
  actionType: string;
  targetUserId: string | null;
  payload: unknown;
}

export async function writeAuditLog(env: Env, entry: AuditEntry): Promise<void> {
  await run(
    env,
    "INSERT INTO admin_audit_logs (id, admin_user_id, action_type, target_user_id, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    newUuid(),
    entry.adminId,
    entry.actionType,
    entry.targetUserId,
    JSON.stringify(entry.payload ?? {}),
    nowIso(),
  );
}
