# apps/api/src/calculators

서버 사이드 계산기 코드. **AGENTS.md 규칙 #1, #4를 따른다.**

## 폴더 패턴 (모든 계산기 동일)

```
<slug>/
├── input.ts    # zod 입력 스키마 + 단위 상수 (kg/m 등)
├── compute.ts  # pure function: (input) => result. 50라인 이하 권장
├── view.ts     # toViewModel(input, result) → ViewModel2D
├── meta.ts    # title / description / assumptions / cautions
└── index.ts    # Calculator<I, R> export
```

`mgt.ts`는 MVP에서 만들지 않는다. MGT 빌더가 들어오는 Phase 2 시점에 추가.

## 계산기 추가 절차 (정확히 3곳)

1. `apps/api/src/calculators/<slug>/index.ts` 등 5개 파일 생성.
2. `packages/shared/src/calculators.ts`의 `CalculatorId` 유니온과 `CALCULATOR_IDS` 배열에 slug 추가.
3. `apps/api/src/calculators/registry.ts`의 `calculators` 배열에 추가.

그 외 라우터/UI는 자동으로 새 계산기를 인식한다 (registry 기반).

## 금지

- `compute`에서 `env`, `fetch`, `D1`을 호출하지 말 것 — 100% 순수 함수.
- 계산기 폴더 내부에서 MGT 문자열(`\nNODE` 등)을 직접 작성하지 말 것.
- 계산기 내부에서 다른 계산기를 import하지 말 것.
