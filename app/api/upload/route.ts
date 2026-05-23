import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { readFileSync } from "fs"
import { join } from "path"

export const runtime = "nodejs"

function readKeyFromEnvFile(key: string): string | undefined {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf8")
    for (const line of content.split("\n")) {
      const trimmed = line.trim()
      if (trimmed.startsWith(`${key}=`)) {
        return trimmed.slice(key.length + 1).trim() || undefined
      }
    }
  } catch {
    /* ignore */
  }
  return undefined
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const files = formData.getAll("files") as File[]

  if (!files.length) {
    return NextResponse.json({ error: "Немає файлів" }, { status: 400 })
  }
  if (files.length > 10) {
    return NextResponse.json({ error: "Максимум 10 фото" }, { status: 400 })
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || readKeyFromEnvFile("SUPABASE_URL") || ""

  const urls: string[] = []

  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from("case-photos")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json(
        { error: `Помилка завантаження: ${error.message}` },
        { status: 500 }
      )
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/case-photos/${filename}`
    urls.push(publicUrl)
  }

  return NextResponse.json({ urls })
}
