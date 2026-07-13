import { Button } from "@workspace/ui/components/button"

import { Header } from "@/components/landing/header"

export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-[linear-gradient(to_right,rgba(0,0,0,0.62),rgba(0,0,0,0.18)),url('/hero.png')] bg-center bg-cover bg-muted">
      <Header />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 py-24 sm:px-8 lg:px-10">
        <h1 className="max-w-3xl text-balance font-heading font-normal text-4xl text-white leading-none tracking-[-0.04em] sm:text-6xl lg:text-7xl">
          Track your project expenses as you build the future.
        </h1>

        <p className="mt-7 max-w-xl text-base text-white/78 leading-7 sm:text-xl">
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
