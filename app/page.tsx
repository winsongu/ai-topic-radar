"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { PlatformCard } from "@/components/platform-card"
import { NewsModal } from "@/components/news-modal"
import { useRouter } from "next/navigation"

// 虚拟数据 - 36氪、今日头条、抖音热榜
const virtualPlatforms = [
  {
    id: "36kr",
    name: "36氪",
    description: "创业资讯和科技新闻",
    updateTime: new Date().toISOString(),
    color: "blue",
    news: [
      { id: 1, title: "某AI初创公司完成B轮融资", summary: "估值达10亿美元，成为新晋独角兽", time: "1小时前", url: "#", hot: 2345678 },
      { id: 2, title: "电商平台推出新零售模式", summary: "线上线下融合创新商业模式", time: "2小时前", url: "#", hot: 1987654 },
      { id: 3, title: "芯片行业迎来新突破", summary: "国产芯片技术取得重大进展", time: "3小时前", url: "#", hot: 1765432 },
      { id: 4, title: "共享经济新趋势", summary: "共享出行领域出现新玩家", time: "4小时前", url: "#", hot: 1543210 },
      { id: 5, title: "金融科技监管新规", summary: "央行发布数字金融监管指导意见", time: "5小时前", url: "#", hot: 1321098 },
      { id: 6, title: "在线教育平台转型", summary: "教育科技公司探索新业务模式", time: "6小时前", url: "#", hot: 1198765 },
      { id: 7, title: "医疗健康科技创新", summary: "智能医疗设备市场快速增长", time: "7小时前", url: "#", hot: 1076543 },
      { id: 8, title: "物流行业数字化升级", summary: "智慧物流技术应用加速", time: "8小时前", url: "#", hot: 954321 },
      { id: 9, title: "元宇宙概念持续升温", summary: "科技巨头加码虚拟现实领域", time: "9小时前", url: "#", hot: 832109 },
      { id: 10, title: "绿色科技投资热潮", summary: "环保科技成为投资新风口", time: "10小时前", url: "#", hot: 710987 },
    ],
  },
  {
    id: "toutiao",
    name: "今日头条",
    description: "个性化推荐资讯平台",
    updateTime: new Date().toISOString(),
    color: "red",
    news: [
      { id: 1, title: "国际局势最新动态", summary: "多国领导人举行重要会晤", time: "1小时前", url: "#", hot: 4123456 },
      { id: 2, title: "经济数据超预期", summary: "最新经济指标显示稳健增长", time: "2小时前", url: "#", hot: 3567890 },
      { id: 3, title: "科研成果获国际认可", summary: "中国科学家研究成果登上顶级期刊", time: "3小时前", url: "#", hot: 3123456 },
      { id: 4, title: "文化交流活动举办", summary: "国际文化艺术节盛大开幕", time: "4小时前", url: "#", hot: 2789012 },
      { id: 5, title: "体育健儿创佳绩", summary: "国际赛事中国队表现出色", time: "5小时前", url: "#", hot: 2456789 },
      { id: 6, title: "民生工程稳步推进", summary: "多项惠民政策落地实施", time: "6小时前", url: "#", hot: 2123456 },
      { id: 7, title: "环境治理成效显著", summary: "生态环境质量持续改善", time: "7小时前", url: "#", hot: 1890123 },
      { id: 8, title: "交通建设新进展", summary: "重大交通项目顺利推进", time: "8小时前", url: "#", hot: 1567890 },
      { id: 9, title: "文物保护新举措", summary: "历史文化遗产保护力度加大", time: "9小时前", url: "#", hot: 1345678 },
      { id: 10, title: "社区服务优化升级", summary: "智慧社区建设取得新成果", time: "10小时前", url: "#", hot: 1123456 },
    ],
  },
  {
    id: "douyin",
    name: "抖音热榜",
    description: "短视频平台热门内容",
    updateTime: new Date().toISOString(),
    color: "black",
    news: [
      { id: 1, title: "创意短视频爆火", summary: "某创作者视频播放量破亿", time: "30分钟前", url: "#", hot: 5678901 },
      { id: 2, title: "美食教程受追捧", summary: "简单易学的家常菜做法走红", time: "1小时前", url: "#", hot: 4890123 },
      { id: 3, title: "舞蹈挑战赛火热", summary: "新舞蹈挑战吸引百万人参与", time: "2小时前", url: "#", hot: 4234567 },
      { id: 4, title: "搞笑段子引爆笑", summary: "幽默短视频获得千万点赞", time: "3小时前", url: "#", hot: 3789012 },
      { id: 5, title: "旅行vlog分享", summary: "博主分享小众旅游目的地", time: "4小时前", url: "#", hot: 3345678 },
      { id: 6, title: "生活小妙招实用", summary: "居家生活技巧视频受欢迎", time: "5小时前", url: "#", hot: 2901234 },
      { id: 7, title: "萌宠日常温馨", summary: "可爱宠物视频治愈人心", time: "6小时前", url: "#", hot: 2567890 },
      { id: 8, title: "健身教程专业", summary: "健身达人分享训练方法", time: "7小时前", url: "#", hot: 2234567 },
      { id: 9, title: "化妆技巧教学", summary: "美妆博主展示妆容技巧", time: "8小时前", url: "#", hot: 1901234 },
      { id: 10, title: "音乐翻唱动听", summary: "歌手翻唱经典歌曲获好评", time: "9小时前", url: "#", hot: 1678901 },
    ],
  },
]

