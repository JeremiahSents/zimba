import type { AdminSupplierWithStatsDto } from "@workspace/api"
import { SuppliersTable } from "@/components/org-detail/suppliers-table"

export function OrgDetailSuppliersTab({
  suppliers,
  currency,
}: {
  suppliers: AdminSupplierWithStatsDto[]
  currency: string
}) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <section>
        <p className="mb-2 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
          Organization suppliers
        </p>
      </section>

      <SuppliersTable
        suppliers={suppliers}
        currency={currency}
        title="Suppliers"
      />
    </div>
  )
}
