# Deep Interview Spec: Struct Flow

## Metadata
- Interview ID: struct-flow-2026-05-16
- Rounds: 3
- Final Ambiguity Score: 15.0%
- Type: greenfield
- Generated: 2026-05-16
- Threshold: 20%
- Status: PASSED (15.0% ≤ 20%)

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.85 | 0.40 | 0.340 |
| Constraint Clarity | 0.90 | 0.30 | 0.270 |
| Success Criteria | 0.80 | 0.30 | 0.240 |
| **Total Clarity** | | | **0.850** |
| **Ambiguity** | | | **0.150** |

---

## Goal

**한 문장 정의:** Struct Flow는 구조설계 엔지니어가 MIDAS Gen 모델링 전에 빠른 감/검쇄(pre-check)를 할 수 있도록, 서버에서 계산식을 실행하고 2D SVG로 결과를 시각화하는 워크벤치형 웹 서비스다. (MGT export는 Phase 2)

**제품 정체성:** 단순 "계산기 사이트"가 **아니다**. 좁고 작아도 **구조설계 워크벤치**다. cae-web의 도킹 패널 UI 톤을 가볍게 차용한 미니 워크벤치.

---

## Constraints

### 기술 제약 (확정)
- **프론트엔드:** React + Vite + TypeScript (Next.js 사용하지 않음)
- **호스팅:** Cloudflare Pages (정적 SPA)
- **API:** Cloudflare Pages Functions (Workers runtime)
- **DB:** Cloudflare D1 (dev/prod 분리)
- **인증:** 자체 구현 (이메일+비밀번호, HttpOnly Secure Cookie, WebCrypto PBKDF2)
- **외부 Auth 서비스 없음:** Supabase Auth 등 추가 인프라 도입 안 함
- **결제:** MVP에는 결제 연동 없음. 계좌이체 수동 Pro 전환만
- **도메인:** 초기에는 `*.pages.dev` 사용, 나중에 커스텀 도메인

### 제품 제약
- **신뢰 수준:** Pre-check (정식 구조계산서 대체 아님 — 면책 강력)
- **표준 인용:** 교과서 수준 공식 위주, KDS 세부 조항 인용 최소 (필요 시 부드러운 언급)
- **MGT:** MVP에서 제외. 구조 전문가 리뷰 채널 확보 후 Phase 2에서 도입. MVP는 폴더/인터페이스 골격만 유지 (`domain/mgt/` 빈 스텁) — 실제 빌더 구현 안 함
- **3D:** MVP 제외. 2D SVG 뷰어만
- **계산 로직:** 100% 서버 사이드. 프론트엔드 JS에는 절대 포함 금지
- **계산식 정의:** DB가 아닌 코드(`apps/api/src/calculators/<slug>/`)에 둠
- **DB 용도 제한:** users / sessions / pro_entitlements / calc_history / admin_audit_logs만

### 운영 제약
- 1인 개발 + Claude Code 위주 → **AI가 디버깅 가능한 단순성이 최우선**
- 무료 티어 또는 매우 저렴한 비용으로 시작
- 복잡한 배포 어댑터(OpenNext 등), VPS, 무거운 프레임워크 회피

---

## Non-Goals (MVP에서 명시적으로 빼는 것)

- Next.js / SSR / RSC
- 3D 뷰어 (Three.js)
- **MGT command 출력 (전체)** — 구조 전문가 리뷰 채널 확보 후 Phase 2
- 온라인 결제 연동 (Toss Payments 등)
- 소셜 로그인
- 다국어/i18n (한국어 only)
- 비밀번호 재설정 이메일 (관리자 수동 리셋으로 시작)
- 위자드 엔진의 본격 구현 (타입/폴더 경계만 잡고 실제 위자드 도구는 0개)
- 계산식 5개 이상
- 관리자 대시보드의 통계/그래프
- API 외부 공개

---

## Acceptance Criteria (MVP 완성 기준)

