"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatMonth } from "@/lib/format"

type Point = { month: string; credits: number; spend: number }

const config = {
  spend: { label: "Витрати", color: "oklch(0.62 0.19 290)" },
  credits: { label: "Креди", color: "oklch(0.65 0.15 195)" },
} satisfies ChartConfig

export function SpendChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-2xl border text-sm text-muted-foreground">
        Ще немає місячних записів — внесіть перший, щоб побачити динаміку.
      </div>
    )
  }

  const chartData = data.map((d) => ({ ...d, label: formatMonth(d.month) }))

  return (
    <ChartContainer config={config} className="h-[220px] w-full">
      <AreaChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
        />
        <YAxis tickLine={false} axisLine={false} width={36} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="spend"
          type="monotone"
          fill="var(--color-spend)"
          fillOpacity={0.2}
          stroke="var(--color-spend)"
          strokeWidth={2}
        />
        <Area
          dataKey="credits"
          type="monotone"
          fill="var(--color-credits)"
          fillOpacity={0.15}
          stroke="var(--color-credits)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
