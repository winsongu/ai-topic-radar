"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { FilterModal } from "@/components/filter-modal"
import { CustomEventModal } from "@/components/custom-event-modal"

// 导入生成的日历数据
import calendarEventsData from "@/data/calendar-events.json"
import monthlyHotspotsData from "@/data/monthly-hotspots.json"

const eventCategories = {
  weather: { name: "节气", color: "text-sky-500" },
  solar: { name: "公历节日", color: "text-gray-600" },
  lunar: { name: "农历节日", color: "text-gray-600" },
  international: { name: "国际节日", color: "text-gray-600" },
  memorial: { name: "纪念日", color: "text-gray-600" },
}

type ViewMode = "month" | "schedule" | "filter"

// 类型定义
type CalendarEvent = {
  year: number
  month: number
  date: number
  weekday: string
  events: {
    title: string
    category: string
    isHighProfile: boolean
  }[]
}

type MonthlyHotspot = {
  year: number
  month: number
  holidays: { name: string; date: number; important: boolean }[]
  solarTerms: { name: string; date: number }[]
  keywords: string[]
}

export default function MarketingCalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showCustomEventModal, setShowCustomEventModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    "weather",
    "solar",
    "lunar",
    "international",
    "memorial",
  ])
  const [showCustomEvents, setShowCustomEvents] = useState(true)
  const [expandedDays, setExpandedDays] = useState<number[]>([])
  const [customEvents, setCustomEvents] = useState<any[]>([])

  // 从 localStorage 加载自定义事件
  useEffect(() => {
    const stored = localStorage.getItem("customMarketingEvents")
    if (stored) {
      try {
        const events = JSON.parse(stored)
        setCustomEvents(events)
      } catch (e) {
        console.error("Failed to parse custom events:", e)
      }
    }
  }, [])

  // 获取当前月份的日历数据（包含自定义事件）
  const currentMonthEvents = useMemo(() => {
    const events = (calendarEventsData as CalendarEvent[]).filter(
      (event) => event.year === currentYear && event.month === currentMonth
    )
    
    // 构建完整的月历（包括没有事件的日期）
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()
    
    const monthCalendar = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const existingEvent = events.find((e) => e.date === day)
      const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
      const dayOfWeek = new Date(currentYear, currentMonth - 1, day).getDay()
      
      // 合并系统事件和自定义事件
      const systemEvents = existingEvent?.events || []
      const customEventsForDay = customEvents
        .filter((ce) => ce.year === currentYear && ce.month === currentMonth && ce.date === day)
        .map((ce) => ({
          title: ce.title,
          category: ce.category,
          isHighProfile: ce.isHighProfile,
        }))
      
      monthCalendar.push({
        date: day,
        day: weekdays[dayOfWeek],
        events: [...systemEvents, ...customEventsForDay],
      })
    }
    
    return monthCalendar
  }, [currentYear, currentMonth, customEvents])

  // 获取当前月份的热点数据
  const currentMonthHotspot = useMemo(() => {
    const monthKey = `${currentYear}-${currentMonth}`
    const hotspot = (monthlyHotspotsData as Record<string, MonthlyHotspot>)[monthKey]
    
    if (!hotspot) {
      return {
        holidays: [],
        solarTerms: [],
        keywords: [],
      }
    }
    
    return hotspot
  }, [currentYear, currentMonth])

  // 获取置顶的事件日期
  const pinnedEvents = useMemo(() => {
    return currentMonthEvents
      .filter((day) => day.events.some((e) => e.isHighProfile))
      .map((day) => ({
        date: day.date,
        title: day.events.find((e) => e.isHighProfile)?.title || "",
      }))
  }, [currentMonthEvents])

  const goToPreviousMonth = () => {
    if (currentMonth > 1) {
      setCurrentMonth(currentMonth - 1)
    } else {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth < 12) {
      setCurrentMonth(currentMonth + 1)
    } else {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    }
  }

  const goToToday = () => {
    setCurrentMonth(today.getMonth() + 1)
    setCurrentYear(today.getFullYear())
  }

  const filteredEvents = currentMonthEvents.map((day) => ({
    ...day,
    events: day.events.filter((event) => {
      // 系统事件根据筛选器显示
      if (selectedFilters.includes(event.category)) {
        return true
      }
      // 自定义事件根据 showCustomEvents 开关显示
      const isCustomEvent = !["weather", "solar", "lunar", "international", "memorial"].includes(event.category)
      return isCustomEvent && showCustomEvents
    }),
  }))

  const toggleDayExpansion = (date: number) => {
    setExpandedDays((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]))
  }

  const getEventColor = (eventTitle: string, category: string, isHighProfile: boolean) => {
    // 重点节日显示橙色
    if (isHighProfile) {
      return "text-orange-500"
    }
    // 节气显示天蓝色
    if (category === "weather") {
      return "text-sky-500"
    }
    // 自定义事件显示紫色
    const isCustomEvent = !["weather", "solar", "lunar", "international", "memorial"].includes(category)
    if (isCustomEvent) {
      return "text-purple-600"
    }
    // 系统节日显示灰色
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
            <Button
              variant="outline"
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              onClick={() => setShowCustomEventModal(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              添加营销节点
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">
              {currentYear}年{currentMonth}月
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-xl bg-transparent" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl bg-transparent" onClick={goToNextMonth}>
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
                  {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((day) => {
                    return (
                      <div
                        key={day}
                        className="bg-slate-500 border-r border-border/40 p-4 text-center font-medium text-white last:border-r-0"
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
                            const eventColor = getEventColor(event.title, event.category, event.isHighProfile)

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

          {/* Sidebar - Monthly Hotspots */}
          {viewMode === "month" && (
            <div className="w-80 rounded-2xl border border-border/40 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="mb-6 text-center">
                <h3 className="text-3xl font-bold">{currentMonth}月热点</h3>
              </div>

              {currentMonthHotspot.holidays.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-bold">
                    <span className="text-xl">🎉</span>
                    节日:
                  </h4>
                  <div className="space-y-2">
                    {currentMonthHotspot.holidays.map((holiday, index) => (
                      <div
                        key={index}
                        className={`text-sm font-medium ${holiday.important ? "text-orange-500" : "text-sky-500"}`}
                      >
                        {holiday.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentMonthHotspot.solarTerms.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-bold">
                    <span className="text-xl">🍂</span>
                    节气:
                  </h4>
                  <div className="space-y-2">
                    {currentMonthHotspot.solarTerms.map((term, index) => (
                      <div key={index} className="text-sm font-medium text-sky-500">
                        {term.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentMonthHotspot.keywords.length > 0 && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-bold">
                    <span className="text-xl">🔑</span>
                    关键词:
                  </h4>
                  <div className="space-y-2">
                    {currentMonthHotspot.keywords.map((keywords, index) => (
                      <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                        {keywords}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentMonthHotspot.holidays.length === 0 &&
                currentMonthHotspot.solarTerms.length === 0 &&
                currentMonthHotspot.keywords.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground">
                    暂无该月热点数据
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {showFilterModal && (
        <FilterModal
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
          showCustomEvents={showCustomEvents}
          onShowCustomEventsChange={setShowCustomEvents}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {showCustomEventModal && (
        <CustomEventModal
          isOpen={showCustomEventModal}
          onClose={() => setShowCustomEventModal(false)}
          onSave={(events) => {
            setCustomEvents(events)
          }}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      )}
    </div>
  )
}
