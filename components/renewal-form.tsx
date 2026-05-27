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

type Props = { subs: Subscription[]; preselectedId?: string }

export function RenewalForm({ subs, preselectedId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subId, setSubId] = useState(
    preselectedId ?? searchParams.get("sub") ?? ""
  )
  const [renewedAt, setRenewedAt] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [planName, setPlanName] = useState("")
  const [status, setStatus] = useState<"active" | "new" | "canceled">("active")
  const [amount, setAmount] = useState("")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  )
  const [currency, setCurrency] = useState("USD")
  const [creditsIncluded, setCreditsIncluded] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!subId) {
      setError("Оберіть сервіс")
      return
    }
    if (!amount) {
      setError("Введіть суму списання")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/renewals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: subId,
          renewed_at: renewedAt,
          plan_name: planName || null,
          status,
          cost_per_cycle: Number(amount),
          billing_cycle: billingCycle,
          currency,
          credits_included: creditsIncluded ? Number(creditsIncluded) : null,
        }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error ?? "Помилка при збереженні")
      }
      router.push(`/budget/subscriptions/${subId}`)
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
          <Label className="text-xs">Сервіс</Label>
          <Select value={subId} onValueChange={setSubId}>
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
          <Label className="text-xs">Дата списання</Label>
          <Input
            type="date"
            value={renewedAt}
            onChange={(e) => setRenewedAt(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Статус</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as typeof status)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Назва плану (опційно)</Label>
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Pro"
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Сума списання</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="99"
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Валюта</Label>
          <Input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="USD"
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Цикл</Label>
          <Select
            value={billingCycle}
            onValueChange={(v) => setBillingCycle(v as typeof billingCycle)}
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

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Кредів у новому плані (опційно)</Label>
        <Input
          type="number"
          min="0"
          value={creditsIncluded}
          onChange={(e) => setCreditsIncluded(e.target.value)}
          placeholder="2000"
          className="text-sm"
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
