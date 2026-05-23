import { JSDOM } from "jsdom"

async function scrapeWithFirecrawl(
  url: string,
  apiKey: string
): Promise<string | null> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ url, formats: ["markdown"] }),
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return null
    const data = (await response.json()) as { data?: { markdown?: string } }
    return data.data?.markdown ?? null
  } catch {
    return null
  }
}

function htmlToText(html: string): string {
  const dom = new JSDOM(html)
  const doc = dom.window.document

  // Remove noisy elements
  for (const el of doc.querySelectorAll(
    "script,style,nav,footer,header,aside,[class*='cookie'],[class*='banner'],[id*='cookie'],[id*='banner']"
  )) {
    el.remove()
  }

  const main =
    doc.querySelector("main") ??
    doc.querySelector("article") ??
    doc.querySelector('[class*="content"]') ??
    doc.querySelector('[class*="docs"]') ??
    doc.body

  return (main?.textContent ?? "")
    .replace(/\s{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/g, "")
    .slice(0, 8000)
}

async function scrapeWithFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AI-KB-Bot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const text = htmlToText(html)
    return text.length > 100 ? text : null
  } catch {
    return null
  }
}

export async function scrapeUrl(url: string): Promise<string | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (apiKey && apiKey !== "your_firecrawl_api_key_here") {
    const result = await scrapeWithFirecrawl(url, apiKey)
    if (result) return result
  }
  return scrapeWithFetch(url)
}
