import { index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"

import { user } from "./auth-schema"
import { organization } from "./organization-schema"

export const onboardingApplication = pgTable(
  "onboarding_application",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    fullName: varchar("full_name").notNull(),
    email: varchar("email").notNull(),
    companyName: varchar("company_name").notNull(),
    companyWebsite: varchar("company_website"),
    industry: varchar("industry"),
    country: varchar("country"),
    phone: varchar("phone"),
    teamSize: varchar("team_size"),
    useCase: text("use_case"),
    status: varchar("status").notNull().default("pending"),
    organizationId: varchar("organization_id").references(
      () => organization.id,
      {
        onDelete: "set null",
      }
    ),
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
    index("onboarding_application_status_idx").on(table.status),
    index("onboarding_application_user_idx").on(table.userId),
  ]
)
