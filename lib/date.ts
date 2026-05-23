export function formatDistanceToNow(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "сьогодні"
  if (diffDays === 1) return "вчора"
  if (diffDays < 7) return `${diffDays}д тому`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}тиж тому`
  return `${Math.floor(diffDays / 30)}міс тому`
}
