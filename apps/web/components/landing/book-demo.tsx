import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DemoForm } from "@/components/landing/demo-form"

const reassurances = [
  "A walkthrough on your own project numbers",
  "Reviewed and answered within one working day",
]

/**
 * The request is recorded straight from the marketing site — no account needed.
 * A super admin reviews it, and the applicant registers afterwards.
 */
export function BookDemo() {
  return (
    <section
      id="book-demo"
      className="border-primary/20 border-t bg-primary/10 px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_460px] lg:gap-14">
        <div>
          <h2 className="text-balance font-heading font-normal text-3xl tracking-[-0.03em] sm:text-4xl">
            See Zimba on one of your own projects.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground leading-7">
            Tell us who you are and we&apos;ll walk you through expense
            tracking, budgets, and approvals using your numbers.
          </p>

          <ul className="mt-7 space-y-3">
            {reassurances.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-foreground text-sm"
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={1.8}
                  aria-hidden
                  className="mt-0.5 size-4.5 shrink-0 text-primary"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <DemoForm />
      </div>
    </section>
  )
}
