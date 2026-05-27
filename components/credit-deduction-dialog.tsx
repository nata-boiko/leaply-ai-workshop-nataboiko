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
import type { Subscription } from "@/lib/supabase"

export function CreditDeductionDialog({
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
  const [chargedAt, setChargedAt] = useState(today)
  const [creditsAmount, setCreditsAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!creditsAmount) {
      setError("Введіть кількість кредитів")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/credit-deductions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: sub.id,
          charged_at: chargedAt,
          credits_amount: Number(creditsAmount),
          notes: notes || null,
          source: "manual",
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
          <DialogTitle className="text-base">
            Списання кредитів — {sub.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Дата</Label>
            <Input
              type="date"
              value={chargedAt}
              onChange={(e) => setChargedAt(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Кількість кредитів</Label>
            <Input
              type="number"
              min="0"
              value={creditsAmount}
              onChange={(e) => setCreditsAmount(e.target.value)}
              placeholder="500"
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
