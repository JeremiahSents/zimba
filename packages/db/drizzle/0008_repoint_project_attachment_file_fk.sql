ALTER TABLE "project_attachment"
  DROP CONSTRAINT IF EXISTS "project_attachment_file_id_uploaded_file_id_fk";
--> statement-breakpoint
ALTER TABLE "project_attachment"
  ADD CONSTRAINT "project_attachment_file_id_file_id_fk"
  FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;
