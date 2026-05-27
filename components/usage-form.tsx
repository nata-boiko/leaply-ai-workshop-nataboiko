"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Subscription } from "@/lib/supabase"
import { periodMonthString } from "@/lib/metrics"

export function UsageForm({ subs }: { subs: Subscription[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    subscription_id: searchParams.get("sub") ?? "",
    period_month: periodMonthString().slice(0, 7),
    credits_used: "",
    credits_remaining: "",
    creo_count: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.subscription_id) {
      setError("Оберіть підписку")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: form.subscription_id,
          period_month: `${form.period_month}-01`,
          credits_used: form.credits_used ? Number(form.credits_used) : 0,
          credits_remaining: form.credits_remaining
            ? Number(form.credits_remaining)
            : null,
          creo_count: form.creo_count ? Number(form.creo_count) : 0,
        }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error ?? "Помилка при збереженні")
      }
      router.push("/budget")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Невідома помилка")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Підписка</Label>
          <Select
            value={form.subscription_id}
            onValueChange={set("subscription_id")}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Оберіть..." />
            </SelectTrigger>
            <SelectContent>
              {subs.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Місяць</Label>
          <Input
            type="month"
            value={form.period_month}
            onChange={(e) => set("period_month")(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Спалено кредів</Label>
          <Input
            type="number"
            min="0"
            value={form.credits_used}
            onChange={(e) => set("credits_used")(e.target.value)}
            placeholder="640"
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Лишилось</Label>
          <Input
            type="number"
            min="0"
            value={form.credits_remaining}
            onChange={(e) => set("credits_remaining")(e.target.value)}
            placeholder="360"
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Крео</Label>
          <Input
            type="number"
            min="0"
            value={form.creo_count}
            onChange={(e) => set("creo_count")(e.target.value)}
            placeholder="48"
            className="text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Заповніть те, що знаєте — всі поля опційні. Повторне збереження того ж
        місяця оновлює дані.
      </p>

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
  )
}
