import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ToolCard } from "@/components/tool-card"
import { UpdateBanner } from "@/components/update-banner"
import { AskWidget } from "@/components/ask-widget"
import { AddUpdateModal } from "@/components/add-update-modal"
import { supabase } from "@/lib/supabase"
import type { Tool, ScrapeUpdate } from "@/lib/supabase"

export const dynamic = "force-dynamic"

async function getData() {
  const [toolsRes, updatesRes] = await Promise.all([
    supabase.from("tools").select("*").order("name"),
    supabase
      .from("scrape_updates")
      .select("*, tool:tools(*)")
      .eq("seen", false)
      .order("detected_at", { ascending: false }),
  ])

  const tools = (toolsRes.data ?? []) as Tool[]

  const caseCounts = await Promise.all(
    tools.map((t) =>
      supabase
        .from("cases")
        .select("id", { count: "exact", head: true })
        .eq("tool_id", t.id)
        .then(({ count }) => ({ id: t.id, count: count ?? 0 }))
    )
  )
  const countMap = Object.fromEntries(
    caseCounts.map(({ id, count }) => [id, count])
  )

  const unseenUpdates = (updatesRes.data ?? []) as (ScrapeUpdate & {
    tool: Tool
  })[]

  const toolsWithMeta = tools.map((t) => ({
    ...t,
    case_count: countMap[t.id] ?? 0,
    update: unseenUpdates.find((u) => u.tool_id === t.id) ?? null,
  }))

  return { tools: toolsWithMeta, updates: unseenUpdates, rawTools: tools }
}

export default async function DashboardPage() {
  const { tools, updates, rawTools } = await getData()

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">AI Tools KB</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            База знань інструментів дизайн-команди
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddUpdateModal tools={rawTools} />
          <Button asChild size="sm" className="rounded-lg text-xs">
            <Link href="/cases/new">+ Кейс</Link>
          </Button>
        </div>
      </div>

      <UpdateBanner updates={updates} />

      {/* Tools */}
      <div className="mb-10 grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Ask */}
      <AskWidget />
    </div>
  )
}
