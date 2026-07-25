ALTER TABLE "invitation" DROP CONSTRAINT "invitation_accepted_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "invitation" DROP COLUMN "accepted_by";