CREATE UNIQUE INDEX IF NOT EXISTS platform_user_user_unique ON platform_user (user_id);
CREATE TABLE IF NOT EXISTS platform_audit_log (
  id varchar PRIMARY KEY NOT NULL,
  actor_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  target_user_id text REFERENCES "user"(id) ON DELETE SET NULL,
  operation varchar NOT NULL,
  old_role varchar,
  new_role varchar,
  metadata jsonb,
  created_at timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS platform_audit_log_created_at_idx ON platform_audit_log (created_at);
