# apps/api/src/infra

런타임 인프라 어댑터 — 외부 시스템(D1, WebCrypto)을 격리하는 얇은 레이어.

- `d1.ts` — D1 쿼리 헬퍼 (모든 raw SQL은 여기를 통해서만, AGENTS.md 규칙 #6)
- `auth.ts` — PBKDF2 100k iterations 해싱, 세션 토큰 발급/쿠키 헬퍼 (Web Crypto)
- `session-store.ts` — 세션 DB 영속 (createSession / verifySession / deleteSession / requireSession)
- `audit.ts` — admin_audit_logs writer
- `ids.ts` — UUID/random token/sha256 헬퍼
- `schema.ts` — Drizzle 스키마 (마이그레이션 0001과 동기화)

**금지:**
- 라우트 안에서 fetch나 raw `env.DB.prepare`를 직접 호출하지 말 것. 이 폴더의 헬퍼 사용.
- 새 외부 서비스를 도입할 때는 라우트가 아니라 여기에 어댑터를 둔다.
