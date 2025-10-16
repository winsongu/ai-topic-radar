"use client"

import { useState } from "react"
import { Search, ExternalLink, TrendingUp, Eye, Calendar, Lightbulb, Target, Palette } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock data for competitor templates
const mockTemplates = [
  {
    id: 1,
    title: "红色国潮风通用汇总总结汇报PPT模板",
    type: "17P",
    format: "Fu",
    heat: 485672,
    usage: "总结汇报",
    platform: "iSlide",
    tags: ["工作总结", "国庆风", "汇报", "年度总结", "企业汇报"],
    date: "2025-01-10",
    thumbnail: "/red-chinese-style-ppt-template.jpg",
    isFree: true,
    link: "#",
  },
  {
    id: 2,
    title: "粉色手绘风通用汇业营销方案PPT模板",
    type: "17D",
    format: "Fu",
    heat: 892341,
    usage: "营销策划",
    platform: "iSlide",
    tags: ["营销方案", "手绘风", "创意", "品牌推广", "活动策划"],
    date: "2025-01-10",
    thumbnail: "/pink-hand-drawn-marketing-ppt-template.jpg",
    isFree: true,
    link: "#",
  },
  {
    id: 3,
    title: "绿色科技芯片发布会PPT",
    type: "15P",
    format: "iRis",
    heat: 356789,
    usage: "产品发布会",
    platform: "iSlide",
    tags: ["发布会", "科技", "芯片", "半导体", "产品发布"],
    date: "2025-01-09",
    thumbnail: "/green-technology-chip-launch-ppt.jpg",
    isFree: true,
    link: "#",
  },
  {
    id: 4,
    title: "黄色卡通创意风教师节通用模板",
    type: "未知",
    format: "未知",
    heat: 0,
    usage: "教学通用PPT",
    platform: "AIPPT",
    tags: ["教育", "卡通", "创意", "教师节", "心理"],
    date: "2025-01-10",
    thumbnail: "/yellow-cartoon-teacher-day-ppt.jpg",
    isFree: false,
    link: "#",
  },
  {
    id: 5,
    title: "蓝色简约Q4季度工作计划通用PPT模板",
    type: "未知",
    format: "未知",
    heat: 676923,
    usage: "职场办公",
    platform: "AIPPT",
    tags: ["工作计划", "商务", "季度", "Q4", "年度规划"],
    date: "2025-01-09",
    thumbnail: "/blue-simple-q4-work-plan-ppt.jpg",
    isFree: false,
    link: "#",
  },
]

const platforms = ["全部", "AI PPT", "熊猫办公", "iSlide", "Canva", "觅知网", "OfficePLUS"]
const timeRanges = ["全部", "今天", "昨天", "近七天"]
const usages = [
  "全部",
  "职场办公",
  "教育教学",
  "市场营销",
  "党政民生",
  "人事行政",
  "节日庆典",
  "宣传企划",
  "平面设计",
  "建筑房地产",
  "财务金融",
]

const allUsages = [
  ...usages,
  "科技互联网",
  "医疗健康",
  "金融保险",
  "餐饮美食",
  "旅游出行",
  "体育运动",
  "文化娱乐",
  "法律服务",
  "房地产",
  "制造业",
]

