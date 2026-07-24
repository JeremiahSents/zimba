import { index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"

import { user } from "./auth-schema"
import { organization } from "./organization-schema"

export const ownershipTransferRequest = pgTable(
  "ownership_transfer_request",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    toUserId: text("to_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: varchar("status").notNull().default("pending"),
    reason: text("reason"),
    reviewedBy: text("reviewed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { mode: "date" }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("ownership_transfer_status_idx").on(table.status),
    index("ownership_transfer_org_idx").on(table.organizationId),
  ]
)
