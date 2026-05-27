import { SubscriptionForm } from "@/components/subscription-form"
import { supabase } from "@/lib/supabase"
import type { Tool } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function NewSubscriptionPage() {
  const { data } = await supabase.from("tools").select("*").order("name")
  const tools = (data ?? []) as Tool[]

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-base font-semibold">Нова підписка</h1>
      <SubscriptionForm tools={tools} />
    </div>
  )
}
