"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon } from "@hugeicons/core-free-icons"

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
    color: "#e2e8f0",
    label: "Budget",
  },
  spent: {
    color: "var(--primary)",
    label: "Spent",
  },
} satisfies ChartConfig

export function SpendBarChart({ data }: { data: SpendChartPoint[] }) {
  const totalSpent = data.reduce((total, point) => total + point.spent, 0)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Budget spend
          </CardTitle>
          <Select defaultValue="current">
            <SelectTrigger className="h-8 w-auto gap-2 border-border text-xs font-medium">
              <SelectValue placeholder="Select range" />
              <HugeiconsIcon
                icon={Calendar01Icon}
                className="size-3.5 text-muted-foreground"
              />
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
            <span className="text-2xl font-bold">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <span className="text-xs font-medium text-primary">
            Logged construction spend
          </span>
        </div>
      </CardHeader>
      <CardContent className="mt-auto pb-6">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Bar
              dataKey="spent"
              stackId="a"
              fill="var(--color-spent)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="budget"
              stackId="a"
              fill="var(--color-budget)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
