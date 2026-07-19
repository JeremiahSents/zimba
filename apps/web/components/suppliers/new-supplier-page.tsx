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
import { createSupplierAction } from "@/app/admin/suppliers/actions"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { ErrorNotice } from "@/components/shared/error-notice"
import type { PublicError } from "@/core/shared/errors"
import { SupplierForm } from "@/components/suppliers/supplier-form"

export function NewSupplierPage({ returnTo, categories }: { returnTo?: string; categories: { name: string; slug: string }[] }) {
  const router = useRouter()
  const [error, setError] = useState<PublicError | string>("")
  const [submitting, setSubmitting] = useState(false)
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
            {error ? (
              <ErrorNotice className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3" error={error} />
            ) : null}
            <SupplierForm
              initialCategories={categories}
              pending={submitting}
              onSubmit={async (values) => {
                setSubmitting(true)
                setError("")
                const result = await createSupplierAction(values)
                if (!result.success) {
                  setError(result.error)
                  setSubmitting(false)
                  return
                }
                const fallback = "/admin/suppliers"
                const destination = returnTo?.startsWith("/admin/")
                  ? returnTo
                  : fallback
                const separator = destination.includes("?") ? "&" : "?"
                router.push(
                  `${destination}${separator}supplier=${encodeURIComponent(values.name)}`
                )
              }}
              onCancel={() =>
                router.push(
                  returnTo?.startsWith("/admin/")
                    ? returnTo
                    : "/admin/suppliers"
                )
              }
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
