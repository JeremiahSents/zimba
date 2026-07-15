"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { SupplierForm } from "@/components/suppliers/supplier-form"
import { storeSupplier } from "@/lib/supplier-store"

export function NewSupplierPage() {
  const router = useRouter()
  return (
    <DashboardShell title="New supplier" subtitle="" focusedTask>
      <div className="grid gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/suppliers">
                    Suppliers
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>New supplier</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h2 className="mt-2 font-heading font-semibold text-xl">
              Create a supplier
            </h2>
            <p className="mt-1 text-muted-foreground text-xs">
              These details will appear on the supplier profile and expense
              dropdowns.
            </p>
          </div>
        </div>
        <Card className="mx-auto w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Supplier details</CardTitle>
            <CardDescription>
              Contact details help the team follow up on receipts and
              outstanding balances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupplierForm
              onSubmit={(values) => {
                storeSupplier(values)
                router.push("/admin/suppliers")
              }}
              onCancel={() => router.push("/admin/suppliers")}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
