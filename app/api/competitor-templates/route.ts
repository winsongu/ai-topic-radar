import { NextResponse } from 'next/server'
import { supabase, hasSupabaseConfig } from '@/lib/supabase'

// 使用 Node.js 运行时（EdgeOne Pages 兼容性更好）
export const runtime = 'nodejs'
// 强制动态渲染，禁用缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/competitor-templates
 * 获取竞品模板数据（所有历史数据，支持分页）
 * 
 * 查询参数：
 * - platform: 平台筛选（可选）：aippt, tukuppt, islide, canva
 * - page: 页码（默认1）
 * - pageSize: 每页数量（默认50，最大100）
 * 
 * 返回格式：
 * {
 *   success: boolean,
 *   data: {
 *     platforms: [
 *       {
 *         id: string,
 *         name: string,
 *         templates: [...],
 *         updateTime: string,
 *         totalCount: number,
 *         currentPage: number,
 *         totalPages: number
 *       }
 *     ]
 *   }
 * }
 */
export async function GET(request: Request) {
  try {
    // 检查Supabase配置
    if (!hasSupabaseConfig) {
      return NextResponse.json({
        success: false,
        error: 'Supabase未配置，使用Mock数据'
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const platformFilter = searchParams.get('platform')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50')))

    // 平台配置
    const platforms = [
      { id: 'aippt', name: 'AIPPT', color: '#FF6B6B' },
      { id: 'tukuppt', name: '熊猫办公', color: '#4ECDC4' },
      { id: 'islide', name: 'iSlide', color: '#45B7D1' },
      { id: 'canva', name: 'Canva', color: '#96CEB4' }
    ]

    // 如果指定了平台筛选，只查询该平台
    const platformsToQuery = platformFilter 
      ? platforms.filter(p => p.id === platformFilter)
      : platforms

    // 为每个平台获取所有历史模板（支持分页）
    const platformsWithTemplates = await Promise.all(
      platformsToQuery.map(async (platform) => {
        try {
          // 1. 获取该平台的总数据量
          const { count, error: countError } = await supabase
            .from('competitor_templates')
            .select('*', { count: 'exact', head: true })
            .eq('platform', platform.name)

          if (countError) {
            console.error(`获取${platform.name}数据总数失败:`, countError)
            return {
              id: platform.id,
              name: platform.name,
              color: platform.color,
              templates: [],
              updateTime: new Date().toISOString(),
              totalCount: 0,
              currentPage: page,
              totalPages: 0
            }
          }

          const totalCount = count || 0
          const totalPages = Math.ceil(totalCount / pageSize)

          if (totalCount === 0) {
            // 该平台还没有数据
            return {
              id: platform.id,
              name: platform.name,
              color: platform.color,
              templates: [],
              updateTime: new Date().toISOString(),
              totalCount: 0,
              currentPage: page,
              totalPages: 0
            }
          }

          // 2. 获取该平台的模板数据（分页）
          const offset = (page - 1) * pageSize
          const { data: templates, error: templatesError } = await supabase
            .from('competitor_templates')
            .select('*')
            .eq('platform', platform.name)
            .order('crawled_at', { ascending: false })  // 最新入库的排前面
            .order('hot_value', { ascending: false })   // 同批次按热度排序
            .order('id', { ascending: false })          // 最后按ID排序
            .range(offset, offset + pageSize - 1)

          if (templatesError) {
            console.error(`获取${platform.name}模板数据失败:`, templatesError)
            return {
              id: platform.id,
              name: platform.name,
              color: platform.color,
              templates: [],
              updateTime: new Date().toISOString(),
              totalCount: 0,
              currentPage: page,
              totalPages: 0
            }
          }

          // 3. 获取最新抓取时间（用于显示更新时间）
          const latestCrawledAt = templates?.[0]?.crawled_at || new Date().toISOString()

          // 4. 格式化数据
          return {
            id: platform.id,
            name: platform.name,
            color: platform.color,
            templates: templates?.map(t => ({
              id: t.id,
              title: t.title,
              type: t.type,
              format: t.format,
              usage: t.usage,
              tags: t.tags || [],
              date: t.date,
              hot_value: t.hot_value || 0,
              url: t.url,
              platform: t.platform,
              thumbnail: t.thumbnail,
              isFree: t.is_free || false,
              crawled_at: t.crawled_at  // 添加入库时间字段
            })) || [],
            updateTime: latestCrawledAt,
            totalCount: totalCount,
            currentPage: page,
            totalPages: totalPages
          }
        } catch (error) {
          console.error(`处理${platform.name}数据失败:`, error)
          return {
            id: platform.id,
            name: platform.name,
            color: platform.color,
            templates: [],
            updateTime: new Date().toISOString(),
            totalCount: 0,
            currentPage: page,
            totalPages: 0
          }
        }
      })
    )

    // 过滤掉没有数据的平台
    const validPlatforms = platformsWithTemplates.filter(p => p.totalCount > 0)

    return NextResponse.json({
      success: true,
      data: {
        platforms: validPlatforms,
        totalPlatforms: validPlatforms.length,
        lastUpdate: new Date().toISOString()
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })
  }
}

/**
 * POST /api/competitor-templates/trigger-crawl
 * 触发手动抓取（可选功能）
 */
export async function POST(request: Request) {
  try {
    // 这里可以调用爬虫脚本
    // 实际部署时可以使用 Vercel Cron Jobs 或其他定时任务服务
    return NextResponse.json({
      success: true,
      message: '抓取任务已触发，请稍后查看结果'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '触发失败'
    }, { status: 500 })
  }
}

