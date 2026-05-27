import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type {
  Subscription,
  RenewalLog,
  UsageLog,
  CreditDeduction,
} from "@/lib/supabase"
import { creditsRunwayWorkingDays } from "@/lib/metrics"
import { SubscriptionDetailTabs } from "@/components/subscription-detail-tabs"
import { SubscriptionInfoBlock } from "@/components/subscription-info-block"
import { SubscriptionPageActions } from "@/components/subscription-page-actions"

export const dynamic = "force-dynamic"

const STATUS_DOT: Record<string, string> = {
  active: "bg-green-500",
  canceled: "bg-red-500",
}

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [subRes, renewalsRes, usageRes, deductionsRes] = await Promise.all([
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
    supabase
      .from("usage_logs")
      .select("*")
      .eq("subscription_id", id)
      .order("period_month", { ascending: false }),
    supabase
      .from("credit_deductions")
      .select("*")
      .eq("subscription_id", id)
      .order("charged_at", { ascending: false }),
  ])

  if (!subRes.data) notFound()

  const sub = subRes.data as Subscription
  const renewals = (renewalsRes.data ?? []) as RenewalLog[]
  const usageLogs = (usageRes.data ?? []) as UsageLog[]
  const deductions = (deductionsRes.data ?? []) as CreditDeduction[]

  // Latest check-up for runway
  const latestUsage = usageLogs[0] ?? null
  const runway = creditsRunwayWorkingDays(latestUsage)

  // Total credits = sum of credits_included across all subscription renewals
  const totalCredits = renewals
    .filter((r) => r.type === "subscription" && r.credits_included != null)
    .reduce((sum, r) => sum + (r.credits_included ?? 0), 0)

  // Used credits = sum of all deductions (manual + checkup-auto)
  const usedCredits = deductions.reduce((sum, d) => sum + d.credits_amount, 0)

  // Remaining = total − used (only if we have data)
  const remainingCredits =
    totalCredits > 0 ? Math.max(0, totalCredits - usedCredits) : null

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/budget"
            className="mb-2 block text-xs text-muted-foreground hover:text-foreground"
          >
            ← Budget
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[sub.status] ?? "bg-muted"}`}
              title={sub.status}
            />
            <h1 className="text-2xl font-bold tracking-tight">{sub.name}</h1>
          </div>
        </div>
        <div className="pt-6">
          <SubscriptionPageActions sub={sub} />
        </div>
      </div>

      {/* Info + Credits blocks side by side */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <SubscriptionInfoBlock sub={sub} />

        <div className="rounded-xl border p-5">
          <p className="mb-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Кредити
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">
                Разом нараховано
              </p>
              <p className="text-sm font-semibold">
                {totalCredits > 0
                  ? `${totalCredits}${sub.credits_unit ? ` ${sub.credits_unit}` : ""}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Використано</p>
              <p className="text-sm font-semibold">
                {usedCredits > 0 ? usedCredits : "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Залишок</p>
              <p className="text-sm font-semibold">
                {remainingCredits != null ? remainingCredits : "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Запас</p>
              <p className="text-sm font-semibold">
                {runway != null ? `≈ ${Math.round(runway)} роб. дн.` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: renewals + check-ups */}
      <SubscriptionDetailTabs
        renewals={renewals}
        usageLogs={usageLogs}
        deductions={deductions}
        sub={sub}
        planName={sub.plan_name}
      />
    </div>
  )
}
