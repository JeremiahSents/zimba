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
import { useState } from "react"
import { createSupplierAction } from "@/app/admin/actions"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { SupplierForm } from "@/components/suppliers/supplier-form"
import { storeSupplier } from "@/lib/supplier-store"
import type { DashboardSource } from "@/lib/types"

export function NewSupplierPage({ source }: { source: DashboardSource }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  return (
    <DashboardShell
      title="New supplier"
      subtitle=""      focusedTask
    >
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
            {error ? (
              <p className="mb-4 text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <SupplierForm
              pending={submitting}
              onSubmit={async (values) => {
                setSubmitting(true)
                setError("")
                const result = await createSupplierAction(values)
                if (!result.ok) {
                  setError(result.error)
                  setSubmitting(false)
                  return
                }
                if (result.data.persistence === "client") storeSupplier(values)
                router.push("/admin/suppliers")
                router.refresh()
              }}
              onCancel={() => router.push("/admin/suppliers")}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
