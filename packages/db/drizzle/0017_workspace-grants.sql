CREATE TABLE "platform_workspace_grant" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" varchar NOT NULL,
	"role" varchar DEFAULT 'owner' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "via_grant_id" varchar;--> statement-breakpoint
ALTER TABLE "platform_workspace_grant" ADD CONSTRAINT "platform_workspace_grant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_workspace_grant" ADD CONSTRAINT "platform_workspace_grant_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "platform_workspace_grant_user_idx" ON "platform_workspace_grant" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "platform_workspace_grant_expires_idx" ON "platform_workspace_grant" USING btree ("expires_at");