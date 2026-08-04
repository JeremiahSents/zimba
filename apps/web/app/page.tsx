import type { Metadata } from "next"

import {
  BookDemo,
  Footer,
  Hero,
  Offerings,
  TrustedBy,
} from "@/components/landing"

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
      <Offerings />
      <BookDemo />
      <Footer />
    </main>
  )
}
