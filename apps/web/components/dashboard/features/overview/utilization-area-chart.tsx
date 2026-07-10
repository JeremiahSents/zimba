"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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

import { formatPercent } from "@/lib/zimba/format"
import type { UtilizationChartPoint } from "@/lib/zimba/types"

const chartConfig = {
  utilization: {
    color: "var(--primary)",
    label: "Utilization",
  },
} satisfies ChartConfig

export function UtilizationAreaChart({
  data,
}: {
  data: UtilizationChartPoint[]
}) {
  const currentUtilization = data.at(-1)?.utilization ?? 0
  const startingUtilization = data[0]?.utilization ?? 0
  const utilizationChange = currentUtilization - startingUtilization
  const highestUtilization = Math.max(
    0,
    ...data.map((point) => point.utilization)
  )

  return (
    <Card size="sm" className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Budget utilization
          </CardTitle>
          <Select defaultValue="current">
            <SelectTrigger className="h-8 w-auto gap-2 border-border text-xs font-medium">
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
            <span className="font-heading text-3xl font-medium text-primary">
              {formatPercent(currentUtilization)}
            </span>
          </div>
          <span className="text-xs font-medium text-primary">
            Average project budget used
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 divide-x border-y py-3">
          <MicroMetric
            label="Period change"
            value={`+${formatPercent(utilizationChange)}`}
          />
          <MicroMetric
            label="Period high"
            value={formatPercent(highestUtilization)}
          />
        </div>
      </CardHeader>
      <CardContent className="mt-auto pb-4">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12, top: 20 }}
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
              <linearGradient id="fillUtilization" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-utilization)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-utilization)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="utilization"
              type="linear"
              fill="url(#fillUtilization)"
              fillOpacity={0.4}
              stroke="var(--color-utilization)"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
            />
          </AreaChart>
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
