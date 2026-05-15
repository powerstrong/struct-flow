# Codex Critic Review — Struct Flow MVP

You are reviewing a freshly committed MVP for **Struct Flow**, a Korean structural-engineering pre-check workbench. The implementation spans ~75 files. The reviewer's job: verify the implementation satisfies the PRD acceptance criteria, and explicitly assess whether the approach is **OPTIMAL** — i.e. is there a meaningfully simpler, faster, or more maintainable alternative the implementation missed?

## Repo

`C:\src\incubating\struct-flow` (also `https://github.com/powerstrong/struct-flow`)

Stack: React + Vite + TypeScript SPA · Cloudflare Pages Functions · Cloudflare D1 · npm workspaces · vitest.

## Boundary rules (in AGENTS.md — must be respected)

1. Calc logic only in `apps/api/src/calculators/<slug>/compute.ts`.
2. `apps/web/` is fetch-only — no formulas.
3. MGT strings only in `apps/api/src/domain/mgt/` (MVP: README only, no code).
4. Calculator addition only in 3 places: `<slug>/index.ts`, `packages/shared/src/calculators.ts`, `registry.ts`.
5. All API routes via single router in `apps/api/src/index.ts`.
6. D1 queries via `infra/d1.ts` helpers only.
7. Pro permission via `domain/pro/checkProAccess.ts` only.

## PRD acceptance criteria (11 user stories, all currently marked passes:true)

See `.omc/prd.json` for full list. Key acceptance points:

- **US-001..US-004**: monorepo, shared types, API skeleton with `/api/health`, D1 migration (5 tables, FK cascade).
- **US-005**: PBKDF2 100k iterations SHA-256 + per-user salt; opaque session token (no JWT); HttpOnly+Secure+SameSite=Lax cookie. Tests verify iterations >=100,000.
- **US-006**: signup/login/logout/me routes; lowercase email; 8-char password floor; mandatory `agreeDisclaimer: true`; idempotent grantPro (double-click extends from prior expiry, not from now).
- **US-007**: 4 calculators with strict 5-file shape; pure compute; vitest 3+ scenarios each (normal/boundary/NG).
- **US-008**: `/api/calc/:slug` tier gating (anon pro→401, logged-in non-pro→403); `/api/history` returns own user's recent 10; admin routes require `is_admin=1`; grant/extend/revoke/set-expires-at + auto audit_log.
- **US-009**: Vite SPA + Tailwind + SvgViewer renders rectangle/line/polygon/arrow/dimension/text.
- **US-010**: signup form requires disclaimer checkbox; AuthContext; admin pages gated by isAdmin.
- **US-011**: root `npm run --workspaces test/build/typecheck` all green.

## Files changed (Ralph session)

API:
- `src/index.ts` (router), `src/http.ts`, `src/env.d.ts`
- `src/routes/{health,auth,calc,admin}.ts`
- `src/infra/{auth,d1,session-store,audit,ids,schema}.ts` + README
- `src/domain/pro/{checkProAccess,grantPro}.ts` + README
- `src/domain/mgt/README.md` (Phase 2 placeholder)
- `src/calculators/registry.ts`
- `src/calculators/{concrete-volume,rebar-weight,simple-beam-deflection,footing-bearing}/{input,compute,view,meta,index}.ts`
- `migrations/0001_init.sql` + migrations README
- `test/{health,auth,migrations,auth-routes,calculators,product-routes}.test.ts` + `test/helpers/d1.ts`
- `wrangler.toml`, `tsconfig.json`, `vitest.config.ts`, `package.json`

Web:
- `index.html`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`
- `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`, `src/README.md`
- `src/components/{Layout,Disclaimer}.tsx`, `src/components/viewer/SvgViewer.tsx`
- `src/lib/{api,auth}.{ts,tsx}`
- `src/features/{registry.ts, <4 slugs>/index.tsx}`
- `src/pages/{Home,Login,Signup,CalculatorPage,History,Pricing,DisclaimerPage,Terms,NotFound}.tsx`
- `src/pages/admin/{AdminLayout,AdminDashboard,AdminUsers,AdminUserDetail,AdminAudit}.tsx`
- `test/{setup.ts,SvgViewer.test.tsx}`

Shared:
- `packages/shared/src/{calculators,viewmodel,contracts,index}.ts`

Top-level: `package.json`, `tsconfig.base.json`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `.gitignore`.

## Verification status from the Ralph session

- API: 67/67 vitest passing across 6 test files (health, auth crypto, auth routes, migrations, calculators, product+admin routes).
- Web: 2/2 vitest passing (SvgViewer).
- Shared: typecheck passes, no tests (types-only package).
- `vite build`: 221.74 kB JS / 11.71 kB CSS for the SPA.
- All workspaces: `tsc --noEmit` 0 errors.

## What I want you to do

1. **Verify the boundary rules are NOT violated.** Look at apps/web specifically — does any calc formula leak into the web side? Are there secondary entrypoints under `functions/api/*` other than `[[path]].ts`? Any direct `env.DB.prepare` calls outside `infra/d1.ts`?

2. **Verify each PRD criterion has matching evidence.** If a criterion claims "PBKDF2 iterations >= 100,000", the test must exercise that — quote the file/line.

3. **Probe security**: is the session token treated as a bearer (compared via timing-safe equality at the DB layer)? Cookie attributes correct? Is there any place a raw input is logged or echoed back unsafely? Are admin routes truly gated?

4. **Probe calculator correctness**: cross-check the textbook formulas in compute.ts files against expected values (UDL 5wL⁴/(384EI), point PL³/(48EI); footing kern e≤L/6; PBKDF2 100k; etc.). If any formula is wrong, name it.

5. **Optimality check (REQUIRED)**: Is there a meaningfully simpler / faster / more maintainable approach that achieves the same acceptance criteria, that the implementation missed? Examples: unnecessary abstractions, duplicated patterns across 4 calculators that should be a generic helper, a more idiomatic Drizzle usage, a missed opportunity to combine routes, etc.

6. **Adjacent-code review**: not just the directly-modified files. Check shared types vs API usage vs Web usage for drift. Check whether the registry pattern actually buys what it promises (single source of truth?).

Report verdict as: **APPROVED** or **REJECTED with specific actionable items**. Be terse and concrete — file paths and line numbers preferred. Don't praise; just find what's wrong or suboptimal.
