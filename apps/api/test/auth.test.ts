import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  PBKDF2_ITERATIONS,
  buildSessionCookie,
  buildClearSessionCookie,
  readSessionCookie,
  createSessionRecord,
  SESSION_COOKIE_NAME,
} from "../src/infra/auth";
import { sha256Hex, newToken, newUuid } from "../src/infra/ids";

describe("PBKDF2 password hashing", () => {
  it("iterations are at least 100,000 (NIST minimum)", () => {
    expect(PBKDF2_ITERATIONS).toBeGreaterThanOrEqual(100_000);
  });

  it("hash + verify roundtrip succeeds for correct password", async () => {
    const { hash, salt } = await hashPassword("s3cret-pass");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(salt).toMatch(/^[0-9a-f]{32}$/);
    await expect(verifyPassword("s3cret-pass", hash, salt)).resolves.toBe(true);
  });

  it("verify fails for wrong password", async () => {
    const { hash, salt } = await hashPassword("right-one");
    await expect(verifyPassword("wrong-one", hash, salt)).resolves.toBe(false);
  });

  it("two hashes of the same password have different salts", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });
});

describe("session cookies", () => {
  it("buildSessionCookie includes HttpOnly + SameSite=Lax + Secure when configured", () => {
    const c = buildSessionCookie("abc123", { secure: true });
    expect(c).toContain(`${SESSION_COOKIE_NAME}=abc123`);
    expect(c).toContain("HttpOnly");
    expect(c).toContain("SameSite=Lax");
    expect(c).toContain("Secure");
    expect(c).toContain("Path=/");
    expect(c).toContain("Max-Age=");
  });

  it("buildSessionCookie omits Secure when disabled (dev http)", () => {
    const c = buildSessionCookie("x", { secure: false });
    expect(c).not.toContain("Secure");
  });

  it("buildClearSessionCookie has Max-Age=0", () => {
    expect(buildClearSessionCookie({ secure: true })).toContain("Max-Age=0");
  });

  it("readSessionCookie extracts the session value from Cookie header", () => {
    const req = new Request("https://x.test/", {
      headers: { cookie: `other=1; ${SESSION_COOKIE_NAME}=tok-value; foo=bar` },
    });
    expect(readSessionCookie(req)).toBe("tok-value");
  });

  it("readSessionCookie returns null when no cookie", () => {
    const req = new Request("https://x.test/");
    expect(readSessionCookie(req)).toBe(null);
  });
});

describe("session records", () => {
  it("createSessionRecord produces non-empty token + sha256 hash + future expiry", async () => {
    const rec = await createSessionRecord();
    expect(rec.token.length).toBeGreaterThan(20);
    expect(rec.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(rec.tokenHash).toBe(await sha256Hex(rec.token));
    expect(new Date(rec.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});

describe("id helpers", () => {
  it("newToken returns base64url-safe (no +, /, =)", () => {
    const t = newToken(32);
    expect(t).not.toMatch(/[+/=]/);
    expect(t.length).toBeGreaterThan(20);
  });

  it("newUuid returns RFC 4122 v4 format", () => {
    expect(newUuid()).toMatch(/^[0-9a-f-]{36}$/);
  });
});
