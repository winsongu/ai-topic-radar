"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { FilterModal } from "@/components/filter-modal"

const eventCategories = {
  weather: { name: "节气", color: "text-sky-500" }, // Light blue for solar terms
  solar: { name: "公历节日", color: "text-gray-600" }, // Dark gray for regular holidays
  lunar: { name: "农历节日", color: "text-gray-600" },
  international: { name: "国际节日", color: "text-gray-600" },
  memorial: { name: "纪念日", color: "text-gray-600" },
  awards: { name: "颁奖典礼", color: "text-gray-600" },
  movie: { name: "影视上映", color: "text-gray-600" },
  tech: { name: "互联网科技", color: "text-gray-600" },
  exhibition: { name: "展会活动", color: "text-gray-600" },
  brand: { name: "品牌日", color: "text-gray-600" },
}

const highProfileHolidays = ["中华人民共和国国庆节", "国庆节", "中秋节", "重阳节", "万圣节", "世界动物日"]

// Mock calendar data for October 2025
const calendarEvents = [
  // Week 1
  {
    date: 1,
    day: "周三",
    events: [
      { title: "中华人民共和国国庆节", category: "solar" },
      { title: "国际音乐日", category: "international" },
      { title: "世界素食日", category: "international" },
    ],
  },
  {
    date: 2,
    day: "周四",
    events: [
      { title: "国际非暴力日", category: "international" },
      { title: "世界农场动物日", category: "international" },
    ],
  },
  {
    date: 3,
    day: "周五",
    events: [
      { title: "世界建筑日", category: "international" },
      { title: "德国统一日", category: "international" },
    ],
  },
  {
    date: 4,
    day: "周六",
    events: [
      { title: "世界动物日", category: "international" },
      { title: "世界空间周开始", category: "tech" },
    ],
  },
  {
    date: 5,
    day: "周日",
    events: [
      { title: "世界教师日", category: "international" },
      { title: "寒露", category: "weather" },
    ],
  },

  // Week 2
  {
    date: 6,
    day: "周一",
    events: [
      { title: "春雨医生创始人张锐逝世 (2016)", category: "memorial" },
      { title: "调休", category: "solar" },
      { title: "国际建筑日", category: "international" },
      { title: "世界人居日", category: "international" },
      { title: "天文学家发现太阳系外第一颗行星", category: "memorial" },
      { title: "中秋节", category: "lunar" },
      { title: "OpenAI 开发者日活动", category: "tech" },
    ],
  },
  {
    date: 7,
    day: "周二",
    events: [
      { title: "第一届上海国际电影节开幕 (1993)", category: "memorial" },
      { title: "调休", category: "solar" },
      { title: "刘伯承元帅逝世 (1986)", category: "memorial" },
      { title: "美国发现最古老的恐龙化石 (1986)", category: "memorial" },
      { title: "新疆军区生产建设兵团成立 (1954)", category: "memorial" },
      { title: "英法联军火烧圆明园纪念日", category: "memorial" },
      { title: "中国与波兰建交 (1949)", category: "memorial" },
    ],
  },
  {
    date: 8,
    day: "周三",
    events: [
      { title: "调休", category: "solar" },
      { title: "国际减少自然灾害日", category: "international" },
      { title: "哈勃太空望远镜发现远古最遥远的星系", category: "memorial" },
    ],
  },
  {
    date: 9,
    day: "周四",
    events: [
      { title: "世界邮政日", category: "international" },
      { title: "辛亥革命纪念日", category: "memorial" },
    ],
  },
  {
    date: 10,
    day: "周五",
    events: [
      { title: "辛亥革命纪念日", category: "memorial" },
      { title: "世界精神卫生日", category: "international" },
      { title: "世界居住条件调查日", category: "international" },
      { title: "中国大陆第一家麦当劳开业 (1990)", category: "memorial" },
      { title: "双十节 (辛亥革命纪念日)", category: "memorial" },
      { title: "中国联通的大众卡公司成立 (1984)", category: "memorial" },
      { title: "中央军委授予钱学森 (1934)", category: "memorial" },
    ],
  },
  {
    date: 11,
    day: "周六",
    events: [
      { title: "60亿人口日", category: "international" },
      { title: "世界镇痛日", category: "international" },
    ],
  },
  {
    date: 12,
    day: "周日",
    events: [
      { title: "哥伦布日", category: "international" },
      { title: "世界关节炎日", category: "international" },
      { title: "NBA球星姚明诞生 (1999)", category: "memorial" },
    ],
  },

  // Week 3
  {
    date: 13,
    day: "周一",
    events: [
      { title: "国际标准时间日", category: "international" },
      { title: "世界保健日", category: "international" },
      { title: "中国少年先锋队诞辰", category: "memorial" },
    ],
  },
  {
    date: 14,
    day: "周二",
    events: [
      { title: "国际标准化组织成立 (2001)", category: "memorial" },
      { title: "电影南海人节", category: "movie" },
      { title: "世界标准日", category: "international" },
    ],
  },
  {
    date: 15,
    day: "周三",
    events: [
      { title: "德国哲学家尼采诞辰 (1844)", category: "memorial" },
      { title: "国际盲人节", category: "international" },
      { title: "全球洗手日", category: "international" },
      { title: "神舟五号中国首次载人飞船发射 (2003)", category: "memorial" },
    ],
  },
  {
    date: 16,
    day: "周四",
    events: [
      { title: "世界粮食日", category: "international" },
      { title: "世界脊柱日", category: "international" },
    ],
  },
  {
    date: 17,
    day: "周五",
    events: [
      { title: "《天津条约》签署 (1860)", category: "memorial" },
      { title: "电影《三毛流浪记》拍摄 (1948)", category: "movie" },
      { title: "南京长江大桥竣工通车 (1967)", category: "memorial" },
    ],
  },
  {
    date: 18,
    day: "周六",
    events: [
      { title: "《格列佛游记》作者乔纳森·斯威夫特诞辰 (1936)", category: "memorial" },
      { title: "美国迪斯尼乐园诞生 (1991)", category: "memorial" },
      { title: "阿拉斯加归属美国 (1867)", category: "memorial" },
    ],
  },
  { date: 19, day: "周日", events: [{ title: "美国独立战争结束 (1781)", category: "memorial" }] },

  // Week 4
  {
    date: 20,
    day: "周一",
    events: [
      { title: "世界统计日", category: "international" },
      { title: "世界骨质疏松日", category: "international" },
      { title: "霜降", category: "weather" },
    ],
  },
  {
    date: 21,
    day: "周二",
    events: [
      { title: "爱迪生发明电灯泡 (1879)", category: "memorial" },
      { title: "诺贝尔奖设立 (1833)", category: "memorial" },
    ],
  },
  { date: 22, day: "周三", events: [{ title: "世界传统医药日", category: "international" }] },
  {
    date: 23,
    day: "周四",
    events: [
      { title: "霜降", category: "weather" },
      { title: "世界雪豹日", category: "international" },
    ],
  },
  {
    date: 24,
    day: "周五",
    events: [
      { title: "联合国日", category: "international" },
      { title: "世界发展信息日", category: "international" },
      { title: "程序员节", category: "tech" },
    ],
  },
  {
    date: 25,
    day: "周六",
    events: [
      { title: "抗美援朝纪念日", category: "memorial" },
      { title: "世界面食日", category: "international" },
    ],
  },
  { date: 26, day: "周日", events: [{ title: "环卫工人节", category: "solar" }] },

  // Week 5
  { date: 27, day: "周一", events: [{ title: "世界音像遗产日", category: "international" }] },
  { date: 28, day: "周二", events: [{ title: "世界男性健康日", category: "international" }] },
  { date: 29, day: "周三", events: [{ title: "世界卒中日", category: "international" }] },
  { date: 30, day: "周四", events: [{ title: "世界勤俭日", category: "international" }] },
  {
    date: 31,
    day: "周五",
    events: [
      { title: "万圣节", category: "international" },
      { title: "世界城市日", category: "international" },
    ],
  },
]

