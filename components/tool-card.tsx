import Link from "next/link"
import type { Tool, ScrapeUpdate } from "@/lib/supabase"
import { formatDistanceToNow } from "@/lib/date"

type Props = {
  tool: Tool & { case_count: number; update?: ScrapeUpdate | null }
  colorIndex?: number
}

// Soft pastel palettes: [light bg, dark bg, icon bg, icon text]
const PALETTES = [
  {
    card: "bg-[oklch(0.94_0.07_80)] dark:bg-[oklch(0.22_0.05_80)]",
    icon: "bg-[oklch(0.87_0.10_80)] dark:bg-[oklch(0.30_0.07_80)] text-[oklch(0.40_0.12_80)] dark:text-[oklch(0.85_0.10_80)]",
    stat: "text-[oklch(0.40_0.10_80)] dark:text-[oklch(0.80_0.09_80)]",
    border:
      "border-[oklch(0.87_0.09_80/40%)] dark:border-[oklch(0.30_0.06_80/40%)]",
  },
  {
    card: "bg-[oklch(0.93_0.06_290)] dark:bg-[oklch(0.22_0.05_290)]",
    icon: "bg-[oklch(0.86_0.09_290)] dark:bg-[oklch(0.30_0.07_290)] text-[oklch(0.40_0.12_290)] dark:text-[oklch(0.85_0.10_290)]",
    stat: "text-[oklch(0.40_0.10_290)] dark:text-[oklch(0.80_0.09_290)]",
    border:
      "border-[oklch(0.86_0.08_290/40%)] dark:border-[oklch(0.30_0.06_290/40%)]",
  },
  {
    card: "bg-[oklch(0.93_0.05_350)] dark:bg-[oklch(0.22_0.04_350)]",
    icon: "bg-[oklch(0.86_0.08_350)] dark:bg-[oklch(0.30_0.06_350)] text-[oklch(0.42_0.11_350)] dark:text-[oklch(0.85_0.09_350)]",
    stat: "text-[oklch(0.42_0.09_350)] dark:text-[oklch(0.80_0.08_350)]",
    border:
      "border-[oklch(0.86_0.07_350/40%)] dark:border-[oklch(0.30_0.05_350/40%)]",
  },
  {
    card: "bg-[oklch(0.93_0.06_195)] dark:bg-[oklch(0.22_0.05_195)]",
    icon: "bg-[oklch(0.86_0.09_195)] dark:bg-[oklch(0.30_0.07_195)] text-[oklch(0.38_0.11_195)] dark:text-[oklch(0.85_0.10_195)]",
    stat: "text-[oklch(0.38_0.09_195)] dark:text-[oklch(0.80_0.09_195)]",
    border:
      "border-[oklch(0.86_0.08_195/40%)] dark:border-[oklch(0.30_0.06_195/40%)]",
  },
]

export function ToolCard({ tool, colorIndex = 0 }: Props) {
  const palette = PALETTES[colorIndex % PALETTES.length]

  return (
    <Link href={`/tools/${tool.slug}`}>
      <div
        className={`group relative flex h-full cursor-pointer flex-col rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${palette.card} ${palette.border}`}
      >
        {/* Update dot */}
        {tool.update && !tool.update.seen && (
          <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-transparent" />
        )}

        {/* Icon */}
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold ${palette.icon}`}
        >
          {tool.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1">
          <p className="mb-1 font-semibold tracking-tight text-foreground">
            {tool.name}
          </p>
          {tool.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-foreground/55">
              {tool.description}
            </p>
          )}
        </div>

        <div
          className={`mt-4 flex items-center justify-between border-t pt-3 ${palette.border}`}
        >
          <span className={`text-sm font-semibold ${palette.stat}`}>
            {tool.case_count}{" "}
            <span className="text-xs font-normal text-foreground/40">
              кейсів
            </span>
          </span>
          {tool.last_scraped_at && (
            <span className="text-xs text-foreground/35">
              {formatDistanceToNow(tool.last_scraped_at)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
