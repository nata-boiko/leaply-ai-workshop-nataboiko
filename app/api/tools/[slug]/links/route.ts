import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { Tool } from "@/lib/supabase"

export const runtime = "nodejs"

type Link = { title: string; url: string; added_at: string }

// POST — add link
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { title, url } = (await req.json()) as { title: string; url: string }
  if (!url?.trim())
    return NextResponse.json({ error: "URL обов'язковий" }, { status: 400 })

  const { data: tool } = await supabase
    .from("tools")
    .select("id, links")
    .eq("slug", slug)
    .single()
  if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const t = tool as Tool
  const existing: Link[] = Array.isArray(t.links) ? t.links : []
  const newLink: Link = {
    title: title?.trim() || url,
    url: url.trim(),
    added_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("tools")
    .update({ links: [...existing, newLink] })
    .eq("id", t.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE — remove link by url
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { url } = (await req.json()) as { url: string }

  const { data: tool } = await supabase
    .from("tools")
    .select("id, links")
    .eq("slug", slug)
    .single()
  if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const t = tool as Tool
  const filtered = (Array.isArray(t.links) ? t.links : []).filter(
    (l: Link) => l.url !== url
  )

  const { error } = await supabase
    .from("tools")
    .update({ links: filtered })
    .eq("id", t.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
