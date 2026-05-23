import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

const UpdateSchema = z.object({
  task_name: z.string().min(1).optional(),
  task_details: z.string().optional(),
  approach: z.string().optional(),
  iterations: z.coerce.number().int().min(1).optional().nullable(),
  outcome: z.string().optional(),
  success: z.boolean().optional(),
  time_spent_min: z.coerce.number().int().min(0).optional().nullable(),
  time_without_ai_min: z.coerce.number().int().min(0).optional().nullable(),
  photos: z.array(z.string()).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = UpdateSchema.parse(await req.json())
    const { data, error } = await supabase
      .from("cases")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof z.ZodError)
      return NextResponse.json(
        { error: err.issues[0]?.message },
        { status: 400 }
      )
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 })
  }
}
