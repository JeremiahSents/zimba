import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { getOnboardingHref } from "@/components/landing/urls"

const onboardingHref = getOnboardingHref()

const reassurances = [
  "A walkthrough on your own project numbers",
  "Reviewed and answered within one working day",
]

/**
 * A native GET form: the three fields land on /onboarding as query params, so
 * the full demo-request form arrives prefilled. Nothing is submitted from the
 * marketing origin itself (Better Auth only trusts the app origin).
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

        <form
          action={onboardingHref}
          method="get"
          className="rounded-xl border border-primary/20 bg-background p-6 shadow-sm sm:p-7"
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="demo-full-name">Full name</Label>
              <Input
                id="demo-full-name"
                name="fullName"
                autoComplete="name"
                placeholder="Your name"
                className="rounded-md"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="demo-company-name">Company name</Label>
              <Input
                id="demo-company-name"
                name="companyName"
                autoComplete="organization"
                placeholder="Your company"
                className="rounded-md"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="demo-email">Email</Label>
              <Input
                id="demo-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="rounded-md"
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="mt-1 rounded-md w-full"
            >
              Book a Demo
            </Button>
            <p className="text-center text-muted-foreground text-xs leading-5">
              We&apos;ll only use these details to set up your demo.
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
