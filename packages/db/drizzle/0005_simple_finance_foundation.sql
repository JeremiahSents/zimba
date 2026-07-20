ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "base_currency" varchar DEFAULT 'UGX' NOT NULL;
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_member" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar NOT NULL,
	"responsibility" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "organization_member" ("id", "organization_id", "user_id", "role", "responsibility")
SELECT "id", "organization_id", "user_id", "role", "responsibility"
FROM "member"
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organization_member_org_user_unique" ON "organization_member" USING btree ("organization_id","user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar DEFAULT 'support' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_user" ADD CONSTRAINT "platform_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "budget_item" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"project_id" varchar NOT NULL,
	"name" text NOT NULL,
	"budget_cents" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "budget_item" ("id", "organization_id", "project_id", "name", "budget_cents", "created_at", "updated_at")
SELECT "id", "organization_id", "project_id", "name", "budget_cents", "created_at", "updated_at"
FROM "allocation"
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "budget_item" ADD CONSTRAINT "budget_item_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "budget_item" ADD CONSTRAINT "budget_item_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "expense_line" ADD COLUMN IF NOT EXISTS "budget_item_id" varchar;
--> statement-breakpoint
UPDATE "expense_line" SET "budget_item_id" = "allocation_id" WHERE "budget_item_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "expense_line" ALTER COLUMN "budget_item_id" SET NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_line" ADD CONSTRAINT "expense_line_budget_item_id_budget_item_id_fk" FOREIGN KEY ("budget_item_id") REFERENCES "public"."budget_item"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment" (
	"id" varchar PRIMARY KEY NOT NULL,
	"expense_id" varchar,
	"payable_id" varchar,
	"organization_id" varchar NOT NULL,
	"supplier_id" varchar,
	"amount_cents" bigint DEFAULT 0 NOT NULL,
	"currency" varchar DEFAULT 'UGX' NOT NULL,
	"payment_date" timestamp,
	"method" varchar,
	"reference" text,
	"idempotency_key" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "payment" ("id", "expense_id", "payable_id", "organization_id", "supplier_id", "amount_cents", "currency", "payment_date", "method", "reference", "idempotency_key", "created_at", "updated_at")
SELECT "id", "expense_id", "payable_id", "organization_id", "supplier_id", "amount_cents", "currency", "payment_date", "method", "reference", "idempotency_key", "created_at", "updated_at"
FROM "ledger_payment"
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment" ADD CONSTRAINT "payment_expense_id_expense_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expense"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment" ADD CONSTRAINT "payment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment" ADD CONSTRAINT "payment_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payment_org_idempotency_unique" ON "payment" USING btree ("organization_id","idempotency_key");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_receipt" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"payment_id" varchar NOT NULL,
	"receipt_number" varchar NOT NULL,
	"file_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"uploader_id" text NOT NULL,
	"key" varchar NOT NULL,
	"url" varchar NOT NULL,
	"filename" text NOT NULL,
	"content_type" varchar NOT NULL,
	"size_bytes" integer NOT NULL,
	"purpose" varchar NOT NULL,
	"status" varchar DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "file_key_unique" UNIQUE("key")
);
--> statement-breakpoint
INSERT INTO "file" ("id", "organization_id", "uploader_id", "key", "url", "filename", "content_type", "size_bytes", "purpose", "status", "created_at", "updated_at")
SELECT "id", "organization_id", "uploader_id", "key", "url", "filename", "content_type", "size_bytes", "purpose", "status", "created_at", "updated_at"
FROM "uploaded_file"
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"file_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_link" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"document_id" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"actor_id" text NOT NULL,
	"action" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"changes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "audit_log" ("id", "organization_id", "actor_id", "action", "entity_type", "entity_id", "changes", "created_at")
SELECT "id", "organization_id", "actor_id", "action", "entity_type", "entity_id", "changes", "created_at"
FROM "audit_event"
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_event" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"actor_id" text,
	"action" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