### 기능 체크리스트
- [ ] 비회원이 무료 계산기 2개를 실행할 수 있다 (API 호출, 결과 + 2D 뷰)
- [ ] 회원가입 / 로그인 / 로그아웃이 동작한다 (이메일+비밀번호, Secure Cookie)
- [ ] 로그아웃하지 않은 채로 브라우저를 닫았다 재접속하면 세션이 유지된다
- [ ] 비로그인 유저가 유료 계산기 API를 호출하면 401을 받는다
- [ ] 로그인했지만 Pro가 아닌 유저가 유료 계산기 API를 호출하면 403을 받는다
- [ ] 관리자가 `/admin/users`에서 특정 회원을 검색해 "Pro 1년 부여" 클릭 시 해당 회원이 즉시 유료 계산기를 사용할 수 있다
- [ ] Pro 만료일이 지나면 해당 회원은 다시 403을 받는다
- [ ] 로그인 사용자가 계산기를 실행하면 직전 10개의 이력이 대시보드에 뜬다
- [ ] 모든 페이지에 "정식 구조계산서가 아닙니다 / Pre-check용입니다" 면책 문구가 보인다
- [ ] 관리자 작업(Pro 부여/만료 수정/메모)이 admin_audit_logs에 기록된다

### 운영 체크리스트
- [ ] dev 환경 (`structmate-dev-db`, dev 브랜치)과 prod 환경 (`structmate-prod-db`, main 브랜치)이 분리됨
- [ ] `wrangler` 명령으로 로컬 개발 → preview 배포 → prod 배포가 막힘없이 흐름
- [ ] 한국어 readme + 면책 문구 + 약관(간이) 페이지가 있음

### 품질 체크리스트
- [ ] 계산기별로 단위 테스트가 있다 (입력 → 결과 스냅샷 비교)
- [ ] 4개 계산기 각각 최소 3개 시나리오 (정상값, 경계값, NG 조건) 테스트
- [ ] 비밀번호는 WebCrypto PBKDF2 (≥100k iterations) + salt로 해시 저장됨
- [ ] 세션 토큰은 서버 측 DB에 저장된 random opaque token (JWT 아님)

---

## Assumptions Exposed & Resolved

| Assumption | Challenge | Resolution |
|---|---|---|
| 시공/적산용 무료 계산기와 구조설계용 유료 계산기를 한 제품에 묶을 수 있다 | 타깃 사용자가 둘로 갈리면 제품 정체성 흔들림 | **타깃은 구조설계 엔지니어로 고정**. 무료 계산기(콘크리트/철근)는 lead-magnet 격. 톤은 구조 워크벤치 |
| MGT command 출력은 핵심 셀링 포인트 | MIDAS 검증 사이클이 길고, 잘못된 MGT는 신뢰 손상 큼. 구조 전문가 리뷰 채널이 별도로 존재 | **MGT는 Phase 2로 완전 연기.** MVP에서 UI 노출 안 함, 폴더/타입 골격만 유지. 구조 전문가 검증 사이클 확보 후 도입 |
| 계산식 정확도는 정식 구조계산서급이어야 한다 | 1인 개발 + AI 코딩 + 면허 책임 부담 | **Pre-check 수준으로 합의.** 교과서 공식 + KDS 세부 인용 최소 + 강력 면책 |
| Next.js를 써야 한다 (cae-web이 Next.js이므로) | App Router, Cloudflare adapter, 서버/클라이언트 경계로 AI 디버깅 난이도↑ | **React + Vite 채택.** cae-web의 UI 톤만 차용, 프레임워크는 차용 안 함 |
| 계산식 정의를 DB에 두면 유연하다 | 관리자 페이지로 계산식 편집 = 코드/스키마/검증 분리 깨짐, AI가 망가뜨리기 쉬움 | **DB에 계산식 정의 없음.** 코드에 두고 git/CI/PR로 관리 |

---

## Technical Context

### 답변 1 — 단순 계산기 사이트 vs 구조 계산 워크벤치
**판단: 구조 계산 워크벤치 (좁은 버전).** 단, MVP는 "워크벤치 외형의 미니 도구"여야 합니다. cae-web의 도킹 패널 4분할(좌/중/우/하)을 가볍게 차용. 풀스크린 도킹/플로팅/리사이즈는 MVP에서 빼고 고정 그리드 레이아웃으로 시작.

