import Link from "next/link"
import type { Case } from "@/lib/supabase"
import { formatDistanceToNow } from "@/lib/date"

type Props = {
  case_: Case
  showTool?: boolean
}

export function CaseRow({ case_, showTool = false }: Props) {
  return (
    <Link href={`/cases/${case_.id}`}>
      <div className="group rounded-2xl border border-border bg-card p-4 transition-all duration-150 hover:-translate-y-px hover:border-primary/20 hover:shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  case_.success ? "bg-primary" : "bg-destructive"
                )}
              />
              <span className="text-sm leading-snug font-medium">
                {case_.task_name}
              </span>
              {showTool && case_.tool && (
                <span className="rounded-md border border-border bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                  {case_.tool.name}
                </span>
              )}
            </div>

            {case_.approach && (
              <p className="mt-2 line-clamp-2 rounded-lg bg-muted/50 px-3 py-2 font-mono text-xs leading-relaxed text-muted-foreground">
                {case_.approach}
              </p>
            )}

            {case_.outcome && !case_.approach && (
              <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
                {case_.outcome}
              </p>
            )}

            {/* Photos preview */}
            {case_.photos?.length > 0 && (
              <div className="mt-2 flex gap-1.5">
                {case_.photos.slice(0, 5).map((url) => (
                  <div
                    key={url}
                    className="h-12 w-12 overflow-hidden rounded-lg border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                {case_.photos.length > 5 && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-secondary text-xs text-muted-foreground">
                    +{case_.photos.length - 5}
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center gap-3">
              {case_.time_spent_min != null && (
                <span className="text-xs text-muted-foreground/60">
                  {case_.time_spent_min} хв
                </span>
              )}
              {case_.iterations != null && (
                <span className="text-xs text-muted-foreground/60">
                  {case_.iterations} іт.
                </span>
              )}
              <span className="text-xs text-muted-foreground/40">
                {formatDistanceToNow(case_.created_at)}
              </span>
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium",
                  case_.success
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {case_.success ? "Успішно" : "Невдало"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}
