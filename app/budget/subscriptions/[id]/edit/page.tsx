import { notFound } from "next/navigation"
import { SubscriptionForm } from "@/components/subscription-form"
import { supabase } from "@/lib/supabase"
import type { Subscription, Tool } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function EditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [subRes, toolsRes] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("id", id).single(),
    supabase.from("tools").select("*").order("name"),
  ])

  if (!subRes.data) notFound()
  const sub = subRes.data as Subscription
  const tools = (toolsRes.data ?? []) as Tool[]

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-base font-semibold">Редагувати: {sub.name}</h1>
      <SubscriptionForm initial={sub} tools={tools} />
    </div>
  )
}
