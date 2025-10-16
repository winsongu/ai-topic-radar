import { NextResponse } from 'next/server'
import { supabase, hasSupabaseConfig } from '@/lib/supabase'

/**
 * GET /api/hot-news
 * 获取所有平台的最新热点新闻
 * 
 * 返回格式：
 * {
 *   success: boolean,
 *   data: Platform[],
 *   updatedAt: string
 * }
 */
export async function GET() {
  try {
    // 检查Supabase配置
    if (!hasSupabaseConfig) {
      console.warn('Supabase is not configured. Returning empty data.')
      return NextResponse.json({
        success: true,
        data: [],
        updatedAt: new Date().toISOString()
      })
    }

    // 1. 定义6个平台的顺序
    const platformOrder = ['baidu', 'chinanews', 'people', '36kr', 'weibo', 'zhihu']
    
    // 2. 获取指定的6个平台
    const { data: platforms, error: platformError } = await supabase
      .from('platforms')
      .select('*')
      .in('id', platformOrder)
      .eq('is_active', true)
    
    if (platformError) {
      console.error('Error fetching platforms:', platformError)
      throw platformError
    }
    
    // 3. 按照 platformOrder 的顺序排序
    const orderedPlatforms = platformOrder
      .map(id => platforms.find(p => p.id === id))
      .filter(Boolean)
    
    // 4. 为每个平台获取最新的Top10新闻
    const platformsWithNews = await Promise.all(
      orderedPlatforms.map(async (platform: any) => {
        // 获取该平台的最新热点（按 rank_order 排序，取Top10）
        const { data: news, error: newsError } = await supabase
          .from('hot_news')
          .select('*')
          .eq('platform_id', platform.id)
          .eq('is_visible', true)
          .order('rank_order', { ascending: true })
          .limit(10)
        
        if (newsError) {
          console.error(`Error fetching news for ${platform.id}:`, newsError)
          return {
            id: platform.id,
            name: platform.name,
            description: platform.description,
            updateTime: new Date().toISOString(),
            color: platform.color,
            news: []
          }
        }
        
        // 5. 获取该平台最新的抓取时间
        const latestCrawledAt = news.length > 0 && news[0].crawled_at
          ? new Date(news[0].crawled_at).toISOString()
          : new Date().toISOString()
        
        // 6. 格式化数据，匹配前端期望的结构
        return {
          id: platform.id,
          name: platform.name,
          description: platform.description,
          updateTime: latestCrawledAt,  // 使用真实的抓取时间
          color: platform.color,
          news: news.map(item => ({
            id: item.rank_order,  // 使用rank_order作为前端的id
            title: item.title,
            summary: item.summary || '',
            url: item.url,
            hot: item.hot_value || 0,
            time: item.time_label || '刚刚',
          }))
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      data: platformsWithNews,
      updatedAt: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Error in /api/hot-news:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch hot news',
        data: []
      },
      { status: 500 }
    )
  }
}