import type { Subscription } from "@/lib/supabase"
import {
  totalMonthlySpend,
  latestLog,
  creditsRunwayWorkingDays,
} from "@/lib/metrics"
import { formatMoney, formatDate, daysUntil } from "@/lib/format"

const CARD =
  "rounded-2xl border p-5 flex flex-col justify-between min-h-[120px]"

const PALETTES = [
  "bg-[oklch(0.94_0.07_80)] dark:bg-[oklch(0.22_0.05_80)] border-[oklch(0.87_0.09_80/40%)] dark:border-[oklch(0.30_0.06_80/40%)]",
  "bg-[oklch(0.93_0.06_290)] dark:bg-[oklch(0.22_0.05_290)] border-[oklch(0.86_0.08_290/40%)] dark:border-[oklch(0.30_0.06_290/40%)]",
  "bg-[oklch(0.93_0.05_350)] dark:bg-[oklch(0.22_0.04_350)] border-[oklch(0.86_0.07_350/40%)] dark:border-[oklch(0.30_0.05_350/40%)]",
]

const LOW_RUNWAY_DAYS = 5

export function BudgetSummaryCards({ subs }: { subs: Subscription[] }) {
  const active = subs.filter((s) => s.status !== "canceled")
  const total = totalMonthlySpend(subs)
  const currency = active[0]?.currency ?? "USD"

  // Nearest upcoming renewal
  const upcoming = active
    .filter((s) => s.renewal_date && daysUntil(s.renewal_date) >= 0)
    .sort((a, b) => daysUntil(a.renewal_date!) - daysUntil(b.renewal_date!))[0]

  // Subscriptions running low on credits
  const lowRunway = active.filter((s) => {
    const days = creditsRunwayWorkingDays(latestLog(s))
    return days != null && days <= LOW_RUNWAY_DAYS
  })

  return (
    <div className="mb-8 grid grid-cols-3 gap-4">
      <div className={`${CARD} ${PALETTES[0]}`}>
        <p className="text-xs font-medium text-foreground/55">
          Витрати / місяць
        </p>
        <p className="text-2xl font-bold tracking-tight">
          {formatMoney(total, currency)}
        </p>
        <p className="text-xs text-foreground/40">
          {active.length} активних підписок
        </p>
      </div>

      <div className={`${CARD} ${PALETTES[1]}`}>
        <p className="text-xs font-medium text-foreground/55">
          Найближче поновлення
        </p>
        {upcoming?.renewal_date ? (
          <>
            <p className="text-lg font-bold tracking-tight">{upcoming.name}</p>
            <p className="text-xs text-foreground/40">
              {formatDate(upcoming.renewal_date)} · через{" "}
              {daysUntil(upcoming.renewal_date)} дн.
            </p>
          </>
        ) : (
          <p className="text-sm text-foreground/40">Немає дат</p>
        )}
      </div>

      <div className={`${CARD} ${PALETTES[2]}`}>
        <p className="text-xs font-medium text-foreground/55">
          Низький запас кредів
        </p>
        <p className="text-2xl font-bold tracking-tight">{lowRunway.length}</p>
        <p className="line-clamp-1 text-xs text-foreground/40">
          {lowRunway.length > 0
            ? lowRunway.map((s) => s.name).join(", ")
            : "Усе під контролем"}
        </p>
      </div>
    </div>
  )
}
