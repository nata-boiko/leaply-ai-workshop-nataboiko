"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

export function RenewalDialog({
  sub,
  open,
  onClose,
}: {
  sub: Subscription
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [renewedAt, setRenewedAt] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [type, setType] = useState<"subscription" | "extra_credits">(
    "subscription"
  )
  const [planName, setPlanName] = useState(sub.plan_name ?? "")
  const [status, setStatus] = useState<"active" | "canceled">("active")
  const [amount, setAmount] = useState(String(sub.cost_per_cycle))
  const [currency, setCurrency] = useState(sub.currency)
  const [creditsIncluded, setCreditsIncluded] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
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
          subscription_id: sub.id,
          renewed_at: renewedAt,
          type,
          plan_name: planName || null,
          status,
          cost_per_cycle: Number(amount),
          currency,
          credits_included: creditsIncluded ? Number(creditsIncluded) : null,
          notes: notes || null,
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
          <DialogTitle className="text-base">
            Оновлення — {sub.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Тип запису</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as typeof type)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subscription">Підписка</SelectItem>
                <SelectItem value="extra_credits">Додаткові креди</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Дата списання</Label>
              <Input
                type="date"
                value={renewedAt}
                onChange={(e) => setRenewedAt(e.target.value)}
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
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Назва плану (опційно)</Label>
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Pro"
              className="text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Сума списання</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Кредів у плані (опційно)</Label>
            <Input
              type="number"
              min="0"
              value={creditsIncluded}
              onChange={(e) => setCreditsIncluded(e.target.value)}
              placeholder="2000"
              className="text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Коментар (опційно)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none text-sm"
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