### 답변 2 — Next.js vs React + Vite
**판단: React + Vite 확정.** 근거:
- Cloudflare Pages는 정적 SPA에 자연스럽고, Pages Functions는 단일 진입(`functions/api/[[path]].ts`)으로 깔끔히 분리됨
- Next.js의 App Router + Cloudflare(OpenNext) 조합은 SSR/RSC 경계 + edge runtime 호환성 이슈로 1인 + AI 디버깅 환경에 비용이 큼
- SEO는 정적 랜딩/요금제/계산기 목록 페이지만 정적 prerender (Vite의 `vite-plugin-ssg` 또는 빌드 타임 마크다운 변환)로 충분
- cae-web의 UI는 React 컴포넌트 단에서 그대로 차용 가능, Next.js 의존 부분만 잘라내면 됨

### 답변 3 — Cloudflare Pages + Pages Functions + D1로 충분한가
**판단: MVP는 충분. 단, 다음 한계 사전 인지.**
- D1은 single-region이며 read replica가 제한적. 한국 사용자에 대해 latency가 미국 동부로 갈 수 있음 → 한국 사용자 첫 응답이 300~500ms 추가될 수 있음. MVP 트래픽엔 무해
- Pages Functions의 한 요청당 CPU 한도(무료 10ms, 유료 50ms). 우리 계산은 다 마이크로초 단위라 OK
- D1 writes는 region 한 곳에서만 → admin/세션/회원가입 쓰기 latency가 사용자에 따라 다를 수 있음 → 무해
- 비밀번호 해시 iteration이 너무 높으면 CPU 한도 부딪힘 → PBKDF2 100k iterations로 시작, 측정 후 조정
- D1 backup/migrations는 `wrangler d1 migrations` 사용. 손으로 직접 SQL 치지 말고 마이그레이션 파일에 다 두기

대안 트리거 (지금 도입 안 함):
- 사용자 50명 넘어가면 백업/지표 도구 검토
- 본격 결제 들어가면 Stripe/Toss webhook 큐잉 위해 Workers Queues 검토

### 답변 4 — MVP 범위 절단
**MVP에 포함 (Must):**
- 회원가입/로그인/로그아웃
- 무료 계산기 2개 + 유료 계산기 2개 (총 4개)
- 2D SVG 뷰어 (공통 모듈)
- 계산 이력 (로그인 사용자, 최근 10개)
- 관리자 페이지 (회원 목록 / Pro 부여·연장·해제 / 메모 / 감사 로그)
- 면책/약관/요금제(정보용) 정적 페이지
- dev/prod 환경 분리

**MVP 제외 (Should later — Phase 2):**
- **MGT command 출력 전체 (단순보 포함)** — 구조 전문가 리뷰 채널 확보 후 도입
- 비밀번호 재설정 이메일
- 결제 연동
- 본격 위자드 엔진
- 계산 이력 무한 스크롤/필터/검색
- 사용자 프로필 설정
- 3D 뷰어

**현 시점에 만들지 말 것 (Never until proven need):**
- 계산식 DB화
- 관리자가 계산식 정의를 편집하는 UI
- 멀티테넌시/팀 계정
- 외부 OAuth
- 모바일 네이티브 앱

### 답변 5 — 내부 아키텍처 방향
**계산기 (Calculator) 인터페이스:**

```
type CalculatorId = "concrete-volume" | "rebar-weight" | "simple-beam-deflection" | "footing-bearing"

interface Calculator<I, R> {
  id: CalculatorId
  version: string            // "1.0.0" — 버전 바뀌면 history.tool_version에 기록
  tier: "free" | "pro"
  meta: { title: string; description: string; assumptions: string[]; cautions: string[] }
  inputSchema: ZodSchema<I>
  compute(input: I): R               // pure function, 서버 사이드에서만 호출
  toViewModel(input: I, result: R): ViewModel2D | null
  toMgt?(input: I, result: R): MgtBuildResult     // optional, 베타 마킹
}
```

**ViewModel2D:**
- shapes[]: rectangle/line/polygon/arrow/dimension
- bounds: { minX, minY, maxX, maxY }
- units: "mm" | "m"
- annotations[]: text label with anchor point
- 계산기는 ViewModel만 생성, 공통 SVG 뷰어가 렌더. 사용자 판단대로 정확한 분리.

