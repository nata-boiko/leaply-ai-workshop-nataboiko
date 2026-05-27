"use client"

import { useState } from "react"
import { RiEditLine } from "@remixicon/react"
import type { Subscription } from "@/lib/supabase"
import { monthlyCost } from "@/lib/metrics"
import { formatMoney, formatDate } from "@/lib/format"
import { SubscriptionEditDialog } from "@/components/subscription-edit-dialog"

export function SubscriptionInfoBlock({ sub }: { sub: Subscription }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="relative rounded-xl border p-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute top-4 right-4 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Редагувати"
        >
          <RiEditLine size={15} />
        </button>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Тарифний план</p>
            <p className="text-sm font-semibold">{sub.plan_name ?? "—"}</p>
            {sub.credits_included != null && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {sub.credits_included}
                {sub.credits_unit ? ` ${sub.credits_unit}` : " credits"}
              </p>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Вартість/міс</p>
            <p className="text-sm font-semibold">
              {formatMoney(monthlyCost(sub), sub.currency)}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Поновлення</p>
            <p className="text-sm font-semibold">
              {sub.renewal_date ? formatDate(sub.renewal_date) : "—"}
            </p>
          </div>
        </div>

        {sub.url && (
          <a
            href={sub.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-xs text-muted-foreground hover:text-foreground"
          >
            {sub.url} ↗
          </a>
        )}
      </div>

      <SubscriptionEditDialog
        sub={sub}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
