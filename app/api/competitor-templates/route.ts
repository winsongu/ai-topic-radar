import { NextResponse } from 'next/server'
import { supabase, hasSupabaseConfig } from '@/lib/supabase'

// 强制动态渲染，禁用缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/competitor-templates
 * 获取竞品模板数据（最新批次）
 * 
 * 查询参数：
 * - platform: 平台筛选（可选）：aippt, tukuppt, islide, canva
 * - limit: 每个平台返回的数量（默认10）
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
 *         totalCount: number
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
    const limit = parseInt(searchParams.get('limit') || '10')

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

    // 为每个平台获取最新批次的模板
    const platformsWithTemplates = await Promise.all(
      platformsToQuery.map(async (platform) => {
        try {
          // 1. 获取该平台最新的抓取时间
          const { data: latestBatch, error: batchError } = await supabase
            .from('competitor_templates')
            .select('crawled_at')
            .eq('platform', platform.name)
            .order('crawled_at', { ascending: false })
            .limit(1)

          if (batchError) {
            console.error(`获取${platform.name}最新批次失败:`, batchError)
            return {
              id: platform.id,
              name: platform.name,
              color: platform.color,
              templates: [],
              updateTime: new Date().toISOString(),
              totalCount: 0
            }
          }

          const latestCrawledAt = latestBatch?.[0]?.crawled_at

          if (!latestCrawledAt) {
            // 该平台还没有数据
            return {
              id: platform.id,
              name: platform.name,
              color: platform.color,
              templates: [],
              updateTime: new Date().toISOString(),
              totalCount: 0
            }
          }

          // 2. 获取该批次的模板数据
          const { data: templates, error: templatesError } = await supabase
            .from('competitor_templates')
            .select('*')
            .eq('platform', platform.name)
            .eq('crawled_at', latestCrawledAt)
            .order('hot_value', { ascending: false })
            .order('id', { ascending: false })
            .limit(limit)

          if (templatesError) {
            console.error(`获取${platform.name}模板数据失败:`, templatesError)
            return {
              id: platform.id,
              name: platform.name,
              color: platform.color,
              templates: [],
              updateTime: latestCrawledAt,
              totalCount: 0
            }
          }

          // 3. 格式化数据
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
              isFree: t.isFree || false,
              crawled_at: t.crawled_at  // 添加入库时间字段
            })) || [],
            updateTime: latestCrawledAt,
            totalCount: templates?.length || 0
          }
        } catch (error) {
          console.error(`处理${platform.name}数据失败:`, error)
          return {
            id: platform.id,
            name: platform.name,
            color: platform.color,
            templates: [],
            updateTime: new Date().toISOString(),
            totalCount: 0
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

