CREATE UNIQUE INDEX "organization_slug_unique" ON "organization" USING btree ("slug");
--> statement-breakpoint
CREATE UNIQUE INDEX "member_organization_user_unique" ON "member" USING btree ("organization_id", "user_id");
