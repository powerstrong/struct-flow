import { describe, it, expect, beforeEach } from "vitest";
import { handle } from "../src/index";
import { makeTestEnv, extractCookieValue, asCookieHeader, type TestEnv } from "./helpers/d1";
import { SESSION_COOKIE_NAME } from "../src/infra/auth";
import { grantPro } from "../src/domain/pro/grantPro";

async function json<T = unknown>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

async function signupAndGetCookie(env: Env, email: string): Promise<{ cookie: string; userId: string }> {
  const res = await handle(
    new Request("https://x.test/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "pa$$word-1", agreeDisclaimer: true }),
    }),
    env,
  );
  const setCookie = res.headers.get("set-cookie");
  const token = extractCookieValue(setCookie, SESSION_COOKIE_NAME)!;
  const body = await json<{ id: string }>(res);
  return { cookie: asCookieHeader(SESSION_COOKIE_NAME, token), userId: body.id };
}

async function makeAdmin(env: TestEnv, userId: string): Promise<void> {
  env.__db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(userId);
}

let env: TestEnv;
beforeEach(() => {
  env = makeTestEnv();
});

describe("GET /api/calc (list)", () => {
  it("returns all 4 calculators (free + pro), no auth required", async () => {
    const res = await handle(new Request("https://x.test/api/calc"), env);
    expect(res.status).toBe(200);
    const body = await json<Array<{ id: string; tier: string }>>(res);
    expect(body).toHaveLength(4);
    expect(body.map((b) => b.id).sort()).toEqual([
      "concrete-volume",
      "footing-bearing",
      "rebar-weight",
      "simple-beam-deflection",
    ]);
  });
});

describe("POST /api/calc/:slug — free tier", () => {
  it("anonymous can run a free calculator and get a result + viewModel", async () => {
    const res = await handle(
      new Request("https://x.test/api/calc/concrete-volume", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: { widthMm: 6000, lengthMm: 4000, thicknessMm: 200 } }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await json<{ toolSlug: string; result: { volumeM3: number }; viewModel: unknown }>(res);
    expect(body.toolSlug).toBe("concrete-volume");
    expect(body.result.volumeM3).toBeCloseTo(4.8, 6);
    expect(body.viewModel).not.toBeNull();
  });

  it("anonymous run does NOT create history", async () => {
    await handle(
      new Request("https://x.test/api/calc/concrete-volume", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: { widthMm: 1000, lengthMm: 1000, thicknessMm: 100 } }),
      }),
      env,
    );
    const count = (env.__db.prepare("SELECT count(*) AS c FROM calc_history").get() as { c: number }).c;
    expect(count).toBe(0);
  });

  it("invalid input → 400", async () => {
    const res = await handle(
      new Request("https://x.test/api/calc/concrete-volume", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: { widthMm: -1, lengthMm: 1, thicknessMm: 1 } }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("unknown slug → 404", async () => {
    const res = await handle(
      new Request("https://x.test/api/calc/unknown-tool", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: {} }),
      }),
      env,
    );
    expect(res.status).toBe(404);
  });
});

describe("POST /api/calc/:slug — pro tier gating", () => {
  it("anonymous gets 401 on pro calculator", async () => {
    const res = await handle(
      new Request("https://x.test/api/calc/simple-beam-deflection", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: { spanM: 6, eiKNm2: 10000, loadCase: "udl", udlKNPerM: 10 } }),
      }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("logged-in but not Pro gets 403", async () => {
    const { cookie } = await signupAndGetCookie(env, "u1@x.com");
    const res = await handle(
      new Request("https://x.test/api/calc/simple-beam-deflection", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ input: { spanM: 6, eiKNm2: 10000, loadCase: "udl", udlKNPerM: 10 } }),
      }),
      env,
    );
    expect(res.status).toBe(403);
  });

  it("Pro user can run and history is recorded", async () => {
    const { cookie, userId } = await signupAndGetCookie(env, "u2@x.com");
    await grantPro(env, { userId, years: 1, grantedBy: userId });
    const res = await handle(
      new Request("https://x.test/api/calc/simple-beam-deflection", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ input: { spanM: 6, eiKNm2: 10000, loadCase: "udl", udlKNPerM: 10 } }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const count = (env.__db.prepare("SELECT count(*) AS c FROM calc_history WHERE user_id = ?").get(userId) as { c: number }).c;
    expect(count).toBe(1);
  });
});

