import { Suspense } from "react"
import { UsageForm } from "@/components/usage-form"
import { supabase } from "@/lib/supabase"
import type { Subscription } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function NewUsagePage() {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .neq("status", "canceled")
    .order("name")
  const subs = (data ?? []) as Subscription[]

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-base font-semibold">Місячний запис</h1>
      <p className="mb-6 text-xs text-muted-foreground">
        Один запис на місяць для підписки. Повторне збереження того ж місяця
        оновлює дані.
      </p>
      <Suspense>
        <UsageForm subs={subs} />
      </Suspense>
    </div>
  )
}
