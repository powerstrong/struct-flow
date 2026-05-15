# Struct Flow

구조설계 엔지니어를 위한 **pre-check 워크벤치** (MVP).

MIDAS Gen 모델링 전에 빠른 감/검산을 할 수 있도록, 서버에서 계산식을 실행하고 2D SVG로 결과를 시각화하는 웹 서비스입니다.

## ⚠️ 면책

**본 서비스의 계산 결과는 정식 구조계산서가 아닌 pre-check 용도입니다.** 실제 설계/시공에 사용 시 반드시 면허를 보유한 구조기술사의 검증을 받아야 합니다.

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
```

자세한 작업 가이드라인은 [AGENTS.md](./AGENTS.md)를 참조하세요.

## Phase 2 (MVP 이후)

- MGT command 출력 (구조 전문가 리뷰 채널 확보 후)
- 결제 연동, 비밀번호 재설정 이메일, 본격 위자드 엔진
