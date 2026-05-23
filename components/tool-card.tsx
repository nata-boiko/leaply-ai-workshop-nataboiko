import Link from "next/link"
import type { Tool, ScrapeUpdate } from "@/lib/supabase"
import { formatDistanceToNow } from "@/lib/date"

type Props = {
  tool: Tool & { case_count: number; update?: ScrapeUpdate | null }
}

export function ToolCard({ tool }: Props) {
  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className="group relative flex h-full cursor-pointer flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:bg-card/80">
        {/* Update dot */}
        {tool.update && !tool.update.seen && (
          <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-amber-400" />
        )}

        {/* Icon placeholder */}
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary text-sm font-semibold text-foreground">
          {tool.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1">
          <p className="mb-1 font-medium tracking-tight">{tool.name}</p>
          {tool.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {tool.case_count}
            </span>{" "}
            кейсів
          </span>
          {tool.last_scraped_at && (
            <span className="text-xs text-muted-foreground/50">
              {formatDistanceToNow(tool.last_scraped_at)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
