import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseRow } from "@/components/case-row"
import { RefreshGuideButton } from "@/components/refresh-guide-button"
import { ManualNotesEditor } from "@/components/manual-notes-editor"
import { LinksManager } from "@/components/links-manager"
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
  const successCount = cases.filter((c) => c.success).length

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>←</span>
          <span>Назад</span>
        </Link>
      </div>

      {/* Hero header */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-medium tracking-widest text-primary uppercase">
                AI Tool
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {tool.name}
            </h1>
            {tool.description && (
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            {tool.last_scraped_at && (
              <p className="text-xs text-muted-foreground/50">
                {formatDistanceToNow(tool.last_scraped_at)}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        {cases.length > 0 && (
          <div className="mt-5 flex items-center gap-4 border-t border-border pt-4">
            <div>
              <p className="text-xl font-semibold">{cases.length}</p>
              <p className="text-xs text-muted-foreground">кейсів</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xl font-semibold text-primary">
                {successCount}
              </p>
              <p className="text-xs text-muted-foreground">успішних</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xl font-semibold text-destructive">
                {cases.length - successCount}
              </p>
              <p className="text-xs text-muted-foreground">невдалих</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cases">
        <TabsList className="mb-5 h-10 rounded-xl bg-card p-1">
          <TabsTrigger
            value="cases"
            className="rounded-lg text-xs data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Кейси команди
            <span className="ml-1.5 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {cases.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="guide"
            className="rounded-lg text-xs data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Гайд
          </TabsTrigger>
        </TabsList>

        {/* Cases tab */}
        <TabsContent value="cases" className="mt-0">
          <div className="mb-4 flex justify-end">
            <Button asChild size="sm" className="rounded-lg text-xs">
              <Link href={`/cases/new?tool=${tool.id}`}>+ Новий кейс</Link>
            </Button>
          </div>

          {cases.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Ще немає кейсів для цього інструменту.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cases.map((c) => (
                <CaseRow key={c.id} case_={c} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Guide tab */}
        <TabsContent value="guide" className="mt-0 flex flex-col gap-6">
          {/* Section 1: Auto-generated guide */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Гайд
              </h2>
              <RefreshGuideButton slug={tool.slug} />
            </div>
            {tool.guide_markdown ? (
              <div className="prose prose-sm dark:prose-invert max-w-none rounded-xl border border-border bg-card p-6 text-sm leading-relaxed [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-medium [&_li]:text-muted-foreground [&_p]:text-muted-foreground [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-4">
                <ReactMarkdown>{tool.guide_markdown}</ReactMarkdown>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <p className="mb-4 text-sm text-muted-foreground">
                  Гайд ще не заповнений.
                </p>
                <RefreshGuideButton slug={tool.slug} />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Section 2: Manual notes */}
          <div>
            <div className="mb-3">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Оновлення
              </h2>
              <p className="mt-1 text-xs text-muted-foreground/50">
                Ручні нотатки — не перезаписуються при оновленні гайду
              </p>
            </div>
            <ManualNotesEditor
              slug={tool.slug}
              initialNotes={tool.manual_notes ?? null}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Section 3: Links */}
          <div>
            <div className="mb-3">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Корисні посилання
              </h2>
            </div>
            <LinksManager
              slug={tool.slug}
              initialLinks={Array.isArray(tool.links) ? tool.links : []}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
