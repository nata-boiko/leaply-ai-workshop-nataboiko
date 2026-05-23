"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RiSendPlaneLine, RiSparklingLine } from "@remixicon/react"
import ReactMarkdown from "react-markdown"

type AskResponse = {
  answer: string
  tool?: string
  similar_case?: { task_name: string; approach: string } | null
}

export function AskWidget() {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState<AskResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleAsk() {
    const q = query.trim()
    if (!q) return
    setError("")
    setResponse(null)
    setLoading(true)
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error ?? "Помилка")
      }
      const data = (await res.json()) as AskResponse
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Невідома помилка")
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void handleAsk()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <RiSparklingLine size={15} className="text-primary" />
        <span className="text-sm font-medium">Ask AI</span>
        <span className="ml-auto text-xs text-muted-foreground">⌘↵</span>
      </div>

      {/* Input */}
      <div className="p-4">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Опишіть задачу — знайдемо потрібний інструмент і підхід..."
          rows={3}
          className="resize-none border-border bg-secondary/50 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
          disabled={loading}
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            size="sm"
            className="gap-1.5 rounded-lg text-xs"
          >
            <RiSendPlaneLine size={13} />
            {loading ? "Шукаю..." : "Запитати"}
          </Button>
        </div>
      </div>

      {/* Response */}
      {error && (
        <div className="mx-4 mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {response && (
        <div className="border-t border-border px-5 py-4">
          <div className="flex flex-col gap-4">
            {response.tool && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Інструмент:
                </span>
                <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {response.tool}
                </span>
              </div>
            )}

            <div className="prose prose-sm prose-invert max-w-none text-sm [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_li]:text-muted-foreground [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-4">
              <ReactMarkdown>{response.answer}</ReactMarkdown>
            </div>

            {response.similar_case && (
              <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
                <p className="mb-1 text-xs font-medium text-primary">
                  Схожий кейс
                </p>
                <p className="text-xs text-muted-foreground">
                  {response.similar_case.task_name}
                </p>
                {response.similar_case.approach && (
                  <p className="mt-1.5 line-clamp-2 rounded-lg bg-muted/50 px-2 py-1.5 font-mono text-xs text-muted-foreground">
                    {response.similar_case.approach}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
