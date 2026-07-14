import type { Metadata } from "next"
import { NewSupplierPage } from "@/components/suppliers/new-supplier-page"

export const metadata: Metadata = {
  title: "New supplier | Zimba",
  description: "Create a supplier profile for Zimba.",
}

export default function Page() {
  return <NewSupplierPage />
}
