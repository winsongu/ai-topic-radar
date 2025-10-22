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
  { id: "custom", name: "自定义", color: "border-purple-500" },
  { id: "company", name: "公司活动", color: "border-blue-500" },
  { id: "product", name: "产品活动", color: "border-green-500" },
  { id: "industry", name: "行业活动", color: "border-indigo-500" },
  { id: "marketing", name: "营销活动", color: "border-pink-500" },
]

interface FilterModalProps {
  selectedFilters: string[]
  onFiltersChange: (filters: string[]) => void
  onClose: () => void
}

export function FilterModal({ selectedFilters, onFiltersChange, onClose }: FilterModalProps) {
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

        <div className="mb-8 grid grid-cols-3 gap-4">
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