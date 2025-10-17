import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化时间为中文格式：10月16日 14:47
 * @param dateString 时间字符串，格式如 "2025-10-16 00:00" 或 ISO 格式
 * @returns 格式化后的时间字符串，如 "10月16日 14:47"
 */
export function formatChineseDateTime(dateString: string): string {
  try {
    // 如果时间字符串包含 'T' 但没有时区标识符，添加 'Z' 表示UTC时间
    let normalizedDateString = dateString
    if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
      normalizedDateString = dateString + 'Z'
    }
    
    const date = new Date(normalizedDateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${month}月${day}日 ${hours}:${minutes}`
  } catch (error) {
    return dateString // 如果解析失败，返回原字符串
  }
}