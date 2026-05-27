import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import type { Subscription, RenewalLog } from "@/lib/supabase"
import { monthlyCost } from "@/lib/metrics"
import { formatMoney, formatDate } from "@/lib/format"

export const dynamic = "force-dynamic"

const STATUS_LABEL = { active: "Active", new: "New", canceled: "Canceled" }
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  new: "secondary",
  canceled: "outline",
}

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [subRes, renewalsRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*, tool:tools(*)")
      .eq("id", id)
      .single(),
    supabase
      .from("renewal_logs")
      .select("*")
      .eq("subscription_id", id)
      .order("renewed_at", { ascending: false }),
  ])

  if (!subRes.data) notFound()

  const sub = subRes.data as Subscription
  const renewals = (renewalsRes.data ?? []) as RenewalLog[]

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/budget"
            className="mb-2 block text-xs text-muted-foreground hover:text-foreground"
          >
            ← Budget
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{sub.name}</h1>
          {sub.plan_name && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {sub.plan_name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
          >
            <Link href={`/budget/renewal/new?sub=${sub.id}`}>+ Оновлення</Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl text-xs">
            <Link href={`/budget/subscriptions/${sub.id}/edit`}>
              Редагувати
            </Link>
          </Button>
        </div>
      </div>

      {/* Current info */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {[
          {
            label: "Статус",
            value: (
              <Badge variant={STATUS_VARIANT[sub.status]}>
                {STATUS_LABEL[sub.status]}
              </Badge>
            ),
          },
          {
            label: "Вартість/міс",
            value: formatMoney(monthlyCost(sub), sub.currency),
          },
          {
            label: "Поновлення",
            value: sub.renewal_date ? formatDate(sub.renewal_date) : "—",
          },
          {
            label: "Кредів у плані",
            value:
              sub.credits_included != null
                ? `${sub.credits_included}${sub.credits_unit ? ` ${sub.credits_unit}` : ""}`
                : "—",
          },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border p-4">
            <p className="mb-1 text-xs text-muted-foreground">{label}</p>
            <div className="text-sm font-semibold">{value}</div>
          </div>
        ))}
      </div>

      {sub.url && (
        <a
          href={sub.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 block text-xs text-muted-foreground hover:text-foreground"
        >
          {sub.url} ↗
        </a>
      )}

      {/* Renewal history */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Історія оновлень</p>
        <span className="text-xs text-muted-foreground">
          {renewals.length} записів
        </span>
      </div>

      {renewals.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground">
          Ще немає оновлень. Натисніть «+ Оновлення», щоб додати перше.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Назва плану</TableHead>
                <TableHead className="text-right">Витрати/міс</TableHead>
                <TableHead className="text-right">Кредів</TableHead>
                <TableHead>Цикл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renewals.map((r: RenewalLog) => {
                const monthly =
                  r.billing_cycle === "annual"
                    ? r.cost_per_cycle / 12
                    : r.cost_per_cycle
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {formatDate(r.renewed_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[r.status]}>
                        {STATUS_LABEL[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.plan_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(monthly, r.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.credits_included != null ? r.credits_included : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.billing_cycle === "annual" ? "Річний" : "Місячний"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
