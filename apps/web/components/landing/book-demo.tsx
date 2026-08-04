import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { getOnboardingHref } from "@/components/landing/urls"

const onboardingHref = getOnboardingHref()

/**
 * A native GET form: the three fields land on /onboarding as query params, so
 * the full demo-request form arrives prefilled. Nothing is submitted from the
 * marketing origin itself (Better Auth only trusts the app origin).
 */
export function BookDemo() {
  return (
    <section id="book-demo" className="bg-primary/10 px-3 py-14 sm:px-5 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <h2 className="text-balance font-heading font-normal text-3xl tracking-[-0.03em] sm:text-4xl">
            See Zimba on one of your own projects.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground leading-7">
            Tell us who you are and we&apos;ll walk you through expense
            tracking, budgets, and approvals — using numbers that look like
            yours. Every request is reviewed by our team before a workspace is
            created.
          </p>
        </div>

        <form
          action={onboardingHref}
          method="get"
          className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="demo-full-name">Full name</Label>
              <Input
                id="demo-full-name"
                name="fullName"
                autoComplete="name"
                placeholder="Jane Okello"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="demo-company-name">Company name</Label>
              <Input
                id="demo-company-name"
                name="companyName"
                autoComplete="organization"
                placeholder="Okello Constructions Ltd."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="demo-email">Work email</Label>
              <Input
                id="demo-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
              />
            </div>
            <Button type="submit" size="lg" className="mt-1 w-full">
              Book a Demo
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
