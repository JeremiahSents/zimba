import { describe, expect, it } from "vitest"
import { getMutationInvalidationPaths } from "./invalidation"

describe("mutation invalidation map", () => {
  it("keeps project mutations scoped to their affected paths", () => {
    expect(
      getMutationInvalidationPaths({
        workspaceSlug: "zimba-consultants",
        organizationId: "org-1",
        projectId: "project-1",
      })
    ).toEqual([
      "/zimba-consultants/home",
      "/zimba-consultants/projects/project-1",
      "/zimba-consultants/projects/project-1/files",
      "/zimba-consultants/expenses",
    ])
  })

  it("does not create global resource paths", () => {
    expect(
      getMutationInvalidationPaths({
        workspaceSlug: "zimba-consultants",
        expenseId: "expense-1",
      })
    ).toEqual([
      "/zimba-consultants/home",
      "/zimba-consultants/expenses/receipts/expense-1",
    ])
  })
})
