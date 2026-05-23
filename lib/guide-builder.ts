import { discoverToolUrls, filterGuideUrls } from "./discovery"
import { scrapeUrl } from "./scraper"
import { anthropic, MODEL } from "./anthropic"

const MAX_URLS = 12
const MAX_CONTENT_PER_URL = 3000
const MAX_TOTAL_CONTENT = 30000

export type GuideBuilderResult = {
  guide: string
  sources: string[]
  urlsFound: number
  urlsScraped: number
}

export async function buildGuide(
  toolName: string,
  toolUrl: string
): Promise<GuideBuilderResult> {
  // 1. Discover all URLs
  const allUrls = await discoverToolUrls(toolUrl)
  const base = new URL(toolUrl).origin
  const guideUrls = filterGuideUrls(allUrls, base)

  // 2. Also always include the homepage
  const homepageUrl = toolUrl
  const urlsToScrape = [
    homepageUrl,
    ...guideUrls.slice(0, MAX_URLS - 1).map((u) => u.url),
  ]

  // 3. Scrape in parallel (with concurrency limit)
  const scraped: { url: string; content: string }[] = []

  const chunks = []
  for (let i = 0; i < urlsToScrape.length; i += 4) {
    chunks.push(urlsToScrape.slice(i, i + 4))
  }

  for (const chunk of chunks) {
    const results = await Promise.all(
      chunk.map(async (url) => {
        const content = await scrapeUrl(url)
        return content
          ? { url, content: content.slice(0, MAX_CONTENT_PER_URL) }
          : null
      })
    )
    scraped.push(
      ...(results.filter(Boolean) as { url: string; content: string }[])
    )
  }

  if (scraped.length === 0) {
    return {
      guide: `# ${toolName}\n\nНе вдалося отримати контент з ${toolUrl}. Додайте гайд вручну.`,
      sources: [],
      urlsFound: allUrls.length,
      urlsScraped: 0,
    }
  }

  // 4. Build context (trim to limit)
  let totalChars = 0
  const contextParts: string[] = []
  for (const { url, content } of scraped) {
    if (totalChars + content.length > MAX_TOTAL_CONTENT) break
    contextParts.push(`## Source: ${url}\n\n${content}`)
    totalChars += content.length
  }
  const context = contextParts.join("\n\n---\n\n")

  // 5. Claude synthesizes the guide
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are building a practical guide for a design team that uses AI tools for performance marketing (video ads, banners, animations for Instagram/TikTok/Facebook).

Based on the scraped content below from ${toolName}'s website, create a structured guide in Ukrainian language with these sections:

# ${toolName}

## Для яких задач
(1-2 sentences on what this tool is best for in our context)

## Можливості
(bullet list of key features relevant to video/image generation)

## Тривалість відео
(if applicable: what video lengths are supported)

## Як почати
(step-by-step: how to get started, key settings)

## Промпти — що працює
(3-5 concrete prompt examples that work well, based on the docs)

## Обмеження
(what the tool can't do or does poorly)

## Поради
(2-3 practical tips from the documentation)

Keep it practical and concise. Focus on what a designer would actually need to know to use this tool effectively.

SCRAPED CONTENT:
${context}`,
      },
    ],
  })

  const guide =
    message.content[0].type === "text"
      ? message.content[0].text
      : `# ${toolName}\n\nНе вдалося згенерувати гайд.`

  return {
    guide,
    sources: scraped.map((s) => s.url),
    urlsFound: allUrls.length,
    urlsScraped: scraped.length,
  }
}
