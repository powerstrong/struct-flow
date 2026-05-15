import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";

export function AdminLayout() {
  const { me, loading } = useAuth();
  if (loading) return <div className="p-8">로딩 중…</div>;
  if (!me) return <Navigate to="/login" replace />;
  if (!me.isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-6 border-b border-gray-200 pb-3">
        <h1 className="text-xl font-bold text-ink mb-3">관리자</h1>
        <nav className="flex gap-4 text-sm">
          <NavLink to="/admin" end className={navClass}>대시보드</NavLink>
          <NavLink to="/admin/users" className={navClass}>회원 검색</NavLink>
          <NavLink to="/admin/audit" className={navClass}>감사 로그</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive ? "text-ink font-semibold" : "text-gray-600 hover:text-ink";
}
