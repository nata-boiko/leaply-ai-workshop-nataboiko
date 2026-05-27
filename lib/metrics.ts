import type { Subscription, UsageLog } from "@/lib/supabase"

// First day of a month as "YYYY-MM-01"
export function periodMonthString(d: Date = new Date()): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  return `${y}-${m}-01`
}

// Recurring subscription cost normalized to a single month
export function monthlyCost(sub: Subscription): number {
  return sub.billing_cycle === "annual"
    ? sub.cost_per_cycle / 12
    : sub.cost_per_cycle
}

// Most recent usage log for a subscription (by period_month)
export function latestLog(sub: Subscription): UsageLog | null {
  const logs = sub.usage_logs ?? []
  if (logs.length === 0) return null
  return [...logs].sort((a, b) =>
    b.period_month.localeCompare(a.period_month)
  )[0]
}

// Total money spent on a subscription in a given period (recurring + top-ups)
export function periodSpend(sub: Subscription, log: UsageLog | null): number {
  return monthlyCost(sub) + (log?.extra_credits_cost ?? 0)
}

// Sum of monthly spend across subscriptions for their latest logged period
export function totalMonthlySpend(subs: Subscription[]): number {
  return subs
    .filter((s) => s.status !== "canceled")
    .reduce((sum, s) => sum + periodSpend(s, latestLog(s)), 0)
}

// Cost of one creative: spend / number of creatives produced
export function costPerCreo(spend: number, creoCount: number): number | null {
  if (!creoCount || creoCount <= 0) return null
  return spend / creoCount
}

// Days that have elapsed in the log's month (at least 1), capped at the
// number of days in that month.
function daysElapsedInMonth(
  periodMonth: string,
  asOf: Date = new Date()
): number {
  const start = new Date(`${periodMonth}T00:00:00Z`)
  const year = start.getUTCFullYear()
  const month = start.getUTCMonth()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

  const sameMonth =
    asOf.getUTCFullYear() === year && asOf.getUTCMonth() === month
  const elapsed = sameMonth ? asOf.getUTCDate() : daysInMonth
  return Math.min(Math.max(elapsed, 1), daysInMonth)
}

// How long the remaining credits will last, expressed in working days.
// Returns null when it can't be computed (no remaining value, no burn).
export function creditsRunwayWorkingDays(
  log: UsageLog | null,
  asOf: Date = new Date()
): number | null {
  if (!log) return null
  if (log.credits_remaining == null) return null
  if (log.credits_used <= 0) return null

  const elapsed = daysElapsedInMonth(log.period_month, asOf)
  const dailyBurn = log.credits_used / elapsed
  if (dailyBurn <= 0) return null

  const calendarDaysLeft = log.credits_remaining / dailyBurn
  return calendarDaysLeft * (5 / 7)
}

// Month-by-month series of credits used and total spend, oldest first.
export function monthlySeries(
  subs: Subscription[]
): { month: string; credits: number; spend: number }[] {
  const byMonth = new Map<string, { credits: number; spend: number }>()

  for (const sub of subs) {
    const recurring = monthlyCost(sub)
    for (const log of sub.usage_logs ?? []) {
      const entry = byMonth.get(log.period_month) ?? { credits: 0, spend: 0 }
      entry.credits += log.credits_used
      entry.spend += recurring + log.extra_credits_cost
      byMonth.set(log.period_month, entry)
    }
  }

  return [...byMonth.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({ month, ...v }))
}
