import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ToolCard } from "@/components/tool-card"
import { UpdateBanner } from "@/components/update-banner"
import { supabase } from "@/lib/supabase"
import type { Tool, ScrapeUpdate, Case } from "@/lib/supabase"
import { formatDistanceToNow } from "@/lib/date"
import { RiCheckLine, RiCloseLine } from "@remixicon/react"

export const dynamic = "force-dynamic"

async function getData() {
  const [toolsRes, updatesRes, casesRes] = await Promise.all([
    supabase.from("tools").select("*").order("name"),
    supabase
      .from("scrape_updates")
      .select("*, tool:tools(*)")
      .eq("seen", false)
      .order("detected_at", { ascending: false }),
    supabase
      .from("cases")
      .select(
        "*, tool:tools(id, slug, name, description, monitor_url, guide_markdown, last_scraped_at, created_at)"
      )
      .order("created_at", { ascending: false })
      .limit(5),
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

  return {
    tools: toolsWithMeta,
    updates: unseenUpdates,
    cases: (casesRes.data ?? []) as (Case & { tool: Tool })[],
  }
}

export default async function DashboardPage() {
  const { tools, updates, cases } = await getData()

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-base font-semibold">AI Tools</h1>
        <Button asChild size="sm">
          <Link href="/cases/new">+ Новий кейс</Link>
        </Button>
      </div>

      <UpdateBanner updates={updates} />

      <div className="mb-10 grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {cases.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Останні кейси
            </h2>
            <Link
              href="/cases"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Всі →
            </Link>
          </div>
          <div className="flex flex-col">
            {cases.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {c.success ? (
                    <RiCheckLine
                      size={13}
                      className="shrink-0 text-green-600"
                    />
                  ) : (
                    <RiCloseLine size={13} className="shrink-0 text-red-500" />
                  )}
                  <span className="truncate text-sm">{c.task_name}</span>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {c.tool?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(c.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
