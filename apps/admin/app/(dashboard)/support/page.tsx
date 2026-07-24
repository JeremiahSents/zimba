import { PageHeader } from "@/components/page-header"

export default function SupportPage() {
  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="Support & Admin Notes"
        description="Internal tracking of tenant issues and operations."
      />

      <div className="rounded-md border p-8 text-center">
        <h3 className="font-semibold text-base">
          Support tracking is not connected
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground text-sm">
          Support tickets and internal customer notes will appear here after a
          real support or admin-notes data model is added.
        </p>
      </div>
    </div>
  )
}
