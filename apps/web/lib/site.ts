/**
 * The marketing host. `proxy.ts` keeps this origin separate from the app
 * (app.zimba.digital) and admin hosts, so it is the only one search engines
 * should ever index.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://zimba.digital"

export const SITE_NAME = "Zimba"

export const SITE_TAGLINE = "Expense tracking for construction teams"

export const SITE_DESCRIPTION =
  "Zimba helps construction and real estate companies track project expenses, budgets, approvals, and cash flow — every shilling tied to the project it belongs to."

/**
 * Everything behind auth or owned by another host. Listed once so robots.ts and
 * sitemap.ts cannot drift apart.
 */
export const PRIVATE_PATHS = [
  "/api/",
  "/workspace",
  "/onboarding",
  "/pending-approval",
  "/login",
  "/register",
  "/invite/",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/demo",
]

/** Marketing pages that should appear in the sitemap. */
export const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
]
