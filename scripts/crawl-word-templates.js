require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// 初始化 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少 Supabase 环境变量')
  process.exit(1)
}

if (!FIRECRAWL_API_KEY) {
  console.error('❌ 错误: 缺少 FIRECRAWL_API_KEY 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 使用 Firecrawl API 抓取
async function fetchWithFirecrawl(url) {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      formats: ['markdown'],
      onlyMainContent: false
    })
  })
  
  if (!response.ok) {
    throw new Error(`API错误 (${response.status})`)
  }
  
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || '未知错误')
  }
  
  return result.data
}

// 从标题中提取标签
function extractTagsFromTitle(title) {
  const tags = []
  
  // 颜色标签
  const colors = ['红色', '绿色', '蓝色', '黄色', '粉色', '紫色', '橙色', '金色', '彩色']
  colors.forEach(color => {
    if (title.includes(color)) tags.push(color)
  })
  
  // 风格标签
  const styles = ['卡通', '简约', '古风', '国潮', '手绘', '清新', '可爱', '创意']
  styles.forEach(style => {
    if (title.includes(style)) tags.push(style)
  })
  
  // 主题标签
  const themes = ['重阳节', '国庆', '中秋', '春节', '教师节', '儿童节', '端午', '元宵']
  themes.forEach(theme => {
    if (title.includes(theme)) tags.push(theme)
  })
  
  return tags
}

// 从标题中提取分类
function extractCategoryFromTitle(title) {
  if (title.includes('重阳') || title.includes('国庆') || title.includes('中秋') || 
      title.includes('春节') || title.includes('节日')) {
    return '节日'
  }
  if (title.includes('教学') || title.includes('课程') || title.includes('学习') || 
      title.includes('小学生')) {
    return '教育'
  }
  if (title.includes('营销') || title.includes('活动') || title.includes('宣传')) {
    return '营销'
  }
  if (title.includes('秋天') || title.includes('风景') || title.includes('季节')) {
    return '自然'
  }
  return '其他'
}

// 提取觅知手抄报详情页URL
function extractMizShouchaobaoUrls(markdown, limit = 8) {
  const urls = []
  const pattern = /https:\/\/www\.51miz\.com\/shouchaobao\/[a-z]+\/([0-9]+)\.html/gi
  let match
  while ((match = pattern.exec(markdown)) !== null && urls.length < limit) {
    const url = match[0]
    if (!urls.includes(url)) {
      urls.push(url)
    }
  }
  return urls
}

// 提取觅知营销日历详情页URL
function extractMizSucaiUrls(markdown, limit = 6) {
  const urls = []
  const pattern = /https:\/\/www\.51miz\.com\/sucai\/([0-9]+)\.html/gi
  let match
  while ((match = pattern.exec(markdown)) !== null && urls.length < limit) {
    const url = match[0]
    if (!urls.includes(url)) {
      urls.push(url)
    }
  }
  return urls
}

// 解析觅知手抄报详情页
function parseMizShouchaobaoDetail(markdown, url) {
  const template = {
    title: null,
    type: '手抄报',
    platform: '觅知手抄报',
    url: url,
    thumbnail: null,
    tags: [],
    category: null,
    description: null,
    author: null,
    hot_value: 0,
    is_hot: false
  }
  
  // 提取标题
  const titlePatterns = [
    /^#+\s*([^#\n]+)/m,
    /作品标题[：:]\s*(.+)/,
  ]
  
  for (const pattern of titlePatterns) {
    const match = markdown.match(pattern)
    if (match && match[1] && match[1].trim().length > 3) {
      template.title = match[1].trim()
      break
    }
  }
  
  // 如果还没找到标题，从前50行查找
  if (!template.title) {
    const lines = markdown.split('\n').slice(0, 50)
    for (const line of lines) {
      const cleaned = line.trim()
      if (cleaned.length > 5 && cleaned.length < 80 && 
          !cleaned.startsWith('[![') &&
          !cleaned.startsWith('![') &&
          !cleaned.startsWith('[') &&
          !cleaned.startsWith('http') &&
          (cleaned.includes('手抄报') || cleaned.includes('小报'))) {
        template.title = cleaned
        break
      }
    }
  }
  
  // 提取缩略图
  const imgPattern = /!\[[^\]]*\]\((https:\/\/imgs-qn\.51miz\.com\/preview\/templet\/[^\s)]+\.jpg)/i
  const imgMatch = markdown.match(imgPattern)
  if (imgMatch) {
    template.thumbnail = imgMatch[1]
  }
  
  // 从标题提取标签和分类
  if (template.title) {
    template.tags = extractTagsFromTitle(template.title)
    template.category = extractCategoryFromTitle(template.title)
  }
  
  return template
}

