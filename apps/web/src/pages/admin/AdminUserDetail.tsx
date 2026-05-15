import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, ApiError } from "../../lib/api";

interface UserItem {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  proActive: boolean;
  proExpiresAt: string | null;
  createdAt: string;
}

export function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserItem | null>(null);
  const [memo, setMemo] = useState("");
  const [years, setYears] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!id) return;
    const all = await api<UserItem[]>("/api/admin/users");
    setUser(all.find((u) => u.id === id) ?? null);
  }

  useEffect(() => {
    void refresh();
  }, [id]);

  async function doAction(action: "grant" | "extend" | "revoke") {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/users/${id}/pro`, {
        method: "POST",
        body: JSON.stringify(action === "revoke" ? { action } : { action, years, memo: memo || undefined }),
      });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "실패");
    } finally {
      setBusy(false);
    }
  }

  if (!user) return <div>로딩 중…</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <Link to="/admin/users" className="text-accent text-sm hover:underline">← 회원 목록</Link>
      <div className="bg-white rounded border border-gray-200 p-4">
        <h2 className="font-semibold text-ink">{user.email}</h2>
        <dl className="text-sm mt-3 space-y-1">
          <Row k="표시 이름" v={user.displayName ?? "-"} />
          <Row k="관리자" v={user.isAdmin ? "예" : "아니오"} />
          <Row k="Pro 상태" v={user.proActive ? `활성 (~${user.proExpiresAt?.slice(0, 10)})` : "미활성"} />
          <Row k="가입일" v={user.createdAt.slice(0, 10)} />
        </dl>
      </div>

      <div className="bg-white rounded border border-gray-200 p-4 space-y-3">
        <h3 className="font-semibold text-ink text-sm">Pro 관리</h3>
        <div className="flex gap-2 items-center">
          <label className="text-sm">기간(년)</label>
          <input
            type="number"
            value={years}
            min={1}
            max={10}
            onChange={(e) => setYears(parseInt(e.target.value, 10) || 1)}
            className="border border-gray-300 rounded px-2 py-1 w-20"
          />
        </div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="관리자 메모 (예: 12/15 입금 확인 #N123)"
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm h-20"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => doAction("grant")}
            disabled={busy}
            className="bg-accent text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
          >
            Pro {years}년 부여
          </button>
          <button
            onClick={() => doAction("extend")}
            disabled={busy}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
          >
            연장
          </button>
          <button
            onClick={() => doAction("revoke")}
            disabled={busy}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
          >
            해제
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-1">
      <dt className="text-gray-600">{k}</dt>
      <dd className="font-mono">{v}</dd>
    </div>
  );
}
