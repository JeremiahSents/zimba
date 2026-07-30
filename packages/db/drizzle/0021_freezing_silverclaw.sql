ALTER TABLE "expense" ADD COLUMN "document_file_id" varchar;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "document_file_id" varchar;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_document_file_id_file_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_document_file_id_file_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;