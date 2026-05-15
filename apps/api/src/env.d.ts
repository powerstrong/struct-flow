/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  APP_ENV: "dev" | "prod";
  COOKIE_SECURE: "true" | "false";
}
