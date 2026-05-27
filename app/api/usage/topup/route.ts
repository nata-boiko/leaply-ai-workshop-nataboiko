import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { periodMonthString } from "@/lib/metrics"

export const runtime = "nodejs"

const TopUpSchema = z.object({
  subscription_id: z.string().uuid(),
  amount: z.coerce.number().positive("Сума має бути більше 0"),
  source: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const { subscription_id, amount, source } = TopUpSchema.parse(
      await req.json()
    )

    const period_month = periodMonthString()

    // Find existing log for current month
    const { data: existing } = await supabase
      .from("usage_logs")
      .select("id, extra_credits_cost, extra_credits_source")
      .eq("subscription_id", subscription_id)
      .eq("period_month", period_month)
      .single()

    if (existing) {
      const newCost = (existing.extra_credits_cost ?? 0) + amount
      const newSource = source
        ? existing.extra_credits_source
          ? `${existing.extra_credits_source}, ${source}`
          : source
        : existing.extra_credits_source

      const { data, error } = await supabase
        .from("usage_logs")
        .update({
          extra_credits_cost: newCost,
          extra_credits_source: newSource,
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // No log yet for this month — create one with just the top-up
    const { data, error } = await supabase
      .from("usage_logs")
      .insert({
        subscription_id,
        period_month,
        credits_used: 0,
        extra_credits_cost: amount,
        extra_credits_source: source ?? null,
      })
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
