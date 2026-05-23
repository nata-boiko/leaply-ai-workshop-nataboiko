import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Tool, ScrapeUpdate } from "@/lib/supabase"
import { formatDistanceToNow } from "@/lib/date"

type Props = {
  tool: Tool & { case_count: number; update?: ScrapeUpdate | null }
}

export function ToolCard({ tool }: Props) {
  return (
    <Link href={`/tools/${tool.slug}`}>
      <Card className="h-full cursor-pointer transition-colors hover:border-foreground/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{tool.name}</span>
            {tool.update && !tool.update.seen && (
              <span className="size-2 shrink-0 rounded-full bg-amber-400" />
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {tool.description && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs font-normal">
              {tool.case_count} кейсів
            </Badge>
            {tool.last_scraped_at && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(tool.last_scraped_at)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
