import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AdminUserSummary as UserItem } from "@struct-flow/shared";
import { api } from "../../lib/api";

export function AdminUsers() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const data = await api<UserItem[]>(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      if (!cancelled) setItems(data);
    })().finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div>
      <input
        type="search"
        placeholder="이메일 검색…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-md border border-gray-300 rounded px-3 py-2 mb-4"
      />
      {loading && <div className="text-xs text-gray-500">검색 중…</div>}
      <table className="w-full text-sm bg-white rounded border border-gray-200">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left">
            <th className="p-2">이메일</th>
            <th className="p-2">표시 이름</th>
            <th className="p-2">Pro</th>
            <th className="p-2">가입일</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-b border-gray-100">
              <td className="p-2 font-mono">{u.email}{u.isAdmin && <span className="ml-1 text-xs text-accent">[admin]</span>}</td>
              <td className="p-2">{u.displayName ?? "-"}</td>
              <td className="p-2">
                {u.proActive ? <span className="text-accent">~{u.proExpiresAt?.slice(0, 10)}</span> : <span className="text-gray-400">-</span>}
              </td>
              <td className="p-2 text-xs text-gray-500">{u.createdAt.slice(0, 10)}</td>
              <td className="p-2"><Link to={`/admin/users/${u.id}`} className="text-accent hover:underline">상세</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
