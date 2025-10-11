/**
 * 每日定时抓取和保存脚本
 * 每天0点自动执行：抓取数据 → 保存到Supabase → 更新前端
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')

// 引入现有的抓取脚本
const { processSource } = require('../extract-news-with-real-links.js')
const { main: saveToSupabase } = require('../save-to-supabase.js')

// Supabase配置
const SUPABASE_URL = 'https://sdxgocjszjnrqrfbsspn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeGdvY2pzempucnFyZmJzc3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTM4NjgsImV4cCI6MjA3NTU2OTg2OH0.8lJ8dCBTT3qwmwNdL71EMPcVAmZHAgBeEp3rr-X6GJU'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 数据源配置
const dataSources = [
  {
    id: 'baidu_hot',
    name: '百度热搜',
    url: 'https://top.baidu.com/board?tab=realtime',
    extractorType: 'baidu',
    waitFor: 3000
  },
  {
    id: 'people_daily',
    name: '人民网重要讲话',
    url: 'https://jhsjk.people.cn/',
    extractorType: 'people',
    waitFor: 3000
  },
  {
    id: 'chinanews_edu',
    name: '中新网教育',
    url: 'https://www.chinanews.com.cn/rss/importnews.xml',
    extractorType: 'rss',
    waitFor: 2000
  }
]

// Platform ID映射
const platformIdMapping = {
  'baidu_hot': 'baidu',
  'chinanews_edu': 'chinanews', 
  'people_daily': 'people'
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
      const result = await processSource(source)
      
      if (!result.success || result.news.length === 0) {
        console.log(`   ⏭️  跳过（无数据）`)
        continue
      }
      
      console.log(`   ✅ 抓取成功，获得 ${result.news.length} 条新闻`)
      
      // 2. 清理旧数据
      const mappedPlatformId = platformIdMapping[source.id] || source.id
      console.log(`   🗑️  清理 ${mappedPlatformId} 的旧数据...`)
      
      const { error: deleteError } = await supabase
        .from('hot_news')
        .delete()
        .eq('platform_id', mappedPlatformId)
      
      if (deleteError) {
        console.log(`   ⚠️  清理失败: ${deleteError.message}`)
      } else {
        console.log(`   ✅ 旧数据已清理`)
      }
      
      // 3. 插入新数据
      const newsToInsert = result.news.map(item => ({
        platform_id: mappedPlatformId,
        title: item.title,
        summary: item.summary,
        url: item.url,
        hot_value: item.hot || 0,
        time_label: item.time,
        rank_order: item.id,
        crawled_at: new Date().toISOString(),
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
      
      totalProcessed += result.news.length
      
      // 等待2秒，避免API限流
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    // 4. 更新平台状态
    console.log('\n🔄 第二步：更新平台状态...')
    const today = new Date().toISOString().split('T')[0] + ' 00:00'
    
    for (const source of dataSources) {
      const mappedPlatformId = platformIdMapping[source.id] || source.id
      
      const { error: updateError } = await supabase
        .from('platforms')
        .update({ 
          update_frequency: today,
          is_active: true 
        })
        .eq('id', mappedPlatformId)
      
      if (updateError) {
        console.log(`   ⚠️  更新 ${mappedPlatformId} 状态失败: ${updateError.message}`)
      } else {
        console.log(`   ✅ ${mappedPlatformId} 状态已更新`)
      }
    }
    
    // 5. 保存执行日志
    const logEntry = {
      timestamp: new Date().toISOString(),
      totalProcessed,
      totalSuccess,
      sources: dataSources.map(s => s.name),
      status: totalSuccess > 0 ? 'success' : 'failed'
    }
    
    const logFile = path.join(__dirname, 'daily-update.log')
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', 'utf-8')
    
    // 6. 输出汇总
    console.log('\n━'.repeat(60))
    console.log('📊 每日更新完成！')
    console.log('━'.repeat(60))
    console.log(`✅ 成功处理: ${totalSuccess}/${totalProcessed} 条新闻`)
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