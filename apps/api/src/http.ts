export function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

export function error(code: string, message: string, status: number, details?: unknown): Response {
  return json({ error: { code, message, ...(details === undefined ? {} : { details }) } }, status);
}

export function notFound(): Response {
  return error("not_found", "리소스를 찾을 수 없습니다.", 404);
}

export function methodNotAllowed(): Response {
  return error("method_not_allowed", "허용되지 않은 메서드입니다.", 405);
}

export function unauthorized(): Response {
  return error("unauthorized", "로그인이 필요합니다.", 401);
}

export function forbidden(message = "권한이 없습니다."): Response {
  return error("forbidden", message, 403);
}

export function badRequest(message: string, details?: unknown): Response {
  return error("bad_request", message, 400, details);
}
