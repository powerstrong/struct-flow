# Codex Critic Re-Review — Struct Flow MVP (round 2)

You previously REJECTED this MVP with 4 major + 2 minor findings. This round verifies that each finding is properly fixed AND looks for new issues.

## Repo

`C:\src\incubating\struct-flow`

## Findings from round 1 (must verify ALL are fixed)

1. **Rule #6 violation in `apps/api/src/routes/calc.ts`**: `getAllHistory()` called `env.DB.prepare()` directly instead of `infra/d1.ts` helpers.
   - Fix claim: removed `getAllHistory`, history route now calls `getAll<HistoryRow>(env, sql, userId, 10)` from `infra/d1.ts`.
   - Verify: grep for `env.DB.prepare` under `apps/api/src/` — should only appear in `infra/d1.ts`.

2. **footing-bearing P=0,M>0 returned passes:true**: physically impossible (free body with applied moment but no axial load was marked safe).
   - Fix claim: `inputSchema` now has `.refine()` rejecting `axialKN === 0 && momentKNm > 0`, with regression tests in `product-routes.test.ts`.
   - Verify: `apps/api/src/calculators/footing-bearing/input.ts` — refine present. Test that anonymous Pro-authenticated POST returns 400 for that case.

3. **Single-source-of-truth claim broken on web**: `META` in `CalculatorPage.tsx` and `TOOLS` in `Home.tsx` duplicated calculator metadata; response shapes re-declared in `lib/auth.tsx`, `History.tsx`, `AdminUsers.tsx`, `AdminUserDetail.tsx`, `AdminAudit.tsx`.
   - Fix claim: `tier` moved into `features/registry.ts` `CalculatorFeature`. `Home.tsx` and `CalculatorPage.tsx` read from the registry. Web pages import `MeResponse`, `HistoryItem`, `AdminUserSummary`, `AdminAuditItem` from `@struct-flow/shared`.
   - Verify: grep for `interface UserItem` / `interface AuditItem` / hardcoded TOOLS / hardcoded META in `apps/web/src/`. Should be gone.

4. **Admin route coverage gap**: integration tests didn't exercise `extend` or `set-expires-at`, and didn't verify audit row creation for each action.
   - Fix claim: added tests for `extend` (verifies expiry advances ~2y + audit row), `set-expires-at` (verifies expiresAt updated + audit row), and 409 paths for `revoke` and `set-expires-at` without active Pro.
   - Verify: `apps/api/test/product-routes.test.ts` describes for each. Count `pro:extend` and `pro:set-expires-at` in audit-row assertions.

5. **History order test only asserted length, not order**: didn't prove "most recent 10 in DESC order".
   - Fix claim: test now asserts `body[0].id === 'h-11'`, `body[9].id === 'h-2'`, plus strictly monotonic descending `createdAt`.

6. **`set-expires-at` returned `{ok:true}` even when 0 rows updated**: false success.
   - Fix claim: `setProExpiresAt` and `revokePro` in `domain/pro/grantPro.ts` now return changed count; admin route returns 409 `no_active_entitlement` when changed === 0.

## Round-2 directive

For EACH numbered finding above, return one of:
- **FIXED** — quote file:line where the fix lives.
- **PARTIALLY FIXED** — explain what's still off.
- **NOT FIXED** — explain why.

Then look for NEW issues you may have missed in round 1. Specifically probe:
- Any **other** direct `env.DB.prepare` calls in app code.
- Any **other** route that returns `{ok:true}` after an unaffected mutation.
- Any **other** schema where `.default()` lets a missing required-field through silently.
- Any **other** shared type that the web side re-declares.

Verification status from current commit:
- API: 73/73 tests pass (was 67).
- Web: 2/2 tests pass, vite build 221.47 kB JS / 11.71 kB CSS.
- All workspaces: `tsc --noEmit` 0 errors.

Verdict required: **APPROVED** or **STILL REJECTED with specific actionable items**. Be terse.
