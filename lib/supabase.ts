import { createClient } from '@supabase/supabase-js'

// 使用默认值，允许在没有环境变量时优雅降级
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 检查是否配置了有效的Supabase
export const hasSupabaseConfig = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// 类型定义
export type Platform = {
  id: string
  name: string
  description: string
  color: string
  update_frequency: string
  is_active: boolean
}

export type HotNews = {
  id: string
  platform_id: string
  title: string
  summary: string
  url: string
  hot_value: number
  time_label: string
  rank_order: number
  crawled_at: string
  is_visible: boolean
}

export type NewsWithPlatform = HotNews & {
  platform_name: string
  platform_description: string
  platform_color: string
}