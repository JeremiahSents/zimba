ALTER TABLE "file" DROP CONSTRAINT "file_uploader_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_invited_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "platform_audit_log" DROP CONSTRAINT "platform_audit_log_actor_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "file" ALTER COLUMN "uploader_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "invited_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ALTER COLUMN "actor_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deactivated_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deactivated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deactivation_reason" text;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_uploader_id_user_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD CONSTRAINT "platform_audit_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;