type ViewMode = "month" | "schedule" | "filter"

export default function MarketingCalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentMonth, setCurrentMonth] = useState(10)
  const [currentYear, setCurrentYear] = useState(2025)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    "weather",
    "solar",
    "lunar",
    "international",
    "memorial",
  ])
  const [expandedDays, setExpandedDays] = useState<number[]>([])

  const pinnedEvents = [
    { date: 1, title: "国庆节" },
    { date: 4, title: "世界动物日" },
    { date: 5, title: "寒露" },
    { date: 23, title: "霜降" },
    { date: 31, title: "万圣节" },
  ]

  const keyHolidaysData = {
    holidays: [
      { name: "国庆节", important: true },
      { name: "重阳节", important: true },
      { name: "世界动物日", important: false },
      { name: "万圣节", important: true },
    ],
    solarTerms: [
      { name: "寒露", important: true },
      { name: "霜降", important: true },
    ],
    keywords: [
      "国庆节,阅兵,7天假期,旅游,爱国",
      "登高,敬老,饮酒,赏菊,关爱",
      "转凉,养生,饮食,添衣",
      "秋收,风雅,进补,滋补,帽子",
      "恶搞,惊悚,化妆舞会,装扮,party",
    ],
  }

  const goToPreviousWeek = () => {
    // Simple implementation - in real app would handle month boundaries
    if (currentMonth > 1) {
      setCurrentMonth(currentMonth - 1)
    } else {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    }
  }

  const goToNextWeek = () => {
    if (currentMonth < 12) {
      setCurrentMonth(currentMonth + 1)
    } else {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    }
  }

  const goToToday = () => {
    setCurrentMonth(10)
    setCurrentYear(2025)
  }

  const filteredEvents = calendarEvents.map((day) => ({
    ...day,
    events: day.events.filter((event) => selectedFilters.includes(event.category)),
  }))

  const toggleDayExpansion = (date: number) => {
    setExpandedDays((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]))
  }

  const getEventColor = (eventTitle: string, category: string) => {
    // High-profile holidays get orange
    if (highProfileHolidays.some((holiday) => eventTitle.includes(holiday))) {
      return "text-orange-500"
    }
    // Solar terms get light blue
    if (category === "weather") {
      return "text-sky-500"
    }
    // Everything else gets dark gray
    return "text-gray-600"
  }

  const getWeekEvents = () => {
    const weeks: (typeof filteredEvents)[][] = []
    let currentWeek: typeof filteredEvents = []

    filteredEvents.forEach((day, index) => {
      currentWeek.push(day)
      if (day.day === "周日" || index === filteredEvents.length - 1) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
    })

    return weeks
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setViewMode("month")}
            >
              月
            </Button>
            <Button
              variant={viewMode === "schedule" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setViewMode("schedule")}
            >
              日程
            </Button>
            <Button
              variant={viewMode === "filter" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setShowFilterModal(true)}
            >
              筛选事件
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">
              {currentYear}年{currentMonth}月
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-xl bg-transparent" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl bg-transparent" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-xl bg-transparent" onClick={goToToday}>
                今天
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Calendar Area */}
          <div className="flex-1">
            {/* Schedule View */}
            {viewMode === "schedule" && (
              <div className="space-y-4">
                {getWeekEvents().map((week, weekIndex) => (
                  <div key={weekIndex}>
                    {week.map((day) => (
                      <div key={day.date}>
                        {day.day === "周一" && (
                          <div className="mb-4 bg-muted/30 px-4 py-2 text-sm font-medium">
                            星期{weekIndex + 1}
                            <span className="float-right text-muted-foreground">
                              {currentYear}年{currentMonth}月{day.date}日
                            </span>
                          </div>
                        )}

                        {day.events.length > 0 && (
                          <div className="mb-2 flex items-start gap-4 border-b border-border/40 px-4 py-3 hover:bg-muted/20">
                            <div className="w-16 flex-shrink-0 text-sm text-muted-foreground">全天</div>
                            <div className="flex-1 space-y-1">
                              {day.events.map((event, eventIndex) => (
                                <div key={eventIndex} className="flex items-center gap-2">
                                  <span
                                    className={`inline-block h-2 w-2 rounded-full ${
                                      eventCategories[event.category as keyof typeof eventCategories].color.split(
                                        " ",
                                      )[0]
                                    }`}
                                  />
                                  <span className="text-sm">{event.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Month View */}
            {viewMode === "month" && (
              <div className="rounded-2xl border border-border/40 bg-card shadow-sm">
                <div className="grid grid-cols-7 border-b border-border/40">
                  {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((day, index) => {
                    const colors = [
                      "bg-slate-500",
                      "bg-slate-500",
                      "bg-slate-500",
                      "bg-slate-500",
                      "bg-slate-500",
                      "bg-slate-500",
                      "bg-slate-500",
                    ]
                    return (
                      <div
                        key={day}
                        className={`${colors[index]} border-r border-border/40 p-4 text-center font-medium text-white last:border-r-0`}
                      >
                        {day}
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-7">
                  {filteredEvents.map((day) => {
                    const isExpanded = expandedDays.includes(day.date)
                    const visibleEvents = isExpanded ? day.events : day.events.slice(0, 3)
                    const hasPushpin = pinnedEvents.some((p) => p.date === day.date)

                    return (
                      <div
                        key={day.date}
                        className="relative min-h-32 border-b border-r border-border/40 p-3 last:border-r-0 hover:bg-muted/20"
                      >
                        <div className="mb-2 flex items-center justify-center gap-1.5">
                          <span className="text-sm font-medium text-muted-foreground">{day.date}</span>
                          {hasPushpin && <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />}
                        </div>
                        <div className="space-y-1">
                          {visibleEvents.map((event, index) => {
                            const eventColor = getEventColor(event.title, event.category)

                            return (
                              <div key={index} className="relative">
                                <div
                                  className={`truncate text-xs font-medium ${eventColor === "text-gray-600" ? "text-gray-400" : eventColor}`}
                                >
                                  {event.title}
                                </div>
                              </div>
                            )
                          })}
                          {day.events.length > 3 && (
                            <button
                              onClick={() => toggleDayExpansion(day.date)}
                              className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
                            >
                              {isExpanded ? "收起" : `+${day.events.length - 3} 更多`}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {viewMode === "month" && (
            <div className="w-80 rounded-2xl border border-border/40 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="mb-6 text-center">
                <h3 className="text-3xl font-bold">{currentMonth}月热点</h3>
              </div>

              <div className="mb-6">
                <h4 className="mb-3 flex items-center gap-2 text-lg font-bold">
                  <span className="text-xl">🎉</span>
                  节日:
                </h4>
                <div className="space-y-2">
                  {keyHolidaysData.holidays.map((holiday, index) => (
                    <div
                      key={index}
                      className={`text-sm font-medium ${holiday.important ? "text-orange-500" : "text-sky-500"}`}
                    >
                      {holiday.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="mb-3 flex items-center gap-2 text-lg font-bold">
                  <span className="text-xl">🍂</span>
                  节气:
                </h4>
                <div className="space-y-2">
                  {keyHolidaysData.solarTerms.map((term, index) => (
                    <div key={index} className="text-sm font-medium text-sky-500">
                      {term.name}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-lg font-bold">
                  <span className="text-xl">🔑</span>
                  关键词:
                </h4>
                <div className="space-y-2">
                  {keyHolidaysData.keywords.map((keywords, index) => (
                    <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                      {keywords}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showFilterModal && (
        <FilterModal
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  )
}