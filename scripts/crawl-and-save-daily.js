/**
 * 每日定时抓取和保存脚本
 * 每天0点自动执行：抓取数据 → 保存到Supabase → 更新前端
 */

// 本地开发时加载环境变量
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')

// 引入爬虫脚本
const { crawlPlatform } = require('./news-crawler.js')

// Supabase配置（优先使用环境变量）
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sdxgocjszjnrqrfbsspn.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeGdvY2pzempucnFyZmJzc3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTM4NjgsImV4cCI6MjA3NTU2OTg2OH0.8lJ8dCBTT3qwmwNdL71EMPcVAmZHAgBeEp3rr-X6GJU'

// Firecrawl API Key（从环境变量读取）
// 注意：FIRECRAWL_API_KEY 需要在 GitHub Secrets 中配置
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || ''
if (!FIRECRAWL_API_KEY) {
  console.warn('⚠️  警告：FIRECRAWL_API_KEY 未配置，前三个平台（百度、中新网、人民网）可能无法抓取')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 数据源配置 - 按照前端显示顺序
const dataSources = [
  { id: 'baidu', name: '百度热搜' },
  { id: 'chinanews', name: '中新网教育' },
  { id: 'people', name: '人民网重要讲话' },
  { id: '36kr', name: '36氪' },
  { id: 'weibo', name: '微博热搜' },
  { id: 'zhihu', name: '知乎热榜' }
]

/**
 * 清理N天前的旧数据（避免数据库无限增长）
 * @param {number} daysToKeep - 保留最近N天的数据（默认90天）
 */
async function cleanOldData(daysToKeep = 90) {
  console.log(`\n🧹 清理 ${daysToKeep} 天前的旧数据...`)
  
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    const cutoffISO = cutoffDate.toISOString()
    
    const { data, error } = await supabase
      .from('hot_news')
      .delete()
      .lt('crawled_at', cutoffISO)
      .select()
    
    if (error) {
      console.log(`   ⚠️  清理失败: ${error.message}`)
      return { success: false, deleted: 0 }
    }
    
    const deletedCount = data?.length || 0
    console.log(`   ✅ 已清理 ${deletedCount} 条旧数据（早于 ${cutoffDate.toLocaleDateString('zh-CN')}）`)
    return { success: true, deleted: deletedCount }
    
  } catch (error) {
    console.error(`   ❌ 清理数据失败:`, error.message)
    return { success: false, deleted: 0 }
  }
}

/**
 * 完整的每日更新流程
 */
async function dailyUpdate() {
  console.log('🚀 开始每日数据更新任务')
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}`)
  console.log('━'.repeat(60))
  
  try {
    let totalProcessed = 0
    let totalSuccess = 0
    
    // 1. 抓取所有数据源
    console.log('📡 第一步：抓取数据源...')
    for (const source of dataSources) {
      console.log(`\n📌 处理: ${source.name}`)
      
      // 抓取数据
      const result = await crawlPlatform(source.id)
      
      if (!result.success || result.data.length === 0) {
        console.log(`   ⏭️  跳过（无数据）`)
        continue
      }
      
      console.log(`   ✅ 抓取成功，获得 ${result.data.length} 条新闻`)
      
      // 2. 【追加模式】直接插入新数据，保留历史记录
      // 每次抓取使用统一的时间戳，便于后续查询最新批次
      const batchTimestamp = new Date().toISOString()
      
      console.log(`   💾 追加新数据（批次时间: ${batchTimestamp}）...`)
      
      // 3. 插入新数据（使用统一的批次时间戳）
      const newsToInsert = result.data.map(item => ({
        platform_id: source.id,
        title: item.title,
        summary: item.summary,
        url: item.url,
        hot_value: item.hot || 0,
        time_label: item.time,
        rank_order: item.id,
        crawled_at: batchTimestamp,  // 使用统一的批次时间
        is_visible: true
      }))
      
      const { data: insertedNews, error: insertError } = await supabase
        .from('hot_news')
        .insert(newsToInsert)
        .select()
      
      if (insertError) {
        console.error(`   ❌ 插入失败: ${insertError.message}`)
      } else {
        console.log(`   ✅ 成功插入 ${insertedNews.length} 条新闻`)
        totalSuccess += insertedNews.length
      }
      
      totalProcessed += result.data.length
      
      // 等待2秒，避免API限流
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    // 4. 清理旧数据（保留90天）
    console.log('\n🧹 第二步：清理旧数据...')
    const cleanResult = await cleanOldData(90)  // 保留90天数据
    
    // 5. 更新平台状态
    console.log('\n🔄 第三步：更新平台状态...')
    const today = new Date().toISOString().split('T')[0] + ' 00:00'
    
    for (const source of dataSources) {
      const { error: updateError } = await supabase
        .from('platforms')
        .update({ 
          update_frequency: today,
          is_active: true 
        })
        .eq('id', source.id)
      
      if (updateError) {
        console.log(`   ⚠️  更新 ${source.id} 状态失败: ${updateError.message}`)
      } else {
        console.log(`   ✅ ${source.id} 状态已更新`)
      }
    }
    
    // 6. 保存执行日志
    const logEntry = {
      timestamp: new Date().toISOString(),
      totalProcessed,
      totalSuccess,
      deletedOldData: cleanResult.deleted || 0,
      sources: dataSources.map(s => s.name),
      status: totalSuccess > 0 ? 'success' : 'failed'
    }
    
    const logFile = path.join(__dirname, 'daily-update.log')
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', 'utf-8')
    
    // 7. 输出汇总
    console.log('\n━'.repeat(60))
    console.log('📊 每日更新完成！')
    console.log('━'.repeat(60))
    console.log(`✅ 新增数据: ${totalSuccess}/${totalProcessed} 条新闻`)
    console.log(`🧹 清理数据: ${cleanResult.deleted || 0} 条旧数据`)
    console.log(`📅 更新时间: ${today}`)
    console.log(`📝 日志文件: daily-update.log`)
    console.log('━'.repeat(60))
    
    if (totalSuccess > 0) {
      console.log('🎉 数据更新成功！前端将显示最新内容。')
    } else {
      console.log('⚠️  警告：没有成功更新任何数据，请检查网络和配置。')
    }
    
  } catch (error) {
    console.error('\n❌ 每日更新失败:', error.message)
    console.error(error)
    
    // 记录错误日志
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      status: 'failed'
    }
    
    const logFile = path.join(__dirname, 'daily-update.log')
    await fs.appendFile(logFile, JSON.stringify(errorLog) + '\n', 'utf-8')
    
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  dailyUpdate()
    .then(() => {
      console.log('\n✨ 每日更新任务完成！')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n❌ 每日更新任务失败:', error)
      process.exit(1)
    })
}

module.exports = { dailyUpdate }