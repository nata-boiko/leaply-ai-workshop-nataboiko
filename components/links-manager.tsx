"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
  RiLinkM,
  RiAddLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
} from "@remixicon/react"

type Link = { title: string; url: string; added_at: string }

export function LinksManager({
  slug,
  initialLinks,
}: {
  slug: string
  initialLinks: Link[]
}) {
  const router = useRouter()
  const [links, setLinks] = useState<Link[]>(initialLinks)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleAdd() {
    if (!url.trim()) {
      setError("Вкажіть URL")
      return
    }
    setSaving(true)
    setError("")
    const res = await fetch(`/api/tools/${slug}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url }),
    })
    if (res.ok) {
      const newLink: Link = {
        title: title.trim() || url.trim(),
        url: url.trim(),
        added_at: new Date().toISOString(),
      }
      setLinks((l) => [...l, newLink])
      setTitle("")
      setUrl("")
      setAdding(false)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleDelete(linkUrl: string) {
    await fetch(`/api/tools/${slug}/links`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: linkUrl }),
    })
    setLinks((l) => l.filter((x) => x.url !== linkUrl))
    router.refresh()
  }

  return (
    <div>
      {links.length > 0 && (
        <div className="mb-3 flex flex-col gap-1.5">
          {links.map((link) => (
            <div
              key={link.url}
              className="group flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2"
            >
              <RiLinkM
                size={13}
                className="shrink-0 text-muted-foreground/50"
              />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-sm text-foreground transition-colors hover:text-primary"
              >
                {link.title || link.url}
              </a>
              <RiExternalLinkLine
                size={12}
                className="shrink-0 text-muted-foreground/30"
              />
              <button
                onClick={() => handleDelete(link.url)}
                className="ml-1 shrink-0 text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100 hover:text-destructive"
              >
                <RiDeleteBinLine size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-3">
          <div className="mb-2 flex flex-col gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="text-xs"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Назва (опціонально)"
              className="text-xs"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={saving}
              className="rounded-lg text-xs"
            >
              {saving ? "..." : "Додати"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false)
                setUrl("")
                setTitle("")
                setError("")
              }}
              className="rounded-lg text-xs"
            >
              Скасувати
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <RiAddLine size={13} /> Додати посилання
        </button>
      )}
    </div>
  )
}
