"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const filterCategories = [
  { id: "weather", name: "节气", color: "border-pink-500" },
  { id: "solar", name: "公历假日", color: "border-green-500" },
  { id: "lunar", name: "农历假日", color: "border-pink-500" },
  { id: "international", name: "国际节日", color: "border-red-500" },
  { id: "memorial", name: "纪念日", color: "border-cyan-500" },
]

interface FilterModalProps {
  selectedFilters: string[]
  onFiltersChange: (filters: string[]) => void
  showCustomEvents: boolean
  onShowCustomEventsChange: (show: boolean) => void
  onClose: () => void
}

export function FilterModal({ selectedFilters, onFiltersChange, showCustomEvents, onShowCustomEventsChange, onClose }: FilterModalProps) {
  const toggleFilter = (filterId: string) => {
    if (selectedFilters.includes(filterId)) {
      onFiltersChange(selectedFilters.filter((id) => id !== filterId))
    } else {
      onFiltersChange([...selectedFilters, filterId])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-card p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-muted/50"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-bold">筛选事件</h2>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">系统节日</h3>
          <div className="grid grid-cols-3 gap-4">
            {filterCategories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={category.id}
                  checked={selectedFilters.includes(category.id)}
                  onCheckedChange={() => toggleFilter(category.id)}
                  className="rounded"
                />
                <label
                  htmlFor={category.id}
                  className={`cursor-pointer rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                    category.color
                  } ${selectedFilters.includes(category.id) ? "bg-primary/10" : "bg-muted/30 hover:bg-muted/50"}`}
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 rounded-xl border-2 border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="customEvents"
                checked={showCustomEvents}
                onCheckedChange={(checked) => onShowCustomEventsChange(checked === true)}
                className="rounded"
              />
              <label htmlFor="customEvents" className="cursor-pointer">
                <div className="font-semibold text-purple-700 dark:text-purple-300">显示自定义事件</div>
                <div className="text-xs text-purple-600 dark:text-purple-400">包含所有手动添加的营销节点</div>
              </label>
            </div>
            <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              自定义
            </div>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-6 text-lg font-medium shadow-lg hover:from-purple-700 hover:to-indigo-700"
        >
          保存
        </Button>
      </div>
    </div>
  )
}