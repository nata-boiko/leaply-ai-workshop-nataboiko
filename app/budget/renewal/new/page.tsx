import { Suspense } from "react"
import { RenewalForm } from "@/components/renewal-form"

import { supabase } from "@/lib/supabase"
import type { Subscription } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function NewRenewalPage() {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .neq("status", "canceled")
    .order("name")
  const subs = (data ?? []) as Subscription[]

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-base font-semibold">Оновлення підписки</h1>
      <p className="mb-6 text-xs text-muted-foreground">
        Зафіксуйте факт списання — оновить дату поновлення і суму для цього
        сервісу.
      </p>
      <Suspense>
        <RenewalForm subs={subs} />
      </Suspense>
    </div>
  )
}
