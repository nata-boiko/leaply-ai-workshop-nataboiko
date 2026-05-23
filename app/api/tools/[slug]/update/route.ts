import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getAnthropic, MODEL } from "@/lib/anthropic"
import type { Tool } from "@/lib/supabase"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { content } = (await req.json()) as { content: string }

  if (!content?.trim()) {
    return NextResponse.json({ error: "Порожній вміст" }, { status: 400 })
  }

  const { data: tool, error } = await supabase
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 })
  }

  const t = tool as Tool
  const existingGuide = t.guide_markdown ?? ""

  const prompt = existingGuide
    ? `You are maintaining a guide for "${t.name}" used by a performance marketing design team.

EXISTING GUIDE:
${existingGuide}

NEW INFORMATION FROM USER:
${content}

Tasks:
1. Check if the new information is already covered in the existing guide (even if worded differently).
2. If it IS already there: respond with JSON {"duplicate": true, "reason": "brief explanation in Ukrainian of what already covers this"}
3. If it is NEW information: merge it naturally into the existing guide in the right section. Respond with JSON {"duplicate": false, "updatedGuide": "full updated guide markdown in Ukrainian"}`
    : `You are creating a guide for "${t.name}" used by a performance marketing design team.

NEW INFORMATION:
${content}

Create a structured guide in Ukrainian based on this information with sections: ## Для яких задач, ## Можливості, ## Як почати, ## Промпти — що працює, ## Обмеження, ## Поради

Respond with JSON {"duplicate": false, "updatedGuide": "full guide markdown in Ukrainian"}`

  const message = await getAnthropic().messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  })

  const raw = message.content[0].type === "text" ? message.content[0].text : ""

  let parsed: { duplicate: boolean; reason?: string; updatedGuide?: string }
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch?.[0] ?? raw)
  } catch {
    return NextResponse.json(
      { error: "Не вдалось обробити відповідь AI" },
      { status: 500 }
    )
  }

  if (parsed.duplicate) {
    return NextResponse.json({ duplicate: true, reason: parsed.reason })
  }

  if (!parsed.updatedGuide) {
    return NextResponse.json(
      { error: "AI не повернув оновлений гайд" },
      { status: 500 }
    )
  }

  await supabase
    .from("tools")
    .update({
      guide_markdown: parsed.updatedGuide,
      last_scraped_at: new Date().toISOString(),
    })
    .eq("id", t.id)

  return NextResponse.json({ duplicate: false, ok: true })
}
