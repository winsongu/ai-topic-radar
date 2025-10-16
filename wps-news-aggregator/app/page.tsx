"use client"

import { useState } from "react"
import { Search, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlatformCard } from "@/components/platform-card"
import { NewsModal } from "@/components/news-modal"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

// Mock data for different platforms
const platforms = [
  {
    id: "baidu",
    name: "百度热搜",
    logo: "https://www.baidu.com/favicon.ico",
    description: "百度搜索引擎热榜榜单",
    updateTime: "30分钟",
    color: "blue",
    news: [
      {
        id: 1,
        title: "2025年春节假期安排公布",
        summary: "国务院办公厅发布2025年春节假期安排通知",
        time: "2小时前",
        url: "#",
        hot: 4892341,
      },
      {
        id: 2,
        title: "AI技术突破：新型语言模型发布",
        summary: "科技公司发布最新AI语言模型，性能提升显著",
        time: "3小时前",
        url: "#",
        hot: 3721456,
      },
      {
        id: 3,
        title: "全国多地迎来降温天气",
        summary: "中央气象台发布寒潮预警，多地气温骤降",
        time: "4小时前",
        url: "#",
        hot: 2891234,
      },
      {
        id: 4,
        title: "新能源汽车销量创新高",
        summary: "2024年新能源汽车销量突破千万辆大关",
        time: "5小时前",
        url: "#",
        hot: 2456789,
      },
      {
        id: 5,
        title: "教育部发布最新政策",
        summary: "关于加强中小学生心理健康教育的指导意见",
        time: "6小时前",
        url: "#",
        hot: 2123456,
      },
      {
        id: 6,
        title: "电影市场票房持续增长",
        summary: "春节档电影预售火爆，多部大片即将上映",
        time: "7小时前",
        url: "#",
        hot: 1987654,
      },
      {
        id: 7,
        title: "科技股集体上涨",
        summary: "A股科技板块表现强劲，多只个股涨停",
        time: "8小时前",
        url: "#",
        hot: 1765432,
      },
      {
        id: 8,
        title: "体育赛事精彩纷呈",
        summary: "CBA联赛进入白热化阶段，多场焦点战即将打响",
        time: "9小时前",
        url: "#",
        hot: 1543210,
      },
      {
        id: 9,
        title: "房地产市场政策调整",
        summary: "多地出台房地产市场调控新政策",
        time: "10小时前",
        url: "#",
        hot: 1321098,
      },
      {
        id: 10,
        title: "健康生活方式受关注",
        summary: "专家呼吁重视运动与饮食健康",
        time: "11小时前",
        url: "#",
        hot: 1098765,
      },
    ],
  },
  {
    id: "weibo",
    name: "微博热搜",
    logo: "https://weibo.com/favicon.ico",
    description: "中国最大的社交平台热搜榜",
    updateTime: "30分钟",
    color: "orange",
    news: [
      {
        id: 1,
        title: "明星演唱会门票秒光",
        summary: "某知名歌手演唱会门票开售即售罄",
        time: "1小时前",
        url: "#",
        hot: 5234567,
      },
      {
        id: 2,
        title: "热播剧收视率破纪录",
        summary: "新剧首播收视率创下年度新高",
        time: "2小时前",
        url: "#",
        hot: 4567890,
      },
      {
        id: 3,
        title: "网红美食店排队火爆",
        summary: "某网红餐厅排队时间超过3小时",
        time: "3小时前",
        url: "#",
        hot: 3890123,
      },
      {
        id: 4,
        title: "时尚周精彩瞬间",
        summary: "国际时装周上的中国设计师作品惊艳全场",
        time: "4小时前",
        url: "#",
        hot: 3234567,
      },
      {
        id: 5,
        title: "游戏新版本上线",
        summary: "热门手游推出重大更新，玩家反响热烈",
        time: "5小时前",
        url: "#",
        hot: 2890123,
      },
      {
        id: 6,
        title: "旅游景点人气爆棚",
        summary: "假期临近，热门景点预订量激增",
        time: "6小时前",
        url: "#",
        hot: 2456789,
      },
      { id: 7, title: "美妆新品发布", summary: "国际品牌推出春季限定系列", time: "7小时前", url: "#", hot: 2123456 },
      {
        id: 8,
        title: "宠物视频走红网络",
        summary: "可爱宠物视频获得千万点赞",
        time: "8小时前",
        url: "#",
        hot: 1890123,
      },
      {
        id: 9,
        title: "音乐节阵容公布",
        summary: "夏季音乐节嘉宾阵容震撼发布",
        time: "9小时前",
        url: "#",
        hot: 1567890,
      },
      { id: 10, title: "综艺节目收官", summary: "热门综艺节目迎来感人收官", time: "10小时前", url: "#", hot: 1234567 },
    ],
  },
  {
    id: "zhihu",
    name: "知乎热榜",
    logo: "https://static.zhihu.com/heifetz/favicon.ico",
    description: "中国知名问答社区热榜",
    updateTime: "30分钟",
    color: "blue",
    news: [
      {
        id: 1,
        title: "如何看待AI对就业市场的影响？",
        summary: "人工智能技术快速发展，对传统行业带来哪些变革",
        time: "2小时前",
        url: "#",
        hot: 3456789,
      },
      {
        id: 2,
        title: "年轻人该如何规划职业发展？",
        summary: "职场新人面临的挑战与机遇分析",
        time: "3小时前",
        url: "#",
        hot: 2890123,
      },
      {
        id: 3,
        title: "新能源技术的未来趋势",
        summary: "清洁能源技术发展方向探讨",
        time: "4小时前",
        url: "#",
        hot: 2456789,
      },
      {
        id: 4,
        title: "如何培养良好的学习习惯？",
        summary: "高效学习方法与时间管理技巧",
        time: "5小时前",
        url: "#",
        hot: 2123456,
      },
      {
        id: 5,
        title: "城市生活vs乡村生活",
        summary: "不同生活方式的优劣对比",
        time: "6小时前",
        url: "#",
        hot: 1890123,
      },
      { id: 6, title: "投资理财入门指南", summary: "普通人如何开始理财投资", time: "7小时前", url: "#", hot: 1567890 },
      { id: 7, title: "如何保持身心健康？", summary: "现代人的健康管理方法", time: "8小时前", url: "#", hot: 1345678 },
      { id: 8, title: "科技创新改变生活", summary: "新技术如何影响日常生活", time: "9小时前", url: "#", hot: 1123456 },
      { id: 9, title: "教育改革的思考", summary: "当代教育体系的挑战与机遇", time: "10小时前", url: "#", hot: 998765 },
      {
        id: 10,
        title: "环保生活方式推广",
        summary: "个人如何践行绿色生活理念",
        time: "11小时前",
        url: "#",
        hot: 876543,
      },
    ],
  },
  {
    id: "36kr",
    name: "36氪",
    logo: "https://36kr.com/favicon.ico",
    description: "创业资讯和科技新闻",
    updateTime: "30分钟",
    color: "blue",
    news: [
      {
        id: 1,
        title: "某AI初创公司完成B轮融资",
        summary: "估值达10亿美元，成为新晋独角兽",
        time: "1小时前",
        url: "#",
        hot: 2345678,
      },
      {
        id: 2,
        title: "电商平台推出新零售模式",
        summary: "线上线下融合创新商业模式",
        time: "2小时前",
        url: "#",
        hot: 1987654,
      },
      {
        id: 3,
        title: "芯片行业迎来新突破",
        summary: "国产芯片技术取得重大进展",
        time: "3小时前",
        url: "#",
        hot: 1765432,
      },
      { id: 4, title: "共享经济新趋势", summary: "共享出行领域出现新玩家", time: "4小时前", url: "#", hot: 1543210 },
      {
        id: 5,
        title: "金融科技监管新规",
        summary: "央行发布数字金融监管指导意见",
        time: "5小时前",
        url: "#",
        hot: 1321098,
      },
      {
        id: 6,
        title: "在线教育平台转型",
        summary: "教育科技公司探索新业务模式",
        time: "6小时前",
        url: "#",
        hot: 1198765,
      },
      {
        id: 7,
        title: "医疗健康科技创新",
        summary: "智能医疗设备市场快速增长",
        time: "7小时前",
        url: "#",
        hot: 1076543,
      },
      { id: 8, title: "物流行业数字化升级", summary: "智慧物流技术应用加速", time: "8小时前", url: "#", hot: 954321 },
      {
        id: 9,
        title: "元宇宙概念持续升温",
        summary: "科技巨头加码虚拟现实领域",
        time: "9小时前",
        url: "#",
        hot: 832109,
      },
      { id: 10, title: "绿色科技投资热潮", summary: "环保科技成为投资新风口", time: "10小时前", url: "#", hot: 710987 },
    ],
  },
  {
    id: "toutiao",
    name: "今日头条",
    logo: "https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/icons_19361_3.805b83c122f29a29c45a2aa4d2d8dc70.svg",
    description: "个性化推荐资讯平台",
    updateTime: "30分钟",
    color: "red",
    news: [
      { id: 1, title: "国际局势最新动态", summary: "多国领导人举行重要会晤", time: "1小时前", url: "#", hot: 4123456 },
      { id: 2, title: "经济数据超预期", summary: "最新经济指标显示稳健增长", time: "2小时前", url: "#", hot: 3567890 },
      {
        id: 3,
        title: "科研成果获国际认可",
        summary: "中国科学家研究成果登上顶级期刊",
        time: "3小时前",
        url: "#",
        hot: 3123456,
      },
      { id: 4, title: "文化交流活动举办", summary: "国际文化艺术节盛大开幕", time: "4小时前", url: "#", hot: 2789012 },
      { id: 5, title: "体育健儿创佳绩", summary: "国际赛事中国队表现出色", time: "5小时前", url: "#", hot: 2456789 },
      { id: 6, title: "民生工程稳步推进", summary: "多项惠民政策落地实施", time: "6小时前", url: "#", hot: 2123456 },
      { id: 7, title: "环境治理成效显著", summary: "生态环境质量持续改善", time: "7小时前", url: "#", hot: 1890123 },
      { id: 8, title: "交通建设新进展", summary: "重大交通项目顺利推进", time: "8小时前", url: "#", hot: 1567890 },
      { id: 9, title: "文物保护新举措", summary: "历史文化遗产保护力度加大", time: "9小时前", url: "#", hot: 1345678 },
      {
        id: 10,
        title: "社区服务优化升级",
        summary: "智慧社区建设取得新成果",
        time: "10小时前",
        url: "#",
        hot: 1123456,
      },
    ],
  },
  {
    id: "douyin",
    name: "抖音热榜",
    logo: "https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/icons_19361_2.805b83c122f29a29c45a2aa4d2d8dc70.svg",
    description: "短视频平台热门内容",
    updateTime: "30分钟",
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

// Cross-platform hot topics data
const crossPlatformTopics = [
  {
    id: 1,
    title: "美股暴跌 遭遇黑色星期五",
    platforms: [
      { name: "今日头条", color: "bg-red-500", icon: "今" },
      { name: "抖音", color: "bg-pink-500", icon: "抖" },
      { name: "知乎热榜", color: "bg-blue-500", icon: "知" },
      { name: "百度热搜", color: "bg-blue-400", icon: "百" },
      { name: "腾讯网", color: "bg-cyan-500", icon: "腾" },
    ],
    items: [
      { platform: "百度热搜", icon: "百", color: "bg-blue-400", title: "美股暴跌 遭遇黑色星期五", percentage: 100 },
      {
        platform: "知乎",
        icon: "知",
        color: "bg-blue-500",
        title: "美股遭遇「黑色星期五」，纳指暴跌 3.56%，如何看待 10 月 10 日美股走势？",
        percentage: 30,
      },
      { platform: "抖音", icon: "抖", color: "bg-pink-500", title: "美股暴跌遭遇黑色星期五", percentage: 100 },
    ],
    platformCount: 5,
  },
  {
    id: 2,
    title: "净网：网警斩断侵公黑色产业链",
    platforms: [
      { name: "今日头条", color: "bg-red-500", icon: "今" },
      { name: "抖音", color: "bg-pink-500", icon: "抖" },
      { name: "百度热搜", color: "bg-blue-400", icon: "百" },
      { name: "腾讯网", color: "bg-cyan-500", icon: "腾" },
    ],
    items: [
      {
        platform: "百度热搜",
        icon: "百",
        color: "bg-blue-400",
        title: "净网：网警斩断侵公黑色产业链",
        percentage: 100,
      },
      { platform: "抖音", icon: "抖", color: "bg-pink-500", title: "净网：网警斩断侵公黑色产业链", percentage: 100 },
      { platform: "今日头条", icon: "今", color: "bg-red-500", title: "净网：网警斩断侵公黑色产业链", percentage: 100 },
    ],
    platformCount: 4,
  },
  {
    id: 3,
    title: "杨瀚森16分4板3帽 单节竟下14分",
    platforms: [
      { name: "知乎热榜", color: "bg-blue-500", icon: "知" },
      { name: "抖音", color: "bg-pink-500", icon: "抖" },
      { name: "百度热搜", color: "bg-blue-400", icon: "百" },
      { name: "百度贴吧", color: "bg-blue-600", icon: "贴" },
    ],
    items: [
      {
        platform: "百度热搜",
        icon: "百",
        color: "bg-blue-400",
        title: "杨瀚森16分4板3帽 单节竟下14分",
        percentage: 100,
      },
      {
        platform: "知乎",
        icon: "知",
        color: "bg-blue-500",
        title: "NBA季前赛，开拓者击败国王，杨瀚森单节14分，全场16分4板3帽，如何评价本场以小博大的发挥？",
        percentage: 100,
      },
    ],
    platformCount: 4,
  },
  {
    id: 4,
    title: "AI技术突破：新型语言模型发布",
    platforms: [
      { name: "36氪", color: "bg-blue-500", icon: "36" },
      { name: "知乎热榜", color: "bg-blue-500", icon: "知" },
      { name: "百度热搜", color: "bg-blue-400", icon: "百" },
    ],
    items: [
      { platform: "百度热搜", icon: "百", color: "bg-blue-400", title: "AI技术突破：新型语言模型发布", percentage: 85 },
      { platform: "36氪", icon: "36", color: "bg-blue-500", title: "某AI初创公司完成B轮融资", percentage: 70 },
      { platform: "知乎", icon: "知", color: "bg-blue-500", title: "如何看待AI对就业市场的影响？", percentage: 60 },
    ],
    platformCount: 3,
  },
  {
    id: 5,
    title: "新能源汽车销量创新高",
    platforms: [
      { name: "今日头条", color: "bg-red-500", icon: "今" },
      { name: "百度热搜", color: "bg-blue-400", icon: "百" },
      { name: "36氪", color: "bg-blue-500", icon: "36" },
    ],
    items: [
      { platform: "百度热搜", icon: "百", color: "bg-blue-400", title: "新能源汽车销量创新高", percentage: 100 },
      { platform: "今日头条", icon: "今", color: "bg-red-500", title: "经济数据超预期", percentage: 75 },
    ],
    platformCount: 3,
  },
  {
    id: 6,
    title: "春节档电影预售火爆",
    platforms: [
      { name: "微博热搜", color: "bg-orange-500", icon: "微" },
      { name: "抖音", color: "bg-pink-500", icon: "抖" },
      { name: "百度热搜", color: "bg-blue-400", icon: "百" },
    ],
    items: [
      { platform: "百度热搜", icon: "百", color: "bg-blue-400", title: "电影市场票房持续增长", percentage: 90 },
      { platform: "微博", icon: "微", color: "bg-orange-500", title: "热播剧收视率破纪录", percentage: 80 },
    ],
    platformCount: 3,
  },
  {
    id: 7,
    title: "教育部发布最新政策",
    platforms: [
      { name: "今日头条", color: "bg-red-500", icon: "今" },
      { name: "知乎热榜", color: "bg-blue-500", icon: "知" },
      { name: "百度热搜", color: "bg-blue-400", icon: "百" },
    ],
    items: [
      { platform: "百度热搜", icon: "百", color: "bg-blue-400", title: "教育部发布最新政策", percentage: 100 },
      { platform: "知乎", icon: "知", color: "bg-blue-500", title: "教育改革的思考", percentage: 65 },
    ],
    platformCount: 3,
  },
  {
    id: 8,
    title: "科技股集体上涨",
    platforms: [
      { name: "36氪", color: "bg-blue-500", icon: "36" },
      { name: "百度热搜", color: "bg-blue-400", icon: "百" },
    ],
    items: [
      { platform: "百度热搜", icon: "百", color: "bg-blue-400", title: "科技股集体上涨", percentage: 100 },
      { platform: "36氪", icon: "36", color: "bg-blue-500", title: "芯片行业迎来新突破", percentage: 70 },
    ],
    platformCount: 2,
  },
  {
    id: 9,
    title: "明星演唱会门票秒光",
    platforms: [
      { name: "微博热搜", color: "bg-orange-500", icon: "微" },
      { name: "抖音", color: "bg-pink-500", icon: "抖" },
    ],
    items: [
      { platform: "微博", icon: "微", color: "bg-orange-500", title: "明星演唱会门票秒光", percentage: 100 },
      { platform: "抖音", icon: "抖", color: "bg-pink-500", title: "创意短视频爆火", percentage: 85 },
    ],
    platformCount: 2,
  },
  {
    id: 10,
    title: "全国多地迎来降温天气",
    platforms: [
      { name: "今日头条", color: "bg-red-500", icon: "今" },
      { name: "百度热搜", color: "bg-blue-400", icon: "百" },
    ],
    items: [
      { platform: "百度热搜", icon: "百", color: "bg-blue-400", title: "全国多地迎来降温天气", percentage: 100 },
      { platform: "今日头条", icon: "今", color: "bg-red-500", title: "环境治理成效显著", percentage: 60 },
    ],
    platformCount: 2,
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<(typeof platforms)[0] | null>(null)
  const router = useRouter()

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

  return (
    <div className="min-h-screen bg-background">
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
              onClick={() => router.push("/marketing-calendar")}
            >
              营销日历
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-40 rounded-xl border-2 bg-card shadow-sm hover:shadow-md"
              onClick={() => router.push("/ai-suggestions")}
            >
              AI选题
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

      <section id="platforms-section" className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-foreground">精选平台</h3>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlatforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} onClick={() => setSelectedPlatform(platform)} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <h3 className="text-2xl font-bold text-foreground">跨平台热点</h3>
          <Badge variant="destructive" className="rounded-md px-2 py-0.5 text-xs">
            热门
          </Badge>
        </div>

        <div className="space-y-8">
          <h4 className="text-lg font-semibold text-foreground">跨平台热点事件</h4>

          {crossPlatformTopics.map((topic, index) => (
            <div key={topic.id} className="rounded-2xl bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <h5 className="text-lg font-semibold text-foreground">
                  <span className="mr-2 text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  {topic.title}
                </h5>
                <Badge variant="secondary" className="ml-4 shrink-0 rounded-md">
                  {topic.platformCount}个平台
                </Badge>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {topic.platforms.map((platform, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className={`rounded-md border-0 px-3 py-1 text-xs font-medium text-white ${platform.color}`}
                  >
                    {platform.name}
                  </Badge>
                ))}
              </div>

              <div className="space-y-3">
                {topic.items.map((item, idx) => (
                  <div key={idx} className="group flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${item.color}`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mb-1 truncate text-sm text-foreground">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">相对度 {item.percentage}%</span>
                      </div>
                    </div>

                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedPlatform && <NewsModal platform={selectedPlatform} onClose={() => setSelectedPlatform(null)} />}
    </div>
  )
}
