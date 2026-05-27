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
import type { Subscription } from "@/lib/supabase"

export function CheckupDialog({
  sub,
  open,
  onClose,
}: {
  sub: Subscription
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)
  const [checkupDate, setCheckupDate] = useState(today)
  const [creditsRemaining, setCreditsRemaining] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-calculate credits used: included in plan − remaining
  const creditsUsedComputed =
    sub.credits_included != null && creditsRemaining !== ""
      ? Math.max(0, sub.credits_included - Number(creditsRemaining))
      : null

  // period_month = first day of the month of the selected date
  function periodMonthFromDate(dateStr: string) {
    return dateStr.slice(0, 7) + "-01"
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: sub.id,
          period_month: periodMonthFromDate(checkupDate),
          checkup_date: checkupDate,
          credits_used: creditsUsedComputed ?? 0,
          credits_remaining: creditsRemaining ? Number(creditsRemaining) : null,
          creo_count: 0,
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Чек-ап — {sub.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Дата чек-апу</Label>
            <Input
              type="date"
              value={checkupDate}
              onChange={(e) => setCheckupDate(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Залишок кредитів</Label>
            <Input
              type="number"
              min="0"
              value={creditsRemaining}
              onChange={(e) => setCreditsRemaining(e.target.value)}
              placeholder="360"
              className="text-sm"
            />
          </div>

          {creditsUsedComputed != null && (
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              Спалено:{" "}
              <span className="font-medium text-foreground">
                {creditsUsedComputed}
              </span>{" "}
              кредитів
              {sub.credits_unit ? ` (${sub.credits_unit})` : ""}
              <br />
              <span className="opacity-70">
                {sub.credits_included} у плані − {creditsRemaining} залишок
              </span>
            </p>
          )}

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