describe("GET /api/history", () => {
  it("requires auth (401 anonymous)", async () => {
    const res = await handle(new Request("https://x.test/api/history"), env);
    expect(res.status).toBe(401);
  });

  it("returns user's own most-recent 10 entries in DESCENDING created_at order", async () => {
    const { cookie, userId } = await signupAndGetCookie(env, "h@x.com");
    // Seed 12 history rows, oldest first.
    const stmt = env.__db.prepare(
      "INSERT INTO calc_history (id, user_id, tool_slug, tool_version, input_json, result_json, created_at) VALUES (?, ?, 'concrete-volume', '1.0.0', '{}', '{}', ?)",
    );
    for (let i = 0; i < 12; i++) {
      stmt.run(`h-${i}`, userId, new Date(Date.UTC(2026, 0, i + 1)).toISOString());
    }
    const res = await handle(new Request("https://x.test/api/history", { headers: { cookie } }), env);
    expect(res.status).toBe(200);
    const body = await json<Array<{ id: string; createdAt: string }>>(res);
    expect(body).toHaveLength(10);
    // Most-recent first: id "h-11", "h-10", ..., "h-2".
    expect(body[0]?.id).toBe("h-11");
    expect(body[9]?.id).toBe("h-2");
    // Strictly monotonic descending createdAt.
    for (let i = 1; i < body.length; i++) {
      expect(new Date(body[i - 1]!.createdAt).getTime()).toBeGreaterThan(
        new Date(body[i]!.createdAt).getTime(),
      );
    }
  });

  it("does not leak other users' history", async () => {
    const a = await signupAndGetCookie(env, "a@x.com");
    const b = await signupAndGetCookie(env, "b@x.com");
    env.__db
      .prepare(
        "INSERT INTO calc_history (id, user_id, tool_slug, tool_version, input_json, result_json, created_at) VALUES ('x', ?, 'concrete-volume', '1.0.0', '{}', '{}', ?)",
      )
      .run(b.userId, new Date().toISOString());
    const res = await handle(new Request("https://x.test/api/history", { headers: { cookie: a.cookie } }), env);
    const body = await json<unknown[]>(res);
    expect(body).toHaveLength(0);
  });
});

