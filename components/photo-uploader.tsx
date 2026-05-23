"use client"

import { useRef, useState } from "react"
import { RiImageAddLine, RiCloseLine } from "@remixicon/react"

type Props = {
  photos: string[]
  onChange: (photos: string[]) => void
  uploading: boolean
  setUploading: (v: boolean) => void
}

export function PhotoUploader({
  photos,
  onChange,
  uploading,
  setUploading,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<
    { file: File; previewUrl: string }[]
  >([])
  const [error, setError] = useState("")

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError("")

    const remaining = 10 - photos.length - previews.length
    if (remaining <= 0) {
      setError("Максимум 10 фото")
      return
    }

    const toUpload = Array.from(files).slice(0, remaining)

    // Show previews immediately
    const newPreviews = toUpload.map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }))
    setPreviews((p) => [...p, ...newPreviews])

    setUploading(true)
    try {
      const fd = new FormData()
      toUpload.forEach((f) => fd.append("files", f))

      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = (await res.json()) as { urls?: string[]; error?: string }

      if (!res.ok || !data.urls) {
        setError(data.error ?? "Помилка завантаження")
        setPreviews((p) => p.filter((pr) => !newPreviews.includes(pr)))
        return
      }

      onChange([...photos, ...data.urls])
      // Keep previews shown (they map to uploaded URLs)
    } catch {
      setError("Помилка завантаження")
      setPreviews((p) => p.filter((pr) => !newPreviews.includes(pr)))
    } finally {
      setUploading(false)
    }
  }

  function removeUploaded(url: string) {
    onChange(photos.filter((p) => p !== url))
  }

  const total = photos.length
  const canAdd = total < 10

  return (
    <div className="flex flex-col gap-3">
      {/* Uploaded photos grid */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url) => (
            <div
              key={url}
              className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeUploaded(url)}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <RiCloseLine size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {canAdd && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2.5 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          <RiImageAddLine size={15} />
          {uploading
            ? "Завантаження..."
            : `Додати фото${total > 0 ? ` (${total}/10)` : " (до 10 шт)"}`}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
