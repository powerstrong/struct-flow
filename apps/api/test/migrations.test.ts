// Verifies that migrations/0001_init.sql is valid SQLite and creates the expected 5 tables.
// Uses Node 22+ built-in `node:sqlite` (no native build tools required).
import { describe, it, expect } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(join(__dirname, "../migrations/0001_init.sql"), "utf-8");

describe("migrations/0001_init.sql", () => {
  it("applies cleanly to in-memory SQLite", () => {
    const db = new DatabaseSync(":memory:");
    expect(() => db.exec(sql)).not.toThrow();
    db.close();
  });

  it("creates the 5 expected tables", () => {
    const db = new DatabaseSync(":memory:");
    db.exec(sql);
    const rows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const tables = rows.map((r) => r.name);
    expect(tables).toEqual([
      "admin_audit_logs",
      "calc_history",
      "pro_entitlements",
      "sessions",
      "users",
    ]);
    db.close();
  });

  it("users.email is UNIQUE", () => {
    const db = new DatabaseSync(":memory:");
    db.exec(sql);
    const stmt = db.prepare(
      "INSERT INTO users (id, email, password_hash, salt) VALUES (?, ?, 'h', 's')",
    );
    stmt.run("u1", "a@x.com");
    expect(() => stmt.run("u2", "a@x.com")).toThrow(/UNIQUE/);
    db.close();
  });

  it("sessions ON DELETE CASCADE removes sessions when user deleted", () => {
    const db = new DatabaseSync(":memory:");
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(sql);
    db.prepare(
      "INSERT INTO users (id, email, password_hash, salt) VALUES ('u1', 'a@x.com', 'h', 's')",
    ).run();
    db.prepare(
      "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ('s1', 'u1', 'th', '2099-01-01')",
    ).run();
    db.prepare("DELETE FROM users WHERE id = 'u1'").run();
    const row = db.prepare("SELECT count(*) AS c FROM sessions").get() as { c: number };
    expect(row.c).toBe(0);
    db.close();
  });
});
