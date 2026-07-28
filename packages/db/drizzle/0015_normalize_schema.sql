-- Normalize table and column names, and remove duplicated structure.
--
-- Written by hand rather than generated, because drizzle-kit resolves a
-- disappeared table plus an appeared table as DROP + CREATE. Every rename below
-- is an ALTER ... RENAME so the rows survive.
--
-- Verified against the live database before writing:
--   * the five legacy tables are byte-for-byte duplicates of their replacements
--     and nothing holds a foreign key to them
--   * expense.receipt_file_id, payment.payable_id and project.archived_by have
--     zero orphans, so the new foreign keys validate immediately
--   * expense_line.allocation_id never disagrees with budget_item_id
--   * project.plot_size never disagrees with land_size

--> statement-breakpoint
-- Empty tables no code reads.
DROP TABLE IF EXISTS "document_link" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "document" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "member_project" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "payment_receipt" CASCADE;--> statement-breakpoint

-- Fold activity_event into audit_log behind a "kind" discriminator.
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "kind" varchar DEFAULT 'audit' NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ALTER COLUMN "actor_id" DROP NOT NULL;--> statement-breakpoint
INSERT INTO "audit_log" ("id", "organization_id", "actor_id", "kind", "action", "entity_type", "entity_id", "changes", "created_at")
SELECT "id", "organization_id", "actor_id", 'activity', "action", "entity_type", "entity_id", "metadata", "created_at"
FROM "activity_event"
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
DROP TABLE IF EXISTS "activity_event" CASCADE;--> statement-breakpoint

-- Superseded copies left behind by 0012, which created the replacements but
-- never completed its own drops.
DROP TABLE IF EXISTS "allocation" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "ledger_payment" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "uploaded_file" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "audit_event" CASCADE;--> statement-breakpoint
-- Dropped before the rename below claims the name.
DROP TABLE IF EXISTS "member" CASCADE;--> statement-breakpoint

-- Renames. Data is carried across.
ALTER TABLE "organization_member" RENAME TO "member";--> statement-breakpoint
ALTER TABLE "ownership_transfer_request" RENAME TO "ownership_transfer";--> statement-breakpoint
ALTER TABLE "expense" RENAME COLUMN "payment_status" TO "status";--> statement-breakpoint
ALTER TABLE "organization" RENAME COLUMN "base_currency" TO "currency";--> statement-breakpoint
ALTER INDEX "organization_member_org_user_unique" RENAME TO "member_org_user_unique";--> statement-breakpoint
ALTER INDEX "session_userId_idx" RENAME TO "session_user_id_idx";--> statement-breakpoint
ALTER INDEX "account_userId_idx" RENAME TO "account_user_id_idx";--> statement-breakpoint

-- Columns that only ever mirrored another column.
ALTER TABLE "expense_line" DROP COLUMN IF EXISTS "allocation_id";--> statement-breakpoint
ALTER TABLE "project" DROP COLUMN IF EXISTS "plot_size";--> statement-breakpoint

-- One project_attachment row points at a project that no longer exists, so no
-- query can reach it. It has to go before the foreign key below can hold.
DELETE FROM "project_attachment" pa
WHERE NOT EXISTS (SELECT 1 FROM "project" p WHERE p.id = pa."project_id");--> statement-breakpoint

-- Foreign keys for columns that always pointed at a row but never said so.
-- The audit_log, file, platform_audit_log and project_attachment keys were
-- declared in the schema but never created by the hand-written 0005-0011
-- migrations; all of them validate against the current data.
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_uploader_id_user_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD CONSTRAINT "platform_audit_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD CONSTRAINT "platform_audit_log_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachment" ADD CONSTRAINT "project_attachment_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_receipt_file_id_file_id_fk" FOREIGN KEY ("receipt_file_id") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_payable_id_payable_id_fk" FOREIGN KEY ("payable_id") REFERENCES "public"."payable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "archived_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_archived_by_user_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- A payment settles an expense or a payable, never both. Rows that predate both
-- links carry neither, so "neither" stays permitted.
ALTER TABLE "payment" ADD CONSTRAINT "payment_single_target" CHECK (not ("payment"."expense_id" is not null and "payment"."payable_id" is not null));
