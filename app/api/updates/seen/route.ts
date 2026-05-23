import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

const Schema = z.object({ id: z.string().uuid() })

export async function PATCH(req: NextRequest) {
  try {
    const { id } = Schema.parse(await req.json())

    const { error } = await supabase
      .from("scrape_updates")
      .update({ seen: true })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Невалідний запит" }, { status: 400 })
  }
}
