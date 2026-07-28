"use client"

import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { visitOrganizationAction } from "@/core/organizations/actions"

export function VisitOrganizationButton({
  organizationId,
}: {
  organizationId: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVisit() {
    setLoading(true)
    setError(null)
    const result = await visitOrganizationAction(organizationId)
    if (result.success) {
      window.open(result.data.url, "_blank")
    } else {
      setError(result.error.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-destructive text-xs">{error}</span>}
      <Button
        variant="outline"
        size="sm"
        onClick={handleVisit}
        disabled={loading}
        className="h-8 gap-1.5 rounded-lg px-2.5"
      >
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          className="size-3.5 text-primary"
        />
        <span>{loading ? "Opening…" : "Visit"}</span>
      </Button>
    </div>
  )
}
