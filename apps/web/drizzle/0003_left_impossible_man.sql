CREATE TABLE IF NOT EXISTS "invitation" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"invited_by" varchar NOT NULL,
	"name" text NOT NULL,
	"email" varchar NOT NULL,
	"role" varchar NOT NULL,
	"responsibility" text,
	"token_hash" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member_project" (
	"id" varchar PRIMARY KEY NOT NULL,
	"member_id" varchar NOT NULL,
	"project_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_event" (
	"id" varchar PRIMARY KEY NOT NULL,
	"organization_id" varchar NOT NULL,
	"actor_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"changes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN IF NOT EXISTS "responsibility" text;--> statement-breakpoint
DO $$ BEGIN
  IF to_regclass('public.project') IS NOT NULL THEN
    ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "archived_at" timestamp;
    ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "archived_by" varchar;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF to_regclass('public.ledger_payment') IS NOT NULL THEN
    ALTER TABLE "ledger_payment" ADD COLUMN IF NOT EXISTS "idempotency_key" varchar;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitation_organization_id_organization_id_fk') THEN
    ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitation_invited_by_user_id_fk') THEN
    ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'member_project_member_id_member_id_fk') THEN
    ALTER TABLE "member_project" ADD CONSTRAINT "member_project_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF to_regclass('public.project') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'member_project_project_id_project_id_fk') THEN
    ALTER TABLE "member_project" ADD CONSTRAINT "member_project_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_event_organization_id_organization_id_fk') THEN
    ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_event_actor_id_user_id_fk') THEN
    ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "member_project_unique" ON "member_project" USING btree ("member_id","project_id");--> statement-breakpoint
DO $$ BEGIN
  IF to_regclass('public.ledger_payment') IS NOT NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS "ledger_payment_org_idempotency_unique" ON "ledger_payment" USING btree ("organization_id","idempotency_key");
  END IF;
END $$;
