"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { Subscription } from "@/lib/supabase"
import {
  latestLog,
  periodSpend,
  costPerCreo,
  creditsRunwayWorkingDays,
} from "@/lib/metrics"
import { formatMoney, formatDate, daysUntil } from "@/lib/format"
import { TopUpDialog } from "@/components/topup-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const STATUS_VARIANT: Record<
  Subscription["status"],
  "default" | "secondary" | "outline"
> = {
  active: "default",
  canceled: "outline",
}

const STATUS_LABEL: Record<Subscription["status"], string> = {
  active: "Active",
  canceled: "Canceled",
}

export function SubscriptionTable({ subs }: { subs: Subscription[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Видалити підписку «${name}»? Це також видалить її місячні записи.`
      )
    )
      return
    setDeleting(id)
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" })
    setDeleting(null)
    router.refresh()
  }

  if (subs.length === 0) {
    return (
      <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground">
        Ще немає підписок. Натисніть «+ Підписка», щоб додати першу.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Сервіс</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Витрати/міс</TableHead>
            <TableHead className="text-right">Креди</TableHead>
            <TableHead className="text-right">Запас</TableHead>
            <TableHead className="text-right">Вартість крео</TableHead>
            <TableHead>Поновлення</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subs.map((sub) => {
            const log = latestLog(sub)
            const spend = periodSpend(sub, log)
            const runway = creditsRunwayWorkingDays(log)
            const creo = costPerCreo(spend, log?.creo_count ?? 0)
            const lowRunway = runway != null && runway <= 5

            return (
              <TableRow key={sub.id}>
                <TableCell>
                  <Link
                    href={`/budget/subscriptions/${sub.id}`}
                    className="font-medium hover:underline"
                  >
                    {sub.name}
                  </Link>
                  {sub.plan_name && (
                    <span className="block text-xs text-muted-foreground">
                      {sub.plan_name}
                    </span>
                  )}
                  {log?.extra_credits_source && (
                    <span className="block text-[11px] text-muted-foreground">
                      докуп: {log.extra_credits_source}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[sub.status]}>
                    {STATUS_LABEL[sub.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(spend, sub.currency)}
                  {sub.billing_cycle === "annual" && (
                    <span className="block text-[11px] text-muted-foreground">
                      річна ÷12
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {log
                    ? `${log.credits_used}${
                        sub.credits_included != null
                          ? ` / ${sub.credits_included}`
                          : ""
                      }`
                    : "—"}
                  {log?.credits_remaining != null && (
                    <span className="block text-[11px] text-muted-foreground">
                      лишилось {log.credits_remaining}
                    </span>
                  )}
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums ${
                    lowRunway ? "font-semibold text-destructive" : ""
                  }`}
                >
                  {runway != null ? `≈ ${Math.round(runway)} р.дн` : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {creo != null ? formatMoney(creo, sub.currency) : "—"}
                </TableCell>
                <TableCell className="text-xs">
                  {sub.renewal_date ? (
                    <>
                      {formatDate(sub.renewal_date)}
                      <span className="block text-[11px] text-muted-foreground">
                        через {daysUntil(sub.renewal_date)} дн.
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <TopUpDialog
                    subscriptionId={sub.id}
                    subscriptionName={sub.name}
                  />
                  <Link
                    href={`/budget/subscriptions/${sub.id}/edit`}
                    className="ml-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Ред.
                  </Link>
                  <button
                    onClick={() => handleDelete(sub.id, sub.name)}
                    disabled={deleting === sub.id}
                    className="ml-3 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Видалити
                  </button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
