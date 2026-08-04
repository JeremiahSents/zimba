ALTER TABLE "onboarding_application" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "onboarding_application_email_idx" ON "onboarding_application" USING btree ("email");