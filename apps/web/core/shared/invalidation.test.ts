import { describe, expect, it } from "vitest"
import { getMutationInvalidationPaths } from "./invalidation"

describe("mutation invalidation map", () => {
  it("keeps project mutations scoped to their affected paths", () => {
    expect(
      getMutationInvalidationPaths({
        organizationId: "org-1",
        projectId: "project-1",
      })
    ).toEqual([
      "/admin/home",
      "/admin/projects/project-1",
      "/admin/projects/project-1/files",
      "/admin/expenses",
    ])
  })

  it("does not create global resource paths", () => {
    expect(getMutationInvalidationPaths({ expenseId: "expense-1" })).toEqual([
      "/admin/home",
      "/admin/expenses/receipts/expense-1",
    ])
  })
})
