ALTER TABLE "invitation" DROP CONSTRAINT IF EXISTS "invitation_accepted_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "invitation" DROP COLUMN IF EXISTS "accepted_by";
