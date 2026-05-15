// D1 helpers. All raw SQL goes through here — see AGENTS.md rule #6.
// We expose:
//   - getOne / getAll: typed select helpers
//   - run: write helper
//   - tx: simple sequence wrapper (D1 doesn't expose true transactions; batches if possible)

export async function getOne<T = unknown>(
  env: Env,
  sql: string,
  ...params: unknown[]
): Promise<T | null> {
  const stmt = env.DB.prepare(sql).bind(...params);
  const row = await stmt.first<T>();
  return row ?? null;
}

export async function getAll<T = unknown>(
  env: Env,
  sql: string,
  ...params: unknown[]
): Promise<T[]> {
  const stmt = env.DB.prepare(sql).bind(...params);
  const res = await stmt.all<T>();
  return res.results ?? [];
}

export async function run(env: Env, sql: string, ...params: unknown[]): Promise<D1Result> {
  return env.DB.prepare(sql).bind(...params).run();
}

export async function batch(env: Env, stmts: D1PreparedStatement[]): Promise<D1Result[]> {
  return env.DB.batch(stmts);
}

export function prepare(env: Env, sql: string): D1PreparedStatement {
  return env.DB.prepare(sql);
}

export function nowIso(): string {
  return new Date().toISOString();
}
