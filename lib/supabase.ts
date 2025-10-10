import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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