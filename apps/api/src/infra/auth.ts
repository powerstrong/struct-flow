// Password hashing (PBKDF2-SHA256, 100k iterations) + session token helpers.
// Web Crypto only — works on Cloudflare Workers and Node 22+.

import { fromHex, toHex, newToken, newUuid, sha256Hex } from "./ids";

export const PBKDF2_ITERATIONS = 100_000;
export const PBKDF2_HASH = "SHA-256";
export const PBKDF2_KEY_BITS = 256;
export const SALT_BYTES = 16;

export const SESSION_IDLE_TTL_MS = 60 * 60 * 1000;             // 1h idle
export const SESSION_ABSOLUTE_MAX_MS = 30 * 24 * 60 * 60 * 1000; // 30d hard cap
export const SESSION_RENEW_THRESHOLD_MS = 15 * 60 * 1000;       // slide only when <=15min remaining
export const SESSION_COOKIE_NAME = "sf_session";

export function newSalt(): string {
  const buf = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(buf);
  return toHex(buf);
}

async function deriveHashHex(password: string, saltHex: string): Promise<string> {
  const salt = fromHex(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: PBKDF2_HASH,
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    keyMaterial,
    PBKDF2_KEY_BITS,
  );
  return toHex(new Uint8Array(bits));
}

export interface PasswordHash {
  hash: string;
  salt: string;
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = newSalt();
  const hash = await deriveHashHex(password, salt);
  return { hash, salt };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  const candidate = await deriveHashHex(password, salt);
  return timingSafeEqual(candidate, hash);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// --- sessions --------------------------------------------------------------

export interface CreatedSession {
  /** Raw token to send to the client (cookie value). */
  token: string;
  /** sha256(token) stored in DB. */
  tokenHash: string;
  sessionId: string;
  /** Idle expiry — slides on near-expiry requests. */
  expiresAt: string;
  /** Hard ceiling — never extends past this. */
  absoluteMaxAt: string;
}

export async function createSessionRecord(): Promise<CreatedSession> {
  const token = newToken(32);
  const tokenHash = await sha256Hex(token);
  const sessionId = newUuid();
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_IDLE_TTL_MS).toISOString();
  const absoluteMaxAt = new Date(now + SESSION_ABSOLUTE_MAX_MS).toISOString();
  return { token, tokenHash, sessionId, expiresAt, absoluteMaxAt };
}

export interface CookieOptions {
  secure: boolean;
}

export function buildSessionCookie(
  token: string,
  opts: CookieOptions,
  maxAgeSeconds: number = Math.floor(SESSION_IDLE_TTL_MS / 1000),
): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (opts.secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildClearSessionCookie(opts: CookieOptions): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
  ];
  if (opts.secure) parts.push("Secure");
  return parts.join("; ");
}

export function readSessionCookie(req: Request): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq) === SESSION_COOKIE_NAME) return part.slice(eq + 1);
  }
  return null;
}

export function cookieSecureFromEnv(env: Env): boolean {
  return env.COOKIE_SECURE !== "false";
}
