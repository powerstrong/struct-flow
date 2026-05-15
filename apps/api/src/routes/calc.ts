import { z } from "zod";
import { json, badRequest, unauthorized, forbidden, notFound, error } from "../http";
import { findCalculator, calculators } from "../calculators/registry";
import { getOne, run, nowIso } from "../infra/d1";
import { newUuid } from "../infra/ids";
import { requireSession } from "../infra/session-store";
import { checkProAccess } from "../domain/pro/checkProAccess";

export async function listCalculatorsRoute(_req: Request, _env: Env): Promise<Response> {
  return json(
    calculators.map((c) => ({
      id: c.id,
      version: c.version,
      tier: c.tier,
      meta: c.meta,
    })),
  );
}

const bodySchema = z.object({ input: z.unknown() });

export async function runCalculatorRoute(
  req: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const slug = params.slug ?? "";
  const calc = findCalculator(slug);
  if (!calc) return notFound();

  const session = await requireSession(env, req);
  const isPro = calc.tier === "pro";
  if (isPro && !session) return unauthorized();
  if (isPro && session) {
    const pro = await checkProAccess(env, session.userId);
    if (!pro.active) return forbidden("Pro 권한이 필요한 계산기입니다.");
  }

  const body = await safeJson(req);
  const wrap = bodySchema.safeParse(body);
  if (!wrap.success) return badRequest("요청 본문이 올바르지 않습니다.", wrap.error.flatten());

  const parsed = calc.inputSchema.safeParse(wrap.data.input);
  if (!parsed.success) return badRequest("입력값이 올바르지 않습니다.", parsed.error.flatten());

  let result: unknown;
  try {
    result = calc.compute(parsed.data);
  } catch (err) {
    return error("compute_error", err instanceof Error ? err.message : "계산 실패", 500);
  }
  const viewModel = calc.toViewModel(parsed.data, result);

  // Persist history only for logged-in users (anonymous free-tier runs are not recorded).
  let recordedAt = nowIso();
  if (session) {
    await run(
      env,
      "INSERT INTO calc_history (id, user_id, tool_slug, tool_version, input_json, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      newUuid(),
      session.userId,
      calc.id,
      calc.version,
      JSON.stringify(parsed.data),
      JSON.stringify(result),
      recordedAt,
    );
  }

  return json({
    toolSlug: calc.id,
    toolVersion: calc.version,
    result,
    viewModel,
    recordedAt,
  });
}

async function safeJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export async function historyRoute(req: Request, env: Env): Promise<Response> {
  const session = await requireSession(env, req);
  if (!session) return unauthorized();
  const rows = await getAllHistory(env, session.userId, 10);
  return json(
    rows.map((r) => ({
      id: r.id,
      toolSlug: r.tool_slug,
      toolVersion: r.tool_version,
      inputJson: safeParse(r.input_json),
      resultJson: safeParse(r.result_json),
      createdAt: r.created_at,
    })),
  );
}

interface HistoryRow {
  id: string;
  tool_slug: string;
  tool_version: string;
  input_json: string;
  result_json: string;
  created_at: string;
}

async function getAllHistory(env: Env, userId: string, limit: number): Promise<HistoryRow[]> {
  const stmt = env.DB.prepare(
    "SELECT id, tool_slug, tool_version, input_json, result_json, created_at FROM calc_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
  ).bind(userId, limit);
  const res = await stmt.all<HistoryRow>();
  return res.results ?? [];
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// silence unused import in callers
void getOne;
