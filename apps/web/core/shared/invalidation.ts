export type InvalidationIdentity = {
  workspaceSlug: string
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
  const root = `/${identity.workspaceSlug}`
  const paths = new Set<string>([`${root}/home`])
  if (identity.projectId) {
    paths.add(`${root}/projects/${identity.projectId}`)
    paths.add(`${root}/projects/${identity.projectId}/files`)
  }
  if (identity.expenseId)
    paths.add(`${root}/expenses/receipts/${identity.expenseId}`)
  if (identity.supplierId) paths.add(`${root}/suppliers/${identity.supplierId}`)
  if (identity.organizationId) paths.add(`${root}/expenses`)
  return [...paths]
}
