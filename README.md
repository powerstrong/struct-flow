# Struct Flow

구조설계 엔지니어용 워크벤치. 서버에서 계산식을 실행하고 2D SVG로 결과를 시각화한다.

## 스택

- 프론트엔드: React + Vite + TypeScript (Tailwind)
- API: Cloudflare Pages Functions (Workers runtime)
- DB: Cloudflare D1 (Drizzle ORM)
- 인증: 자체 구현 (WebCrypto PBKDF2, HttpOnly Secure Cookie, opaque session token)

## 워크스페이스

```
apps/web        # React + Vite SPA
apps/api        # Cloudflare Pages Functions
packages/shared # 양쪽이 공유하는 타입
```

## 개발

```bash
npm install
npm run -ws build
npm run -ws test

# 로컬 실행
npx wrangler d1 migrations apply structmate-dev-db --local   # apps/api 안에서
npm run dev -w @struct-flow/api    # http://127.0.0.1:8788
npm run dev -w @struct-flow/web    # http://localhost:5173 (proxies /api → 8788)
```

자세한 작업 가이드라인은 [AGENTS.md](./AGENTS.md)를 참조하세요.

## 계산기

| Slug | Tier | 설명 |
|---|---|---|
| `concrete-volume` | free | 콘크리트 물량 (폭 × 길이 × 두께) |
| `rebar-weight` | free | 철근 중량 (D10..D29 KDS 단위중량) |
| `simple-beam-deflection` | pro | 단순보 처짐 (UDL / 중앙 집중) |
| `footing-bearing` | pro | 독립기초 접지압 (편심 / kern) |

## Phase 2 (예정)

- MGT command 출력
- 결제 연동, 비밀번호 재설정 이메일, 본격 위자드 엔진, 3D 뷰어
