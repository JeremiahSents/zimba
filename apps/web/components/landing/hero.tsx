import Image from "next/image"

import { Button } from "@workspace/ui/components/button"

import { Header } from "@/components/landing/header"

export function Hero() {
  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <Image
        src="/hero.png"
        alt="Construction team reviewing project expenses"
        fill
        priority
        className="-z-10 object-cover"
        sizes="100vw"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/30 to-black/10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-black/75 via-black/40 to-transparent"
      />

      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-24 sm:px-8 lg:px-10">
        <h1 className="max-w-2xl font-heading text-5xl font-medium tracking-[-0.03em] text-balance text-white sm:text-6xl lg:text-7xl">
          Cleaner project spend. Built on Zimba.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
          One clean place for construction and real estate teams to monitor
          expenses, budgets, approvals, and project cash flow.
        </p>

        <div className="mt-8">
          <Button size="lg" className="px-6">
            Learn more
          </Button>
        </div>
      </div>
    </section>
  )
}
