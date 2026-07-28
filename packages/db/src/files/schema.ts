import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"

import { user } from "../auth/schema"
import { organization } from "../organizations/schema"
import { project } from "../projects/schema"

export const file = pgTable("file", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  uploaderId: text("uploader_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  key: varchar("key").notNull().unique(),
  url: varchar("url").notNull(),
  filename: text("filename").notNull(),
  contentType: varchar("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  purpose: varchar("purpose").notNull(),
  status: varchar("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const projectAttachment = pgTable("project_attachment", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  projectId: varchar("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  fileId: varchar("file_id")
    .notNull()
    .references(() => file.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
