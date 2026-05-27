"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RenewalHistoryTable } from "@/components/renewal-history-table"
import { CheckupHistoryTable } from "@/components/checkup-history-table"
import { CreditDeductionTable } from "@/components/credit-deduction-table"
import { CreditDeductionDialog } from "@/components/credit-deduction-dialog"
import type {
  RenewalLog,
  UsageLog,
  CreditDeduction,
  Subscription,
} from "@/lib/supabase"

function periodLabel(ym: string): string {
  const [y, m] = ym.split("-")
  const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(
    "uk-UA",
    { month: "long", year: "numeric" }
  )
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function SubscriptionDetailTabs({
  renewals,
  usageLogs,
  deductions,
  sub,
  planName,
}: {
  renewals: RenewalLog[]
  usageLogs: UsageLog[]
  deductions: CreditDeduction[]
  sub: Pick<
    Subscription,
    "id" | "name" | "credits_included" | "credits_unit" | "currency"
  >
  planName?: string | null
}) {
  const [activeTab, setActiveTab] = useState("renewals")
  const [renewalPeriod, setRenewalPeriod] = useState("all")
  const [checkupPeriod, setCheckupPeriod] = useState("all")
  const [addDeductionOpen, setAddDeductionOpen] = useState(false)

  const renewalMonths = [
    ...new Set(renewals.map((r) => r.renewed_at.slice(0, 7))),
  ]
    .sort()
    .reverse()
  const checkupMonths = [
    ...new Set(usageLogs.map((l) => l.period_month.slice(0, 7))),
  ]
    .sort()
    .reverse()

  const filteredRenewals =
    renewalPeriod === "all"
      ? renewals
      : renewals.filter((r) => r.renewed_at.startsWith(renewalPeriod))

  const filteredUsageLogs =
    checkupPeriod === "all"
      ? usageLogs
      : usageLogs.filter((l) => l.period_month.startsWith(checkupPeriod))

  // Period filter only for renewals + checkups tabs
  const showPeriodFilter = activeTab === "renewals" || activeTab === "checkups"
  const currentMonths = activeTab === "renewals" ? renewalMonths : checkupMonths
  const currentPeriod = activeTab === "renewals" ? renewalPeriod : checkupPeriod
  const setCurrentPeriod =
    activeTab === "renewals" ? setRenewalPeriod : setCheckupPeriod

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-3 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="renewals">
              Оновлення
              <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0 text-[10px] tabular-nums">
                {filteredRenewals.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="checkups">
              Чек-апи
              <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0 text-[10px] tabular-nums">
                {filteredUsageLogs.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="deductions">
              Списання
              <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0 text-[10px] tabular-nums">
                {deductions.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {activeTab === "deductions" && (
              <button
                type="button"
                onClick={() => setAddDeductionOpen(true)}
                className="h-8 rounded-lg border px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                + Списання
              </button>
            )}
            {showPeriodFilter && currentMonths.length > 0 && (
              <Select value={currentPeriod} onValueChange={setCurrentPeriod}>
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Усі періоди</SelectItem>
                  {currentMonths.map((m) => (
                    <SelectItem key={m} value={m}>
                      {periodLabel(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <TabsContent value="renewals">
          <RenewalHistoryTable
            renewals={filteredRenewals}
            currency={sub.currency}
            planName={planName}
          />
        </TabsContent>

        <TabsContent value="checkups">
          {filteredUsageLogs.length === 0 && usageLogs.length > 0 ? (
            <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground">
              Немає записів за цей період.
            </div>
          ) : (
            <CheckupHistoryTable logs={filteredUsageLogs} sub={sub} />
          )}
        </TabsContent>

        <TabsContent value="deductions">
          <CreditDeductionTable
            items={deductions}
            creditsUnit={sub.credits_unit}
          />
        </TabsContent>
      </Tabs>

      <CreditDeductionDialog
        sub={sub as Subscription}
        open={addDeductionOpen}
        onClose={() => setAddDeductionOpen(false)}
      />
    </>
  )
}
