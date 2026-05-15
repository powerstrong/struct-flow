import { describe, it, expect } from "vitest";
import { handle } from "../src/index";

const env = { APP_ENV: "dev", COOKIE_SECURE: "true", DB: {} as unknown } as unknown as Env;

describe("GET /api/health", () => {
  it("returns 200 ok", async () => {
    const res = await handle(new Request("https://x.test/api/health"), env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok", env: "dev" });
  });

  it("returns 405 for POST", async () => {
    const res = await handle(
      new Request("https://x.test/api/health", { method: "POST" }),
      env,
    );
    expect(res.status).toBe(405);
  });

  it("returns 404 for unknown path", async () => {
    const res = await handle(new Request("https://x.test/api/nope"), env);
    expect(res.status).toBe(404);
  });
});
