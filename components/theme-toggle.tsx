"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { RiMoonLine, RiSunLine } from "@remixicon/react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */
  if (!mounted) return <div className="h-8 w-8" />

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      title={isDark ? "Світла тема" : "Темна тема"}
    >
      {isDark ? <RiSunLine size={15} /> : <RiMoonLine size={15} />}
    </button>
  )
}
