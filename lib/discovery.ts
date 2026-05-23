import { gunzipSync } from "zlib"

export type DiscoveredUrl = {
  url: string
  lastmod?: string
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AI-KB-Bot/1.0)" },
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function fetchBytes(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AI-KB-Bot/1.0)" },
    })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

function extractSitemapUrls(xml: string): string[] {
  const matches = xml.match(/<loc>(.*?)<\/loc>/g) ?? []
  return matches.map((m) => m.replace(/<\/?loc>/g, "").trim())
}

function extractSitemapIndexUrls(xml: string): string[] {
  return extractSitemapUrls(xml)
}

function isSitemapIndex(xml: string): boolean {
  return xml.includes("<sitemapindex")
}

function extractLastmod(xml: string, url: string): string | undefined {
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const block = xml.match(
    new RegExp(`<loc>${escaped}<\\/loc>[^<]*<lastmod>([^<]+)<\\/lastmod>`)
  )
  return block?.[1]
}

async function parseSitemap(url: string, depth = 0): Promise<DiscoveredUrl[]> {
  if (depth > 3) return []

  let xml: string | null

  if (url.endsWith(".gz")) {
    const bytes = await fetchBytes(url)
    if (!bytes) return []
    try {
      xml = gunzipSync(bytes).toString("utf-8")
    } catch {
      return []
    }
  } else {
    xml = await fetchText(url)
    if (!xml) return []
  }

  if (isSitemapIndex(xml)) {
    const childUrls = extractSitemapIndexUrls(xml)
    const results = await Promise.all(
      childUrls.map((u) => parseSitemap(u, depth + 1))
    )
    return results.flat()
  }

  const urls = extractSitemapUrls(xml)
  return urls.map((u) => ({ url: u, lastmod: extractLastmod(xml!, u) }))
}

async function discoverFromRobots(baseUrl: string): Promise<string[]> {
  const text = await fetchText(`${baseUrl}/robots.txt`)
  if (!text) return []
  const sitemaps: string[] = []
  for (const line of text.split("\n")) {
    const match = line.match(/^Sitemap:\s*(.+)$/i)
    if (match?.[1]) sitemaps.push(match[1].trim())
  }
  return sitemaps
}

async function discoverFromLlmsTxt(baseUrl: string): Promise<DiscoveredUrl[]> {
  const text = await fetchText(`${baseUrl}/llms.txt`)
  if (!text) return []

  const urls: DiscoveredUrl[] = []
  const urlRegex = /https?:\/\/[^\s\)>\"']+/g
  const matches = text.match(urlRegex) ?? []
  for (const url of matches) {
    if (url.startsWith(baseUrl)) {
      urls.push({ url })
    }
  }
  return urls
}

const GUIDE_PATTERNS = [
  /\/docs?\//i,
  /\/guide/i,
  /\/tutorial/i,
  /\/learn/i,
  /\/help/i,
  /\/support/i,
  /\/getting[-_]started/i,
  /\/how[-_]to/i,
  /\/features/i,
  /\/changelog/i,
  /\/release/i,
  /\/api[-_]?ref/i,
  /\/reference/i,
  /\/blog/i,
  /\/faq/i,
]

const SKIP_PATTERNS = [
  /\.(png|jpg|jpeg|gif|svg|ico|webp|mp4|mp3|pdf|zip|gz)$/i,
  /\/cdn-cgi\//i,
  /\/wp-admin/i,
  /\?/,
  /#/,
  /\/tag\//i,
  /\/category\//i,
  /\/author\//i,
  /\/page\/\d+/i,
]

export function filterGuideUrls(
  urls: DiscoveredUrl[],
  baseUrl: string
): DiscoveredUrl[] {
  return urls.filter(({ url }) => {
    if (!url.startsWith(baseUrl)) return false
    if (SKIP_PATTERNS.some((p) => p.test(url))) return false
    return GUIDE_PATTERNS.some((p) => p.test(url))
  })
}

export async function discoverToolUrls(
  toolUrl: string
): Promise<DiscoveredUrl[]> {
  const base = new URL(toolUrl).origin
  const seen = new Set<string>()
  const all: DiscoveredUrl[] = []

  function add(items: DiscoveredUrl[]) {
    for (const item of items) {
      if (!seen.has(item.url)) {
        seen.add(item.url)
        all.push(item)
      }
    }
  }

  // 1. Standard paths
  const standardPaths = [
    "/sitemap.xml",
    "/sitemap_index.xml",
    "/sitemap-index.xml",
    "/sitemap/sitemap.xml",
  ]

  const sitemapUrlsFromRobots = await discoverFromRobots(base)
  const sitemapsToParse = [
    ...sitemapUrlsFromRobots,
    ...standardPaths
      .map((p) => `${base}${p}`)
      .filter((u) => !sitemapUrlsFromRobots.includes(u)),
  ]

  // 2. Parse all sitemaps in parallel
  const sitemapResults = await Promise.all(
    sitemapsToParse.map((u) => parseSitemap(u))
  )
  for (const r of sitemapResults) add(r)

  // 3. llms.txt
  const llmsUrls = await discoverFromLlmsTxt(base)
  add(llmsUrls)

  return all
}
