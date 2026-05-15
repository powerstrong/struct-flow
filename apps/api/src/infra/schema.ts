// Drizzle schema mirroring migrations/0001_init.sql. The migration file is the source of truth;
// this file gives Drizzle typed access. When changing schema: write new migration, then update here.

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey().notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    salt: text("salt").notNull(),
    displayName: text("display_name"),
    isAdmin: integer("is_admin").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({ emailIdx: index("idx_users_email").on(t.email) }),
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({
    tokenIdx: index("idx_sessions_token_hash").on(t.tokenHash),
    userIdx: index("idx_sessions_user_id").on(t.userId),
  }),
);

export const proEntitlements = sqliteTable(
  "pro_entitlements",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id").notNull(),
    plan: text("plan").notNull().default("pro-1y"),
    status: text("status").notNull().default("active"),
    grantedAt: text("granted_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    grantedBy: text("granted_by"),
    adminMemo: text("admin_memo"),
    source: text("source").notNull().default("manual"),
  },
  (t) => ({
    userIdx: index("idx_pro_user_id").on(t.userId),
    statusIdx: index("idx_pro_status").on(t.status),
  }),
);

export const calcHistory = sqliteTable(
  "calc_history",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id").notNull(),
    toolSlug: text("tool_slug").notNull(),
    toolVersion: text("tool_version").notNull(),
    inputJson: text("input_json").notNull(),
    resultJson: text("result_json").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({ userCreatedIdx: index("idx_history_user_created").on(t.userId, t.createdAt) }),
);

export const adminAuditLogs = sqliteTable(
  "admin_audit_logs",
  {
    id: text("id").primaryKey().notNull(),
    adminUserId: text("admin_user_id").notNull(),
    actionType: text("action_type").notNull(),
    targetUserId: text("target_user_id"),
    payloadJson: text("payload_json").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({ createdIdx: index("idx_audit_created").on(t.createdAt) }),
);
