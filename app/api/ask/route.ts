import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAnthropic, MODEL } from "@/lib/anthropic"
import { supabase } from "@/lib/supabase"
import { getTeamContext } from "@/lib/team-context"
import type { Tool, Case } from "@/lib/supabase"

export const runtime = "nodejs"

const QuerySchema = z.object({
  query: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = QuerySchema.parse(await req.json())

    const [toolsRes, casesRes, teamContext] = await Promise.all([
      supabase.from("tools").select("*").order("name"),
      supabase
        .from("cases")
        .select("*, tool:tools(name)")
        .order("created_at", { ascending: false })
        .limit(30),
      getTeamContext(),
    ])

    const tools = (toolsRes.data ?? []) as Tool[]
    const cases = (casesRes.data ?? []) as (Case & {
      tool: { name: string }
    })[]

    const toolsSummary = tools
      .map(
        (t) =>
          `**${t.name}** (slug: ${t.slug})\n${t.description ?? ""}\n${t.guide_markdown ? t.guide_markdown.slice(0, 800) : ""}`
      )
      .join("\n\n---\n\n")

    const casesSummary = cases
      .map(
        (c) =>
          `- [${c.tool?.name}] ${c.task_name}: ${c.approach?.slice(0, 200) ?? ""} (${c.success ? "успішно" : "невдало"}, ${c.time_spent_min ?? "?"}хв)`
      )
      .join("\n")

    const systemPrompt = `Ти — асистент бази знань AI-інструментів дизайн-команди.

${teamContext ? `## Контекст команди\n${teamContext}\n\n` : ""}## Доступні AI-інструменти
${toolsSummary}

## Кейси команди (реальний досвід)
${casesSummary || "Поки немає кейсів."}

## Як відповідати
- Дай конкретну рекомендацію: який інструмент підходить і чому
- Якщо є схожий кейс — посилайся на нього
- Дай покрокові інструкції
- Будь стислим і практичним
- Якщо є схожий кейс, поверни його назву і підхід у полі similar_case у JSON`

    const message = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: body.query,
        },
      ],
    })

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : ""

    const similarCase =
      cases.find((c) =>
        c.task_name
          .toLowerCase()
          .includes(body.query.toLowerCase().slice(0, 20))
      ) ?? null

    const mentionedTool = tools.find((t) =>
      rawText.toLowerCase().includes(t.name.toLowerCase())
    )

    return NextResponse.json({
      answer: rawText,
      tool: mentionedTool?.name ?? null,
      similar_case: similarCase
        ? { task_name: similarCase.task_name, approach: similarCase.approach }
        : null,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Невалідний запит" }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 })
  }
}
