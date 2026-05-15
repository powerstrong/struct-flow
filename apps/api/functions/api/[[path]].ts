// Single Cloudflare Pages Functions entrypoint.
// All API requests are delegated to apps/api/src/index.ts router.
// DO NOT add other functions/api/*.ts files — see AGENTS.md rule #5.

import { handle } from "../../src/index";

export const onRequest: PagesFunction<Env> = (ctx) => handle(ctx.request, ctx.env);
