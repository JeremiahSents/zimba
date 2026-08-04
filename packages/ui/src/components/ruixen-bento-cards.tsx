"use client"

import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps } from "react"

export type BentoCard = {
  title: string
  description: string
}

const defaultCards: BentoCard[] = [
  {
    title: "Beautiful Components",
    description:
      "Ready-made components built with consistent design and performance in mind.",
  },
  {
    title: "Developer Friendly",
    description:
      "Simple APIs and excellent documentation make it easy to integrate and customize.",
  },
  {
    title: "Flexible Layouts",
    description:
      "Design dynamic, responsive layouts using grid utilities and flex-based helpers. Whether you're building dashboards, landing pages, or nested components, composable layout primitives scale beautifully across screen sizes.",
  },
  {
    title: "Dark Mode Support",
    description:
      "Every component is designed to work seamlessly in both light and dark themes.",
  },
  {
    title: "Fast & Lightweight",
    description:
      "Built for speed and performance, ensuring quick load times without sacrificing quality.",
  },
]

/**
 * The five cards are placed by hand rather than in a loop: the bento rhythm
 * (3+2 over 4+2+2) is the design, so the spans belong with the layout and not
 * with the content.
 */
const cardSpans = [
  "lg:col-span-3 lg:row-span-2",
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-4 lg:row-span-1",
  "lg:col-span-2 lg:row-span-1",
  "lg:col-span-2 lg:row-span-1",
]

export function PlusCard({
  className,
  plusClassName,
  icon,
  title,
  description,
}: {
  className?: string
  /** Colours the four corner markers so a section can tint them to its accent. */
  plusClassName?: string
  icon?: ComponentProps<typeof HugeiconsIcon>["icon"]
  title: string
  description: string
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[200px] flex-col justify-between rounded-lg border border-border border-dashed bg-card p-6",
        className
      )}
    >
      <CornerPlusIcons className={plusClassName} />
      <div className="relative z-10 space-y-2">
        {icon ? (
          <HugeiconsIcon
            icon={icon}
            strokeWidth={1.8}
            className="mb-3 size-6 text-primary"
          />
        ) : null}
        <h3 className="font-bold text-foreground text-xl">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function CornerPlusIcons({ className }: { className?: string }) {
  return (
    <>
      <PlusMark className={cn("-top-3 -left-3", className)} />
      <PlusMark className={cn("-top-3 -right-3", className)} />
      <PlusMark className={cn("-bottom-3 -left-3", className)} />
      <PlusMark className={cn("-bottom-3 -right-3", className)} />
    </>
  )
}

function PlusMark({ className }: { className?: string }) {
  return (
    <HugeiconsIcon
      icon={PlusSignIcon}
      strokeWidth={1}
      aria-hidden
      className={cn("absolute size-6 text-foreground", className)}
    />
  )
}

export default function RuixenBentoCards({
  cards = defaultCards,
  heading = "Built for performance. Designed for flexibility.",
  description = "Each component is thoughtfully designed to be flexible, reusable, and accessible.",
}: {
  cards?: BentoCard[]
  heading?: string
  description?: string
}) {
  return (
    <section className="border border-border bg-background">
      <div className="container mx-auto border border-border border-t-0 px-4 py-12">
        <div className="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {cards.map((card, index) => (
            <PlusCard
              key={card.title}
              title={card.title}
              description={card.description}
              className={cardSpans[index % cardSpans.length]}
            />
          ))}
        </div>

        <div className="ml-auto mt-6 max-w-2xl px-4 text-right lg:-mt-20">
          <h2 className="mb-4 font-bold text-4xl text-foreground md:text-6xl">
            {heading}
          </h2>
          <p className="text-lg text-muted-foreground">{description}</p>
        </div>
      </div>
    </section>
  )
}
