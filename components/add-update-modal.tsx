"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import type { Tool } from "@/lib/supabase"

type Status = "idle" | "loading" | "saved" | "duplicate" | "error"

export function AddUpdateModal({ tools }: { tools: Tool[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedSlug, setSelectedSlug] = useState(tools[0]?.slug ?? "")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [duplicateReason, setDuplicateReason] = useState("")

  async function handleSubmit() {
    if (!content.trim() || !selectedSlug) return
    setStatus("loading")
    setDuplicateReason("")
    try {
      const res = await fetch(`/api/tools/${selectedSlug}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      const data = (await res.json()) as {
        duplicate?: boolean
        reason?: string
        ok?: boolean
        error?: string
      }
      if (!res.ok) {
        setStatus("error")
        return
      }
      if (data.duplicate) {
        setStatus("duplicate")
        setDuplicateReason(data.reason ?? "")
        return
      }
      setStatus("saved")
      setContent("")
      setTimeout(() => {
        setOpen(false)
        setStatus("idle")
        router.refresh()
      }, 1500)
    } catch {
      setStatus("error")
    }
  }

  function close() {
    setOpen(false)
    setStatus("idle")
    setContent("")
  }

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="rounded-lg border-border text-xs hover:border-primary/40 hover:text-primary"
      >
        + Оновлення гайду
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Додати оновлення до гайду</h2>
          <button
            onClick={close}
            className="text-lg leading-none text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        {/* Tool selector */}
        <div className="mb-4 flex gap-2">
          {tools.map((t) => (
            <button
              key={t.slug}
              onClick={() => setSelectedSlug(t.slug)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                selectedSlug === t.slug
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setStatus("idle")
          }}
          placeholder="Нова функція, зміна в промптах, порада зі статті або листа..."
          className="mb-4 min-h-[130px] resize-none border-border bg-secondary/50 text-sm"
          disabled={status === "loading"}
        />

        {status === "duplicate" && (
          <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
            <span className="font-medium">Вже є в гайді.</span>
            {duplicateReason && <span className="ml-1">{duplicateReason}</span>}
          </div>
        )}
        {status === "saved" && (
          <div className="mb-4 rounded-xl border border-primary/20 bg-primary/10 p-3 text-xs text-primary">
            ✓ Гайд оновлено
          </div>
        )}
        {status === "error" && (
          <div className="mb-4 text-xs text-destructive">
            Помилка. Спробуйте ще раз.
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={close}
            disabled={status === "loading"}
            className="rounded-lg text-xs"
          >
            Скасувати
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={status === "loading" || !content.trim()}
            className="rounded-lg text-xs"
          >
            {status === "loading" ? "Перевірка..." : "Додати до гайду"}
          </Button>
        </div>
      </div>
    </div>
  )
}
