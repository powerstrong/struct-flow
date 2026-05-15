import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { HistoryItem } from "@struct-flow/shared";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

export function History() {
  const { me, loading } = useAuth();
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !me) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api<HistoryItem[]>("/api/history");
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "로드 실패");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [me, loading]);

  if (loading) return <div className="p-8">불러오는 중…</div>;
  if (!me) {
    return (
      <div className="p-8">
        이력은 <Link to="/login" className="text-accent underline">로그인</Link> 후 열람할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-ink mb-4">최근 계산 이력</h1>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      {items?.length === 0 && <p className="text-gray-500 text-sm">아직 이력이 없습니다.</p>}
      <ul className="space-y-2">
        {items?.map((h) => (
          <li key={h.id} className="bg-white rounded border border-gray-200 p-3 text-sm">
            <div className="flex justify-between items-center">
              <Link to={`/calc/${h.toolSlug}`} className="font-medium text-accent hover:underline">
                {h.toolSlug}
              </Link>
              <span className="text-xs text-gray-500">
                v{h.toolVersion} · {new Date(h.createdAt).toLocaleString("ko-KR")}
              </span>
            </div>
            <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
              input: {JSON.stringify(h.inputJson)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
