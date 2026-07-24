import type { Metadata } from "next"
import { NewSupplierPage } from "@/components/suppliers/new-supplier-page"
import { getSupplierCategories } from "@/core/suppliers/service"

export const metadata: Metadata = {
  title: "New supplier | Zimba",
  description: "Create a supplier profile for Zimba.",
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const [{ returnTo }, categories] = await Promise.all([
    searchParams,
    getSupplierCategories(),
  ])
  return (
    <NewSupplierPage
      returnTo={returnTo}
      categories={categories.map(({ name, slug }) => ({ name, slug }))}
    />
  )
}
