import { NextRequest, NextResponse } from 'next/server'

/**
 * EdgeOne 定时任务 API
 * 每天0点自动执行数据更新
 */
export async function GET(request: NextRequest) {
  try {
    // 验证请求来源（可选，增加安全性）
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 开始执行每日数据更新任务')
    
    // 动态导入定时任务脚本
    const { dailyUpdate } = await import('@/scripts/crawl-and-save-daily')
    
    // 执行更新任务
    await dailyUpdate()
    
    return NextResponse.json({
      success: true,
      message: '每日数据更新任务执行成功',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ 定时任务执行失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 支持 POST 请求（某些平台可能需要）
export async function POST(request: NextRequest) {
  return GET(request)
}