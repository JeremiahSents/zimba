CREATE INDEX IF NOT EXISTS invitation_status_hash_idx ON invitation (status, token_hash);
CREATE INDEX IF NOT EXISTS platform_user_role_idx ON platform_user (role);
CREATE INDEX IF NOT EXISTS expense_org_project_idx ON expense (organization_id, project_id);
