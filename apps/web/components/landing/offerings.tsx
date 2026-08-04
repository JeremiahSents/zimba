import {
  CheckmarkCircle02Icon,
  CoinsDollarIcon,
  Invoice01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"
import { PlusCard } from "@workspace/ui/components/ruixen-bento-cards"
import type { HugeiconsIcon } from "@hugeicons/react"
import type { ComponentProps } from "react"

type Card = {
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
  title: string
  body: string
  span: string
}

const cards: Card[] = [
  {
    icon: Invoice01Icon,
    title: "Expense tracking",
    body: "Log every cost against the project it belongs to — materials, labour, transport, permits. Nothing lands in a shared pot nobody can't explain later.",
    span: "lg:col-span-4",
  },
  {
    icon: CheckmarkCircle02Icon,
    title: "Approvals",
    body: "Requests route to the right person and clear in minutes, not site visits.",
    span: "lg:col-span-2",
  },
  {
    icon: CoinsDollarIcon,
    title: "Budgets & cash flow",
    body: "Set a budget per project, watch the burn as it happens, and see what is going out this week across every active site.",
    span: "lg:col-span-2",
  },
  {
    icon: SmartPhone01Icon,
    title: "Capture from the field",
    body: "Site teams snap a receipt and log the expense before they leave the gate. No end-of-month envelope of paper.",
    span: "lg:col-span-4",
  },
]

export function Offerings() {
  return (
    <section id="product" className="bg-background px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl rounded-2xl border border-primary/20 border-dashed p-5 sm:p-8">
        <h2 className="max-w-2xl text-balance font-heading font-normal text-3xl tracking-[-0.03em] sm:text-4xl">
          Everything it takes to keep a project on budget.
        </h2>

        <div className="mt-10 grid auto-rows-auto grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {cards.map((card) => (
            <PlusCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.body}
              className={`border-primary/30 bg-transparent ${card.span}`}
              plusClassName="text-primary/50"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
