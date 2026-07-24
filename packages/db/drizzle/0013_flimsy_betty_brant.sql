CREATE TABLE "onboarding_application" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"company_name" varchar NOT NULL,
	"company_website" varchar,
	"industry" varchar,
	"country" varchar,
	"phone" varchar,
	"team_size" varchar,
	"use_case" text,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"organization_id" varchar,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ownership_transfer_request" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "onboarding_application" ADD CONSTRAINT "onboarding_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_application" ADD CONSTRAINT "onboarding_application_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_application" ADD CONSTRAINT "onboarding_application_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ownership_transfer_request" ADD CONSTRAINT "ownership_transfer_request_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ownership_transfer_request" ADD CONSTRAINT "ownership_transfer_request_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ownership_transfer_request" ADD CONSTRAINT "ownership_transfer_request_to_user_id_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ownership_transfer_request" ADD CONSTRAINT "ownership_transfer_request_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "onboarding_application_status_idx" ON "onboarding_application" USING btree ("status");--> statement-breakpoint
CREATE INDEX "onboarding_application_user_idx" ON "onboarding_application" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ownership_transfer_status_idx" ON "ownership_transfer_request" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ownership_transfer_org_idx" ON "ownership_transfer_request" USING btree ("organization_id");