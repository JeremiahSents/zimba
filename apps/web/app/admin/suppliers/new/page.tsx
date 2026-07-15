import type { Metadata } from "next"
import { NewSupplierPage } from "@/components/suppliers/new-supplier-page"

export const metadata: Metadata = {
  title: "New supplier | Zimba",
  description: "Create a supplier profile for Zimba.",
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { returnTo } = await searchParams
  return <NewSupplierPage returnTo={returnTo} />
}
