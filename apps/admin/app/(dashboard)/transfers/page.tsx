import { redirect } from "next/navigation"

export default function TransfersPage() {
  redirect("/applications?tab=transfers")
}