// 解析觅知营销日历详情页
function parseMizSucaiDetail(markdown, url) {
  const template = {
    title: null,
    type: '营销素材',
    platform: '觅知营销日历',
    url: url,
    thumbnail: null,
    tags: [],
    category: '营销',
    description: null,
    author: null,
    hot_value: 0,
    is_hot: false
  }
  
  // 提取标题
  const titlePatterns = [
    /^#+\s*([^#\n]+)/m,
    /作品标题[：:]\s*(.+)/,
  ]
  
  for (const pattern of titlePatterns) {
    const match = markdown.match(pattern)
    if (match && match[1] && match[1].trim().length > 3) {
      template.title = match[1].trim()
      break
    }
  }
  
  // 如果还没找到标题，从前50行查找
  if (!template.title) {
    const lines = markdown.split('\n').slice(0, 50)
    for (const line of lines) {
      const cleaned = line.trim()
      if (cleaned.length > 5 && cleaned.length < 80 && 
          !cleaned.startsWith('[![') &&
          !cleaned.startsWith('![') &&
          !cleaned.startsWith('[') &&
          !cleaned.startsWith('http')) {
        template.title = cleaned
        break
      }
    }
  }
  
  // 提取缩略图
  const imgPattern = /!\[[^\]]*\]\((https:\/\/imgs-qn\.51miz\.com\/[^\s)]+\.(?:jpg|png))/gi
  const images = []
  let imgMatch
  while ((imgMatch = imgPattern.exec(markdown)) !== null && images.length < 5) {
    const imgUrl = imgMatch[1]
    if (!imgUrl.includes('logo') && !imgUrl.includes('icon') && !imgUrl.includes('assets-v2')) {
      images.push(imgUrl)
    }
  }
  
  if (images.length > 0) {
    template.thumbnail = images[0]
  }
  
  // 从标题提取标签和分类
  if (template.title) {
    template.tags = extractTagsFromTitle(template.title)
    if (!template.category || template.category === '营销') {
      template.category = extractCategoryFromTitle(template.title)
    }
  }
  
  return template
}

// 保存到数据库（带全局去重）
async function saveToDatabase(templates) {
  if (templates.length === 0) {
    console.log('   ⚠️  没有数据需要保存')
    return { success: false, count: 0, skipped: 0 }
  }
  
  console.log('   🔍 检查重复数据（全局去重）...')
  
  const { data: existingData, error: queryError } = await supabase
    .from('word_templates')
    .select('url, title')
  
  if (queryError) {
    console.log(`   ⚠️  无法查询已有数据: ${queryError.message}`)
  }
  
  const existingKeys = new Set()
  if (existingData && existingData.length > 0) {
    existingData.forEach(item => {
      existingKeys.add(`${item.url}|||${item.title}`)
    })
    console.log(`   ℹ️  数据库现有 ${existingData.length} 条记录`)
  }
  
  const uniqueTemplates = templates.filter(t => {
    const key = `${t.url}|||${t.title}`
    return !existingKeys.has(key)
  })
  
  const skippedCount = templates.length - uniqueTemplates.length
  if (skippedCount > 0) {
    console.log(`   ⏭️  跳过 ${skippedCount} 条已存在的重复数据`)
  }
  
  if (uniqueTemplates.length === 0) {
    console.log('   ✅ 所有数据都已存在，无需保存')
    return { success: true, count: 0, skipped: skippedCount }
  }
  
  const batchTimestamp = new Date().toISOString()
  const dataToInsert = uniqueTemplates.map(t => ({
    ...t,
    crawled_at: batchTimestamp
  }))
  
  const { data, error } = await supabase
    .from('word_templates')
    .insert(dataToInsert)
    .select()
  
  if (error) {
    console.error(`   ❌ 数据库插入失败: ${error.message}`)
    return { success: false, count: 0, skipped: skippedCount, error: error.message }
  }
  
  console.log(`   ✅ 成功保存 ${data.length} 条新数据到数据库`)
  if (skippedCount > 0) {
    console.log(`   📊 本次统计: 新增${data.length}条 + 跳过${skippedCount}条重复 = 总计抓取${templates.length}条`)
  }
  
  return { success: true, count: data.length, skipped: skippedCount }
}

