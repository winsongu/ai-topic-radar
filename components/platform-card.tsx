"use client"

import { Clock, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Platform {
  id: string
  name: string
  description: string
  updateTime: string
  color: string
  news: Array<{
    id: number
    title: string
    summary: string
    time: string
    url: string
    hot: number
  }>
}

interface PlatformCardProps {
  platform: Platform
  onClick: () => void
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  black: "bg-gray-900",
}

export function PlatformCard({ platform, onClick }: PlatformCardProps) {
  const hasNews = platform.news.length > 0

  return (
    <Card className="group relative min-h-[420px] overflow-hidden rounded-2xl border-0 bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute left-0 right-0 top-0 h-1 ${colorMap[platform.color] || "bg-blue-500"}`} />

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-1.5 text-lg font-semibold">{platform.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{platform.description}</CardDescription>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{platform.updateTime}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-5">
        {hasNews ? (
          <div className="space-y-3">
            <div className="max-h-[260px] space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
              {platform.news.slice(0, 10).map((item, index) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-start gap-2.5 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary shadow-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-foreground/90 cursor-pointer hover:text-primary transition-colors" onClick={() => window.open(item.url, '_blank')}>{item.title}</p>
                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer flex-shrink-0 mt-0.5" onClick={() => window.open(item.url, '_blank')} />
                    </div>
                  </div>
                  <p className="ml-7 line-clamp-2 text-xs text-muted-foreground/70">{item.summary}</p>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              className="w-full justify-between rounded-xl text-primary transition-colors hover:bg-primary/5 hover:text-primary"
              onClick={onClick}
            >
              <span className="font-medium">查看全部</span>
              <span>→</span>
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">暂无热点数据</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}