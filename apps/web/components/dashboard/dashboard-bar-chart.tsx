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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"

const chartData = [
  { month: "Jan", spend: 120, budget: 200 },
  { month: "Feb", spend: 150, budget: 200 },
  { month: "Mar", spend: 180, budget: 200 },
  { month: "Apr", spend: 90, budget: 200 },
  { month: "May", spend: 130, budget: 200 },
  { month: "Jun", spend: 170, budget: 200 },
  { month: "Jul", spend: 190, budget: 200 },
  { month: "Aug", spend: 110, budget: 200 },
  { month: "Sep", spend: 80, budget: 200 },
  { month: "Oct", spend: 140, budget: 200 },
  { month: "Nov", spend: 160, budget: 200 },
  { month: "Dec", spend: 200, budget: 200 },
]

const chartConfig = {
  spend: {
    label: "Spend",
    color: "#6366f1", // Indigo 500
  },
  budget: {
    label: "Budget",
    color: "#e2e8f0", // Slate 200
  },
} satisfies ChartConfig

export function DashboardBarChart() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total sales</CardTitle>
          <Select defaultValue="30days">
            <SelectTrigger className="h-8 w-auto gap-2 border-border text-xs font-medium">
              <SelectValue placeholder="Select range" />
              <HugeiconsIcon icon={Calendar01Icon} className="size-3.5 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">1,525</span>
          </div>
          <span className="text-xs text-emerald-500 font-medium">+20.1% from last month</span>
        </div>
      </CardHeader>
      <CardContent className="mt-auto pb-6">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="spend"
              stackId="a"
              fill="var(--color-spend)"
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
