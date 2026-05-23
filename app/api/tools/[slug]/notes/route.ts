import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { Tool } from "@/lib/supabase"

export const runtime = "nodejs"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { notes } = (await req.json()) as { notes: string }

  const { data: tool } = await supabase
    .from("tools")
    .select("id")
    .eq("slug", slug)
    .single()
  if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { error } = await supabase
    .from("tools")
    .update({ manual_notes: notes })
    .eq("id", (tool as Tool).id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
