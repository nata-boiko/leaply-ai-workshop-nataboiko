"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckupDialog } from "@/components/checkup-dialog"
import { RenewalDialog } from "@/components/renewal-dialog"
import { SubscriptionEditDialog } from "@/components/subscription-edit-dialog"
import { CreditDeductionDialog } from "@/components/credit-deduction-dialog"
import type { Subscription } from "@/lib/supabase"

export function SubscriptionPageActions({ sub }: { sub: Subscription }) {
  const [checkupOpen, setCheckupOpen] = useState(false)
  const [renewalOpen, setRenewalOpen] = useState(false)
  const [deductionOpen, setDeductionOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-xs"
          onClick={() => setCheckupOpen(true)}
        >
          Чек-ап
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-xs"
          onClick={() => setRenewalOpen(true)}
        >
          + Оновлення
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-xs"
          onClick={() => setDeductionOpen(true)}
        >
          + Списання
        </Button>
        <Button
          size="sm"
          className="rounded-xl text-xs"
          onClick={() => setEditOpen(true)}
        >
          Редагувати
        </Button>
      </div>

      <CheckupDialog
        sub={sub}
        open={checkupOpen}
        onClose={() => setCheckupOpen(false)}
      />
      <RenewalDialog
        sub={sub}
        open={renewalOpen}
        onClose={() => setRenewalOpen(false)}
      />
      <CreditDeductionDialog
        sub={sub}
        open={deductionOpen}
        onClose={() => setDeductionOpen(false)}
      />
      <SubscriptionEditDialog
        sub={sub}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  )
}
