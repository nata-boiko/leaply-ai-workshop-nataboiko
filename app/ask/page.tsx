"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import ReactMarkdown from "react-markdown"

type AskResponse = {
  answer: string
  tool?: string
  similar_case?: { task_name: string; approach: string } | null
}

export default function AskPage() {
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
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      void handleAsk()
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-base font-semibold">Ask</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Опишіть задачу — система знайде відповідний інструмент і підхід на
          основі гайдів і кейсів команди.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Мені потрібно анімувати статичне фото продукту для Instagram Stories..."
          rows={4}
          className="resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            ⌘↵ для відправки
          </span>
          <Button
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            size="sm"
          >
            {loading ? "Шукаю..." : "Запитати →"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-6">
          <div className="mb-6 h-px bg-border" />

          <div className="flex flex-col gap-4">
            {response.tool && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Рекомендований інструмент:
                </span>
                <span className="rounded-md bg-foreground px-2 py-0.5 text-xs font-medium text-background">
                  {response.tool}
                </span>
              </div>
            )}

            <div className="prose prose-sm prose-neutral max-w-none text-sm [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4">
              <ReactMarkdown>{response.answer}</ReactMarkdown>
            </div>

            {response.similar_case && (
              <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
                <p className="mb-1 text-xs font-medium">Схожий кейс команди</p>
                <p className="text-xs text-muted-foreground">
                  {response.similar_case.task_name}
                </p>
                {response.similar_case.approach && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
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
