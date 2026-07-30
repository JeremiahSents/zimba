CREATE TABLE "platform_invitation" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"name" text NOT NULL,
	"role" varchar DEFAULT 'super_admin' NOT NULL,
	"token_hash" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"invited_by_id" text,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_invitation_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "platform_invitation" ADD CONSTRAINT "platform_invitation_invited_by_id_user_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "platform_invitation_status_email_idx" ON "platform_invitation" USING btree ("status","email");