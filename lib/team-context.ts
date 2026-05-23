import { supabase } from "./supabase"

export async function getTeamContext(): Promise<string> {
  const { data } = await supabase
    .from("team_context")
    .select("content")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  return data?.content ?? ""
}
