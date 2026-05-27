import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { UsageSchema } from "@/lib/schemas/usage-schema"

export const runtime = "nodejs"

// Upsert a monthly usage entry. If credits_used > 0, auto-create a credit deduction.
export async function POST(req: NextRequest) {
  try {
    const body = UsageSchema.parse(await req.json())

    const { data, error } = await supabase
      .from("usage_logs")
      .upsert(body, { onConflict: "subscription_id,period_month" })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Auto-create a credit deduction when credits were actually used
    if (body.credits_used > 0 && body.checkup_date) {
      // Remove any existing checkup-sourced deduction for this usage_log
      await supabase
        .from("credit_deductions")
        .delete()
        .eq("usage_log_id", data.id)

      await supabase.from("credit_deductions").insert({
        subscription_id: body.subscription_id,
        charged_at: body.checkup_date,
        credits_amount: body.credits_used,
        source: "checkup",
        usage_log_id: data.id,
        notes: null,
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Невалідні дані" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 })
  }
}
