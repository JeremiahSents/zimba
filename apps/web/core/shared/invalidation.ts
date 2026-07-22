export type InvalidationIdentity = {
  organizationId?: string
  projectId?: string
  expenseId?: string
  supplierId?: string
}

/**
 * Returns the minimum web paths affected by a mutation. Keep this pure so
 * mutations can test invalidation without invoking Next.js cache APIs.
 */
export function getMutationInvalidationPaths(identity: InvalidationIdentity) {
  const paths = new Set<string>(["/admin/home"])
  if (identity.projectId) {
    paths.add(`/admin/projects/${identity.projectId}`)
    paths.add(`/admin/projects/${identity.projectId}/files`)
  }
  if (identity.expenseId) paths.add(`/admin/expenses/receipts/${identity.expenseId}`)
  if (identity.supplierId) paths.add(`/admin/suppliers/${identity.supplierId}`)
  if (identity.organizationId) paths.add("/admin/expenses")
  return [...paths]
}