**MGT Builder (Phase 2):**
- MVP에서는 `domain/mgt/README.md` 한 장만 — "Phase 2에 채울 자리. 구조 전문가 리뷰 채널 확보 후 착수" 명시
- 계산기 인터페이스의 `toMgt?` 필드는 타입만 남기고 모든 계산기에서 미구현 (호출 안 됨)
- UI에 "MGT Command" 탭 자체를 노출하지 않음
- Phase 2 진입 시 빌더 모듈 분해 계획:
  - `domain/mgt/MgtBuilder.ts` — 빌더 패턴 진입점
  - `domain/mgt/{units,nodes,elements,loads,sections}.ts` — 섹션별 모듈
  - 계산기 내부에서 문자열 직접 결합 금지 규칙은 Phase 2부터 적용

**위자드 확장성 (MVP는 인터페이스만):**
- `Calculator` 위에 `WizardTool` 인터페이스를 따로 두지 말고, 일단 `Calculator`가 자체적으로 multi-step 입력을 받을 수 있게 inputSchema를 `MultiStepSchema` 타입으로 확장 가능한 형태로만 둠
- 실제 위자드 엔진은 만들지 않음. 5번째 도구 추가 시점에 패턴이 보이면 그때 추출 (rule of three)

### 답변 6 — AI 코딩 도구 안전을 위한 폴더 구조 / 경계 / 규칙

```
struct-flow/
├── apps/
│   ├── web/                          # React + Vite SPA
│   │   ├── src/
│   │   │   ├── routes/               # 라우트 = 단일 페이지 (없으면 만들지 말 것)
│   │   │   ├── features/             # 계산기 UI 어댑터 (계산기당 1폴더)
│   │   │   │   └── concrete-volume/
│   │   │   │       ├── InputForm.tsx
│   │   │   │       ├── ResultPanel.tsx
│   │   │   │       └── index.ts      # public exports
│   │   │   ├── components/           # 공통 UI (Header, DockPanel 등)
│   │   │   ├── components/viewer/    # SvgViewer.tsx
│   │   │   ├── lib/                  # api client, auth state
│   │   │   └── styles/
│   │   └── vite.config.ts
│   └── api/                          # Cloudflare Pages Functions
│       ├── src/
│       │   ├── calculators/          # 계산기당 1폴더, 단일 진입점
│       │   │   └── concrete-volume/
│       │   │       ├── input.ts      # Zod 스키마
│       │   │       ├── compute.ts    # pure function
│       │   │       ├── view.ts       # toViewModel
│       │   │       ├── mgt.ts        # optional
│       │   │       ├── meta.ts       # title/cautions/assumptions
│       │   │       └── index.ts      # Calculator export
│       │   ├── routes/
│       │   │   ├── auth/             # login, signup, me, logout
│       │   │   ├── calc/             # /api/calc/[slug]
│       │   │   ├── history/
│       │   │   └── admin/            # 모든 admin 라우트 (미들웨어로 보호)
│       │   ├── domain/
│       │   │   ├── mgt/              # MgtBuilder + 모듈
│       │   │   ├── view/             # ViewModel2D 타입 + 헬퍼
│       │   │   └── pro/              # entitlement 체크 (단일 함수)
│       │   ├── infra/
│       │   │   ├── d1.ts             # DB binding 래퍼
│       │   │   ├── auth.ts           # WebCrypto PBKDF2, 세션 생성/검증
│       │   │   └── audit.ts          # admin_audit_logs 헬퍼
│       │   └── index.ts              # 단일 진입 router
│       ├── migrations/               # wrangler d1 migrations
│       └── wrangler.toml
├── packages/
│   └── shared/                       # apps/web ↔ apps/api 공유 타입
│       ├── calculators/              # CalculatorId, input/result 타입
│       └── viewmodel.ts              # ViewModel2D 타입
├── .omc/
└── README.md
```

