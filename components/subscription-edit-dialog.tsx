"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Subscription } from "@/lib/supabase"

export function SubscriptionEditDialog({
  sub,
  open,
  onClose,
}: {
  sub: Subscription
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [planName, setPlanName] = useState(sub.plan_name ?? "")
  const [status, setStatus] = useState<"active" | "canceled">(sub.status)
  const [costPerCycle, setCostPerCycle] = useState(String(sub.cost_per_cycle))
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    sub.billing_cycle
  )
  const [currency, setCurrency] = useState(sub.currency)
  const [renewalDate, setRenewalDate] = useState(sub.renewal_date ?? "")
  const [url, setUrl] = useState(sub.url ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_name: planName || null,
          status,
          cost_per_cycle: Number(costPerCycle),
          billing_cycle: billingCycle,
          currency,
          renewal_date: renewalDate || null,
          url: url || null,
        }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error ?? "Помилка при збереженні")
      }
      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Невідома помилка")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Редагувати підписку</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="flex flex-col gap-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Тарифний план</Label>
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Pro"
                className="text-sm"
              />
            </div>
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
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Сума за цикл</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={costPerCycle}
                onChange={(e) => setCostPerCycle(e.target.value)}
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
            <Label className="text-xs">Дата поновлення</Label>
            <Input
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Посилання (опційно)</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="text-sm"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Скасувати
            </button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Збереження..." : "Зберегти"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
