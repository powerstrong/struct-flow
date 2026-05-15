import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Disclaimer } from "./Disclaimer";

export function Layout() {
  const { me, logout } = useAuth();
  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-ink tracking-tight">
          Struct Flow <span className="text-xs font-normal text-gray-500 align-middle">pre-check workbench</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/calc/concrete-volume" className={navLinkClass}>계산기</NavLink>
          {me && <NavLink to="/history" className={navLinkClass}>이력</NavLink>}
          {me?.isAdmin && <NavLink to="/admin" className={navLinkClass}>관리자</NavLink>}
          <NavLink to="/pricing" className={navLinkClass}>요금제</NavLink>
          {me ? (
            <>
              <span className="text-gray-600 text-xs">
                {me.email}
                {me.proActive && <span className="ml-1 text-accent">PRO</span>}
              </span>
              <button onClick={() => void logout()} className="text-sm text-gray-700 hover:text-ink">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>로그인</NavLink>
              <NavLink to="/signup" className="px-3 py-1 rounded bg-accent text-white text-sm hover:bg-blue-700">
                회원가입
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white text-xs text-gray-500 px-6 py-3 flex flex-wrap items-center justify-between gap-2">
        <span>© Struct Flow · MVP</span>
        <span className="flex gap-3">
          <Link to="/disclaimer" className="hover:text-ink">면책</Link>
          <Link to="/terms" className="hover:text-ink">약관</Link>
          <Link to="/pricing" className="hover:text-ink">요금제</Link>
        </span>
      </footer>

      <Disclaimer />
    </div>
  );
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? "text-ink font-medium" : "text-gray-600 hover:text-ink";
}

// 4-panel dock layout used inside calculator pages.
export function DockLayout({
  left,
  center,
  right,
  bottom,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  bottom?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 grid-rows-[1fr_auto] gap-2 p-3 bg-gray-100 h-full min-h-[600px]">
      <aside className="col-span-3 bg-white rounded border border-gray-200 p-3 overflow-auto">{left}</aside>
      <section className="col-span-6 bg-white rounded border border-gray-200 p-3 overflow-auto">{center}</section>
      <aside className="col-span-3 bg-white rounded border border-gray-200 p-3 overflow-auto">{right}</aside>
      {bottom && (
        <footer className="col-span-12 bg-white rounded border border-gray-200 p-3 overflow-auto">{bottom}</footer>
      )}
    </div>
  );
}