**경계 규칙 (AI가 깨면 안 됨):**
1. **계산 로직은 `apps/api/src/calculators/<slug>/compute.ts` 안에서만 실행됨.** 이걸 `apps/web/`에서 import하지 말 것.
2. **`apps/web/`은 fetch만 한다.** 계산식 수식이 web 디렉토리에 등장하면 안 됨.
3. **MGT 문자열은 `domain/mgt/` 안에서만 만든다.** 계산기 폴더 안에서 `\\nNODE` 같은 문자열을 직접 작성하지 말 것.
4. **계산기 추가는 단 한 곳:** `apps/api/src/calculators/<slug>/index.ts` 추가 + `packages/shared/calculators` 타입 등록 + 라우터에 자동 등록 (`registry` 배열) — 그 외 모든 곳은 손대지 않음.
5. **모든 API 라우트는 `apps/api/src/index.ts`의 단일 라우터를 거친다.** 새 진입점 만들지 말 것.
6. **D1 쿼리는 `infra/d1.ts`의 헬퍼만 사용.** 라우트 안에서 raw SQL 흩뿌리지 말 것.
7. **권한 체크는 `domain/pro/checkProAccess(userId)` 함수만 호출.** 라우트마다 다르게 풀어 쓰지 말 것.

**AI 가드레일:**
- `AGENTS.md` / `CLAUDE.md`에 위 7개 규칙을 짧고 단정적으로 적어둘 것
- 각 디렉토리 루트에 `README.md`로 "이 폴더에서 하는 일 / 하지 말아야 할 일"을 1문단으로 적어둘 것
- 계산기 폴더는 모두 같은 5개 파일 구조 — 패턴 일관성이 AI 정확도를 끌어올림
- 큰 함수 만들지 말 것. compute는 50라인 이하 권장

### 답변 7 — 초기 계산식 4개 평가
**전반 평가: 적절하다.** Pre-check 워크벤치 정체성과 잘 맞고, 무료 2개는 lead-magnet, 유료 2개는 진짜 가치 제공. 다만 다음 조정 권장:

| 후보 | 평가 | 권장 |
|---|---|---|
| 콘크리트 물량 (무료) | ✅ 좋음. 누구나 한 번은 한다 | 그대로 |
| 철근 중량 (무료) | ✅ 좋음. 시각화 약함이 흠 | 단면도+철근 배근 미니 뷰 1개 |
| 단순보 처짐 (유료) | ✅ 매우 좋음. MGT 후보로도 깔끔 | 등분포 + 집중하중 2케이스 |
| 독립기초 접지압 (유료) | ⚠️ 괜찮은데 MGT 매칭 어려움 | MGT 출력은 안 함, 시각화만 |

**대안 후보 (5번째 추가 검토 시):**
- 단순기둥 좌굴 검토 (Euler) — 시각화 단순, 공식 명확
- 옹벽 활동/전도 약식 검토 — pre-check 정체성 합치
- 슬래브 처짐 약식 (단변/장변비 기반) — 무료/유료 경계 모호
- 콘크리트 단면 단순보 휨 약식 (a=As·fy/0.85fc·b) — 휨 강도 약식

**권장:** MVP는 제안된 4개 그대로 가고, 5번째는 유저 피드백 후 결정.

### 답변 8 — 관리자 페이지 + 수동 Pro 전환 운영
**판단: 적절하다.** 1인 + 초기 트래픽이라면 정답에 가깝다. 다만 다음 5개는 처음부터 넣을 것:

1. **감사 로그 (admin_audit_logs):** 누가 / 언제 / 어떤 회원에게 / 무슨 작업. 분쟁 / 디버깅 / 회계 모두 여기서 시작
2. **idempotency:** "Pro 1년 부여" 버튼을 더블클릭하면 만료일이 2년이 되면 안 됨 → 서버 측 멱등 체크 (이미 active면 연장 시작점을 현재 만료일로)
3. **수동 만료일 수정 페이지:** 입금 누락 / 환불 처리 / 테스트 등 예외 케이스 대응
4. **관리자 메모 필드:** "X일 입금 확인, 영수증 #N123" 같은 자유 메모 저장
5. **관리자 계정 식별:** users 테이블에 `is_admin BOOLEAN` 컬럼. 처음에는 본인 계정만 수동으로 true. 별도 admin 테이블 만들지 말 것

**향후 결제 연동 시 변환 경로:**
- Toss webhook 핸들러는 `pro_entitlements`에 같은 함수(`grantPro(userId, source: "manual"|"toss", expiresAt)`) 호출
- 수동/자동 둘 다 같은 테이블/같은 함수 — webhook 추가만으로 자동화 됨

