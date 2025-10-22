"use client"

import { useState, useEffect } from "react"
import { Search, ExternalLink, TrendingUp, Eye, Calendar, Lightbulb, Target, Palette, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatChineseDateTime } from "@/lib/utils"

// 模板数据类型
interface Template {
  id: number
  title: string
  type: string | null
  format: string | null
  usage: string | null
  platform: string
  tags: string[]
  date: string
  hot_value: number
  url: string | null
  thumbnail?: string
  crawled_at: string
}

// 平台数据类型
interface PlatformData {
  id: string
  name: string
  templates: Template[]
  updateTime: string
  totalCount: number
}

const platforms = ["全部", "iSlide", "AIPPT", "熊猫办公", "Canva"]
const timeRanges = ["全部", "今天", "昨天", "近七天"]
const usages = [
  "全部",
  "工作总结",
  "教育教学", 
  "医疗健康",
  "职场办公",
  "宣传企划",
  "产品发布",
  "市场营销",
  "节日庆典",
  "建筑房地产",
]

const allUsages = [
  ...usages,
  "科技互联网",
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
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [showMobileInsights, setShowMobileInsights] = useState(false)
  
  // 新增状态：API数据
  const [platformsData, setPlatformsData] = useState<PlatformData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("")

  const additionalUsages = allUsages.filter((usage) => !usages.includes(usage))

  // 从API获取数据
  useEffect(() => {
    fetchCompetitorData()
  }, [])

  async function fetchCompetitorData() {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/competitor-templates')
      const result = await response.json()
      
      if (result.success && result.data) {
        setPlatformsData(result.data.platforms || [])
        // 找到最新的更新时间
        const latestUpdate = result.data.platforms
          .map((p: PlatformData) => p.updateTime)
          .sort()
          .reverse()[0]
        setLastUpdateTime(latestUpdate || new Date().toISOString())
      } else {
        setError(result.error || '获取数据失败')
      }
    } catch (err: any) {
      console.error('Error fetching competitor data:', err)
      setError(err.message || '网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  // 将所有平台的模板合并为一个数组
  const allTemplates = platformsData.flatMap(p => p.templates)

  // Filter templates
  const filteredTemplates = allTemplates.filter((template) => {
    // Platform filter
    if (selectedPlatform !== "全部" && template.platform !== selectedPlatform) return false
    
    // Usage filter
    if (selectedUsage !== "全部" && template.usage !== selectedUsage) return false
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        template.title.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">竞品动态</h1>
          <p className="text-sm text-muted-foreground">实时追踪PPT模板市场动态，把握设计趋势</p>
          </div>
          <Button
            onClick={fetchCompetitorData}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">

        {/* Search and Filters */}
        <div className="mb-6 rounded-xl bg-card p-5 shadow-sm border">
          {/* Search Bar */}
          <div className="mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索模板标题、描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Platform Filter */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">平台:</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Button
                  key={platform}
                  variant={selectedPlatform === platform ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlatform(platform)}
                  className="rounded-full text-xs h-8"
                >
                  {platform}
                </Button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">时间:</label>
            <div className="flex flex-wrap gap-2">
              {timeRanges.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className="rounded-full text-xs h-8"
                >
                  {time}
                </Button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs h-8">
                    <Calendar className="h-3.5 w-3.5" />
                    自定义日期
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4">
                    <p className="mb-2 text-sm font-medium">选择日期范围（最多30天）</p>
                    <CalendarComponent
                      mode="range"
                      selected={dateRange}
                      onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
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
            <label className="mb-2 block text-xs font-medium text-muted-foreground">用途:</label>
            <div className="flex flex-wrap gap-2">
              {usages.map((usage) => (
                <Button
                  key={usage}
                  variant={selectedUsage === usage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedUsage(usage)}
                  className="rounded-full text-xs h-8"
                >
                  {usage}
                </Button>
              ))}
              {additionalUsages.length > 0 && (
                <Popover open={showUsagePopover} onOpenChange={setShowUsagePopover}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full text-xs h-8 text-primary hover:text-primary">
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
                            className="justify-start text-xs"
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

        {/* Mobile Insights Button */}
        <div className="lg:hidden mb-4">
          <Button
            onClick={() => setShowMobileInsights(true)}
            className="w-full gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            查看AI洞察与趋势分析
          </Button>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">正在加载竞品数据...</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">❌ {error}</p>
            <Button onClick={fetchCompetitorData} variant="outline" size="sm" className="mt-3">
              重试
            </Button>
          </div>
        )}

        {/* Results Header */}
        {!loading && !error && (
          <>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">共找到 {filteredTemplates.length} 个模板</p>
              <p className="text-xs text-blue-600 font-medium">
                最后更新: {lastUpdateTime ? formatChineseDateTime(lastUpdateTime) : '暂无数据'}
              </p>
        </div>

        {/* Results Grid - Optimized Card Layout */}
        <div className="space-y-3">
              {filteredTemplates.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">暂无匹配的模板数据</p>
                </div>
              ) : (
                filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative overflow-hidden rounded-xl bg-card border shadow-sm transition-all hover:shadow-md"
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex gap-5 p-5">
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  <div
                    className="relative h-32 w-48 cursor-pointer overflow-hidden rounded-lg bg-muted"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <img
                      src={template.thumbnail || "/placeholder.svg"}
                      alt={template.title}
                      className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Hover overlay with preview button */}
                    {hoveredId === template.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
                        <Button size="sm" variant="secondary" className="gap-1.5 h-8 text-xs">
                          <Eye className="h-3.5 w-3.5" />
                          预览
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content - Better organized information */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  {/* Title and metadata */}
                  <div>
                    <div className="mb-2.5 flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="mb-1.5 text-base font-semibold leading-snug text-foreground group-hover:text-primary line-clamp-2">
                          {template.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {template.type && <span>{template.type}</span>}
                                {template.type && template.format && <span>•</span>}
                                {template.format && <span>{template.format}</span>}
                                {template.hot_value > 0 && (
                                  <>
                          <span>•</span>
                                    <span className="text-orange-500">🔥 {template.hot_value}</span>
                                  </>
                                )}
                        </div>
                      </div>
                            {template.url && (
                      <a
                                href={template.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground flex-shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                            )}
                    </div>

                    {/* Tags - More prominent and organized */}
                    <div className="space-y-1.5">
                      {/* Usage - Primary category with distinct styling */}
                            {template.usage && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">用途:</span>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">{template.usage}</Badge>
                      </div>
                            )}

                      {/* Platform - Secondary info with different styling */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">平台:</span>
                        <Badge variant="outline" className="border-border bg-muted/50 text-foreground text-xs">
                          {template.platform}
                        </Badge>
                      </div>

                      {/* Tags - Tertiary info with subtle styling */}
                            {template.tags && template.tags.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-xs text-muted-foreground">标签:</span>
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 5).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-muted/50 text-xs text-muted-foreground hover:bg-muted border-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 5 && (
                            <Badge variant="secondary" className="bg-muted/50 text-xs text-muted-foreground border-0">
                              +{template.tags.length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>
                            )}
                    </div>
                  </div>

                  {/* Footer - 入库时间 */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      入库时间: {new Date(template.crawled_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      }).replace(/\//g, '-')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
                ))
              )}
        </div>
          </>
        )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
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
                  {platformsData.map((platform) => {
                    const percentage = Math.min(100, Math.round((platform.totalCount / 20) * 100))
                    return (
                      <div key={platform.id} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{platform.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                      </div>
                          <span className="text-xs text-muted-foreground">{platform.totalCount}</span>
                    </div>
                  </div>
                    )
                  })}
                      </div>
                    </div>
                  </div>
          </div>
        </div>
      </div>

      {/* Template Preview Dialog */}
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
              </div>

              {/* Key information */}
              <div className="space-y-4">
                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {previewTemplate.type && <span>{previewTemplate.type}</span>}
                  {previewTemplate.type && previewTemplate.format && <span>•</span>}
                  {previewTemplate.format && <span>{previewTemplate.format}</span>}
                  <span>•</span>
                  <span>{previewTemplate.date}</span>
                  {previewTemplate.hot_value > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-orange-500">🔥 热度: {previewTemplate.hot_value}</span>
                    </>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  {previewTemplate.usage && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">用途:</span>
                    <Badge className="bg-blue-500/10 text-blue-700">{previewTemplate.usage}</Badge>
                  </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">平台:</span>
                    <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
                      {previewTemplate.platform}
                    </Badge>
                  </div>

                  {previewTemplate.tags && previewTemplate.tags.length > 0 && (
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
                  )}
                </div>

                {/* Action button */}
                {previewTemplate.url && (
                <div className="flex justify-end">
                    <a href={previewTemplate.url} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      访问原链接
                    </Button>
                  </a>
                </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Insights Dialog */}
      <Dialog open={showMobileInsights} onOpenChange={setShowMobileInsights}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              AI洞察与趋势分析
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Hot Trends */}
            <div>
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
            <div>
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
            <div>
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

            {/* Platform Stats */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">平台活跃度</h4>
              <div className="space-y-3">
                {platformsData.map((platform) => {
                  const percentage = Math.min(100, Math.round((platform.totalCount / 20) * 100))
                  return (
                    <div key={platform.id} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{platform.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div 
                            className="h-full bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                    </div>
                        <span className="text-xs text-muted-foreground">{platform.totalCount}</span>
                  </div>
                </div>
                  )
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