export default function HomePage() {
  const [platforms, setPlatforms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null)
  const router = useRouter()

  // 从API获取真实数据（前3个平台）+ 虚拟数据（后3个平台）
  const fetchData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const response = await fetch('/api/hot-news')
      const result = await response.json()
      
      if (result.success && result.data.length > 0) {
        // 合并真实数据和虚拟数据
        // 前3个平台从Supabase获取：百度热搜、中新网教育、人民网重要讲话
        const realPlatforms = result.data
          .filter((p: any) => ['baidu', 'chinanews', 'people'].includes(p.id))
          .sort((a: any, b: any) => {
            const order = ['baidu', 'chinanews', 'people']
            return order.indexOf(a.id) - order.indexOf(b.id)
          })
        
        // 合并真实数据和虚拟数据
        setPlatforms([...realPlatforms, ...virtualPlatforms])
      } else {
        // 如果API失败，只显示虚拟数据
        console.warn('No data from API, using virtual data only')
        setPlatforms(virtualPlatforms)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // 出错时使用虚拟数据
      setPlatforms(virtualPlatforms)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 手动刷新数据
  const handleRefresh = () => {
    fetchData(true)
  }

  useEffect(() => {
    fetchData()
    // 移除自动刷新，改为每天0点更新策略
  }, [])

  const filteredPlatforms = platforms.filter(
    (platform) =>
      platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      platform.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const scrollToPlatforms = () => {
    const platformsSection = document.getElementById("platforms-section")
    if (platformsSection) {
      platformsSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Loading状态
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-xl text-muted-foreground">加载中...</div>
              <div className="text-sm text-muted-foreground mt-2">正在从数据库获取最新热点</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Component */}
      <Navigation />

      <section className="bg-gradient-to-b from-muted/30 to-background py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            AI今日热榜
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            为您每日提供PPT创作灵感与素材
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="min-w-40 rounded-xl shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30"
              onClick={scrollToPlatforms}
            >
              最新热点
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-40 rounded-xl border-2 bg-card shadow-sm hover:shadow-md"
              onClick={() => router.push("/competitor-dynamics")}
            >
              竞品动态
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-40 rounded-xl border-2 bg-card shadow-sm hover:shadow-md"
              onClick={() => router.push("/ai-suggestions")}
            >
              AI选题
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-40 rounded-xl border-2 bg-card shadow-sm hover:shadow-md"
              onClick={() => router.push("/marketing-calendar")}
            >
              营销日历
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索热点..."
            className="rounded-xl border-0 bg-muted/50 pl-9 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Platforms Grid */}
      <section id="platforms-section" className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <h3 className="text-2xl font-bold text-foreground">精选平台</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '更新中...' : '更新数据'}
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlatforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} onClick={() => setSelectedPlatform(platform)} />
          ))}
        </div>
      </section>

      {/* News Modal */}
      {selectedPlatform && <NewsModal platform={selectedPlatform} onClose={() => setSelectedPlatform(null)} />}
    </div>
  )
}