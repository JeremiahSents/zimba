"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { formatCompactCurrency } from "@/lib/format-currency"

export type AdminSpendChartPoint = {
  month: string
  spentCents: number
  budgetCents: number
}

const chartConfig = {
  budgetCents: {
    color: "var(--border)",
    label: "Budget",
  },
  spentCents: {
    color: "var(--primary)",
    label: "Spent",
  },
} satisfies ChartConfig

export function SpendBarChart({
  data,
  currency,
}: {
  data: AdminSpendChartPoint[]
  currency: string
}) {
  const totalSpentCents = data.reduce((total, point) => total + point.spentCents, 0)
  const totalBudgetCents = data.reduce(
    (total, point) => total + point.budgetCents,
    0
  )
  const averageSpendCents = data.length > 0 ? totalSpentCents / data.length : 0
  const peak = data.reduce<AdminSpendChartPoint | undefined>(
    (peakPoint, point) =>
      !peakPoint || point.spentCents > peakPoint.spentCents ? point : peakPoint,
    undefined
  )

  return (
    <Card size="sm" className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-medium text-muted-foreground text-xs">
            Budget spend
          </CardTitle>
          <span className="inline-flex h-8 items-center rounded-md border bg-muted/50 px-3 font-medium text-[10px] text-muted-foreground">
            Current period
          </span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-base text-primary">
              {formatCompactCurrency(totalSpentCents, currency)}
            </span>
          </div>
          <span className="font-medium text-[10px] text-primary">
            Logged construction spend
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x border-y py-3">
          <MicroMetric
            label="Average / project"
            value={formatCompactCurrency(averageSpendCents, currency)}
          />
          <MicroMetric
            label="Budget used"
            value={`${Math.round((totalSpentCents / Math.max(totalBudgetCents, 1)) * 100)}%`}
          />
          <MicroMetric label="Peak project" value={peak?.month ?? "—"} />
        </div>
      </CardHeader>
      <CardContent className="mt-auto pb-4">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 16, right: 8, left: 0 }}
            barSize={36}
            barGap={5}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickFormatter={(value) =>
                `${Math.round(Number(value) / 100_000_000)}M`
              }
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              formatter={(value) =>
                formatCompactCurrency(Number(value), currency)
              }
            />
            <Bar
              dataKey="budgetCents"
              fill="var(--color-budgetCents)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="spentCents"
              fill="var(--color-spentCents)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function MicroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <p className="font-medium text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground text-xs">{value}</p>
    </div>
  )
}
