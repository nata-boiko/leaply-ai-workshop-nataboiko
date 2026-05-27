import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { RenewalSchema } from "@/lib/schemas/renewal-schema"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = RenewalSchema.parse(await req.json())

    // Fetch subscription to get billing_cycle for the log record
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("billing_cycle")
      .eq("id", body.subscription_id)
      .single()

    if (subError || !sub)
      return NextResponse.json(
        { error: "Підписку не знайдено" },
        { status: 404 }
      )

    const billingCycle = sub.billing_cycle as "monthly" | "annual"

    // Insert renewal log entry
    const { data, error } = await supabase
      .from("renewal_logs")
      .insert({ ...body, billing_cycle: billingCycle })
      .select()
      .single()

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError)
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Невалідні дані" },
        { status: 400 }
      )
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 })
  }
}
