import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL ?? ""
    const key = process.env.SUPABASE_ANON_KEY ?? ""
    if (!url || !key) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
    }
    _client = createClient(url, key)
  }
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  },
})

export type Tool = {
  id: string
  slug: string
  name: string
  description: string | null
  monitor_url: string | null
  guide_markdown: string | null
  last_scraped_at: string | null
  created_at: string
}

export type ScrapeUpdate = {
  id: string
  tool_id: string
  diff_summary: string
  seen: boolean
  detected_at: string
}

export type Case = {
  id: string
  tool_id: string
  task_name: string
  task_details: string | null
  approach: string | null
  iterations: number | null
  outcome: string | null
  success: boolean
  time_spent_min: number | null
  time_without_ai_min: number | null
  source: "web" | "extension"
  created_at: string
  tool?: Tool
}

export type TeamContext = {
  id: string
  content: string
  updated_at: string
}
