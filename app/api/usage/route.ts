import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { UsageSchema } from "@/lib/schemas/usage-schema"

export const runtime = "nodejs"

// Upsert a monthly usage entry (one row per subscription + month)
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
