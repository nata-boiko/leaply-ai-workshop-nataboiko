export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency,
    maximumFractionDigits: amount < 100 ? 2 : 0,
  }).format(amount)
}

// "2026-05-01" -> "трав 2026"
export function formatMonth(periodMonth: string): string {
  const d = new Date(`${periodMonth}T00:00:00Z`)
  return new Intl.DateTimeFormat("uk-UA", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d)
}

// "2026-04-20" -> "20 квіт 2026"
export function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d)
}

// Whole days until a date (negative if past)
export function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00Z`).getTime()
  const today = new Date()
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  )
  return Math.round((target - todayUtc) / (1000 * 60 * 60 * 24))
}
