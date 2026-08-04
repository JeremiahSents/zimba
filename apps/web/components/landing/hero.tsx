import { Button } from "@workspace/ui/components/button"
import Image from "next/image"
import Link from "next/link"

import { Header } from "@/components/landing/header"

export function Hero() {
  return (
    <section className="bg-primary/10 p-3 sm:p-5">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-3xl bg-[oklch(0.24_0.05_166)] pb-4 sm:pb-6">
        <Header />

        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.6fr_1fr] lg:items-end">
            <h1 className="text-balance font-heading font-normal text-4xl text-white leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Every project shilling, accounted for.
            </h1>

            <div className="max-w-sm lg:justify-self-end">
              <p className="text-sm text-white/75 leading-6 sm:text-base">
                Zimba gives construction and real estate teams one clean place
                to track expenses, budgets, approvals, and project cash flow.
              </p>
              <div className="mt-6">
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href="#book-demo" />}
                  className="px-6"
                >
                  Book a Demo
                </Button>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src="/hero.png"
              alt="Construction team working on site"
              width={1680}
              height={945}
              priority
              className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[480px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