describe("admin routes", () => {
  it("non-admin gets 403 on /api/admin/users", async () => {
    const { cookie } = await signupAndGetCookie(env, "normal@x.com");
    const res = await handle(new Request("https://x.test/api/admin/users", { headers: { cookie } }), env);
    expect(res.status).toBe(403);
  });

  it("anonymous gets 401 on /api/admin/users", async () => {
    const res = await handle(new Request("https://x.test/api/admin/users"), env);
    expect(res.status).toBe(401);
  });

  it("admin can list users + grant Pro + see audit log", async () => {
    const admin = await signupAndGetCookie(env, "admin@x.com");
    await makeAdmin(env, admin.userId);
    const target = await signupAndGetCookie(env, "target@x.com");

    const list = await handle(new Request("https://x.test/api/admin/users?q=target", { headers: { cookie: admin.cookie } }), env);
    expect(list.status).toBe(200);
    const users = await json<Array<{ id: string; email: string }>>(list);
    expect(users.some((u) => u.email === "target@x.com")).toBe(true);

    const grant = await handle(
      new Request(`https://x.test/api/admin/users/${target.userId}/pro`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: admin.cookie },
        body: JSON.stringify({ action: "grant", years: 1, memo: "test grant" }),
      }),
      env,
    );
    expect(grant.status).toBe(200);

    const audit = await handle(new Request("https://x.test/api/admin/audit", { headers: { cookie: admin.cookie } }), env);
    expect(audit.status).toBe(200);
    const auditBody = await json<Array<{ actionType: string; targetUserId: string }>>(audit);
    expect(auditBody[0]?.actionType).toBe("pro:grant");
    expect(auditBody[0]?.targetUserId).toBe(target.userId);
  });

  it("revoke immediately removes pro access", async () => {
    const admin = await signupAndGetCookie(env, "admin@x.com");
    await makeAdmin(env, admin.userId);
    const target = await signupAndGetCookie(env, "target@x.com");

    await handle(
      new Request(`https://x.test/api/admin/users/${target.userId}/pro`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: admin.cookie },
        body: JSON.stringify({ action: "grant", years: 1 }),
      }),
      env,
    );
    const before = await handle(new Request("https://x.test/api/auth/me", { headers: { cookie: target.cookie } }), env);
    expect((await json<{ proActive: boolean }>(before)).proActive).toBe(true);

    await handle(
      new Request(`https://x.test/api/admin/users/${target.userId}/pro`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: admin.cookie },
        body: JSON.stringify({ action: "revoke" }),
      }),
      env,
    );
    const after = await handle(new Request("https://x.test/api/auth/me", { headers: { cookie: target.cookie } }), env);
    expect((await json<{ proActive: boolean }>(after)).proActive).toBe(false);
  });

  it("extend on a Pro user appends years from current expiry + writes pro:extend audit", async () => {
    const admin = await signupAndGetCookie(env, "admin@x.com");
    await makeAdmin(env, admin.userId);
    const target = await signupAndGetCookie(env, "target@x.com");

    const grant = await handle(
      new Request(`https://x.test/api/admin/users/${target.userId}/pro`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: admin.cookie },
        body: JSON.stringify({ action: "grant", years: 1, memo: "first grant" }),
      }),
      env,
    );
    const grantBody = await json<{ result: { expiresAt: string }; proStatus: { expiresAt: string } }>(grant);
    const firstExpiry = new Date(grantBody.proStatus.expiresAt).getTime();

    const extend = await handle(
      new Request(`https://x.test/api/admin/users/${target.userId}/pro`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: admin.cookie },
        body: JSON.stringify({ action: "extend", years: 2, memo: "renewal" }),
      }),
      env,
    );
    expect(extend.status).toBe(200);
    const extendBody = await json<{ proStatus: { expiresAt: string } }>(extend);
    const newExpiry = new Date(extendBody.proStatus.expiresAt).getTime();
    // ~2 years later than the previous expiry (allow 24h skew).
    const expectedDeltaMs = 2 * 365 * 24 * 60 * 60 * 1000;
    expect(newExpiry - firstExpiry).toBeGreaterThan(expectedDeltaMs - 86_400_000);

    const audit = await handle(new Request("https://x.test/api/admin/audit", { headers: { cookie: admin.cookie } }), env);
    const auditBody = await json<Array<{ actionType: string }>>(audit);
    const types = auditBody.map((a) => a.actionType);
    expect(types).toContain("pro:extend");
    expect(types).toContain("pro:grant");
  });

  it("set-expires-at on an active Pro updates the expiry + writes audit row", async () => {
    const admin = await signupAndGetCookie(env, "admin@x.com");
    await makeAdmin(env, admin.userId);
    const target = await signupAndGetCookie(env, "target@x.com");

    await handle(
      new Request(`https://x.test/api/admin/users/${target.userId}/pro`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: admin.cookie },
        body: JSON.stringify({ action: "grant", years: 1 }),
      }),
      env,
    );

    const newExpiresAt = "2030-12-31T00:00:00.000Z";
    const set = await handle(
      new Request(`https://x.test/api/admin/users/${target.userId}/pro`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: admin.cookie },
        body: JSON.stringify({ action: "set-expires-at", expiresAt: newExpiresAt, memo: "manual" }),
      }),
      env,
    );
    expect(set.status).toBe(200);
    const body = await json<{ proStatus: { expiresAt: string } }>(set);
    expect(body.proStatus.expiresAt).toBe(newExpiresAt);

    const audit = await handle(new Request("https://x.test/api/admin/audit", { headers: { cookie: admin.cookie } }), env);
    const types = (await json<Array<{ actionType: string }>>(audit)).map((a) => a.actionType);
    expect(types).toContain("pro:set-expires-at");
  });

  it("set-expires-at without an active Pro returns 409 (no rows changed)", async () => {
    const admin = await signupAndGetCookie(env, "admin@x.com");
    await makeAdmin(env, admin.userId);
    const target = await signupAndGetCookie(env, "target@x.com");

    const res = await handle(
      new Request(`https://x.test/api/admin/users/${target.userId}/pro`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: admin.cookie },
        body: JSON.stringify({ action: "set-expires-at", expiresAt: "2030-01-01T00:00:00.000Z" }),
      }),
      env,
    );
    expect(res.status).toBe(409);
  });

  it("revoke without an active Pro returns 409", async () => {
    const admin = await signupAndGetCookie(env, "admin@x.com");
    await makeAdmin(env, admin.userId);
    const target = await signupAndGetCookie(env, "target@x.com");

    const res = await handle(
      new Request(`https://x.test/api/admin/users/${target.userId}/pro`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: admin.cookie },
        body: JSON.stringify({ action: "revoke" }),
      }),
      env,
    );
    expect(res.status).toBe(409);
  });
});

describe("footing-bearing physical-consistency guard (Pro-authenticated)", () => {
  async function asPro(): Promise<string> {
    const { cookie, userId } = await signupAndGetCookie(env, "pro@x.com");
    await grantPro(env, { userId, years: 1, grantedBy: userId });
    return cookie;
  }

  it("rejects P=0 with M>0 with 400 (free body — physically inconsistent)", async () => {
    const cookie = await asPro();
    const res = await handle(
      new Request("https://x.test/api/calc/footing-bearing", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ input: { lengthM: 3, widthM: 2, axialKN: 0, momentKNm: 100, qAllowKPa: 200 } }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("accepts P=0 with M=0 (trivial zero pressure)", async () => {
    const cookie = await asPro();
    const res = await handle(
      new Request("https://x.test/api/calc/footing-bearing", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ input: { lengthM: 3, widthM: 2, axialKN: 0, momentKNm: 0, qAllowKPa: 200 } }),
      }),
      env,
    );
    expect(res.status).toBe(200);
  });
});
