# domain/pro

Pro entitlement 도메인 로직. **모든 권한 체크는 여기를 거친다 (AGENTS.md 규칙 #7).**

- `checkProAccess(env, userId)` — 현재 시점에 활성 Pro인지 boolean + 만료일 반환
- `grantPro(env, input)` — 멱등 부여/연장. 더블클릭 안전.
- `setProExpiresAt(env, userId, expiresAt)` — 수동 만료일 수정 (환불/입금 누락 케이스)
- `revokePro(env, userId)` — 해제

라우트는 이 함수들만 호출해야 한다. `pro_entitlements`에 라우트가 직접 SQL을 던지면 안 된다.
