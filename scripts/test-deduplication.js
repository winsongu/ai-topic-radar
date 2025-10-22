/**
 * 去重功能测试脚本（小样本）
 * 
 * 用途：快速测试全局去重逻辑
 * 特点：每个平台只抓取2条数据，快速验证
 */

require('dotenv').config({ path: '.env.local' })
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase环境变量未配置')
  process.exit(1)
}

if (!FIRECRAWL_API_KEY) {
  console.error('❌ Firecrawl API密钥未配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

// 平台配置 - 只测试2个平台
const PLATFORMS = [
  {
    id: 'islide',
    name: 'iSlide',
    testIds: ['5254284', '5254283'] // 只抓2条
  },
  {
    id: 'tukuppt',
    name: '熊猫办公',
    testIds: ['9887', '9886'] // 只抓2条
  }
]

/**
 * 使用Firecrawl抓取页面
 */
async function fetchWithFirecrawl(url) {
  console.log(`   🔥 Firecrawl抓取: ${url.substring(0, 60)}...`)
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        onlyMainContent: false,
        waitFor: 2000,
        timeout: 30000
      })
    })
    
    if (!response.ok) {
      throw new Error(`API错误 (${response.status})`)
    }
    
    const result = await response.json()
    return result.data?.markdown || ''
  } catch (error) {
    console.error(`   ❌ 抓取失败: ${error.message}`)
    return null
  }
}

/**
 * 解析iSlide详情页
 */
function parseDetailPage_iSlide(markdown, url) {
  const template = {
    title: null,
    type: null,
    format: '未知',
    usage: '工作总结',
    platform: 'iSlide',
    tags: [],
    date: null,
    hot_value: 0,
    url: url,
    thumbnail: null,
    is_free: true,
    author: null
  }
  
  // 标题从图片alt提取
  const titleMatch = markdown.match(/!\[([^\]]*(?:PPT|模板)[^\]]*)\]\(https:\/\/static\.islide\.cc/i)
  if (titleMatch) {
    template.title = titleMatch[1].trim()
  }
  
  // 缩略图
  const imgMatch = markdown.match(/(https:\/\/static\.islide\.cc\/site\/content\/gallery\/[^\s)]+\.jpg)/i)
  if (imgMatch) {
    template.thumbnail = imgMatch[1]
  }
  
  // 标签从标题提取
  if (template.title) {
    const keywords = ['红色', '国潮', '简约', '商务', '工作', '总结', '汇报', '蓝色', '绿色']
    template.tags = keywords.filter(k => template.title.includes(k))
  }
  
  return template
}

/**
 * 解析熊猫办公详情页
 */
function parseDetailPage_Tukuppt(markdown, url) {
  const template = {
    title: null,
    type: null,
    format: 'PPTX',
    usage: '工作总结',
    platform: '熊猫办公',
    tags: [],
    date: null,
    hot_value: 0,
    url: url,
    thumbnail: null,
    is_free: false,
    author: null
  }
  
  // 标题提取
  const lines = markdown.split('\n').slice(0, 30)
  for (const line of lines) {
    if (line.includes('PPT') && line.length > 10 && line.length < 100 &&
        !line.includes('logo') && !line.includes('icon') && !line.startsWith('[')) {
      const cleaned = line.replace(/!\[\]\([^\)]*\)/, '').replace(/^#+\s*/, '').trim()
      if (cleaned.length > 5) {
        template.title = cleaned
        break
      }
    }
  }
  
  // 页数提取
  const pageMatch = markdown.match(/(\d+)页/)
  if (pageMatch) {
    template.type = `${pageMatch[1]}P`
  }
  
  // 缩略图 - 优先preview路径
  const imgPattern = /!\[[^\]]*\]\((https:\/\/(?:img|static)\.tukuppt\.com\/[^\s)]+\.(?:jpg|jpeg|png))/gi
  const imgs = []
  let imgMatch
  while ((imgMatch = imgPattern.exec(markdown)) !== null) {
    const imgUrl = imgMatch[1]
    if (!imgUrl.includes('logo') && !imgUrl.includes('icon') && 
        !imgUrl.includes('vip') && !imgUrl.includes('member')) {
      imgs.push(imgUrl)
    }
  }
  
  const previewImg = imgs.find(img => img.includes('img.tukuppt.com/preview/'))
  template.thumbnail = previewImg || imgs[0] || null
  
  // 标签
  if (template.title) {
    const keywords = ['红色', '国潮', '简约', '商务', '工作', '总结', '汇报', '蓝色', '绿色']
    template.tags = keywords.filter(k => template.title.includes(k))
  }
  
  return template
}

/**
 * 抓取单个平台（测试版）
 */
