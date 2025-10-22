import { NextResponse } from 'next/server'
import { supabase, hasSupabaseConfig } from '@/lib/supabase'

/**
 * GET /api/analytics
 * 数据分析API：支持月度复盘、热度趋势、热词统计
 * 
 * 查询参数：
 * - type: 'monthly' | 'trend' | 'keywords' | 'platform-stats'
 * - platform: 平台ID（可选，不传则查询所有平台）
 * - startDate: 起始日期 YYYY-MM-DD（可选）
 * - endDate: 结束日期 YYYY-MM-DD（可选）
 * - title: 热点标题关键词（用于趋势分析，可选）
 * 
 * 返回格式：
 * {
 *   success: boolean,
 *   data: any,
 *   summary: object (统计摘要)
 * }
 */
export async function GET(request: Request) {
  try {
    // 检查Supabase配置
    if (!hasSupabaseConfig) {
      return NextResponse.json({
        success: false,
        error: 'Supabase未配置'
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'monthly'
    const platform = searchParams.get('platform')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const title = searchParams.get('title')

    // 默认查询最近30天的数据
    const defaultEndDate = new Date()
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 30)

    const queryStartDate = startDate || defaultStartDate.toISOString().split('T')[0]
    const queryEndDate = endDate || defaultEndDate.toISOString().split('T')[0]

    switch (type) {
      case 'monthly':
        return await getMonthlyReport(queryStartDate, queryEndDate, platform)
      
      case 'trend':
        if (!title) {
          return NextResponse.json({
            success: false,
            error: '趋势分析需要提供 title 参数'
          }, { status: 400 })
        }
        return await getTrendAnalysis(title, queryStartDate, queryEndDate, platform)
      
      case 'keywords':
        return await getKeywordsStats(queryStartDate, queryEndDate, platform)
      
      case 'platform-stats':
        return await getPlatformStats(queryStartDate, queryEndDate)
      
      default:
        return NextResponse.json({
          success: false,
          error: '不支持的分析类型'
        }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error('Error in /api/analytics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch analytics data'
      },
      { status: 500 }
    )
  }
}

/**
 * 月度复盘报告
 */
async function getMonthlyReport(startDate: string, endDate: string, platform?: string | null) {
  let query = supabase
    .from('hot_news')
    .select('*')
    .gte('crawled_at', startDate)
    .lte('crawled_at', endDate + 'T23:59:59')
    .eq('is_visible', true)
    .order('crawled_at', { ascending: false })
  
  if (platform) {
    query = query.eq('platform_id', platform)
  }
  
  const { data: news, error } = await query
  
  if (error) {
    throw error
  }
  
  // 按天统计
  const dailyStats: Record<string, any> = {}
  const titleFrequency: Record<string, number> = {}
  
  news.forEach(item => {
    const date = item.crawled_at.split('T')[0]
    
    if (!dailyStats[date]) {
      dailyStats[date] = {
        date,
        totalNews: 0,
        platforms: new Set(),
        avgHotValue: 0,
        hotValues: []
      }
    }
    
    dailyStats[date].totalNews++
    dailyStats[date].platforms.add(item.platform_id)
    dailyStats[date].hotValues.push(item.hot_value || 0)
    
    // 统计标题词频
    const words = item.title.match(/[\u4e00-\u9fa5]+/g) || []
    words.forEach((word: string) => {
      if (word.length >= 2) {  // 只统计2字以上的词
        titleFrequency[word] = (titleFrequency[word] || 0) + 1
      }
    })
  })
  
  // 计算每日平均热度
  Object.values(dailyStats).forEach((day: any) => {
    day.avgHotValue = day.hotValues.length > 0
      ? day.hotValues.reduce((a: number, b: number) => a + b, 0) / day.hotValues.length
      : 0
    day.platforms = Array.from(day.platforms)
    delete day.hotValues  // 移除原始数据
  })
  
  // 热词Top20
  const topKeywords = Object.entries(titleFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }))
  
  // 汇总统计
  const summary = {
    totalNews: news.length,
    dateRange: { startDate, endDate },
    uniqueDays: Object.keys(dailyStats).length,
    platforms: platform ? [platform] : [...new Set(news.map(n => n.platform_id))],
    avgDailyNews: news.length / Object.keys(dailyStats).length
  }
  
  return NextResponse.json({
    success: true,
    data: {
      dailyStats: Object.values(dailyStats),
      topKeywords
    },
    summary
  })
}

/**
 * 热点趋势分析（追踪某个话题的热度变化）
 */
async function getTrendAnalysis(
  title: string, 
  startDate: string, 
  endDate: string, 
  platform?: string | null
) {
  let query = supabase
    .from('hot_news')
    .select('*')
    .ilike('title', `%${title}%`)
    .gte('crawled_at', startDate)
    .lte('crawled_at', endDate + 'T23:59:59')
    .eq('is_visible', true)
    .order('crawled_at', { ascending: true })
  
  if (platform) {
    query = query.eq('platform_id', platform)
  }
  
  const { data: news, error } = await query
  
  if (error) {
    throw error
  }
  
  // 按时间点统计
  const trendData = news.map(item => ({
    time: item.crawled_at,
    date: item.crawled_at.split('T')[0],
    platform: item.platform_id,
    title: item.title,
    hotValue: item.hot_value || 0,
    rank: item.rank_order
  }))
  
  const summary = {
    keyword: title,
    totalOccurrences: news.length,
    dateRange: { startDate, endDate },
    platforms: [...new Set(news.map(n => n.platform_id))],
    peakHotValue: Math.max(...news.map(n => n.hot_value || 0)),
    avgHotValue: news.reduce((sum, n) => sum + (n.hot_value || 0), 0) / news.length
  }
  
  return NextResponse.json({
    success: true,
    data: trendData,
    summary
  })
}

/**
 * 关键词统计（全局热词分析）
 */
async function getKeywordsStats(
  startDate: string, 
  endDate: string, 
  platform?: string | null
) {
  let query = supabase
    .from('hot_news')
    .select('title, platform_id, hot_value')
    .gte('crawled_at', startDate)
    .lte('crawled_at', endDate + 'T23:59:59')
    .eq('is_visible', true)
  
  if (platform) {
    query = query.eq('platform_id', platform)
  }
  
  const { data: news, error } = await query
  
  if (error) {
    throw error
  }
  
  // 统计关键词及其热度
  const keywordStats: Record<string, any> = {}
  
  news.forEach(item => {
    const words = item.title.match(/[\u4e00-\u9fa5]+/g) || []
    words.forEach((word: string) => {
      if (word.length >= 2) {
        if (!keywordStats[word]) {
          keywordStats[word] = {
            word,
            count: 0,
            totalHotValue: 0,
            platforms: new Set()
          }
        }
        keywordStats[word].count++
        keywordStats[word].totalHotValue += item.hot_value || 0
        keywordStats[word].platforms.add(item.platform_id)
      }
    })
  })
  
  // 计算平均热度并排序
  const topKeywords = Object.values(keywordStats)
    .map((stat: any) => ({
      word: stat.word,
      count: stat.count,
      avgHotValue: stat.totalHotValue / stat.count,
      platforms: Array.from(stat.platforms)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)  // Top 50
  
  return NextResponse.json({
    success: true,
    data: topKeywords,
    summary: {
      totalKeywords: Object.keys(keywordStats).length,
      dateRange: { startDate, endDate }
    }
  })
}

/**
 * 平台统计（各平台活跃度对比）
 */
async function getPlatformStats(startDate: string, endDate: string) {
  const { data: news, error } = await supabase
    .from('hot_news')
    .select('platform_id, hot_value, crawled_at')
    .gte('crawled_at', startDate)
    .lte('crawled_at', endDate + 'T23:59:59')
    .eq('is_visible', true)
  
  if (error) {
    throw error
  }
  
  // 按平台统计
  const platformStats: Record<string, any> = {}
  
  news.forEach(item => {
    if (!platformStats[item.platform_id]) {
      platformStats[item.platform_id] = {
        platform: item.platform_id,
        totalNews: 0,
        totalHotValue: 0,
        crawlDates: new Set()
      }
    }
    platformStats[item.platform_id].totalNews++
    platformStats[item.platform_id].totalHotValue += item.hot_value || 0
    platformStats[item.platform_id].crawlDates.add(item.crawled_at.split('T')[0])
  })
  
  const stats = Object.values(platformStats).map((stat: any) => ({
    platform: stat.platform,
    totalNews: stat.totalNews,
    avgHotValue: stat.totalHotValue / stat.totalNews,
    activeDays: stat.crawlDates.size,
    avgDailyNews: stat.totalNews / stat.crawlDates.size
  }))
  
  return NextResponse.json({
    success: true,
    data: stats,
    summary: {
      totalPlatforms: stats.length,
      dateRange: { startDate, endDate }
    }
  })
}

