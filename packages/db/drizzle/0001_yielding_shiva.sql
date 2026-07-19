ALTER TABLE "supplier" ADD COLUMN "email" varchar;--> statement-breakpoint
ALTER TABLE "supplier" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "supplier" ADD COLUMN "company_contact" text;--> statement-breakpoint
ALTER TABLE "supplier" ADD COLUMN "contact_name" text;--> statement-breakpoint
ALTER TABLE "ledger_payment" ADD COLUMN "expense_id" varchar;--> statement-breakpoint
ALTER TABLE "ledger_payment" ADD COLUMN "method" varchar;--> statement-breakpoint
ALTER TABLE "ledger_payment" ADD COLUMN "reference" text;