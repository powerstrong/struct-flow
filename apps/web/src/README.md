# apps/web/src

React + Vite SPA. **계산식이 절대 등장하면 안 됨 (AGENTS.md 규칙 #1, #2).**

- `App.tsx` — 라우터 (Layout 안에 모든 페이지 중첩)
- `main.tsx` — 진입점 (BrowserRouter + AuthProvider)
- `components/` — 공통 UI (Layout/Disclaimer/viewer/SvgViewer)
- `features/<slug>/` — 계산기 UI 어댑터 (InputForm / ResultPanel)
- `features/registry.ts` — 4개 계산기 feature 매핑
- `pages/` — 라우트 페이지 1:1 매핑
- `pages/admin/` — 관리자 영역 (isAdmin 가드)
- `lib/api.ts` — fetch 래퍼 (credentials:'include', ApiError 클래스)
- `lib/auth.tsx` — AuthContext + useAuth

## 금지

- 수식이나 단위 환산 로직을 web에 두지 말 것. 서버 응답을 받아서 표시만 한다.
- 새 fetch 진입점을 만들지 말 것. `lib/api.ts`의 `api()`만 사용.
- 라우트는 `App.tsx` 한 곳에서만 등록.
