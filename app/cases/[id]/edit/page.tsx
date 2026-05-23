"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PhotoUploader } from "@/components/photo-uploader"
import type { Case, Tool } from "@/lib/supabase"

export default function EditCasePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)

  const [taskName, setTaskName] = useState("")
  const [taskDetails, setTaskDetails] = useState("")
  const [approach, setApproach] = useState("")
  const [iterations, setIterations] = useState("")
  const [outcome, setOutcome] = useState("")
  const [success, setSuccess] = useState(true)
  const [timeSpent, setTimeSpent] = useState("")
  const [timeWithout, setTimeWithout] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [toolName, setToolName] = useState("")

  useEffect(() => {
    fetch(`/api/cases`)
      .then((r) => r.json())
      .then((cases: (Case & { tool: Tool })[]) => {
        const c = cases.find((c) => c.id === id)
        if (!c) return
        setTaskName(c.task_name)
        setTaskDetails(c.task_details ?? "")
        setApproach(c.approach ?? "")
        setIterations(c.iterations != null ? String(c.iterations) : "")
        setOutcome(c.outcome ?? "")
        setSuccess(c.success)
        setTimeSpent(c.time_spent_min != null ? String(c.time_spent_min) : "")
        setTimeWithout(
          c.time_without_ai_min != null ? String(c.time_without_ai_min) : ""
        )
        setPhotos(c.photos ?? [])
        setToolName(c.tool?.name ?? "")
      })
      .finally(() => setFetching(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_name: taskName,
          task_details: taskDetails || undefined,
          approach: approach || undefined,
          iterations: iterations ? Number(iterations) : null,
          outcome: outcome || undefined,
          success,
          time_spent_min: timeSpent ? Number(timeSpent) : null,
          time_without_ai_min: timeWithout ? Number(timeWithout) : null,
          photos,
        }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error)
      }
      router.push(`/cases/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка")
    } finally {
      setLoading(false)
    }
  }

  if (fetching)
    return (
      <div className="p-8 text-sm text-muted-foreground">Завантаження...</div>
    )

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/cases/${id}`)}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Назад
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-base font-semibold">Редагувати кейс</h1>
        {toolName && (
          <p className="mt-0.5 text-sm text-muted-foreground">{toolName}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Result toggle */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Результат</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSuccess(true)}
              className={`flex-1 rounded-xl border py-2 text-xs transition-colors ${
                success
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-border/60"
              }`}
            >
              ✓ Успішний
            </button>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className={`flex-1 rounded-xl border py-2 text-xs transition-colors ${
                !success
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border text-muted-foreground hover:border-border/60"
              }`}
            >
              ✗ Невдалий
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Назва задачі</Label>
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Назва задачі"
            className="text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Підхід і промпти</Label>
          <Textarea
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            placeholder="Які промпти використовували, які налаштування..."
            rows={5}
            className="resize-none font-mono text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Деталі задачі</Label>
          <Textarea
            value={taskDetails}
            onChange={(e) => setTaskDetails(e.target.value)}
            placeholder="Що саме потрібно було зробити..."
            rows={2}
            className="resize-none text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Ітерацій</Label>
            <Input
              type="number"
              min="1"
              value={iterations}
              onChange={(e) => setIterations(e.target.value)}
              placeholder="3"
              className="text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Час з AI (хв)</Label>
            <Input
              type="number"
              min="0"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder="10"
              className="text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Без AI (хв)</Label>
            <Input
              type="number"
              min="0"
              value={timeWithout}
              onChange={(e) => setTimeWithout(e.target.value)}
              placeholder="60"
              className="text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Результат / нотатки</Label>
          <Textarea
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Що вийшло, якість результату..."
            rows={2}
            className="resize-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Фото результатів</Label>
          <PhotoUploader
            photos={photos}
            onChange={setPhotos}
            uploading={uploading}
            setUploading={setUploading}
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => router.push(`/cases/${id}`)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Скасувати
          </button>
          <Button type="submit" size="sm" disabled={loading || uploading}>
            {loading ? "Збереження..." : "Зберегти"}
          </Button>
        </div>
      </form>
    </div>
  )
}
