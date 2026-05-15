-- 0001_init.sql — Struct Flow MVP initial schema (D1 / SQLite).
-- 5 tables: users, sessions, pro_entitlements, calc_history, admin_audit_logs.

CREATE TABLE users (
  id            TEXT PRIMARY KEY NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt          TEXT NOT NULL,
  display_name  TEXT,
  is_admin      INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE sessions (
  id         TEXT PRIMARY KEY NOT NULL,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

CREATE TABLE pro_entitlements (
  id         TEXT PRIMARY KEY NOT NULL,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan       TEXT NOT NULL DEFAULT 'pro-1y',
  status     TEXT NOT NULL DEFAULT 'active',  -- active | revoked | expired
  granted_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  granted_by TEXT REFERENCES users(id),
  admin_memo TEXT,
  source     TEXT NOT NULL DEFAULT 'manual'   -- manual | toss
);

CREATE INDEX idx_pro_user_id ON pro_entitlements(user_id);
CREATE INDEX idx_pro_status ON pro_entitlements(status);

CREATE TABLE calc_history (
  id           TEXT PRIMARY KEY NOT NULL,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_slug    TEXT NOT NULL,
  tool_version TEXT NOT NULL,
  input_json   TEXT NOT NULL,
  result_json  TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_history_user_created ON calc_history(user_id, created_at DESC);

CREATE TABLE admin_audit_logs (
  id             TEXT PRIMARY KEY NOT NULL,
  admin_user_id  TEXT NOT NULL REFERENCES users(id),
  action_type    TEXT NOT NULL,
  target_user_id TEXT REFERENCES users(id),
  payload_json   TEXT NOT NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_created ON admin_audit_logs(created_at DESC);
