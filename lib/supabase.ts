import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL ?? "https://placeholder.supabase.co"
const key = process.env.SUPABASE_ANON_KEY ?? "placeholder-key"

export const supabase = createClient(url, key)

export type Tool = {
  id: string
  slug: string
  name: string
  description: string | null
  monitor_url: string | null
  guide_markdown: string | null
  manual_notes: string | null
  links: { title: string; url: string; added_at: string }[]
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
  photos: string[]
  created_at: string
  tool?: Tool
}

export type TeamContext = {
  id: string
  content: string
  updated_at: string
}

export type Subscription = {
  id: string
  tool_id: string | null
  name: string
  plan_name: string | null
  status: "active" | "new" | "canceled"
  currency: string
  cost_per_cycle: number
  billing_cycle: "monthly" | "annual"
  renewal_date: string | null
  credits_included: number | null
  credits_unit: string | null
  url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  tool?: Tool | null
  usage_logs?: UsageLog[]
}

export type RenewalLog = {
  id: string
  subscription_id: string
  renewed_at: string
  plan_name: string | null
  status: "active" | "new" | "canceled"
  cost_per_cycle: number
  billing_cycle: "monthly" | "annual"
  currency: string
  credits_included: number | null
  notes: string | null
  created_at: string
}

export type UsageLog = {
  id: string
  subscription_id: string
  period_month: string
  credits_used: number
  credits_remaining: number | null
  creo_count: number
  extra_credits_cost: number
  extra_credits_source: string | null
  recorded_at: string
}
