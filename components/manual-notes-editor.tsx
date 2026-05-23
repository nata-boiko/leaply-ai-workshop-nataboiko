"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { RiEditLine, RiCheckLine, RiCloseLine } from "@remixicon/react"
import ReactMarkdown from "react-markdown"

export function ManualNotesEditor({
  slug,
  initialNotes,
}: {
  slug: string
  initialNotes: string | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [saved, setSaved] = useState(initialNotes ?? "")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/tools/${slug}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    })
    setSaved(notes)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  function handleCancel() {
    setNotes(saved)
    setEditing(false)
  }

  if (editing) {
    return (
      <div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Нотатки, спостереження, важливі деталі які не підходять під кейси... Підтримується Markdown."
          className="mb-3 min-h-[160px] resize-y font-mono text-xs"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5 rounded-lg text-xs"
          >
            <RiCheckLine size={13} />
            {saving ? "Збереження..." : "Зберегти"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="gap-1.5 rounded-lg text-xs"
          >
            <RiCloseLine size={13} />
            Скасувати
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {saved ? (
        <div className="group relative">
          <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-xs [&_li]:text-muted-foreground [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-4">
            <ReactMarkdown>{saved}</ReactMarkdown>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/50 transition-colors hover:text-primary"
          >
            <RiEditLine size={12} /> Редагувати
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <RiEditLine size={13} />
          Додати нотатки
        </button>
      )}
    </div>
  )
}
