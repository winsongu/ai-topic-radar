"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Platform {
  id: string
  name: string
  logo?: string
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

  const now = new Date()
  const updateDate = `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  return (
    <Card className="group relative min-h-[420px] overflow-hidden rounded-2xl border-0 bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute left-0 right-0 top-0 h-1 ${colorMap[platform.color] || "bg-blue-500"}`} />

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              {platform.logo && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  <Image
                    src={platform.logo || "/placeholder.svg"}
                    alt={platform.name}
                    width={24}
                    height={24}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <CardTitle className="text-lg font-semibold">{platform.name}</CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground">{platform.description}</CardDescription>
          </div>
          <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            {updateDate}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-5">
        {hasNews ? (
          <div className="space-y-3">
            <div className="max-h-[260px] space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
              {platform.news.slice(0, 5).map((item, index) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-start gap-2.5 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary shadow-sm">
                      {index + 1}
                    </span>
                    <p className="line-clamp-2 flex-1 text-foreground/90">{item.title}</p>
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
