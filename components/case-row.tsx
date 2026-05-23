import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Case } from "@/lib/supabase"
import { formatDistanceToNow } from "@/lib/date"
import { RiCheckLine, RiCloseLine } from "@remixicon/react"

type Props = {
  case_: Case
  showTool?: boolean
}

export function CaseRow({ case_, showTool = false }: Props) {
  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{case_.task_name}</span>
            {case_.success ? (
              <span className="shrink-0 text-green-600">
                <RiCheckLine size={14} />
              </span>
            ) : (
              <span className="shrink-0 text-red-500">
                <RiCloseLine size={14} />
              </span>
            )}
            {showTool && case_.tool && (
              <Badge variant="secondary" className="text-xs font-normal">
                {case_.tool.name}
              </Badge>
            )}
          </div>
          {case_.approach && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {case_.approach}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            {case_.time_spent_min != null && (
              <span>{case_.time_spent_min} хв</span>
            )}
            {case_.iterations != null && <span>{case_.iterations} іт.</span>}
            <span>{formatDistanceToNow(case_.created_at)}</span>
          </div>
        </div>
      </div>
      <Separator className="mt-3" />
    </div>
  )
}
