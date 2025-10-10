"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Flame, Loader2 } from "lucide-react"
import { OutlineModal } from "@/components/outline-modal"
import Image from "next/image"

interface TopicSuggestion {
  id: string
  title: string
  useCase: string[]
  targetAudience: string[]
  recommendedStyle: string[]
  estimatedPages: number
  marketValue: "高" | "中" | "低"
  description: string
  source: string
  coverImage: string
  heat: number
}

const mockSuggestions: TopicSuggestion[] = [
  {
    id: "1",
    title: "中华文化传承与创新之路",
    useCase: ["政务宣传", "教育培训"],
    targetAudience: ["文化工作者", "教育从业者", "政府宣传部门"],
    recommendedStyle: ["传统典雅"],
    estimatedPages: 15,
    marketValue: "中",
    description:
      "从中华文明延续性切入，分析文化传承的当代价值，展示传统文化创新案例，探讨新媒体在文化传播中的作用，提出文化发展建议。",
    source: "百度热搜",
    coverImage: "/chinese-traditional-culture-heritage.jpg",
    heat: 485672,
  },
  {
    id: "2",
    title: "热搜背后的文化传播策略",
    useCase: ["企业培训", "营销策划"],
    targetAudience: ["市场营销人员", "新媒体运营", "品牌策划师"],
    recommendedStyle: ["简约现代"],
    estimatedPages: 12,
    marketValue: "高",
    description:
      "分析热搜榜单的传播机制，探讨文化内容如何借助热点传播，分享用户关注点，提供内容创作和传播策略的实操方法。",
    source: "百度热搜",
    coverImage: "/social-media-marketing-strategy-trending.jpg",
    heat: 892341,
  },
  {
    id: "3",
    title: "数字时代的文化自信建设",
    useCase: ["职场汇报", "个人分享"],
    targetAudience: ["企业管理层", "文化研究者", "年轻职场人"],
    recommendedStyle: ["商务正式"],
    estimatedPages: 10,
    marketValue: "中",
    description:
      "结合热搜案例，分析数字平台如何助力文化自信建设，探讨传统文化与现代技术的融合，提出提升文化影响力的具体路径。",
    source: "百度热搜",
    coverImage: "/digital-culture-technology-innovation.jpg",
    heat: 356789,
  },
  {
    id: "4",
    title: "AI技术驱动的内容创新",
    useCase: ["技术分享", "产品发布"],
    targetAudience: ["技术开发者", "产品经理", "创业者"],
    recommendedStyle: ["科技未来"],
    estimatedPages: 18,
    marketValue: "高",
    description:
      "探讨AI技术在内容创作领域的应用，分析智能推荐算法对内容传播的影响，展示AI辅助创作的实际案例，预测未来发展趋势。",
    source: "36氪",
    coverImage: "/artificial-intelligence-ai-technology-futuristic.jpg",
    heat: 1245678,
  },
  {
    id: "5",
    title: "新能源汽车市场洞察报告",
    useCase: ["行业分析", "投资决策"],
    targetAudience: ["投资人", "行业分析师", "企业高管"],
    recommendedStyle: ["专业商务"],
    estimatedPages: 20,
    marketValue: "高",
    description: "深度解析新能源汽车市场现状，对比国内外主要品牌竞争格局，分析技术创新趋势，提供市场预测和投资建议。",
    source: "今日头条",
    coverImage: "/electric-vehicle-ev-car-charging-sustainable.jpg",
    heat: 678923,
  },
  {
    id: "6",
    title: "短视频时代的品牌营销",
    useCase: ["营销培训", "品牌策划"],
    targetAudience: ["品牌经理", "市场总监", "新媒体运营"],
    recommendedStyle: ["活泼创意"],
    estimatedPages: 14,
    marketValue: "中",
    description: "分析短视频平台的用户特征和内容偏好，总结成功品牌案例的营销策略，提供短视频内容创作和投放的实用技巧。",
    source: "抖音热榜",
    coverImage: "/short-video-content-creation-social-media.jpg",
    heat: 523456,
  },
]

const formatHeat = (heat: number): string => {
  if (heat >= 10000) {
    return `${(heat / 10000).toFixed(1)}万`
  }
  return heat.toString()
}

export default function AISuggestionsPage() {
  const [selectedSource, setSelectedSource] = useState<string>("全部")
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<TopicSuggestion | null>(null)
  const [showOutline, setShowOutline] = useState(false)

  const sources = ["全部", "百度热搜", "36氪", "今日头条", "抖音热榜"]

  const filteredSuggestions =
    selectedSource === "全部" ? mockSuggestions : mockSuggestions.filter((s) => s.source === selectedSource)

  const handleViewOutline = async (suggestion: TopicSuggestion) => {
    setLoadingId(suggestion.id)
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setLoadingId(null)
    setSelectedSuggestion(suggestion)
    setShowOutline(true)
  }

  const handleDownloadCover = (suggestion: TopicSuggestion) => {
    // In a real app, this would trigger an actual download
    const link = document.createElement("a")
    link.href = suggestion.coverImage
    link.download = `${suggestion.title}-封面.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI选题建议</h1>
            <p className="text-sm text-muted-foreground">基于热点新闻智能生成PPT选题方案</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {sources.map((source) => (
            <Button
              key={source}
              variant={selectedSource === source ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setSelectedSource(source)}
            >
              {source}
            </Button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="group rounded-2xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex gap-6 p-6">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-foreground">{suggestion.title}</h3>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 ${
                        suggestion.marketValue === "高"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          : suggestion.marketValue === "中"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      市场价值: {suggestion.marketValue}
                    </Badge>
                    <div className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1 dark:bg-orange-950/30">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                        {formatHeat(suggestion.heat)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">适用场景:</span>
                      <span className="text-muted-foreground">{suggestion.useCase.join(" / ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">目标受众:</span>
                      <span className="text-muted-foreground">{suggestion.targetAudience.join("、")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">推荐风格:</span>
                      <span className="text-muted-foreground">{suggestion.recommendedStyle.join("、")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">预估页数:</span>
                      <span className="text-muted-foreground">{suggestion.estimatedPages}页</span>
                    </div>
                  </div>

                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{suggestion.description}</p>

                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      className="rounded-xl shadow-sm"
                      onClick={() => handleViewOutline(suggestion)}
                      disabled={loadingId === suggestion.id}
                    >
                      {loadingId === suggestion.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          AI 正在生成...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          查看完整大纲
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl bg-transparent"
                      onClick={() => handleDownloadCover(suggestion)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下载封面图
                    </Button>
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="relative h-[200px] w-[300px] overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={suggestion.coverImage || "/placeholder.svg"}
                      alt={`${suggestion.title} 封面`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSuggestion && (
        <OutlineModal isOpen={showOutline} onClose={() => setShowOutline(false)} suggestion={selectedSuggestion} />
      )}
    </div>
  )
}