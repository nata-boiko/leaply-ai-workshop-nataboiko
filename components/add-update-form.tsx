"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

type Status = "idle" | "loading" | "saved" | "duplicate" | "error"

export function AddUpdateForm({ slug }: { slug: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [duplicateReason, setDuplicateReason] = useState("")

  async function handleSubmit() {
    if (!content.trim()) return
    setStatus("loading")
    setDuplicateReason("")

    try {
      const res = await fetch(`/api/tools/${slug}/update`, {
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

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        + Оновлення
      </Button>
    )
  }

  return (
    <div className="mb-6 rounded-md border border-border p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Додати нову інформацію до гайду</p>
        <button
          onClick={() => {
            setOpen(false)
            setStatus("idle")
            setContent("")
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <Textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          setStatus("idle")
        }}
        placeholder="Вставте нову інформацію — нову функцію, зміну в промптах, порада з листа чи статті…"
        className="mb-3 min-h-[120px] text-sm"
        disabled={status === "loading"}
      />

      {status === "duplicate" && (
        <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <span className="font-medium">Вже є в гайді.</span>
          {duplicateReason && <span className="ml-1">{duplicateReason}</span>}
        </div>
      )}

      {status === "saved" && (
        <div className="mb-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ✓ Гайд оновлено
        </div>
      )}

      {status === "error" && (
        <div className="mb-3 text-sm text-destructive">
          Помилка. Спробуйте ще раз.
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(false)
            setStatus("idle")
            setContent("")
          }}
          disabled={status === "loading"}
        >
          Скасувати
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={status === "loading" || !content.trim()}
        >
          {status === "loading" ? "Перевірка…" : "Додати до гайду"}
        </Button>
      </div>
    </div>
  )
}
