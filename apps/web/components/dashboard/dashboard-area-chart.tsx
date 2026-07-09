"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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
  { month: "Jan", revenue: 1000 },
  { month: "Feb", revenue: 1200 },
  { month: "Mar", revenue: 1100 },
  { month: "Apr", revenue: 2000 },
  { month: "May", revenue: 1500 },
  { month: "Jun", revenue: 1800 },
  { month: "Jul", revenue: 2500 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#6366f1", // Indigo 500
  },
} satisfies ChartConfig

export function DashboardAreaChart() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
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
            <span className="text-2xl font-bold">$20,462.89</span>
          </div>
          <span className="text-xs text-emerald-500 font-medium">+20.1% from last month</span>
        </div>
      </CardHeader>
      <CardContent className="mt-auto pb-6">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="revenue"
              type="linear"
              fill="url(#fillRevenue)"
              fillOpacity={0.4}
              stroke="var(--color-revenue)"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 4, fill: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
