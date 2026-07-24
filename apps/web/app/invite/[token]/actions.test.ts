import { beforeEach, describe, expect, it, vi } from "vitest"

const service = vi.hoisted(() => ({
  acceptInvitation: vi.fn(),
}))

const navigation = vi.hoisted(() => ({
  redirect: vi.fn((url: string): never => {
    throw Object.assign(new Error("NEXT_REDIRECT"), {
      digest: `NEXT_REDIRECT;replace;${url};false`,
    })
  }),
}))

vi.mock("@/core/team/service", () => service)
vi.mock("next/navigation", () => navigation)

import { acceptInvitationAction } from "./actions"

describe("acceptInvitationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects to the invited workspace team page after successful acceptance", async () => {
    service.acceptInvitation.mockResolvedValue("invited-workspace")
    const formData = new FormData()
    formData.set("token", "a".repeat(20))

    await expect(acceptInvitationAction(formData)).rejects.toMatchObject({
      digest: "NEXT_REDIRECT;replace;/invited-workspace/team;false",
    })

    expect(service.acceptInvitation).toHaveBeenCalledWith("a".repeat(20))
    expect(navigation.redirect).toHaveBeenCalledWith("/invited-workspace/team")
  })

  it("rejects malformed tokens as validation failures without accepting them", async () => {
    const formData = new FormData()
    formData.set("token", "short")

    await expect(acceptInvitationAction(formData)).rejects.toMatchObject({
      code: "VALIDATION_FAILED",
      message: "This invitation link is invalid.",
    })

    expect(service.acceptInvitation).not.toHaveBeenCalled()
    expect(navigation.redirect).not.toHaveBeenCalled()
  })
})
