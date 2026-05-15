# @struct-flow/shared

`apps/web`과 `apps/api`가 함께 쓰는 **타입 전용** 패키지.

- `calculators.ts` — `CalculatorId` 유니온과 메타 타입
- `viewmodel.ts` — 공통 `ViewModel2D` (SVG 뷰어 입력)
- `contracts.ts` — REST 응답 DTO

**여기에 두지 말 것:**
- 실제 계산 로직 (서버에서만 실행, `apps/api/src/calculators/<slug>/compute.ts`)
- React 컴포넌트 / DOM 코드
- D1 쿼리

새 계산기를 추가할 때 `calculators.ts`의 `CalculatorId` 유니온과 `CALCULATOR_IDS` 배열에 slug를 추가한다.
