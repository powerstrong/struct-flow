import { useEffect, useState } from "react";
import type { AdminAuditItem as AuditItem } from "@struct-flow/shared";
import { api } from "../../lib/api";

export function AdminAudit() {
  const [items, setItems] = useState<AuditItem[]>([]);
  useEffect(() => {
    void api<AuditItem[]>("/api/admin/audit?limit=100").then(setItems);
  }, []);
  return (
    <div>
      <h2 className="font-semibold text-ink mb-3 text-sm">최근 감사 로그 100건</h2>
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id} className="bg-white rounded border border-gray-200 p-3 text-sm">
            <div className="flex justify-between">
              <span className="font-mono text-xs text-accent">{a.actionType}</span>
              <span className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString("ko-KR")}</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              admin: <span className="font-mono">{a.adminUserId.slice(0, 8)}…</span>
              {a.targetUserId && (<> · target: <span className="font-mono">{a.targetUserId.slice(0, 8)}…</span></>)}
            </div>
            <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">{JSON.stringify(a.payloadJson)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
