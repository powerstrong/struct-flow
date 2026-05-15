# CLAUDE.md

이 저장소에서 Claude Code가 작업할 때 따라야 하는 규칙은 [AGENTS.md](./AGENTS.md)에 모두 있다. 시작 전 반드시 읽어라.

요약하면:

1. 계산 로직은 `apps/api/src/calculators/<slug>/compute.ts` 안에서만 실행.
2. `apps/web/`은 fetch만 한다 — 계산식이 web 디렉토리에 등장 금지.
3. MGT 문자열은 `apps/api/src/domain/mgt/` 안에서만 만든다 (MVP에는 구현 없음).
4. 계산기 추가는 정확히 3곳: `calculators/<slug>/index.ts`, `packages/shared/src/calculators.ts`의 `CalculatorId`, `apps/api/src/calculators/registry.ts`.
5. 모든 API 라우트는 `apps/api/src/index.ts`의 단일 라우터를 거친다.
6. D1 쿼리는 `apps/api/src/infra/d1.ts`의 헬퍼만 사용.
7. 권한 체크는 `apps/api/src/domain/pro/checkProAccess.ts`만 호출.

자세한 폴더 구조, 계산기 파일 5종 패턴, 인증/세션 규칙은 AGENTS.md 본문에 있다.
