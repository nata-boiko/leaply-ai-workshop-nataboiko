import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { RenewalSchema } from "@/lib/schemas/renewal-schema"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = RenewalSchema.parse(await req.json())

    // Insert renewal log entry
    const { data, error } = await supabase
      .from("renewal_logs")
      .insert(body)
      .select()
      .single()

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    // Compute next renewal date (charge date + 1 month or + 1 year)
    const d = new Date(`${body.renewed_at}T00:00:00Z`)
    if (body.billing_cycle === "annual") {
      d.setUTCFullYear(d.getUTCFullYear() + 1)
    } else {
      d.setUTCMonth(d.getUTCMonth() + 1)
    }
    const nextRenewalDate = d.toISOString().slice(0, 10)

    // Keep subscription's current values in sync with latest renewal
    await supabase
      .from("subscriptions")
      .update({
        plan_name: body.plan_name,
        status: body.status,
        cost_per_cycle: body.cost_per_cycle,
        billing_cycle: body.billing_cycle,
        currency: body.currency,
        credits_included: body.credits_included ?? null,
        renewal_date: nextRenewalDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.subscription_id)

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
