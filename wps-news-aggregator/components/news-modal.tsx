"use client"

import { X, ExternalLink, TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

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

interface NewsModalProps {
  platform: Platform
  onClose: () => void
}

export function NewsModal({ platform, onClose }: NewsModalProps) {
  const formatHotValue = (hot: number) => {
    if (hot >= 10000000) {
      return `${(hot / 10000000).toFixed(1)}千万`
    } else if (hot >= 10000) {
      return `${(hot / 10000).toFixed(1)}万`
    }
    return hot.toString()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] rounded-2xl border-0 p-0 shadow-2xl">
        <DialogHeader className="border-b border-border/50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-semibold">{platform.name}</DialogTitle>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {platform.description} · 更新于 {platform.updateTime}前
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-muted/50">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)]">
          <div className="space-y-2 p-6">
            {platform.news.map((item, index) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border-0 bg-muted/30 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-card hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary shadow-sm">
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-balance text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                        {item.title}
                      </h4>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    <p className="text-pretty text-sm text-muted-foreground line-clamp-2">{item.summary}</p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.time}</span>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">{formatHotValue(item.hot)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
