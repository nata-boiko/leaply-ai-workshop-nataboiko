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
import { CheckupEditDialog } from "@/components/checkup-edit-dialog"
import type { UsageLog, Subscription } from "@/lib/supabase"
import { formatDate } from "@/lib/format"

export function CheckupHistoryTable({
  logs,
  sub,
}: {
  logs: UsageLog[]
  sub: Pick<Subscription, "id" | "name" | "credits_included" | "credits_unit">
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<UsageLog | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("Видалити цей чек-ап?")) return
    setDeleting(id)
    try {
      await fetch(`/api/usage/${id}`, { method: "DELETE" })
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground">
        Ще немає чек-апів.
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead className="text-right">Залишок</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {log.checkup_date
                    ? formatDate(log.checkup_date)
                    : formatDate(log.period_month)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {log.credits_remaining != null ? log.credits_remaining : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setEditing(log)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="Редагувати"
                    >
                      <RiEditLine size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(log.id)}
                      disabled={deleting === log.id}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                      title="Видалити"
                    >
                      <RiDeleteBin6Line size={14} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <CheckupEditDialog
          log={editing}
          sub={sub}
          open={true}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
