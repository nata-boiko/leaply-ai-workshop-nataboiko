"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  RiBookOpenLine,
  RiFileList3Line,
  RiSettings3Line,
} from "@remixicon/react"
import { ThemeToggle } from "@/components/theme-toggle"

const nav = [
  { href: "/", label: "Tools", icon: RiBookOpenLine },
  { href: "/cases", label: "Cases", icon: RiFileList3Line },
  { href: "/settings", label: "Settings", icon: RiSettings3Line },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="px-5 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <span className="text-[10px] font-bold text-primary-foreground">
              AI
            </span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Tools KB
          </span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border px-3 py-3">
        <ThemeToggle />
      </div>
    </aside>
  )
}
