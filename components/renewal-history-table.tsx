"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { RiEditLine, RiDeleteBin6Line, RiFileCopyLine } from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { RenewalLog } from "@/lib/supabase"
import { formatMoney, formatDate } from "@/lib/format"
import { RenewalEditDialog } from "@/components/renewal-edit-dialog"

const STATUS_LABEL = { active: "Active", canceled: "Canceled" }
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  canceled: "outline",
}

const INITIAL_ROWS = 10

export function RenewalHistoryTable({
  renewals,
  currency,
  planName,
}: {
  renewals: RenewalLog[]
  currency: string
  planName?: string | null
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<RenewalLog | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [duplicating, setDuplicating] = useState<string | null>(null)

  async function handleDuplicate(r: RenewalLog) {
    setDuplicating(r.id)
    try {
      const res = await fetch("/api/renewals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: r.subscription_id,
          renewed_at: new Date().toISOString().slice(0, 10),
          type: r.type,
          plan_name: r.plan_name,
          status: r.status,
          cost_per_cycle: r.cost_per_cycle,
          currency: r.currency,
          credits_included: r.credits_included,
          notes: r.notes,
        }),
      })
      if (!res.ok) return
      const created = (await res.json()) as RenewalLog
      setEditing(created)
    } finally {
      setDuplicating(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Видалити цей запис?")) return
    setDeleting(id)
    try {
      await fetch(`/api/renewals/${id}`, { method: "DELETE" })
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  if (renewals.length === 0) {
    return (
      <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground">
        Ще немає оновлень. Натисніть «+ Оновлення», щоб додати перше.
      </div>
    )
  }

  const displayed = showAll ? renewals : renewals.slice(0, INITIAL_ROWS)
  const hiddenCount = renewals.length - INITIAL_ROWS

  // Totals across ALL filtered renewals (not just visible)
  const totalCost = renewals.reduce((sum, r) => sum + r.cost_per_cycle, 0)
  const totalCredits = renewals.reduce(
    (sum, r) => sum + (r.credits_included ?? 0),
    0
  )

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Назва підписки</TableHead>
              <TableHead className="text-right">Сума оплати</TableHead>
              <TableHead className="text-right">Кредів</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayed.map((r) => {
              const isOpen = expanded === r.id
              return (
                <React.Fragment key={r.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    <TableCell className="font-medium">
                      {formatDate(r.renewed_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[r.status]}>
                        {STATUS_LABEL[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.type === "subscription" ? "default" : "secondary"
                        }
                      >
                        {r.type === "subscription" ? "Підписка" : "+ Креди"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.type === "subscription"
                        ? (r.plan_name ?? planName ?? "—")
                        : ""}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(r.cost_per_cycle, r.currency ?? currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.credits_included != null ? r.credits_included : "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditing(r)
                          }}
                          className="rounded p-1 hover:bg-muted"
                          title="Редагувати"
                        >
                          <RiEditLine size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            void handleDuplicate(r)
                          }}
                          disabled={duplicating === r.id}
                          className="rounded p-1 hover:bg-muted"
                          title="Дублювати"
                        >
                          <RiFileCopyLine size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            void handleDelete(r.id)
                          }}
                          disabled={deleting === r.id}
                          className="rounded p-1 hover:bg-destructive/10 hover:text-destructive"
                          title="Видалити"
                        >
                          <RiDeleteBin6Line size={14} />
                        </button>
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </TableCell>
                  </TableRow>

                  {isOpen && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={7} className="py-3 pl-5">
                        <div className="grid grid-cols-2 gap-6 text-xs">
                          <div>
                            <p className="mb-0.5 text-muted-foreground">
                              Кредів у записі
                            </p>
                            <p className="font-medium">
                              {r.credits_included != null
                                ? r.credits_included
                                : "не вказано"}
                            </p>
                          </div>
                          <div>
                            <p className="mb-0.5 text-muted-foreground">
                              Коментар
                            </p>
                            <p className="font-medium">{r.notes ?? "—"}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>

        {/* Summary row */}
        <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">
            Разом {renewals.length} записів
          </span>
          <div className="flex items-center gap-6 text-xs font-semibold tabular-nums">
            <span>{formatMoney(totalCost, currency)}</span>
            {totalCredits > 0 && <span>{totalCredits} кредів</span>}
          </div>
        </div>
      </div>

      {/* Show more / less */}
      {hiddenCount > 0 && (
        <div className="mt-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Згорнути" : `Показати ще ${hiddenCount}`}
          </Button>
        </div>
      )}

      {editing && (
        <RenewalEditDialog
          renewal={editing}
          open={true}
          onClose={() => {
            setEditing(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
