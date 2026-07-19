ALTER TABLE "allocation" ALTER COLUMN "budget_cents" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "expense_line" ALTER COLUMN "unit_rate_cents" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "expense_line" ALTER COLUMN "amount_cents" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "ledger_payment" ALTER COLUMN "amount_cents" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "payable" ALTER COLUMN "amount_cents" SET DATA TYPE bigint;