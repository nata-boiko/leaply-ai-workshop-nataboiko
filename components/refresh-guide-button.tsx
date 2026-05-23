"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RiRefreshLine } from "@remixicon/react"
import { useRouter } from "next/navigation"

type Props = { slug: string }

export function RefreshGuideButton({ slug }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  )
  const [stats, setStats] = useState<{ found: number; scraped: number } | null>(
    null
  )

  async function handleRefresh() {
    setStatus("loading")
    setStats(null)

    try {
      const res = await fetch(`/api/tools/${slug}/discover`, {
        method: "POST",
      })

      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error)
      }

      const data = (await res.json()) as {
        urlsFound: number
        urlsScraped: number
      }
      setStats({ found: data.urlsFound, scraped: data.urlsScraped })
      setStatus("done")
      router.refresh()
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleRefresh}
        disabled={status === "loading"}
        className="gap-1.5"
      >
        <RiRefreshLine
          size={14}
          className={status === "loading" ? "animate-spin" : ""}
        />
        {status === "loading" ? "Завантаження..." : "Оновити гайд"}
      </Button>
      {status === "done" && stats && (
        <span className="text-xs text-muted-foreground">
          ✓ {stats.scraped} сторінок зі {stats.found} знайдених
        </span>
      )}
      {status === "error" && (
        <span className="text-xs text-destructive">Помилка</span>
      )}
    </div>
  )
}
