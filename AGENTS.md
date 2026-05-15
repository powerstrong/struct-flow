# AGENTS.md — Struct Flow 작업 가이드라인

이 문서는 AI 에이전트(Claude Code 등)가 이 저장소에서 작업할 때 반드시 지켜야 하는 **경계 규칙**과 패턴을 단정형으로 적은 가드레일이다. 한 번에 모든 걸 외울 필요는 없지만, 아래 7개 규칙은 위반 시 PR이 거부된다.

## 핵심 7개 경계 규칙 (위반 금지)

1. **계산 로직은 `apps/api/src/calculators/<slug>/compute.ts` 안에서만 실행된다.** 이걸 `apps/web/`에서 import하지 말 것. 프론트엔드는 절대로 수식을 모른다.
2. **`apps/web/`은 fetch만 한다.** 계산식 수식이나 단위 변환식이 web 디렉토리에 등장하면 안 된다.
3. **MGT 문자열은 `apps/api/src/domain/mgt/` 안에서만 만든다.** 계산기 폴더 안에서 `\nNODE` 같은 문자열을 직접 작성하지 말 것. (MVP는 빌더 자체가 없음 — Phase 2)
4. **계산기 추가는 단 한 곳:** `apps/api/src/calculators/<slug>/index.ts` 추가 + `packages/shared/src/calculators.ts`의 `CalculatorId` 유니온에 등록 + `apps/api/src/calculators/registry.ts` 배열에 추가 — 그 외 모든 곳은 손대지 않는다.
5. **모든 API 라우트는 `apps/api/src/index.ts`의 단일 라우터를 거친다.** 새 진입점(`functions/api/foo.ts` 등)을 만들지 말 것.
6. **D1 쿼리는 `apps/api/src/infra/d1.ts`의 헬퍼만 사용.** 라우트 안에서 raw SQL을 흩뿌리지 말 것.
7. **권한 체크는 `apps/api/src/domain/pro/checkProAccess.ts`의 함수만 호출.** 라우트마다 다르게 풀어 쓰지 말 것.

## 계산기 폴더 구조 (필수 일관성)

모든 계산기는 정확히 같은 5개 파일을 가진다 (+ optional mgt.ts).

```
apps/api/src/calculators/<slug>/
├── input.ts    # zod 입력 스키마
├── compute.ts  # pure function: (input) => result
├── view.ts     # toViewModel(input, result) → ViewModel2D
├── meta.ts     # title / description / assumptions / cautions
├── index.ts    # Calculator<I, R> export (id/version/tier/meta/...)
└── mgt.ts      # optional, MVP에서는 만들지 않음
```

- `compute`는 50라인 이하 권장.
- `compute`는 절대 env / fetch / D1을 호출하지 않는다 (pure function).
- 같은 폴더 안에서 5개 파일 패턴을 깨지 말 것. 추가 헬퍼가 필요하면 `_helpers.ts`로.

## 인증/세션 규칙

- 비밀번호는 WebCrypto PBKDF2 (SHA-256, ≥100,000 iterations) + per-user salt로 해싱.
- 세션 토큰은 서버에서 발급한 **opaque random token** (JWT 금지). DB에 `sha256(token)`만 저장.
- 쿠키는 항상 `HttpOnly; Secure; SameSite=Lax; Path=/`.

## D1 사용 규칙

- 모든 DDL은 `apps/api/migrations/` 안의 마이그레이션 파일에만. 손으로 직접 SQL을 prod에 치지 말 것.
- 마이그레이션 적용은 `npx wrangler d1 migrations apply`.
- raw SQL은 `infra/d1.ts` 헬퍼나 Drizzle 빌더를 통해서만.

## 테스트 규칙

- 계산기마다 vitest 단위 테스트가 최소 3 시나리오 (정상값 / 경계값 / NG 조건).
- `compute`는 pure이므로 환경 mock 없이 직접 테스트.
- 라우트 테스트는 D1 binding을 mock한 채로 핸들러 함수 단위 호출.

## MGT (Phase 2)

- MVP에서는 `apps/api/src/domain/mgt/`에 README.md 한 장만 둔다. 빌더 구현 없음.
- UI에 "MGT Command" 탭을 노출하지 않는다.
- 계산기 인터페이스의 `toMgt?` 필드는 타입만 남기고 모든 계산기에서 미구현.

## 면책 / 표시 의무

- 모든 페이지 푸터에 다음 문구가 보여야 한다:
  > 본 서비스의 계산 결과는 정식 구조계산서가 아닌 pre-check 용도입니다.
- 회원가입 시 면책 동의 체크박스가 필수.

## 일반 코드 규칙

- 큰 함수 만들지 말 것. compute는 50라인 이하 권장.
- 새 npm 패키지 도입 시: 정말 필요한지 한 번 더 묻고, deep interview 스펙의 결정 목록과 충돌하지 않는지 확인.
- 빈 디렉토리는 `README.md` 한 장으로 의도를 적어둘 것.