// 主抓取函数
async function crawlWordTemplates() {
  console.log('🚀 开始抓取文字模板数据')
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`)
  console.log(`🔥 Firecrawl API: ${FIRECRAWL_API_KEY.substring(0, 12)}...`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  const allTemplates = []
  const results = []
  
  // 1. 抓取觅知手抄报
  console.log('📊 正在抓取: 觅知手抄报')
  console.log('   🌐 列表页: https://www.51miz.com/shouchaobao/')
  try {
    console.log('   🔥 Firecrawl抓取列表页...')
    const listResult = await fetchWithFirecrawl('https://www.51miz.com/shouchaobao/')
    const listMarkdown = listResult.markdown || ''
    
    const detailUrls = extractMizShouchaobaoUrls(listMarkdown, 8)
    console.log(`   ✅ 找到 ${detailUrls.length} 个详情页URL`)
    
    let successCount = 0
    for (let i = 0; i < detailUrls.length; i++) {
      const url = detailUrls[i]
      console.log(`   📄 [${i+1}/${detailUrls.length}] 抓取详情页...`)
      console.log(`   🔥 Firecrawl抓取: ${url}`)
      
      try {
        const detailResult = await fetchWithFirecrawl(url)
        const detailMarkdown = detailResult.markdown || ''
        
        const template = parseMizShouchaobaoDetail(detailMarkdown, url)
        
        if (template.title) {
          console.log(`      ✅ ${template.title}`)
          allTemplates.push(template)
          successCount++
        } else {
          console.log(`      ⚠️  解析失败（未找到标题）`)
        }
      } catch (error) {
        console.log(`      ❌ 抓取失败: ${error.message}`)
      }
      
      // 避免请求过快
      if (i < detailUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log(`   ✅ 觅知手抄报: 成功提取 ${successCount} 个模板\n`)
    results.push({ platform: '觅知手抄报', count: successCount })
    
  } catch (error) {
    console.error(`   ❌ 觅知手抄报抓取失败: ${error.message}\n`)
    results.push({ platform: '觅知手抄报', count: 0, error: error.message })
  }
  
  // 2. 抓取觅知营销日历
  console.log('📊 正在抓取: 觅知营销日历')
  console.log('   🌐 列表页: https://www.51miz.com/sucai/')
  try {
    console.log('   🔥 Firecrawl抓取列表页...')
    const listResult = await fetchWithFirecrawl('https://www.51miz.com/sucai/')
    const listMarkdown = listResult.markdown || ''
    
    const detailUrls = extractMizSucaiUrls(listMarkdown, 6)
    console.log(`   ✅ 找到 ${detailUrls.length} 个详情页URL`)
    
    let successCount = 0
    for (let i = 0; i < detailUrls.length; i++) {
      const url = detailUrls[i]
      console.log(`   📄 [${i+1}/${detailUrls.length}] 抓取详情页...`)
      console.log(`   🔥 Firecrawl抓取: ${url}`)
      
      try {
        const detailResult = await fetchWithFirecrawl(url)
        const detailMarkdown = detailResult.markdown || ''
        
        const template = parseMizSucaiDetail(detailMarkdown, url)
        
        if (template.title) {
          console.log(`      ✅ ${template.title}`)
          allTemplates.push(template)
          successCount++
        } else {
          console.log(`      ⚠️  解析失败（未找到标题）`)
        }
      } catch (error) {
        console.log(`      ❌ 抓取失败: ${error.message}`)
      }
      
      // 避免请求过快
      if (i < detailUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log(`   ✅ 觅知营销日历: 成功提取 ${successCount} 个模板\n`)
    results.push({ platform: '觅知营销日历', count: successCount })
    
  } catch (error) {
    console.error(`   ❌ 觅知营销日历抓取失败: ${error.message}\n`)
    results.push({ platform: '觅知营销日历', count: 0, error: error.message })
  }
  
  // 保存到数据库
  console.log('💾 保存数据到 Supabase...')
  const saveResult = await saveToDatabase(allTemplates)
  
  // 输出总结
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 抓取完成！')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ 成功抓取: ${results.length}/2 个平台`)
  console.log(`📝 新增数据: ${saveResult.count} 条模板`)
  console.log(`⏭️  跳过重复: ${saveResult.skipped} 条`)
  console.log(`📅 下次抓取: 建议每天执行一次`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('详细结果:')
  results.forEach(r => {
    const status = r.error ? '❌' : '✅'
    const info = r.error ? ` (${r.error})` : `: ${r.count} 条`
    console.log(`  ${status} ${r.platform}${info}`)
  })
  
  console.log('\n💡 提示: 可以配置GitHub Actions定时任务每天执行此脚本')
}

// 执行
crawlWordTemplates().catch(console.error)

