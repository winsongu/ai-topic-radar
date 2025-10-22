/**
 * 检查数据库中竞品模板数据的脚本
 * 用于排查为什么只显示4个内容
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sdxgocjszjnrqrfbsspn.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeGdvY2pzempucnFyZmJzc3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTM4NjgsImV4cCI6MjA3NTU2OTg2OH0.8lJ8dCBTT3qwmwNdL71EMPcVAmZHAgBeEp3rr-X6GJU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  console.log('🔍 正在检查 competitor_templates 表的数据...\n')

  const platforms = [
    { id: 'aippt', name: 'AIPPT' },
    { id: 'tukuppt', name: '熊猫办公' },
    { id: 'islide', name: 'iSlide' },
    { id: 'canva', name: 'Canva' }
  ]

  let totalCount = 0

  for (const platform of platforms) {
    const { count, error } = await supabase
      .from('competitor_templates')
      .select('*', { count: 'exact', head: true })
      .eq('platform', platform.name)

    if (error) {
      console.error(`❌ ${platform.name} 查询失败:`, error.message)
      continue
    }

    totalCount += count || 0
    console.log(`${platform.name}: ${count || 0} 条数据`)

    // 查看最新的几条数据
    if (count && count > 0) {
      const { data, error: dataError } = await supabase
        .from('competitor_templates')
        .select('id, title, crawled_at')
        .eq('platform', platform.name)
        .order('crawled_at', { ascending: false })
        .limit(3)

      if (!dataError && data) {
        data.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.title}`)
          console.log(`     入库时间: ${new Date(item.crawled_at).toLocaleString('zh-CN')}`)
        })
      }
    }
    console.log('')
  }

  console.log(`\n📊 总计: ${totalCount} 条竞品模板数据`)

  if (totalCount === 0) {
    console.log('\n⚠️  数据库中没有数据！')
    console.log('💡 建议运行爬虫脚本抓取数据：')
    console.log('   node scripts/crawl-competitor-templates-v2.js')
  } else if (totalCount < 20) {
    console.log('\n⚠️  数据量较少，建议运行爬虫脚本补充数据')
  } else {
    console.log('\n✅ 数据正常！问题可能是部署或前端代码问题')
  }
}

checkData().catch(console.error)

