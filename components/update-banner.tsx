"use client"

import { useState } from "react"
import type { ScrapeUpdate, Tool } from "@/lib/supabase"
import { RiCloseLine } from "@remixicon/react"

type Props = {
  updates: (ScrapeUpdate & { tool: Tool })[]
}

export function UpdateBanner({ updates }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = updates.filter((u) => !dismissed.has(u.id))
  if (visible.length === 0) return null

  async function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]))
    await fetch("/api/updates/seen", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
  }

  return (
    <div className="mb-6 flex flex-col gap-1.5">
      {visible.map((update) => (
        <div
          key={update.id}
          className="flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm"
        >
          <div className="flex min-w-0 items-start gap-2">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-400" />
            <span className="text-amber-900">
              <span className="font-medium">{update.tool.name}</span>
              {" — "}
              {update.diff_summary}
            </span>
          </div>
          <button
            onClick={() => dismiss(update.id)}
            className="mt-0.5 shrink-0 text-amber-500 hover:text-amber-700"
          >
            <RiCloseLine size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