export default function CompetitorDynamicsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("全部")
  const [selectedTime, setSelectedTime] = useState("全部")
  const [selectedUsage, setSelectedUsage] = useState("全部")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [showUsagePopover, setShowUsagePopover] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<(typeof mockTemplates)[0] | null>(null)

  const additionalUsages = allUsages.filter((usage) => !usages.includes(usage))

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">竞品动态</h1>
            <p className="text-muted-foreground">实时追踪PPT模板市场动态，把握设计趋势</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              返回首页
            </Button>
          </Link>
        </div>

        <div className="flex gap-6">
          {/* Main content area */}
          <div className="flex-1">
            {/* Search and Filters */}
            <div className="mb-8 rounded-2xl bg-card p-6 shadow-sm">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="搜索模板标题、描述或标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Platform Filter */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-foreground">平台:</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform) => (
                    <Button
                      key={platform}
                      variant={selectedPlatform === platform ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPlatform(platform)}
                      className="rounded-full"
                    >
                      {platform}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Filter */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-foreground">时间:</label>
                <div className="flex flex-wrap gap-2">
                  {timeRanges.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="rounded-full"
                    >
                      {time}
                    </Button>
                  ))}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 rounded-full bg-transparent">
                        <Calendar className="h-4 w-4" />
                        自定义日期
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-4">
                        <p className="mb-2 text-sm font-medium">选择日期范围（最多30天）</p>
                        <CalendarComponent
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                          numberOfMonths={1}
                          disabled={(date) => {
                            const today = new Date()
                            const thirtyDaysAgo = new Date(today)
                            thirtyDaysAgo.setDate(today.getDate() - 30)
                            return date > today || date < thirtyDaysAgo
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Usage Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">用途:</label>
                <div className="flex flex-wrap gap-2">
                  {usages.map((usage) => (
                    <Button
                      key={usage}
                      variant={selectedUsage === usage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedUsage(usage)}
                      className="rounded-full"
                    >
                      {usage}
                    </Button>
                  ))}
                  {additionalUsages.length > 0 && (
                    <Popover open={showUsagePopover} onOpenChange={setShowUsagePopover}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full text-primary">
                          更多
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="start">
                        <div className="space-y-2">
                          <p className="mb-3 text-sm font-medium">更多用途类别</p>
                          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
                            {additionalUsages.map((usage) => (
                              <Button
                                key={usage}
                                variant={selectedUsage === usage ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setSelectedUsage(usage)
                                  setShowUsagePopover(false)
                                }}
                                className="justify-start"
                              >
                                {usage}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">共找到 {mockTemplates.length} 个模板</p>
              <p className="text-sm text-muted-foreground">最后更新: 2025/10/11</p>
            </div>

            {/* Results Grid - Optimized Card Layout */}
            <div className="space-y-4">
              {mockTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-md"
                  onMouseEnter={() => setHoveredId(template.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex gap-6 p-6">
                    {/* Thumbnail - Larger and more prominent */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="relative h-40 w-60 cursor-pointer overflow-hidden rounded-xl bg-muted"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <img
                          src={template.thumbnail || "/placeholder.svg"}
                          alt={template.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {template.isFree && (
                          <div className="absolute left-3 top-3">
                            <Badge className="bg-emerald-500 text-white shadow-md">Free</Badge>
                          </div>
                        )}
                        {/* Hover overlay with preview button */}
                        {hoveredId === template.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
                            <Button size="sm" variant="secondary" className="gap-2">
                              <Eye className="h-4 w-4" />
                              预览
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content - Better organized information */}
                    <div className="flex flex-1 flex-col justify-between">
                      {/* Title and metadata */}
                      <div>
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-2 text-lg font-semibold leading-tight text-foreground group-hover:text-primary">
                              {template.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{template.type}</span>
                              <span>•</span>
                              <span>{template.format}</span>
                              {template.heat > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-orange-500">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    热度 {template.heat.toLocaleString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <a
                            href={template.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </div>

                        {/* Tags - More prominent and organized */}
                        <div className="space-y-2">
                          {/* Usage - Primary category with distinct styling */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">用途:</span>
                            <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">
                              {template.usage}
                            </Badge>
                          </div>

                          {/* Platform - Secondary info with different styling */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">平台:</span>
                            <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
                              {template.platform}
                            </Badge>
                          </div>

                          {/* Tags - Tertiary info with subtle styling */}
                          <div className="flex items-start gap-2">
                            <span className="mt-1 text-xs font-medium text-muted-foreground">标签:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {template.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-muted/50 text-xs text-muted-foreground hover:bg-muted"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer - Date and actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{template.date}</span>
                        <div className="flex gap-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* AI Insights Card */}
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="mb-6 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-foreground">AI 洞察</h3>
                </div>

                {/* Hot Trends */}
                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    热门趋势
                  </h4>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-white/60 p-3 dark:bg-gray-900/40">
                      <p className="mb-1 text-sm font-medium text-orange-600">国庆主题模板</p>
                      <p className="text-xs text-muted-foreground">近7天上传量增长 156%，建议关注红色国潮风格</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-3 dark:bg-gray-900/40">
                      <p className="mb-1 text-sm font-medium text-blue-600">科技芯片主题</p>
                      <p className="text-xs text-muted-foreground">热度持续上升，绿色科技风格受欢迎</p>
                    </div>
                  </div>
                </div>

                {/* Popular Categories */}
                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Target className="h-4 w-4 text-green-500" />
                    热门类别
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">总结汇报</span>
                      <Badge className="bg-green-500/10 text-green-700">高需求</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">营销策划</span>
                      <Badge className="bg-blue-500/10 text-blue-700">中需求</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">产品发布</span>
                      <Badge className="bg-orange-500/10 text-orange-700">上升中</Badge>
                    </div>
                  </div>
                </div>

                {/* Design Styles */}
                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Palette className="h-4 w-4 text-purple-500" />
                    流行风格
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                      国潮风
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                    >
                      科技风
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
                    >
                      手绘风
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    >
                      简约商务
                    </Badge>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:from-amber-950/30 dark:to-orange-950/30">
                  <p className="mb-2 text-sm font-semibold text-foreground">💡 运营建议</p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• 关注节日主题模板，提前2周布局</li>
                    <li>• 科技类模板保持简洁专业风格</li>
                    <li>• 手绘风格适合教育和创意类场景</li>
                    <li>• 国潮风格在政务和企业汇报中受欢迎</li>
                  </ul>
                </div>
              </div>

              {/* Platform Stats Card */}
              <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-bold text-foreground">平台活跃度</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">iSlide</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-[85%] bg-blue-500"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">AI PPT</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-[72%] bg-green-500"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">熊猫办公</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-[68%] bg-purple-500"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Canva</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-[55%] bg-orange-500"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">55%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{previewTemplate?.title}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-6">
              {/* Large preview image */}
              <div className="relative overflow-hidden rounded-xl bg-muted">
                <img
                  src={previewTemplate.thumbnail || "/placeholder.svg"}
                  alt={previewTemplate.title}
                  className="h-auto w-full object-contain"
                />
                {previewTemplate.isFree && (
                  <div className="absolute left-4 top-4">
                    <Badge className="bg-emerald-500 text-white shadow-md">Free</Badge>
                  </div>
                )}
              </div>

              {/* Key information */}
              <div className="space-y-4">
                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{previewTemplate.type}</span>
                  <span>•</span>
                  <span>{previewTemplate.format}</span>
                  {previewTemplate.heat > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-orange-500">
                        <TrendingUp className="h-4 w-4" />
                        热度 {previewTemplate.heat.toLocaleString()}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>{previewTemplate.date}</span>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">用途:</span>
                    <Badge className="bg-blue-500/10 text-blue-700">{previewTemplate.usage}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">平台:</span>
                    <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
                      {previewTemplate.platform}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-sm font-medium text-muted-foreground">标签:</span>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-muted/50 text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex justify-end">
                  <a href={previewTemplate.link} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      访问原链接
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
