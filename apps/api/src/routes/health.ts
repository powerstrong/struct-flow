import { json } from "../http";

export async function healthRoute(_req: Request, env: Env): Promise<Response> {
  return json({ status: "ok", env: env.APP_ENV });
}
