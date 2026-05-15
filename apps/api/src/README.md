# apps/api/src

Cloudflare Pages Functions 런타임에서 동작하는 API 코드.

**구조:**
- `index.ts` — 단일 라우터 (모든 요청 진입점, AGENTS.md 규칙 #5)
- `http.ts` — Response 헬퍼 (json/error/unauthorized/forbidden 등)
- `routes/` — 라우트 핸들러
- `calculators/<slug>/` — 계산기당 5개 파일 패턴 (AGENTS.md 규칙 #4)
- `calculators/registry.ts` — 전체 계산기 배열 + lookup
- `domain/pro/` — 권한 체크 (AGENTS.md 규칙 #7)
- `domain/mgt/` — MGT 빌더 자리 (MVP는 README만)
- `infra/d1.ts` — D1 헬퍼 (AGENTS.md 규칙 #6)
- `infra/auth.ts` — PBKDF2 + 세션
- `infra/audit.ts` — 감사 로그 헬퍼

**금지:**
- 라우트 안에서 raw SQL 흩뿌리기 (infra/d1.ts 헬퍼만 사용)
- 권한 체크를 라우트마다 다르게 구현 (`domain/pro/checkProAccess` 한 곳만)
- 새 진입점 추가 (`functions/api/*.ts` 다른 파일 만들지 말 것)
