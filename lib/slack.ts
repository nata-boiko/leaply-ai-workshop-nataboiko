import { env } from "./env"

export async function sendSlackNotification(message: string): Promise<void> {
  if (!env.SLACK_WEBHOOK_URL) return

  await fetch(env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  })
}
