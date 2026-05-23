import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

function readEnvFile(): Record<string, string> {
  const content = readFileSync(join(process.cwd(), ".env.local"), "utf8")
  const result: Record<string, string> = {}
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    result[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
  }
  return result
}

const env = readEnvFile()
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

async function main() {
  const { data: tools } = await supabase.from("tools").select("id, slug")
  const kling = tools?.find((t) => t.slug === "kling")
  if (!kling) {
    console.error("Kling not found")
    process.exit(1)
  }

  const { data: cases } = await supabase
    .from("cases")
    .select("id, task_name")
    .eq("tool_id", kling.id)
    .ilike("task_name", "%лікаря%")

  if (!cases?.length) {
    console.error("Case not found")
    process.exit(1)
  }
  const caseId = cases[0].id
  console.log("Updating:", cases[0].task_name)

  const { error } = await supabase
    .from("cases")
    .update({
      task_name: "Експертне відео лікаря на 2 хвилини",
      approach: `Prompt:
Professional doctor speaking directly to camera in medical office, explaining nervous system health, realistic gestures, natural speech.`,
      task_details:
        "Хотіли повністю замінити реального експерта AI-генерацією.",
      iterations: 8,
      time_spent_min: 60,
      time_without_ai_min: 90,
      outcome:
        "Після 20–30 секунд починалися артефакти обличчя. Жести повторювалися. Виглядало неприродно.\n\nВисновок: краще використовувати реального експерта або нарізати короткі сцени по 5–10 секунд.",
      success: false,
    })
    .eq("id", caseId)

  if (error) {
    console.error(error)
    process.exit(1)
  }
  console.log("✓ Done")
}

main()
