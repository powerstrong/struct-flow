// Single API router. All routes are dispatched here from functions/api/[[path]].ts.
// Adding a new entrypoint elsewhere is forbidden (AGENTS.md rule #5).

import { json, notFound, methodNotAllowed } from "./http";
import { healthRoute } from "./routes/health";

type Handler = (req: Request, env: Env, params: Record<string, string>) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

function route(method: string, path: string, handler: Handler): Route {
  const paramNames: string[] = [];
  const pattern = new RegExp(
    "^" +
      path.replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, (m) => {
        paramNames.push(m.slice(1));
        return "([^/]+)";
      }) +
      "$",
  );
  return { method, pattern, paramNames, handler };
}

const routes: Route[] = [
  route("GET", "/api/health", healthRoute),
];

export async function handle(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  let matchedPath = false;
  for (const r of routes) {
    const m = r.pattern.exec(path);
    if (!m) continue;
    matchedPath = true;
    if (r.method !== req.method) continue;
    const params: Record<string, string> = {};
    r.paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(m[i + 1] ?? "");
    });
    try {
      return await r.handler(req, env, params);
    } catch (err) {
      console.error("route error", path, err);
      return json({ error: { code: "internal_error", message: "internal error" } }, 500);
    }
  }

  return matchedPath ? methodNotAllowed() : notFound();
}
