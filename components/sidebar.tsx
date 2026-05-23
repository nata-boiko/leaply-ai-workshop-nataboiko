"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  RiBookOpenLine,
  RiFileList3Line,
  RiChatSmile3Line,
  RiSettings3Line,
} from "@remixicon/react"

const nav = [
  { href: "/", label: "Tools", icon: RiBookOpenLine },
  { href: "/cases", label: "Cases", icon: RiFileList3Line },
  { href: "/ask", label: "Ask", icon: RiChatSmile3Line },
  { href: "/settings", label: "Settings", icon: RiSettings3Line },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border">
      <div className="border-b border-border px-5 py-5">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          AI Tools KB
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