**관리자 페이지 라우팅:** `/admin` 하위에 단순 페이지 4개로 충분:
- `/admin` — 대시보드 (오늘 가입 / 활성 Pro 수)
- `/admin/users` — 검색 + 목록
- `/admin/users/[id]` — 상세 + Pro 부여/수정/메모
- `/admin/audit` — 최근 감사 로그 100개

### 답변 9 — 프로젝트명
**현재 이름 평가:**

| 후보 | 장점 | 단점 |
|---|---|---|
| Struct Flow (현재 잠정) | 발음 쉽고 가볍다, 도메인 가용 가능성 높음, "flow"가 워크벤치 느낌 | "Flow"가 흔함, 차별성 약함 |
| StructMate | 직관적, 친근 | mate 계열이 너무 흔하고 진부 |
| ArchMate | 건축 일반으로 넓힐 때 좋음 | 현재 좁은 정체성과 안 맞음 |

**추가 제안:**

| 후보 | 톤 | 비고 |
|---|---|---|
| **Struct Flow** | 가볍고 워크벤치적 | 사용자 선택. 합리적 |
| Prestruct | "Pre-check + struct" 합성 | 정체성에 가장 잘 맞음 |
| StructDeck | 도킹 패널/카드 느낌 | UI 톤과 일치 |
| Pristruct | Pre-check 강조 | 발음이 어색 |
| Sketchstruct | 가벼움/사전적 의미 | MIDAS 연결 약함 |
| MGTPad | MGT 강조 | MIDAS 상표 충돌 위험 |
| BeamLab | 보 중심 도구 | 영역이 좁다 |

**추천: Struct Flow 유지.** 이유:
- 1인이 짧게 시작하는 제품엔 발음 쉬운 짧은 이름이 우선
- 정체성이 워크벤치 = "flow"
- 도메인 / GitHub 핸들 가용성 점검만 빠르게 한 뒤 확정 권장

**상표 리스크:** MIDAS, GTS, AutoCAD, Tekla 같은 등록 상표는 절대 사용 금지. "Struct Flow"는 일반어 조합이라 안전한 편이지만, 한국 특허청 KIPRIS 검색 1회는 출시 전 실행 권장.

### 답변 10 — Claude Code 구현 착수 전 확정 질문 목록

**기술 결정 (코드 시작 전 결정 必):**
1. 패키지 매니저: pnpm vs npm? (monorepo면 pnpm 권장)
2. Monorepo 도구: turbo 없이 단순 pnpm workspaces? (1인 단순성 우선이면 turbo 없이)
3. UI 라이브러리: Tailwind만? + shadcn/ui? (가볍게 가려면 Tailwind only)
4. 폼: react-hook-form + zod? (계산기 입력이 다양하면 강력 권장)
5. SVG 뷰어: 직접 구현 vs `react-svg-pan-zoom` 등? (MVP는 직접 구현 권장 — 패닝/줌 없어도 됨)
6. 인증 라이브러리: 직접 구현 vs `lucia` 같은 라이브러리? (Cloudflare D1 어댑터 가용성 확인 후 결정 — 아니면 직접 PBKDF2)
7. 테스트: vitest? E2E는 playwright? (단위는 vitest, E2E는 MVP 이후)
8. 마이그레이션 도구: wrangler d1 migrations 그대로 vs Drizzle Kit? (Drizzle 권장 — 타입 안전)
9. ORM: 안 씀 (raw SQL) vs Drizzle? (D1에서 Drizzle 잘 동작 — 권장)
10. 로깅: Cloudflare 기본 / Workers Logs / 외부(Sentry/Logtail)? (MVP는 Cloudflare 기본만)

