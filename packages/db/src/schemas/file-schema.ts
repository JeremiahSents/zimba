import { relations } from "drizzle-orm"
import {
  bigint,
  boolean,
  integer,
  jsonb,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import { user } from "./auth-schema"
import { organization } from "./organization-schema"
import { project } from "./project-schema"

export const uploadedFile = pgTable("file", {
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

export const document = pgTable("document", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  fileId: varchar("file_id")
    .notNull()
    .references(() => uploadedFile.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const documentLink = pgTable("document_link", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  documentId: varchar("document_id")
    .notNull()
    .references(() => document.id, { onDelete: "cascade" }),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
    .references(() => uploadedFile.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
