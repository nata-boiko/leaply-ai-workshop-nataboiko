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
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="px-5 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm">
            <span className="text-[11px] font-bold tracking-tight text-primary-foreground">
              AI
            </span>
          </div>
          <div>
            <p className="text-sm leading-none font-semibold tracking-tight text-foreground">
              Tools KB
            </p>
            <p className="mt-0.5 text-[10px] leading-none text-muted-foreground">
              Design team
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 pb-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150",
                active
                  ? "bg-primary font-medium text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3">
        <ThemeToggle />
      </div>
    </aside>
  )
}
