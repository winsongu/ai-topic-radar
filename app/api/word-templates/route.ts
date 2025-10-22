import { NextResponse } from 'next/server'
import { supabase, hasSupabaseConfig } from '@/lib/supabase'

// 强制动态渲染，禁用缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/word-templates
 * 获取文字模板数据（所有历史数据，支持分页）
 * 
 * 查询参数：
 * - platform: 平台筛选（可选）：觅知手抄报、觅知营销日历、熊猫办公
 * - type: 类型筛选（可选）：手抄报、营销素材、Word模板
 * - page: 页码（默认1）
 * - pageSize: 每页数量（默认50，最大100）
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
    const platformFilter = searchParams.get('platform')
    const typeFilter = searchParams.get('type')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50')))

    // 平台配置
    const platforms = [
      { id: 'miz_shouchaobao', name: '觅知手抄报', color: '#FF6B9D' },
      { id: 'miz_sucai', name: '觅知营销日历', color: '#4ECDC4' },
      { id: 'tukuppt_word', name: '熊猫办公', color: '#45B7D1' }
    ]

    // 如果指定了平台筛选，只查询该平台
    const platformsToQuery = platformFilter 
      ? platforms.filter(p => p.name === platformFilter)
      : platforms

    // 为每个平台获取所有历史模板（支持分页）
    const platformsWithTemplates = await Promise.all(
      platformsToQuery.map(async (platform) => {
        try {
          // 1. 构建查询条件
          let countQuery = supabase
            .from('word_templates')
            .select('*', { count: 'exact', head: true })
            .eq('platform', platform.name)

          if (typeFilter) {
            countQuery = countQuery.eq('type', typeFilter)
          }

          // 获取该平台的总数据量
          const { count, error: countError } = await countQuery

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
          let dataQuery = supabase
            .from('word_templates')
            .select('*')
            .eq('platform', platform.name)
            .order('crawled_at', { ascending: false })
            .order('hot_value', { ascending: false })
            .order('id', { ascending: false })
            .range(offset, offset + pageSize - 1)

          if (typeFilter) {
            dataQuery = dataQuery.eq('type', typeFilter)
          }

          const { data: templates, error: templatesError } = await dataQuery

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

          // 3. 获取最新抓取时间
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
              platform: t.platform,
              tags: t.tags || [],
              category: t.category,
              description: t.description,
              url: t.url,
              thumbnail: t.thumbnail,
              author: t.author,
              hot_value: t.hot_value || 0,
              is_hot: t.is_hot || false,
              crawled_at: t.crawled_at
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

