"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchError, setFetchError] = useState("")

  useEffect(() => {
    fetch("/api/team-context")
      .then((r) => r.json())
      .then((d: { content: string }) => setContent(d.content ?? ""))
      .catch(() => setFetchError("Не вдалося завантажити контекст"))
  }, [])

  async function handleSave() {
    setLoading(true)
    setSaved(false)

    try {
      const res = await fetch("/api/team-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setFetchError("Помилка збереження")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-base font-semibold">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Контекст команди — Claude використовує цю інформацію при відповіді на
          запити.
        </p>
      </div>

      {fetchError && (
        <p className="mb-4 text-xs text-destructive">{fetchError}</p>
      )}

      <div className="flex flex-col gap-2">
        <Label className="text-xs">Контекст команди</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="resize-none font-mono text-sm"
          placeholder="Опишіть команду: хто ви, які задачі вирішуєте, що важливо враховувати..."
        />
        <p className="text-xs text-muted-foreground">
          Це буде ін&apos;єктуватися в кожен запит до Claude як системний
          контекст.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSave} size="sm" disabled={loading}>
          {loading ? "Збереження..." : "Зберегти"}
        </Button>
        {saved && (
          <span className="text-xs text-muted-foreground">✓ Збережено</span>
        )}
      </div>
    </div>
  )
}
