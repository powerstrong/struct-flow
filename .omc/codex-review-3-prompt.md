# Codex Critic Re-Review — Struct Flow MVP (round 3)

Round 2 left exactly one open finding: `revoke` and `set-expires-at` mutated any `status='active'` row, while `checkProAccess` requires `status='active' AND expires_at > now`. Result: an entitlement that has naturally expired (timestamp past, status untouched) could be revived by `set-expires-at` or falsely 200'd by `revoke`.

## Fix applied (this commit)

`apps/api/src/domain/pro/grantPro.ts`:
- `setProExpiresAt()` now uses `WHERE user_id = ? AND status = 'active' AND expires_at > ?` — same active predicate as `checkProAccess`.
- `revokePro()` same predicate.

Tests added in `apps/api/test/product-routes.test.ts`:
- `revoke on a NATURALLY-EXPIRED entitlement returns 409` — seeds a `status='active'` row with `expires_at = '2020-12-31'`, calls revoke, asserts 409.
- `set-expires-at on a NATURALLY-EXPIRED entitlement returns 409 (no silent revival)` — same seed, calls set-expires-at to 2099, asserts 409 AND confirms `/api/auth/me proActive === false` after the failed attempt.

API test count: 75/75 (was 73).

## Round-3 directive

1. Confirm the round-2 finding is now fully closed. Quote the exact WHERE predicates in `grantPro.ts` and the regression tests.

2. Final sweep — anything still wrong? Specifically:
   - Any other code path that defines "active" inconsistently between read and write?
   - Any other place where 0-row mutations report success?
   - Boundary rules: any `env.DB.prepare` outside `infra/d1.ts`? Any calc formula in `apps/web/`?
   - Any missing test for an action that mutates state?

3. **Final verdict**: APPROVED, ACCEPT-WITH-RESERVATIONS, or REJECTED. Be terse.

Verification artifacts:
- API: 75/75 pass
- Web: 2/2 pass, vite build green
- Workspaces typecheck: 0 errors
