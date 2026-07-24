CREATE TABLE "onboarding_application" (
  "id" varchar PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "full_name" varchar NOT NULL,
  "email" varchar NOT NULL,
  "company_name" varchar NOT NULL,
  "company_website" varchar,
  "industry" varchar,
  "country" varchar,
  "phone" varchar,
  "team_size" varchar,
  "use_case" text,
  "status" varchar NOT NULL DEFAULT 'pending',
  "organization_id" varchar REFERENCES "organization"("id") ON DELETE set null,
  "reviewed_by" text REFERENCES "user"("id") ON DELETE set null,
  "reviewed_at" timestamp,
  "rejection_reason" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "onboarding_application_status_idx" ON "onboarding_application" ("status");
CREATE INDEX "onboarding_application_user_idx" ON "onboarding_application" ("user_id");

CREATE TABLE "ownership_transfer_request" (
  "id" varchar PRIMARY KEY NOT NULL,
  "organization_id" varchar NOT NULL REFERENCES "organization"("id") ON DELETE cascade,
  "from_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "to_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "status" varchar NOT NULL DEFAULT 'pending',
  "reason" text,
  "reviewed_by" text REFERENCES "user"("id") ON DELETE set null,
  "reviewed_at" timestamp,
  "rejection_reason" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "ownership_transfer_status_idx" ON "ownership_transfer_request" ("status");
CREATE INDEX "ownership_transfer_org_idx" ON "ownership_transfer_request" ("organization_id");
