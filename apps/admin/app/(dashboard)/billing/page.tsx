import { PageHeader } from "@/components/page-header"

export default function BillingPage() {
  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="Billing & Plans"
        description="Monitor subscriptions, MRR, and payment health."
      />

      <div className="rounded-md border p-8 text-center">
        <h3 className="font-semibold text-base">Billing is not connected</h3>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground text-sm">
          Real subscription, plan, and MRR data will appear here after the
          billing provider is connected to the platform database.
        </p>
      </div>
    </div>
  )
}
