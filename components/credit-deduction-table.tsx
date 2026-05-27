"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RiEditLine, RiDeleteBin6Line } from "@remixicon/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import type { CreditDeduction } from "@/lib/supabase"
import { formatDate } from "@/lib/format"

function EditDialog({
  item,
  open,
  onClose,
}: {
  item: CreditDeduction
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [chargedAt, setChargedAt] = useState(item.charged_at)
  const [creditsAmount, setCreditsAmount] = useState(
    String(item.credits_amount)
  )
  const [notes, setNotes] = useState(item.notes ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/credit-deductions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charged_at: chargedAt,
          credits_amount: Number(creditsAmount),
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Редагувати списання</DialogTitle>
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

export function CreditDeductionTable({
  items,
  creditsUnit,
}: {
  items: CreditDeduction[]
  creditsUnit?: string | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<CreditDeduction | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("Видалити це списання?")) return
    setDeleting(id)
    try {
      await fetch(`/api/credit-deductions/${id}`, { method: "DELETE" })
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground">
        Ще немає списань.
      </div>
    )
  }

  const total = items.reduce((sum, d) => sum + d.credits_amount, 0)

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Джерело</TableHead>
              <TableHead>Коментар</TableHead>
              <TableHead className="text-right">
                Кредити{creditsUnit ? ` (${creditsUnit})` : ""}
              </TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {formatDate(item.charged_at)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.source === "checkup" ? "Чек-ап" : "Вручну"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.notes ?? "—"}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {item.credits_amount}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setEditing(item)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="Редагувати"
                    >
                      <RiEditLine size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                      title="Видалити"
                    >
                      <RiDeleteBin6Line size={14} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/40 font-semibold">
              <TableCell colSpan={3}>Разом</TableCell>
              <TableCell className="text-right tabular-nums">{total}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {editing && (
        <EditDialog
          item={editing}
          open={true}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
