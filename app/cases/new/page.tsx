"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Tool } from "@/lib/supabase"

function NewCaseForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultToolId = searchParams.get("tool") ?? ""

  const [tools, setTools] = useState<Tool[]>([])
  const [toolId, setToolId] = useState(defaultToolId)
  const [taskName, setTaskName] = useState("")
  const [taskDetails, setTaskDetails] = useState("")
  const [approach, setApproach] = useState("")
  const [iterations, setIterations] = useState("")
  const [outcome, setOutcome] = useState("")
  const [success, setSuccess] = useState(true)
  const [timeSpent, setTimeSpent] = useState("")
  const [timeWithout, setTimeWithout] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/tools")
      .then((r) => r.json())
      .then((d: Tool[]) => setTools(d))
      .catch(() => setError("Не вдалося завантажити інструменти"))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!toolId) {
      setError("Оберіть інструмент")
      return
    }
    if (!taskName.trim()) {
      setError("Введіть назву задачі")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool_id: toolId,
          task_name: taskName,
          task_details: taskDetails || undefined,
          approach: approach || undefined,
          iterations: iterations ? Number(iterations) : undefined,
          outcome: outcome || undefined,
          success,
          time_spent_min: timeSpent ? Number(timeSpent) : undefined,
          time_without_ai_min: timeWithout ? Number(timeWithout) : undefined,
          source: "web",
        }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error ?? "Помилка при збереженні")
      }

      router.push("/cases")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Невідома помилка")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-base font-semibold">Новий кейс</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Інструмент</Label>
            <Select value={toolId} onValueChange={setToolId}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Оберіть..." />
              </SelectTrigger>
              <SelectContent>
                {tools.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Результат</Label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSuccess(true)}
                className={`flex-1 rounded-md border py-2 text-xs transition-colors ${
                  success
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                ✓ Успішний
              </button>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className={`flex-1 rounded-md border py-2 text-xs transition-colors ${
                  !success
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                ✗ Невдалий
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Назва задачі</Label>
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Анімація продукту для Instagram Stories"
            className="text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Підхід і промпти</Label>
          <Textarea
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            placeholder="Які промпти використовували, які налаштування..."
            rows={4}
            className="resize-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Деталі задачі (опціонально)</Label>
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
          <Label className="text-xs">Результат / нотатки (опціонально)</Label>
          <Textarea
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Що вийшло, якість результату..."
            rows={2}
            className="resize-none text-sm"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Скасувати
          </button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Збереження..." : "Зберегти"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function NewCasePage() {
  return (
    <Suspense>
      <NewCaseForm />
    </Suspense>
  )
}
