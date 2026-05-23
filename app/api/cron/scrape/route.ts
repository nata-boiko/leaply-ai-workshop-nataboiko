import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { scrapeUrl } from "@/lib/scraper"
import { getAnthropic, MODEL } from "@/lib/anthropic"
import { sendSlackNotification } from "@/lib/slack"
import type { Tool } from "@/lib/supabase"

export const runtime = "nodejs"

export async function GET() {
  try {
    const { data: tools, error } = await supabase
      .from("tools")
      .select("*")
      .not("monitor_url", "is", null)

    if (error || !tools) {
      return NextResponse.json(
        { error: "Failed to fetch tools" },
        { status: 500 }
      )
    }

    const results: { tool: string; updated: boolean }[] = []

    for (const tool of tools as Tool[]) {
      if (!tool.monitor_url) continue

      const newContent = await scrapeUrl(tool.monitor_url)
      if (!newContent) {
        results.push({ tool: tool.name, updated: false })
        continue
      }

      if (!tool.guide_markdown) {
        await supabase
          .from("tools")
          .update({
            guide_markdown: newContent,
            last_scraped_at: new Date().toISOString(),
          })
          .eq("id", tool.id)
        results.push({ tool: tool.name, updated: true })
        continue
      }

      const diffMessage = await getAnthropic().messages.create({
        model: MODEL,
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `Compare these two versions of a tool's documentation and describe any MEANINGFUL changes in 1-2 sentences. If there are no significant changes, reply with just "NO_CHANGE".

BEFORE:
${tool.guide_markdown.slice(0, 2000)}

AFTER:
${newContent.slice(0, 2000)}`,
          },
        ],
      })

      const diffText =
        diffMessage.content[0].type === "text"
          ? diffMessage.content[0].text.trim()
          : ""

      if (
        diffText &&
        diffText !== "NO_CHANGE" &&
        !diffText.startsWith("NO_CHANGE")
      ) {
        await Promise.all([
          supabase
            .from("tools")
            .update({
              guide_markdown: newContent,
              last_scraped_at: new Date().toISOString(),
            })
            .eq("id", tool.id),
          supabase.from("scrape_updates").insert({
            tool_id: tool.id,
            diff_summary: diffText,
          }),
        ])

        await sendSlackNotification(`🆕 *${tool.name}* — ${diffText}`)
        results.push({ tool: tool.name, updated: true })
      } else {
        await supabase
          .from("tools")
          .update({ last_scraped_at: new Date().toISOString() })
          .eq("id", tool.id)
        results.push({ tool: tool.name, updated: false })
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 })
  }
}
