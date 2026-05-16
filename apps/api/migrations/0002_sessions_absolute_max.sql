-- 0002_sessions_absolute_max.sql — add absolute_max_at to cap rolling session renewals.
-- Rolling sessions slide expires_at by idle TTL on near-expiry requests, but absolute_max_at
-- enforces a hard ceiling so an indefinitely active client still terminates eventually.

ALTER TABLE sessions ADD COLUMN absolute_max_at TEXT;

-- Existing sessions (if any) get their current expires_at as the absolute cap so they
-- behave like non-rolling sessions until natural expiry.
UPDATE sessions SET absolute_max_at = expires_at WHERE absolute_max_at IS NULL;
