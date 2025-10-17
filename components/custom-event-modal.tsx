"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, Edit2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CustomEvent = {
  id: string
  title: string
  year: number
  month: number
  date: number
  category: string
  isHighProfile: boolean
}

type CustomEventModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (events: CustomEvent[]) => void
  currentYear: number
  currentMonth: number
}

export function CustomEventModal({ isOpen, onClose, onSave, currentYear, currentMonth }: CustomEventModalProps) {
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([])
  const [editingEvent, setEditingEvent] = useState<CustomEvent | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    year: currentYear,
    month: currentMonth,
    date: 1,
    category: "custom",
    isHighProfile: false,
  })

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
  }, [isOpen])

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert("请输入节日名称")
      return
    }

    const newEvent: CustomEvent = {
      id: editingEvent?.id || `custom-${Date.now()}`,
      ...formData,
    }

    let updatedEvents: CustomEvent[]
    if (editingEvent) {
      // 编辑现有事件
      updatedEvents = customEvents.map((e) => (e.id === editingEvent.id ? newEvent : e))
    } else {
      // 添加新事件
      updatedEvents = [...customEvents, newEvent]
    }

    setCustomEvents(updatedEvents)
    localStorage.setItem("customMarketingEvents", JSON.stringify(updatedEvents))
    onSave(updatedEvents)

    // 重置表单
    setFormData({
      title: "",
      year: currentYear,
      month: currentMonth,
      date: 1,
      category: "custom",
      isHighProfile: false,
    })
    setEditingEvent(null)
  }

  const handleEdit = (event: CustomEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      year: event.year,
      month: event.month,
      date: event.date,
      category: event.category,
      isHighProfile: event.isHighProfile,
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个自定义热点吗？")) {
      const updatedEvents = customEvents.filter((e) => e.id !== id)
      setCustomEvents(updatedEvents)
      localStorage.setItem("customMarketingEvents", JSON.stringify(updatedEvents))
      onSave(updatedEvents)
    }
  }

  const handleCancelEdit = () => {
    setEditingEvent(null)
    setFormData({
      title: "",
      year: currentYear,
      month: currentMonth,
      date: 1,
      category: "custom",
      isHighProfile: false,
    })
  }

  if (!isOpen) return null

  // 按日期排序
  const sortedEvents = [...customEvents].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    if (a.month !== b.month) return a.month - b.month
    return a.date - b.date
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-background shadow-xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-2xl font-bold">自定义营销热点</h2>
            <p className="mt-1 text-sm text-muted-foreground">添加您的专属营销节点，让日历更贴合业务需求</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          {/* 左侧：添加/编辑表单 */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-4">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Plus className="h-4 w-4" />
                {editingEvent ? "编辑热点" : "添加新热点"}
              </h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    节日名称 *
                  </Label>
                  <Input
                    id="title"
                    placeholder="例如：公司周年庆、产品发布会"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="year" className="text-sm font-medium">
                      年份
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      min="2024"
                      max="2030"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="month" className="text-sm font-medium">
                      月份
                    </Label>
                    <Input
                      id="month"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date" className="text-sm font-medium">
                      日期
                    </Label>
                    <Input
                      id="date"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: parseInt(e.target.value) })}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    分类
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="custom">自定义</option>
                    <option value="company">公司活动</option>
                    <option value="product">产品活动</option>
                    <option value="industry">行业活动</option>
                    <option value="marketing">营销活动</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-background p-3">
                  <input
                    type="checkbox"
                    id="isHighProfile"
                    checked={formData.isHighProfile}
                    onChange={(e) => setFormData({ ...formData, isHighProfile: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isHighProfile" className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <Star className="h-4 w-4 text-orange-500" />
                    设为重点热点（橙色星标）
                  </Label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} className="flex-1 rounded-xl">
                    {editingEvent ? "更新" : "添加"}
                  </Button>
                  {editingEvent && (
                    <Button onClick={handleCancelEdit} variant="outline" className="rounded-xl">
                      取消
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
              <p className="font-medium">💡 使用提示</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• 自定义热点仅保存在本地浏览器中</li>
                <li>• 可以添加公司活动、产品发布等专属节点</li>
                <li>• 重点热点会显示橙色星标，在日历中更醒目</li>
                <li>• 清除浏览器数据会删除所有自定义热点</li>
              </ul>
            </div>
          </div>

          {/* 右侧：已添加的自定义热点列表 */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">已添加的热点 ({customEvents.length})</h3>
              {customEvents.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("确定要清空所有自定义热点吗？此操作不可恢复！")) {
                      setCustomEvents([])
                      localStorage.removeItem("customMarketingEvents")
                      onSave([])
                    }
                  }}
                  className="rounded-lg text-xs text-red-500 hover:text-red-600"
                >
                  清空全部
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto rounded-xl border bg-muted/20 p-4" style={{ maxHeight: "500px" }}>
              {sortedEvents.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Plus className="mb-3 h-12 w-12 opacity-20" />
                  <p className="text-sm">还没有自定义热点</p>
                  <p className="mt-1 text-xs">在左侧添加您的第一个营销节点吧</p>
                </div>
              ) : (
                sortedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group flex items-center justify-between rounded-lg border bg-background p-3 transition-all hover:shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.title}</span>
                        {event.isHighProfile && <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {event.year}年{event.month}月{event.date}日
                        </span>
                        <span>•</span>
                        <span className="rounded-full bg-muted px-2 py-0.5">
                          {event.category === "custom" && "自定义"}
                          {event.category === "company" && "公司活动"}
                          {event.category === "product" && "产品活动"}
                          {event.category === "industry" && "行业活动"}
                          {event.category === "marketing" && "营销活动"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event)}
                        className="h-8 w-8 rounded-lg"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 border-t p-6">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            关闭
          </Button>
        </div>
      </div>
    </div>
  )
}

