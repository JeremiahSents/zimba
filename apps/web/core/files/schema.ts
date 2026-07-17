import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { organization } from "../organizations/schema"
import { user } from "../auth/schema"

export const uploadedFile = pgTable("uploaded_file", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  uploaderId: varchar("uploader_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  key: varchar("key").notNull().unique(),
  url: varchar("url").notNull(),
  filename: text("filename").notNull(),
  contentType: varchar("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  purpose: varchar("purpose").notNull(), // attachment, receipt
  status: varchar("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const projectAttachment = pgTable("project_attachment", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  projectId: varchar("project_id").notNull(), // ref to project.id (no strict fk to avoid circular imports, or we can use late binding)
  fileId: varchar("file_id")
    .notNull()
    .references(() => uploadedFile.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
