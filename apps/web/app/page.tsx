import type { Metadata } from "next"

import { Footer, Hero, TrustedBy } from "@/components/landing"

export const metadata: Metadata = {
  title: "Zimba | Expense tracking for construction teams",
  description:
    "Zimba helps construction and real estate companies track expenses, budgets, approvals, and project cash flow.",
}

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <Hero />
      <TrustedBy />
      <Footer />
    </main>
  )
}
