"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TrendingUp, Home, Sparkles, Calendar } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/95 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">AI选题雷达</h1>
            <p className="text-xs text-muted-foreground">每日0点自动更新</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            首页
          </Link>
          <Link
            href="/ai-suggestions"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              pathname === "/ai-suggestions"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AI选题建议
          </Link>
          <Link
            href="/marketing-calendar"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              pathname === "/marketing-calendar"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            营销日历
          </Link>
        </nav>
      </div>
    </header>
  )
}