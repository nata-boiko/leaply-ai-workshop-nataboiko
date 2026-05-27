import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { CreditDeductionSchema } from "@/lib/schemas/credit-deduction-schema"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = CreditDeductionSchema.parse(await req.json())

    const { data, error } = await supabase
      .from("credit_deductions")
      .insert(body)
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
