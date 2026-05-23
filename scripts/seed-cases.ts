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

const klingCases = [
  {
    task_name: "UGC testimonial для реклами програми по вагусному нерву",
    success: true,
  },
  { task_name: "POV відео для Instagram Reels", success: true },
  {
    task_name: "Експертне відео лікаря на 2 хвилини",
    success: false,
    outcome: "Не вдалось досягти достатньої якості для довгого формату.",
  },
  {
    task_name: "Мультфільм з постійним персонажем через 10 сцен",
    success: false,
    outcome: "Консистентність персонажа втрачається між сценами.",
  },
  {
    task_name: "Згенерувати розкадровку для мультфільму в стилі Pixar",
    success: true,
    approach:
      "Create a 10-scene storyboard for a Pixar-style animated commercial about a stressed office worker who discovers breathing exercises.",
    outcome: "Отримали готову структуру сцен для подальшої генерації.",
  },
  {
    task_name: "Генерація вправ для реклами здоров'я",
    success: true,
    approach:
      "Woman performing squats in a bright living room, fitness instructional style, full body visible, clean movement, realistic anatomy.",
    outcome: "Використали як B-roll вставки.",
  },
  {
    task_name: "Дитина плаче через забраний планшет",
    success: true,
    approach:
      "Young child sitting on a couch, crying because tablet was taken away, concerned mother nearby, family living room, emotional but safe atmosphere.",
    outcome: "Сильний рекламний хук.",
  },
  {
    task_name: "Згенерувати мультфільм лише за діалогом персонажів",
    success: false,
    outcome: "Потрібен storyboard перед генерацією.",
  },
]

const higgsfieldCases = [
  { task_name: "Product Hero Shot для Facebook Video Ads", success: true },
  { task_name: "POV Anxiety Visualization", success: true },
  {
    task_name: "UGC Testimonial на 60 секунд",
    success: false,
    outcome: "Складно підтримувати якість протягом довгого відео.",
  },
  {
    task_name: "Мультфільм для сторітелінгу на 3 хвилини",
    success: false,
    outcome: "Недостатня консистентність для довгих форматів.",
  },
  {
    task_name: "Cinematic Exercise Demonstration",
    success: true,
    approach:
      "Athletic woman demonstrating squats in a modern fitness studio, cinematic commercial style.",
    outcome: "Якісні hero shots для реклами.",
  },
  {
    task_name: "Emotional Parenting Scene",
    success: true,
    approach:
      "Mother gently taking away a tablet from her child, child starts crying, emotional family moment.",
    outcome: "Сильний емоційний хук.",
  },
  {
    task_name: "Disney-style cartoon story на 4 хвилини",
    success: false,
    outcome: "Недостатня консистентність персонажів.",
  },
  {
    task_name: "Генерація промптів для мультфільму за репліками",
    success: true,
    outcome:
      "Storyboard значно якісніший після попередньої генерації структури сцен.",
  },
]

async function main() {
  // Get tool IDs
  const { data: tools } = await supabase.from("tools").select("id, slug")
  const kling = tools?.find((t) => t.slug === "kling")
  const higgsfield = tools?.find((t) => t.slug === "higgsfield")

  if (!kling || !higgsfield) {
    console.error("Tools not found:", tools)
    process.exit(1)
  }

  console.log("Kling ID:", kling.id)
  console.log("Higgsfield ID:", higgsfield.id)

  const toInsert = [
    ...klingCases.map((c) => ({
      ...c,
      tool_id: kling.id,
      source: "web" as const,
    })),
    ...higgsfieldCases.map((c) => ({
      ...c,
      tool_id: higgsfield.id,
      source: "web" as const,
    })),
  ]

  const { error } = await supabase.from("cases").insert(toInsert)

  if (error) {
    console.error("Error inserting cases:", error)
    process.exit(1)
  }

  console.log(
    `✓ Inserted ${toInsert.length} cases (${klingCases.length} Kling + ${higgsfieldCases.length} Higgsfield)`
  )
}

main()
