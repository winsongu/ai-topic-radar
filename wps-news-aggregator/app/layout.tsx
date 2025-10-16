import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import "./globals.css"

export const metadata: Metadata = {
  title: "WPS稻壳内容选题神器 - 全网热点一站速览",
  description: "汇聚全网热点新闻，每日9点自动更新，帮助内容创作者快速发现热门话题",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Navigation />
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
