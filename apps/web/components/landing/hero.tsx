import { Button } from "@workspace/ui/components/button"

import { Header } from "@/components/landing/header"

export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-muted bg-[linear-gradient(to_right,rgba(0,0,0,0.62),rgba(0,0,0,0.18)),url('/hero.png')] bg-cover bg-center">
      <Header />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 py-24 sm:px-8 lg:px-10">
        <h1 className="max-w-3xl font-heading text-4xl leading-none font-normal tracking-[-0.04em] text-balance text-white sm:text-6xl lg:text-7xl">
          Track your project expenses as you build the future.
        </h1>

        <p className="mt-7 max-w-xl text-base leading-7 text-white/78 sm:text-xl">
          One clean place for construction and real estate teams to monitor
          expenses, budgets, approvals, and project cash flow.
        </p>

        <div className="mt-10">
          <Button size="lg" className="px-6">
            Learn more
          </Button>
        </div>
      </div>
    </section>
  )
}
