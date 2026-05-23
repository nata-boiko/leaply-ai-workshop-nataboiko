import Anthropic from "@anthropic-ai/sdk"
import { readFileSync } from "fs"
import { join } from "path"

export const MODEL = "claude-sonnet-4-6"

function readKeyFromEnvFile(): string | undefined {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf8")
    for (const line of content.split("\n")) {
      const trimmed = line.trim()
      if (trimmed.startsWith("ANTHROPIC_API_KEY=")) {
        return trimmed.slice("ANTHROPIC_API_KEY=".length).trim() || undefined
      }
    }
  } catch {
    // file not found or unreadable
  }
  return undefined
}

export function getAnthropic(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY || readKeyFromEnvFile()
  return new Anthropic({ apiKey: key })
}
