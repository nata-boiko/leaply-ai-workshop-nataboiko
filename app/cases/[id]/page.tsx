import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { Case, Tool } from "@/lib/supabase"
import { formatDistanceToNow } from "@/lib/date"

export const dynamic = "force-dynamic"

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data } = await supabase
    .from("cases")
    .select(
      "*, tool:tools(id, slug, name, description, monitor_url, guide_markdown, last_scraped_at, created_at)"
    )
    .eq("id", id)
    .single()

  const c = data as (Case & { tool: Tool }) | null
  if (!c) notFound()

  return (
    <div className="max-w-xl">
      {/* Back */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href={c.tool ? `/tools/${c.tool.slug}` : "/cases"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {c.tool ? c.tool.name : "Кейси"}
        </Link>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="rounded-lg border-border text-xs hover:border-primary/40 hover:text-primary"
        >
          <Link href={`/cases/${c.id}/edit`}>Редагувати</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="border-b border-border px-6 py-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {c.tool && (
              <Link
                href={`/tools/${c.tool.slug}`}
                className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {c.tool.name}
              </Link>
            )}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                c.success
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {c.success ? "✓ Успішно" : "✗ Невдало"}
            </span>
            <span className="ml-auto text-xs text-muted-foreground/50">
              {formatDistanceToNow(c.created_at)}
            </span>
          </div>
          <h1 className="text-base leading-snug font-semibold">
            {c.task_name}
          </h1>
        </div>

        {/* Fields */}
        <div className="divide-y divide-border">
          {c.task_details && (
            <Field label="Деталі задачі">
              <p className="text-sm leading-relaxed text-foreground">
                {c.task_details}
              </p>
            </Field>
          )}

          {c.approach && (
            <Field label="Підхід і промпти">
              <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                {c.approach}
              </pre>
            </Field>
          )}

          {c.outcome && (
            <Field label="Результат">
              <p className="text-sm leading-relaxed text-foreground">
                {c.outcome}
              </p>
            </Field>
          )}

          {/* Stats row */}
          {(c.iterations != null ||
            c.time_spent_min != null ||
            c.time_without_ai_min != null) && (
            <div className="grid grid-cols-3 divide-x divide-border">
              <Stat
                label="Ітерацій"
                value={c.iterations != null ? String(c.iterations) : "—"}
              />
              <Stat
                label="Час з AI"
                value={
                  c.time_spent_min != null ? `${c.time_spent_min} хв` : "—"
                }
              />
              <Stat
                label="Без AI"
                value={
                  c.time_without_ai_min != null
                    ? `${c.time_without_ai_min} хв`
                    : "—"
                }
              />
            </div>
          )}

          {/* Photos */}
          {c.photos?.length > 0 && (
            <Field label={`Фото (${c.photos.length})`}>
              <div className="grid grid-cols-4 gap-2">
                {c.photos.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-square overflow-hidden rounded-xl border border-border transition-opacity hover:opacity-80"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </Field>
          )}

          {/* Empty state */}
          {!c.task_details &&
            !c.approach &&
            !c.outcome &&
            !c.photos?.length && (
              <Field label="">
                <p className="text-sm text-muted-foreground">
                  Деталі не заповнені.
                </p>
              </Field>
            )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="px-6 py-4">
      {label && (
        <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground/50 uppercase">
          {label}
        </p>
      )}
      {children}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-4 text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
