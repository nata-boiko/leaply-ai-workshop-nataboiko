import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BudgetSummaryCards } from "@/components/budget-summary-cards"
import { SpendChart } from "@/components/spend-chart"
import { SubscriptionTable } from "@/components/subscription-table"
import { supabase } from "@/lib/supabase"
import type { Subscription } from "@/lib/supabase"
import { monthlySeries } from "@/lib/metrics"

export const dynamic = "force-dynamic"

async function getSubscriptions(): Promise<Subscription[]> {
  const { data } = await supabase
    .from("subscriptions")
    .select("*, tool:tools(*), usage_logs(*)")
    .order("name")
  return (data ?? []) as Subscription[]
}

export default async function BudgetPage() {
  const subs = await getSubscriptions()
  const series = monthlySeries(subs)

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Бюджет
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Підписки та креди
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl px-4 text-xs font-medium"
          >
            <Link href="/budget/usage/new">Внести місяць</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-xl px-4 text-xs font-medium"
          >
            <Link href="/budget/subscriptions/new">+ Підписка</Link>
          </Button>
        </div>
      </div>

      <BudgetSummaryCards subs={subs} />

      <div className="mb-8 rounded-2xl border p-5">
        <p className="mb-3 text-sm font-semibold">Динаміка по місяцях</p>
        <SpendChart data={series} />
      </div>

      <SubscriptionTable subs={subs} />
    </div>
  )
}
