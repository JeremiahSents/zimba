import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SupplierDetailPage } from "@/components/suppliers/supplier-detail-page"
import { getDashboardOverviewData } from "@/lib/api/dashboard"
import { getSupplierBySlug } from "@/lib/supplier-data"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supplier = getSupplierBySlug(slug)
  return {
    title: supplier
      ? `${supplier.name} | Suppliers | Zimba`
      : "Supplier | Zimba",
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supplier = getSupplierBySlug(slug)
  if (!supplier) notFound()
  const data = await getDashboardOverviewData()
  return (
    <SupplierDetailPage supplierName={supplier.name} source={data.source} />
  )
}
