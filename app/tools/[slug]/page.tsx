import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CaseRow } from "@/components/case-row"
import { supabase } from "@/lib/supabase"
import type { Tool, Case } from "@/lib/supabase"
import { formatDistanceToNow } from "@/lib/date"
import ReactMarkdown from "react-markdown"

export const dynamic = "force-dynamic"

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const toolRes = await supabase
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .single()

  const tool = toolRes.data as Tool | null
  if (!tool) notFound()

  const casesRes = await supabase
    .from("cases")
    .select("*")
    .eq("tool_id", tool.id)
    .order("created_at", { ascending: false })

  const cases = (casesRes.data ?? []) as Case[]

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Назад
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-base font-semibold">{tool.name}</h1>
          {tool.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {tool.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {tool.last_scraped_at && (
            <span className="text-xs text-muted-foreground">
              Оновлено {formatDistanceToNow(tool.last_scraped_at)}
            </span>
          )}
          <Button asChild size="sm" variant="outline">
            <Link href={`/cases/new?tool=${tool.id}`}>+ Кейс</Link>
          </Button>
        </div>
      </div>

      {tool.guide_markdown ? (
        <div className="mb-10">
          <h2 className="mb-3 text-sm font-medium">Гайд</h2>
          <div className="prose prose-sm prose-neutral max-w-none text-sm leading-relaxed [&_code]:text-xs [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-medium [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-4">
            <ReactMarkdown>{tool.guide_markdown}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="mb-10 rounded-md border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Гайд ще не заповнений. Він з&apos;явиться після першого
            автоматичного оновлення.
          </p>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">
            Кейси команди{" "}
            <span className="font-normal text-muted-foreground">
              ({cases.length})
            </span>
          </h2>
        </div>
        {cases.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Ще немає кейсів для цього інструменту.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href={`/cases/new?tool=${tool.id}`}>
                Додати перший кейс
              </Link>
            </Button>
          </div>
        ) : (
          <div>
            {cases.map((c) => (
              <CaseRow key={c.id} case_={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