async function crawlPlatformTest(platform) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📱 平台: ${platform.name}`)
  console.log(`🧪 测试模式: 只抓取${platform.testIds.length}条数据`)
  console.log('='.repeat(60))
  
  const templates = []
  
  for (let i = 0; i < platform.testIds.length; i++) {
    const id = platform.testIds[i]
    let detailUrl
    
    if (platform.id === 'islide') {
      detailUrl = `https://www.islide.cc/ppt/template/${id}.html`
    } else if (platform.id === 'tukuppt') {
      detailUrl = `https://www.tukuppt.com/muban/${id}.html`
    }
    
    console.log(`\n[${i + 1}/${platform.testIds.length}] ${detailUrl}`)
    
    const markdown = await fetchWithFirecrawl(detailUrl)
    if (!markdown) continue
    
    let template
    if (platform.id === 'islide') {
      template = parseDetailPage_iSlide(markdown, detailUrl)
    } else if (platform.id === 'tukuppt') {
      template = parseDetailPage_Tukuppt(markdown, detailUrl)
    }
    
    if (template && template.title) {
      console.log(`   ✅ ${template.title}`)
      templates.push(template)
    } else {
      console.log(`   ⚠️  解析失败`)
    }
    
    // 延迟避免被限流
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`\n📊 ${platform.name} 抓取完成: ${templates.length}条`)
  return templates
}

/**
 * 保存到数据库（带全局去重）
 */
async function saveToDatabase(templates) {
  if (templates.length === 0) {
    console.log('   ⚠️  没有数据需要保存')
    return { success: false, count: 0, skipped: 0 }
  }
  
  console.log('\n💾 保存数据到数据库...')
  console.log('   🔍 检查重复数据（全局去重）...')
  
  // 查询数据库中所有已存在的数据（不限日期）
  const { data: existingData, error: queryError } = await supabase
    .from('competitor_templates')
    .select('url, title')
  
  if (queryError) {
    console.log(`   ⚠️  无法查询已有数据: ${queryError.message}`)
    console.log('   ℹ️  继续保存所有数据（不去重）')
  }
  
  // 创建已存在的URL+标题组合的Set
  const existingKeys = new Set()
  if (existingData && existingData.length > 0) {
    existingData.forEach(item => {
      existingKeys.add(`${item.url}|||${item.title}`)
    })
    console.log(`   ℹ️  数据库现有 ${existingData.length} 条记录`)
  } else {
    console.log(`   ℹ️  数据库为空，这是首次抓取`)
  }
  
  // 过滤掉重复数据
  const uniqueTemplates = templates.filter(t => {
    const key = `${t.url}|||${t.title}`
    const isDuplicate = existingKeys.has(key)
    if (isDuplicate) {
      console.log(`   ⏭️  跳过重复: ${t.title.substring(0, 30)}...`)
    }
    return !isDuplicate
  })
  
  const skippedCount = templates.length - uniqueTemplates.length
  
  if (uniqueTemplates.length === 0) {
    console.log('\n   ✅ 所有数据都已存在，无需保存')
    console.log(`   📊 统计: 跳过${skippedCount}条重复数据`)
    return { success: true, count: 0, skipped: skippedCount }
  }
  
  // 添加批次时间戳
  const batchTimestamp = new Date().toISOString()
  const dataToInsert = uniqueTemplates.map(t => ({
    ...t,
    crawled_at: batchTimestamp
  }))
  
  // 插入数据库
  const { data, error } = await supabase
    .from('competitor_templates')
    .insert(dataToInsert)
    .select()
  
  if (error) {
    console.error(`\n   ❌ 数据库插入失败: ${error.message}`)
    return { success: false, count: 0, skipped: skippedCount, error: error.message }
  }
  
  console.log(`\n   ✅ 成功保存 ${data.length} 条新数据到数据库`)
  console.log(`   📊 本次统计: 新增${data.length}条 + 跳过${skippedCount}条重复 = 总计抓取${templates.length}条`)
  
  return { success: true, count: data.length, skipped: skippedCount }
}

/**
 * 主函数
 */
async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🧪 去重功能测试（小样本）')
  console.log('='.repeat(70))
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}`)
  console.log(`📊 测试平台: ${PLATFORMS.map(p => p.name).join(', ')}`)
  console.log(`🔢 每平台抓取: 2条数据`)
  console.log('='.repeat(70))
  
  const allTemplates = []
  
  // 抓取所有平台
  for (const platform of PLATFORMS) {
    const templates = await crawlPlatformTest(platform)
    allTemplates.push(...templates)
  }
  
  console.log('\n' + '='.repeat(70))
  console.log(`📊 抓取汇总: 共${allTemplates.length}条数据`)
  console.log('='.repeat(70))
  
  // 保存到数据库
  const saveResult = await saveToDatabase(allTemplates)
  
  // 总结
  console.log('\n' + '='.repeat(70))
  console.log('✅ 测试完成')
  console.log('='.repeat(70))
  console.log(`新增: ${saveResult.count}条`)
  console.log(`跳过: ${saveResult.skipped}条`)
  console.log(`总计: ${allTemplates.length}条`)
  console.log('='.repeat(70))
  
  console.log('\n💡 提示:')
  console.log('   立即再次运行此脚本，所有数据应该都会被跳过（测试去重）')
  console.log('   命令: node scripts/test-deduplication.js')
  console.log('')
}

main().catch(error => {
  console.error('\n❌ 测试失败:', error.message)
  process.exit(1)
})

