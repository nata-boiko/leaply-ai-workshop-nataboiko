import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function GET() {
  const { data, error } = await supabase
    .from("team_context")
    .select("content")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ content: data?.content ?? "" })
}

const Schema = z.object({ content: z.string() })

export async function POST(req: NextRequest) {
  try {
    const { content } = Schema.parse(await req.json())

    const { data: existing } = await supabase
      .from("team_context")
      .select("id")
      .limit(1)
      .single()

    if (existing) {
      await supabase
        .from("team_context")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await supabase.from("team_context").insert({ content })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Помилка збереження" }, { status: 500 })
  }
}
