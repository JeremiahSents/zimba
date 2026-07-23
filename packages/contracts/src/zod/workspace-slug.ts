import { z } from "zod"

const RESERVED_ROUTE_NAMES = new Set([
  "admin",
  "api",
  "login",
  "register",
  "onboarding",
  "invite",
  "privacy",
  "terms",
  "settings",
  "auth",
  "www",
  "app",
])

export function normalizeSlug(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 54)
  return base || "workspace"
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_ROUTE_NAMES.has(slug)
}

export function generateUniqueSlug(
  base: string,
  existingSlugs: string[]
): string {
  const normalized = normalizeSlug(base)
  if (!isReservedSlug(normalized) && !existingSlugs.includes(normalized)) {
    return normalized
  }
  let suffix = 1
  let candidate = `${normalized}-${suffix}`
  while (existingSlugs.includes(candidate) || isReservedSlug(candidate)) {
    suffix++
    candidate = `${normalized}-${suffix}`
  }
  return candidate
}

export const workspaceSlugSchema = z
  .string()
  .trim()
  .min(2)
  .max(54)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .refine((slug) => !isReservedSlug(slug), {
    message: "This slug is reserved.",
  })

export type WorkspaceSlug = z.infer<typeof workspaceSlugSchema>
