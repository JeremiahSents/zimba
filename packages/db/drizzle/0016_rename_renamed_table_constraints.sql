-- Postgres keeps the original constraint names when a table is renamed, so
-- after 0015 the member and ownership_transfer tables still carried constraints
-- named after organization_member and ownership_transfer_request.
--
-- drizzle-kit generate cannot emit this: it diffs the TS schema against the
-- snapshot, and those already agree — only the names inside the database lag.

ALTER TABLE "member" RENAME CONSTRAINT "organization_member_organization_id_organization_id_fk" TO "member_organization_id_organization_id_fk";--> statement-breakpoint
ALTER TABLE "member" RENAME CONSTRAINT "organization_member_user_id_user_id_fk" TO "member_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "member" RENAME CONSTRAINT "organization_member_pkey" TO "member_pkey";--> statement-breakpoint

ALTER TABLE "ownership_transfer" RENAME CONSTRAINT "ownership_transfer_request_organization_id_organization_id_fk" TO "ownership_transfer_organization_id_organization_id_fk";--> statement-breakpoint
ALTER TABLE "ownership_transfer" RENAME CONSTRAINT "ownership_transfer_request_from_user_id_user_id_fk" TO "ownership_transfer_from_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "ownership_transfer" RENAME CONSTRAINT "ownership_transfer_request_to_user_id_user_id_fk" TO "ownership_transfer_to_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "ownership_transfer" RENAME CONSTRAINT "ownership_transfer_request_reviewed_by_user_id_fk" TO "ownership_transfer_reviewed_by_user_id_fk";--> statement-breakpoint
ALTER TABLE "ownership_transfer" RENAME CONSTRAINT "ownership_transfer_request_pkey" TO "ownership_transfer_pkey";
