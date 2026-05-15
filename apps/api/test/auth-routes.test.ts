import { describe, it, expect, beforeEach } from "vitest";
import { handle } from "../src/index";
import { makeTestEnv, extractCookieValue, asCookieHeader, type TestEnv } from "./helpers/d1";
import { grantPro, revokePro } from "../src/domain/pro/grantPro";
import { SESSION_COOKIE_NAME } from "../src/infra/auth";

interface MeBody {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  proActive: boolean;
  proExpiresAt: string | null;
}

async function jsonBody<T = unknown>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

const SIGNUP_URL = "https://x.test/api/auth/signup";
const LOGIN_URL = "https://x.test/api/auth/login";
const LOGOUT_URL = "https://x.test/api/auth/logout";
const ME_URL = "https://x.test/api/auth/me";

const credentials = { email: "a@x.com", password: "pa$$word-1" } as const;

async function signup(env: Env, body: Record<string, unknown> = credentials): Promise<Response> {
  return handle(
    new Request(SIGNUP_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    env,
  );
}

async function login(env: Env, body: Record<string, unknown> = credentials): Promise<Response> {
  return handle(
    new Request(LOGIN_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    env,
  );
}

function cookieFromResponse(res: Response): string {
  const setCookie = res.headers.get("set-cookie");
  const token = extractCookieValue(setCookie, SESSION_COOKIE_NAME);
  if (!token) throw new Error("no session cookie in response");
  return asCookieHeader(SESSION_COOKIE_NAME, token);
}

let env: TestEnv;
beforeEach(() => {
  env = makeTestEnv();
});

describe("POST /api/auth/signup", () => {
  it("201s, returns user, sets HttpOnly session cookie", async () => {
    const res = await signup(env);
    expect(res.status).toBe(201);
    const body = await jsonBody<MeBody>(res);
    expect(body.email).toBe("a@x.com");
    expect(body.proActive).toBe(false);

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
  });

  it("rejects short password (<8)", async () => {
    const res = await signup(env, { email: "b@x.com", password: "short" });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate email", async () => {
    await signup(env);
    const dup = await signup(env);
    expect(dup.status).toBe(409);
  });

  it("normalizes email to lowercase", async () => {
    const res = await signup(env, { email: "A@X.com", password: "pa$$word-1" });
    expect(res.status).toBe(201);
    const dup = await signup(env, { email: "a@x.COM", password: "pa$$word-1" });
    expect(dup.status).toBe(409);
  });
});

describe("POST /api/auth/login + /api/auth/me + /api/auth/logout", () => {
  it("login fails before signup", async () => {
    const res = await login(env);
    expect(res.status).toBe(401);
  });

  it("login succeeds after signup; me returns user; logout clears", async () => {
    await signup(env);
    const loginRes = await login(env);
    expect(loginRes.status).toBe(200);
    const cookie = cookieFromResponse(loginRes);

    const meRes = await handle(new Request(ME_URL, { headers: { cookie } }), env);
    expect(meRes.status).toBe(200);
    const body = await jsonBody<MeBody>(meRes);
    expect(body.email).toBe("a@x.com");
    expect(body.proActive).toBe(false);

    const logoutRes = await handle(new Request(LOGOUT_URL, { method: "POST", headers: { cookie } }), env);
    expect(logoutRes.status).toBe(200);
    const clear = logoutRes.headers.get("set-cookie") ?? "";
    expect(clear).toContain("Max-Age=0");

    const after = await handle(new Request(ME_URL, { headers: { cookie } }), env);
    expect(after.status).toBe(401);
  });

  it("me returns 401 without cookie", async () => {
    const res = await handle(new Request(ME_URL), env);
    expect(res.status).toBe(401);
  });

  it("login fails with wrong password", async () => {
    await signup(env);
    const res = await login(env, { email: "a@x.com", password: "wrong-password-1" });
    expect(res.status).toBe(401);
  });
});

describe("Pro entitlement", () => {
  it("me.proActive becomes true after grantPro and false after revokePro", async () => {
    const signupRes = await signup(env);
    const userId = (await jsonBody<MeBody>(signupRes)).id;
    // Re-login (the signupRes body is already consumed)
    const loginRes = await login(env);
    const cookie = cookieFromResponse(loginRes);

    const meBefore = await jsonBody<MeBody>(await handle(new Request(ME_URL, { headers: { cookie } }), env));
    expect(meBefore.proActive).toBe(false);

    await grantPro(env, { userId, years: 1, grantedBy: userId });
    const meAfter = await jsonBody<MeBody>(await handle(new Request(ME_URL, { headers: { cookie } }), env));
    expect(meAfter.proActive).toBe(true);
    expect(typeof meAfter.proExpiresAt).toBe("string");

    await revokePro(env, userId);
    const meRevoked = await jsonBody<MeBody>(await handle(new Request(ME_URL, { headers: { cookie } }), env));
    expect(meRevoked.proActive).toBe(false);
  });

  it("grantPro is idempotent — double-call extends expiry from prior expiration, not 'now'", async () => {
    const signupRes = await signup(env);
    const userId = (await jsonBody<MeBody>(signupRes)).id;
    const first = await grantPro(env, { userId, years: 1, grantedBy: userId });
    const second = await grantPro(env, { userId, years: 1, grantedBy: userId });
    expect(second.extended).toBe(true);
    expect(new Date(second.expiresAt).getTime()).toBeGreaterThan(new Date(first.expiresAt).getTime());
  });
});
