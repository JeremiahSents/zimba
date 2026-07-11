"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { formatCurrency } from "@/lib/zimba/format"
import type { SpendChartPoint } from "@/lib/zimba/types"

const chartConfig = {
  budget: {
    color: "var(--border)",
    label: "Budget",
  },
  spent: {
    color: "var(--primary)",
    label: "Spent",
  },
} satisfies ChartConfig

export function SpendBarChart({ data }: { data: SpendChartPoint[] }) {
  const totalSpent = data.reduce((total, point) => total + point.spent, 0)
  const totalBudget = data.reduce((total, point) => total + point.budget, 0)
  const averageSpend = data.length > 0 ? totalSpent / data.length : 0
  const peakMonth = data.reduce<SpendChartPoint | undefined>(
    (peak, point) => (!peak || point.spent > peak.spent ? point : peak),
    undefined
  )

  return (
    <Card size="sm" className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Budget spend
          </CardTitle>
          <Select defaultValue="current">
            <SelectTrigger className="h-8 w-auto gap-2 border-border text-[10px] font-medium">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current period</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-heading text-base font-semibold text-primary">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <span className="text-[10px] font-medium text-primary">
            Logged construction spend
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x border-y py-3">
          <MicroMetric
            label="Average / month"
            value={formatCurrency(averageSpend)}
          />
          <MicroMetric
            label="Budget used"
            value={`${Math.round((totalSpent / Math.max(totalBudget, 1)) * 100)}%`}
          />
          <MicroMetric label="Peak month" value={peakMonth?.month ?? "—"} />
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
                `${Math.round(Number(value) / 1_000_000)}M`
              }
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Bar
              dataKey="budget"
              fill="var(--color-budget)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="spent"
              fill="var(--color-spent)"
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
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
    </div>
  )
}
