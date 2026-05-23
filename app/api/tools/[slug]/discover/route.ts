import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { buildGuide } from "@/lib/guide-builder"
import type { Tool } from "@/lib/supabase"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: tool, error } = await supabase
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 })
  }

  const t = tool as Tool
  if (!t.monitor_url) {
    return NextResponse.json(
      { error: "Tool has no URL configured" },
      { status: 400 }
    )
  }

  try {
    const result = await buildGuide(t.name, t.monitor_url)

    await supabase
      .from("tools")
      .update({
        guide_markdown: result.guide,
        last_scraped_at: new Date().toISOString(),
      })
      .eq("id", t.id)

    return NextResponse.json({
      ok: true,
      urlsFound: result.urlsFound,
      urlsScraped: result.urlsScraped,
      sources: result.sources,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to build guide" },
      { status: 500 }
    )
  }
}