**제품 결정:**
11. 면책 문구의 정확한 문장 (한국어, 법무 검토 없이도 안전한 톤)
12. 약관 / 개인정보처리방침 초안 — 외부 템플릿 사용 OK? (생성형 + 사람이 한 번 읽기)
13. 회원가입 시 이메일 인증 (소유 검증) 처음부터 넣을지? (수동 운영이라 nice-to-have이지만 SPAM 방지엔 강력 추천)
14. 계산 이력의 view_model_json을 저장할지, "tool_version + input"만 저장하고 재생성할지? (디스크 절약 + 일관성: input만 저장, view는 재계산)
15. 비로그인 사용자의 계산 시도에 rate limit을 처음부터 둘지? (Pages Functions에서 KV 기반 leaky bucket 권장)
16. Pro 1년 만료일이 지난 사용자에게 알림 메일 보낼지? (MVP는 NO — 결제 연동 후)
17. 계산기 페이지 URL: `/calc/<slug>` vs `/tools/<slug>`? (`/calc/<slug>` 권장 — 직관)
18. 관리자 계정 부트스트래핑: SQL 직접 vs 첫 가입자 자동 admin? (수동 SQL 권장 — `wrangler d1 execute`)
19. 면책 동의 체크박스를 매 계산마다 받을지, 가입 시 한 번? (가입 시 + 페이지 푸터 상시 표시)
20. KIPRIS 상표 검색 결과 (Struct Flow 한국 등록 충돌 여부)

**운영 결정:**
21. 도메인 구입 시점 (MVP 트래픽 들어오면 즉시? 출시 전?)
22. dev 환경 인증 정보를 prod와 어떻게 분리? (Pages 환경 변수 별도 + D1 별도 binding)
23. 백업: D1 export를 주 1회 수동 실행 vs Cron Trigger? (Cron Trigger + R2 권장)
24. 에러 모니터링: 0인 상태로 갈지, Sentry free tier? (MVP는 0, 사용자 발생 후 도입)
25. README / AGENTS.md / CLAUDE.md의 1차 작성자: Claude Code가 작성 → 사용자가 검토? (Yes)

---

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| User | core domain | id, email, password_hash, salt, display_name, is_admin, created_at | has many Sessions, has 0..1 ProEntitlement, has many CalcHistory |
| Session | core domain | id, user_id, token_hash, expires_at, created_at | belongs to User |
| ProEntitlement | core domain | id, user_id, plan, status, granted_at, expires_at, granted_by, admin_memo, source (manual\|toss) | belongs to User, granted_by → User (admin) |
| Calculator | code-only (not DB) | id, version, tier, meta, inputSchema, compute, toViewModel, toMgt? | — |
| CalcHistory | core domain | id, user_id, tool_slug, tool_version, input_json, result_json, mgt_command_text?, created_at | belongs to User, references Calculator |
| ViewModel2D | code-only | shapes[], bounds, units, annotations[] | produced by Calculator.toViewModel |
| MgtBuildResult | code-only | text, sections_used[], warnings[] | produced by Calculator.toMgt |
| AdminAuditLog | core domain | id, admin_user_id, action_type, target_user_id, payload_json, created_at | belongs to admin User, references target User |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 9 | 9 | - | - | N/A |
| 2 | 9 | 0 | 0 | 9 | 100% |
| 3 | 9 | 0 | 0 | 9 | 100% |

엔트로피 라운드 1에 안정화됨 — 사용자 브리프가 매우 상세했기 때문.

---

## Interview Transcript

<details>
<summary>Full Q&A (3 rounds)</summary>

### Round 1 — Targeting: Goal Clarity
**Q:** Struct Flow의 1차 타깃 사용자는 누구인가요?
**A:** 구조 설계 엔지니어 (MIDAS 사용자 중심)
**Ambiguity:** 31.5% (Goal: 0.85, Constraints: 0.75, Criteria: 0.40)

### Round 2 — Targeting: Success Criteria
**Q:** 계산 결과의 "신뢰 수준"을 어디에 둘까요?
**A:** 프리헤드 계산 투우 (Pre-check)
**Ambiguity:** 21.0% (Goal: 0.85, Constraints: 0.85, Criteria: 0.65)

### Round 3 — Targeting: Success Criteria (남은 위험점)
**Q:** MGT command 출력의 검증 경로는 어떻게 됩니까?
**A:** MGT 포맷 문서화 채널(곅자·지인)에 의존 — 매번 외부 검증
**Ambiguity:** 15.0% (Goal: 0.85, Constraints: 0.90, Criteria: 0.80) ← 임계치 통과

</details>
