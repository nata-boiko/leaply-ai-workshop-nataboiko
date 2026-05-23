import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CaseRow } from "@/components/case-row"
import { supabase } from "@/lib/supabase"
import type { Case, Tool } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function CasesPage() {
  const { data } = await supabase
    .from("cases")
    .select(
      "*, tool:tools(id, slug, name, description, monitor_url, guide_markdown, last_scraped_at, created_at)"
    )
    .order("created_at", { ascending: false })

  const cases = (data ?? []) as (Case & { tool: Tool })[]

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-base font-semibold">Кейси</h1>
        <Button asChild size="sm">
          <Link href="/cases/new">+ Новий кейс</Link>
        </Button>
      </div>

      {cases.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-10 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Ще немає кейсів. Додайте перший після роботи з AI-інструментом.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/cases/new">Додати кейс</Link>
          </Button>
        </div>
      ) : (
        <div>
          {cases.map((c) => (
            <CaseRow key={c.id} case_={c} showTool />
          ))}
        </div>
      )}
    </div>
  )
}
