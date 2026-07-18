import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SupplierDetailPage } from "@/components/suppliers/supplier-detail-page"
import { getDashboardOverviewData } from "@/core/dashboard/service"
import { getSupplierBySlug } from "@/lib/supplier-data"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `${slug.replaceAll("-", " ")} | Suppliers | Zimba`,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [{ slug }, data] = await Promise.all([
    params,
    getDashboardOverviewData(),
  ])
  const supplier = getSupplierBySlug(slug, data.suppliers)
  if (!supplier) notFound()
  return (
    <SupplierDetailPage
      supplier={supplier}
      expenses={data.expenses}
    />
  )
}
