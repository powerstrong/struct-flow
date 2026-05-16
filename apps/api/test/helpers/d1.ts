// Minimal D1Database shim backed by node:sqlite in-memory.
// Lets us run integration tests against real SQL without spinning up wrangler.

import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire("node:sqlite") as typeof import("node:sqlite");
type Db = InstanceType<typeof DatabaseSync>;

const MIGRATIONS_DIR = join(__dirname, "..", "..", "migrations");

export interface TestEnv extends Env {
  __db: Db;
}

export function makeTestEnv(): TestEnv {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const f of files) {
    db.exec(readFileSync(join(MIGRATIONS_DIR, f), "utf-8"));
  }
  return {
    DB: wrapAsD1(db),
    APP_ENV: "dev",
    COOKIE_SECURE: "false",
    __db: db,
  };
}

function wrapAsD1(db: Db): D1Database {
  const makeStmt = (sql: string, bindings: unknown[] = []): D1PreparedStatement => {
    const bind = (...args: unknown[]) => makeStmt(sql, [...bindings, ...args]);
    return {
      bind,
      first: async <T = unknown>(_col?: string) => {
        const stmt = db.prepare(sql);
        const row = stmt.get(...(bindings as never[]));
        return (row as T | undefined) ?? null;
      },
      all: async <T = unknown>() => {
        const stmt = db.prepare(sql);
        const rows = stmt.all(...(bindings as never[])) as T[];
        return {
          success: true,
          results: rows,
          meta: { duration: 0, changes: 0, last_row_id: 0, rows_read: rows.length, rows_written: 0 },
        } as unknown as D1Result<T>;
      },
      run: async () => {
        const stmt = db.prepare(sql);
        const info = stmt.run(...(bindings as never[]));
        return {
          success: true,
          results: [],
          meta: {
            duration: 0,
            changes: Number(info.changes ?? 0),
            last_row_id: Number(info.lastInsertRowid ?? 0),
            rows_read: 0,
            rows_written: Number(info.changes ?? 0),
          },
        } as unknown as D1Result;
      },
      raw: async () => {
        const stmt = db.prepare(sql);
        const rows = stmt.all(...(bindings as never[])) as unknown as unknown[][];
        return rows;
      },
    } as unknown as D1PreparedStatement;
  };

  return {
    prepare: (sql: string) => makeStmt(sql),
    batch: async (statements: D1PreparedStatement[]) => {
      const out: D1Result[] = [];
      for (const s of statements) out.push((await s.run()) as D1Result);
      return out;
    },
    dump: async () => new ArrayBuffer(0),
    exec: async (sql: string) => {
      db.exec(sql);
      return { count: 0, duration: 0 };
    },
    withSession: () => {
      throw new Error("withSession is not implemented in the test shim");
    },
  } as unknown as D1Database;
}

export function extractCookieValue(setCookie: string | null, name: string): string | null {
  if (!setCookie) return null;
  const m = new RegExp(`(?:^|; )${name}=([^;]*)`).exec(setCookie);
  return m ? m[1] ?? null : null;
}

export function asCookieHeader(name: string, value: string): string {
  return `${name}=${value}`;
}
