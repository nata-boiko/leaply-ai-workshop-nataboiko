"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
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
import type { Subscription, Tool } from "@/lib/supabase"

const NO_TOOL = "__none__"

type Props = { initial?: Subscription; tools: Tool[] }

export function SubscriptionForm({ initial, tools }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    tool_id: initial?.tool_id ?? NO_TOOL,
    plan_name: initial?.plan_name ?? "",
    status: initial?.status ?? "active",
    currency: initial?.currency ?? "USD",
    cost_per_cycle: initial?.cost_per_cycle?.toString() ?? "",
    billing_cycle: initial?.billing_cycle ?? "monthly",
    renewal_date: initial?.renewal_date ?? "",
    credits_included: initial?.credits_included?.toString() ?? "",
    credits_unit: initial?.credits_unit ?? "",
    url: initial?.url ?? "",
    notes: initial?.notes ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.name.trim()) {
      setError("Введіть назву сервісу")
      return
    }
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        tool_id: form.tool_id === NO_TOOL ? null : form.tool_id,
        plan_name: form.plan_name || null,
        status: form.status,
        currency: form.currency || "USD",
        cost_per_cycle: form.cost_per_cycle ? Number(form.cost_per_cycle) : 0,
        billing_cycle: form.billing_cycle,
        renewal_date: form.renewal_date || null,
        credits_included: form.credits_included
          ? Number(form.credits_included)
          : null,
        credits_unit: form.credits_unit || null,
        url: form.url || null,
        notes: form.notes || null,
      }
      const url = initial
        ? `/api/subscriptions/${initial.id}`
        : "/api/subscriptions"
      const res = await fetch(url, {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          <Label className="text-xs">Назва сервісу</Label>
          <Input
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Kling"
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Інструмент (опціонально)</Label>
          <Select value={form.tool_id} onValueChange={set("tool_id")}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Не прив'язано" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_TOOL}>Не прив&apos;язано</SelectItem>
              {tools.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Тариф</Label>
          <Input
            value={form.plan_name}
            onChange={(e) => set("plan_name")(e.target.value)}
            placeholder="Pro"
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Статус</Label>
          <Select value={form.status} onValueChange={set("status")}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Ціна</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.cost_per_cycle}
            onChange={(e) => set("cost_per_cycle")(e.target.value)}
            placeholder="29"
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Валюта</Label>
          <Input
            value={form.currency}
            onChange={(e) => set("currency")(e.target.value)}
            placeholder="USD"
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Цикл</Label>
          <Select
            value={form.billing_cycle}
            onValueChange={set("billing_cycle")}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Місячний</SelectItem>
              <SelectItem value="annual">Річний</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Поновлення</Label>
          <Input
            type="date"
            value={form.renewal_date}
            onChange={(e) => set("renewal_date")(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Кредів у плані</Label>
          <Input
            type="number"
            min="0"
            value={form.credits_included}
            onChange={(e) => set("credits_included")(e.target.value)}
            placeholder="1000"
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Одиниця</Label>
          <Input
            value={form.credits_unit}
            onChange={(e) => set("credits_unit")(e.target.value)}
            placeholder="credits"
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Посилання на сайт (опційно)</Label>
        <Input
          type="url"
          value={form.url}
          onChange={(e) => set("url")(e.target.value)}
          placeholder="https://heygen.com"
          className="text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Нотатки (опціонально)</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => set("notes")(e.target.value)}
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
  )
}
