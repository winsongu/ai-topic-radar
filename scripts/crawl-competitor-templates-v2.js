#!/usr/bin/env node

/**
 * 竞品模板爬虫 V2 - 详情页深度抓取版本
 * 
 * 策略：
 * 1. 列表页抓取URL列表（快速）
 * 2. 详情页深度抓取（页数、作者、真实缩略图）
 * 3. 标签使用AI识别（可选）
 * 
 * 优点：
 * - 数据完整准确（页数、作者、缩略图都从详情页获取）
 * - 适合定时任务
 */

require('dotenv').config({ path: '.env.local' })
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// 环境变量检查
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 缺少 Supabase 环境变量')
  process.exit(1)
}

if (!FIRECRAWL_API_KEY) {
  console.error('❌ 缺少 FIRECRAWL_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 竞品配置
const PLATFORMS = [
  {
    id: 'tukuppt',
    name: '熊猫办公',
    listUrl: 'https://www.tukuppt.com/ppt/time_0_0_0_0_0_0_1.html',
    limit: 10  // 每个平台抓取数量
  },
  {
    id: 'aippt',
    name: 'AIPPT',
    listUrl: 'https://www.aippt.cn/template/',
    limit: 10
  },
  {
    id: 'islide',
    name: 'iSlide',
    listUrl: 'https://www.islide.cc/ppt/template?filters=content-category.free&group=latest',
    limit: 10
  }
]

/**
 * Firecrawl抓取
 */
async function fetchWithFirecrawl(url, waitTime = 3000) {
  console.log(`   🔥 Firecrawl抓取: ${url}`)
  
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
        waitFor: waitTime,
        timeout: 60000
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Firecrawl API错误 (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      return data.data
    } else {
      throw new Error('Firecrawl返回失败')
    }
  } catch (error) {
    console.error(`   ❌ Firecrawl抓取失败: ${error.message}`)
    return null
  }
}

/**
 * 从列表页提取详情页URL
 */
function extractDetailUrls(markdown, platform, limit) {
  const urls = []
  let match
  
  switch (platform) {
    case 'tukuppt':
      // 熊猫办公：https://www.tukuppt.com/muban/wwwkkjmz.html
      const tukupptPattern = /https:\/\/www\.tukuppt\.com\/muban\/[a-z]+\.html/g
      while ((match = tukupptPattern.exec(markdown)) !== null && urls.length < limit) {
        if (!urls.includes(match[0])) {
          urls.push(match[0])
        }
      }
      break
      
    case 'aippt':
      // AIPPT: https://www.aippt.cn/template/ppt/detail/643756.html
      const aipptPattern = /https:\/\/www\.aippt\.cn\/template\/ppt\/detail\/\d+\.html/g
      while ((match = aipptPattern.exec(markdown)) !== null && urls.length < limit) {
        if (!urls.includes(match[0])) {
          urls.push(match[0])
        }
      }
      break
      
    case 'islide':
      // iSlide: 使用固定的热门模板ID列表（因为列表页有反爬限制）
      // 这些是从网站上手动提取的最新免费模板
      const islideIds = [
        '5254284', '5254283', '5254282', '5254281', 
        '5226210', '5196382', '4986178', '4951759', 
        '4951758', '4925828'
      ]
      islideIds.slice(0, limit).forEach(id => {
        urls.push(`https://www.islide.cc/ppt/template/${id}.html`)
      })
      break
  }
  
  return urls
}

/**
 * 从详情页提取完整信息（熊猫办公）
 */
function parseDetailPage_Tukuppt(markdown, url) {
  const template = {
    title: null,
    type: null,  // 页数
    format: 'PPT',
    usage: '工作总结',
    platform: '熊猫办公',
    tags: [],
    date: null,
    hot_value: 0,
    url: url,
    thumbnail: null,
    is_free: true,
    author: null
  }
  
  // 提取标题（第一个 # 标题）
  const titleMatch = markdown.match(/^#\s+([^\n]+)/m)
  if (titleMatch) {
    template.title = titleMatch[1].trim()
  }
  
  // 提取页数（页数为25 或 页数 25）
  const pageMatch = markdown.match(/页数[为\s]*[：:]*\s*(\d+)/i)
  if (pageMatch) {
    template.type = `${pageMatch[1]}P`
  }
  
  // 提取作者
  const authorMatch = markdown.match(/作者[为\s]*[：:]*\s*([^\n]+)/i)
  if (authorMatch) {
    template.author = authorMatch[1].trim()
  }
  
  // 提取上传时间
  const dateMatch = markdown.match(/上传时间[为\s]*[：:]*\s*([^\n]+)/i)
  if (dateMatch) {
    const dateStr = dateMatch[1].trim()
    // 解析相对时间
    if (dateStr.includes('周前')) {
      const weeks = parseInt(dateStr)
      const date = new Date()
      date.setDate(date.getDate() - weeks * 7)
      template.date = date.toISOString().split('T')[0]
    } else if (dateStr.includes('天前')) {
      const days = parseInt(dateStr)
      const date = new Date()
      date.setDate(date.getDate() - days)
      template.date = date.toISOString().split('T')[0]
    }
  }
  
  // 提取缩略图（优先使用img.tukuppt.com/preview/的封面图）
  const imgPattern = /!\[[^\]]*\]\((https:\/\/(?:img|static)\.tukuppt\.com\/[^\s)]+\.(?:jpg|jpeg|png))/gi
  const imgs = []
  let imgMatch
  while ((imgMatch = imgPattern.exec(markdown)) !== null) {
    const imgUrl = imgMatch[1]
    // 排除logo、icon、会员图标
    if (!imgUrl.includes('logo') && 
        !imgUrl.includes('icon') && 
        !imgUrl.includes('vip') &&
        !imgUrl.includes('member') &&
        !imgUrl.includes('avatar')) {
      imgs.push(imgUrl)
    }
  }
  
  // 优先选择preview路径的封面图（真实封面）
  const previewImg = imgs.find(img => img.includes('img.tukuppt.com/preview/'))
  if (previewImg) {
    template.thumbnail = previewImg
  } else if (imgs.length > 0) {
    // 如果没有preview图片，使用第一张非logo图片
    template.thumbnail = imgs[0]
  }
  
  // 从标题提取标签（简单规则）
  if (template.title) {
    template.tags = extractTagsFromTitle(template.title)
    template.usage = extractUsageFromTitle(template.title)
  }
  
  return template
}

/**
 * 从详情页提取完整信息（AIPPT）
 */
function parseDetailPage_AIPPT(markdown, url) {
  const template = {
    title: null,
    type: null,
    format: '未知',
    usage: '工作总结',
    platform: 'AIPPT',
    tags: [],
    date: null,
    hot_value: 0,
    url: url,
    thumbnail: null,
    is_free: false,
    author: null
  }
  
  // 提取标题 - AIPPT的标题在<Base64-Image-Removed>图片后面
  // 格式: ![](<Base64-Image-Removed>)粉色3D立体风营销报告PPT模板
  // 注意：标题可能以"模板"结尾，所以不要求后面还有内容
  const titleMatch = markdown.match(/!\[\]\(<Base64-Image-Removed>\)([^\n]+(?:PPT|ppt|模板))/i)
  if (titleMatch) {
    let title = titleMatch[1].trim()
    // 过滤掉链接和无效文本
    if (!title.includes('登录') && 
        !title.includes('注册') && 
        !title.includes('下载客户端') &&
        !title.startsWith('[') &&
        !title.startsWith('](') && 
        title.length > 5) {
      template.title = title
    }
  }
  
  // 如果上面没找到，尝试在前30行查找（避免匹配到推荐模板标题）
  if (!template.title) {
    const lines = markdown.split('\n').slice(0, 30)  // 只搜索前30行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // 跳过包含推荐词汇的行（避免匹配推荐模板）
      if (line.includes('推荐') || line.includes('相关') || 
          line.includes('简约风+产品') || line.includes('我心向党')) {
        continue
      }
      
      if (line.includes('PPT模板') && 
          line.length > 10 && 
          line.length < 100 &&  // 标题不会太长
          !line.includes('登录') &&
          !line.includes('注册') &&
          !line.includes('下载客户端') &&
          !line.startsWith('[') &&
          !line.startsWith('#') &&
          !line.includes('http')) {
        const cleaned = line.replace(/!\[\]\([^\)]*\)/, '').trim()
        if (cleaned.length > 5 && !cleaned.startsWith('[')) {
          template.title = cleaned
          break
        }
      }
    }
  }
  
  // 提取页数 - 只匹配"XX页"格式，页数在10-100之间
  const pageMatches = markdown.match(/(\d+)[页]/gi)
  if (pageMatches) {
    for (const match of pageMatches) {
      const pageNum = parseInt(match)
      if (pageNum >= 10 && pageNum <= 100) {
        template.type = `${pageNum}P`
        break
      }
    }
  }
  
  // 提取缩略图（aippt-domestic域名）
  // 优先选择首屏封面图（无w_参数），其次选择w_400
  const imgPattern = /https:\/\/aippt-domestic\.aippt\.com\/[^\s)]+\.(?:jpg|jpeg|png)[^\s)]*/gi
  const imgs = []
  let imgMatch
  while ((imgMatch = imgPattern.exec(markdown)) !== null && imgs.length < 10) {
    imgs.push(imgMatch[0])
  }
  
  // 优先选择第一张图（首屏封面，无压缩参数）
  const coverImg = imgs.find(img => !img.includes('w_200') && !img.includes('w_400'))
  if (coverImg) {
    template.thumbnail = coverImg
  } else {
    // 其次选择w_400的高质量图
    const highQualityImg = imgs.find(img => img.includes('w_400'))
    if (highQualityImg) {
      template.thumbnail = highQualityImg
    } else if (imgs.length > 0) {
      template.thumbnail = imgs[0]
    }
  }
  
  // 从标题提取标签
  if (template.title) {
    template.tags = extractTagsFromTitle(template.title)
    template.usage = extractUsageFromTitle(template.title)
  }
  
  return template
}

/**
 * 从详情页提取完整信息（iSlide）
 */
function parseDetailPage_iSlide(markdown, url) {
  const template = {
    title: null,
    type: null,
    format: null,  // Fu, iRis等
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
  
  // 提取标题 - iSlide的标题在第一张图片的alt属性中
  // 格式: ![红色国潮风通用行业总结汇报PPT模板](https://static.islide.cc/...)
  const titleMatch = markdown.match(/!\[([^\]]*(?:PPT|模板)[^\]]*)\]\(https:\/\/static\.islide\.cc/i)
  if (titleMatch) {
    const title = titleMatch[1].trim()
    if (title.length > 5 && !title.includes('iSlide')) {
      template.title = title
    }
  }
  
  // 如果上面没找到，尝试查找包含"PPT"的alt
  if (!template.title) {
    const altMatch = markdown.match(/!\[([^\]]+PPT[^\]]+)\]\(/i)
    if (altMatch && altMatch[1].length > 5) {
      template.title = altMatch[1].trim()
    }
  }
  
  // 提取作者/格式 - 格式: ## Fu 或 ## iRis
  const formatMatch = markdown.match(/^##\s+(Fu|iRis|Rin|Dai|Fish)/m)
  if (formatMatch) {
    template.format = formatMatch[1]
  }
  
  // 提取缩略图（gallery图片，取第一张）
  const imgMatch = markdown.match(/(https:\/\/static\.islide\.cc\/site\/content\/gallery\/[^\s)]+\.jpg[^\s)]*)/i)
  if (imgMatch) {
    template.thumbnail = imgMatch[1]
  }
  
  // 从标题提取标签
  if (template.title) {
    template.tags = extractTagsFromTitle(template.title)
    template.usage = extractUsageFromTitle(template.title)
  }
  
  return template
}

/**
 * 从标题提取用途
 */
function extractUsageFromTitle(title) {
  const usageMap = {
    '工作总结': ['总结', '汇报', '年终', '年中', '季度'],
    '教育教学': ['教学', '课件', '教育', '培训', '学校', '儿童', '学生'],
    '医疗健康': ['医疗', '健康', '医院', '护理', '病例', '养生'],
    '职场办公': ['职场', '办公', '简历', '求职', '规划'],
    '宣传企划': ['宣传', '企划', '策划', '营销', '推广', '活动'],
    '节日庆典': ['节日', '庆典', '国庆', '春节', '儿童节'],
  }
  
  for (const [usage, keywords] of Object.entries(usageMap)) {
    if (keywords.some(keyword => title.includes(keyword))) {
      return usage
    }
  }
  
  return '工作总结'
}

/**
 * 从标题提取标签
 */
function extractTagsFromTitle(title) {
  const tags = []
  
  // 颜色标签
  const colors = ['红色', '蓝色', '绿色', '黄色', '粉色', '紫色', '黑色', '白色', '橙色', '棕色']
  colors.forEach(color => {
    if (title.includes(color)) tags.push(color)
  })
  
  // 风格标签
  const styles = ['简约', '商务', '中国风', '卡通', '插画', '手绘', '科技', '创意', '国潮', '喜庆']
  styles.forEach(style => {
    if (title.includes(style)) tags.push(style)
  })
  
  // 主题标签
  const themes = ['工作总结', '汇报', '教育', '医疗', '营销', '节日', '培训']
  themes.forEach(theme => {
    if (title.includes(theme)) tags.push(theme)
  })
  
  return tags.slice(0, 5) // 最多5个标签
}

/**
 * 抓取单个平台
 */
async function crawlPlatform(platformConfig) {
  console.log(`\n📊 正在抓取: ${platformConfig.name}`)
  console.log(`   🌐 列表页: ${platformConfig.listUrl}`)
  
  try {
    // 1. 抓取列表页，获取详情页URL
    const listData = await fetchWithFirecrawl(platformConfig.listUrl, 3000)
    if (!listData) {
      console.log(`   ⚠️  列表页抓取失败`)
      return []
    }
    
    const detailUrls = extractDetailUrls(listData.markdown, platformConfig.id, platformConfig.limit)
    console.log(`   ✅ 找到 ${detailUrls.length} 个详情页URL`)
    
    if (detailUrls.length === 0) {
      console.log(`   ⚠️  未找到详情页URL`)
      return []
    }
    
    // 2. 逐个抓取详情页
    const templates = []
    for (let i = 0; i < detailUrls.length; i++) {
      const url = detailUrls[i]
      console.log(`   📄 [${i+1}/${detailUrls.length}] 抓取详情页...`)
      
      const detailData = await fetchWithFirecrawl(url, 5000) // 详情页等待更久
      if (!detailData) {
        console.log(`      ⚠️  详情页抓取失败`)
        continue
      }
      
      // 根据平台解析详情页
      let template = null
      switch (platformConfig.id) {
        case 'tukuppt':
          template = parseDetailPage_Tukuppt(detailData.markdown, url)
          break
        case 'aippt':
          template = parseDetailPage_AIPPT(detailData.markdown, url)
          break
        case 'islide':
          template = parseDetailPage_iSlide(detailData.markdown, url)
          break
      }
      
      if (template && template.title) {
        templates.push(template)
        console.log(`      ✅ ${template.title.substring(0, 40)}...`)
      } else {
        console.log(`      ⚠️  解析失败`)
      }
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log(`   ✅ ${platformConfig.name}: 成功提取 ${templates.length} 个模板`)
    return templates
    
  } catch (error) {
    console.error(`   ❌ ${platformConfig.name} 抓取异常: ${error.message}`)
    return []
  }
}

/**
 * 保存到数据库
 */
async function saveToDatabase(templates) {
  if (templates.length === 0) {
    console.log('   ⚠️  没有数据需要保存')
    return { success: false, count: 0 }
  }
  
  const batchTimestamp = new Date().toISOString()
  const dataToInsert = templates.map(t => ({
    ...t,
    crawled_at: batchTimestamp
  }))
  
  const { data, error } = await supabase
    .from('competitor_templates')
    .insert(dataToInsert)
    .select()
  
  if (error) {
    console.error(`   ❌ 数据库插入失败: ${error.message}`)
    return { success: false, count: 0, error: error.message }
  }
  
  console.log(`   ✅ 成功保存 ${data.length} 条数据到数据库`)
  return { success: true, count: data.length }
}

/**
 * 清理旧数据
 */
async function cleanOldData(daysToKeep = 90) {
  console.log(`\n🧹 清理 ${daysToKeep} 天前的旧数据...`)
  
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    const cutoffISO = cutoffDate.toISOString()
    
    const { data, error } = await supabase
      .from('competitor_templates')
      .delete()
      .lt('crawled_at', cutoffISO)
      .select()
    
    if (error) {
      console.log(`   ⚠️  清理失败: ${error.message}`)
      return { success: false, deleted: 0 }
    } else {
      console.log(`   ✅ 已清理 ${data.length} 条旧数据`)
      return { success: true, deleted: data.length }
    }
  } catch (e) {
    console.log(`   ❌ 清理异常: ${e.message}`)
    return { success: false, deleted: 0 }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始抓取竞品模板数据（详情页深度版）')
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}`)
  console.log(`🔥 Firecrawl API: ${FIRECRAWL_API_KEY.substring(0, 12)}...`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  const allTemplates = []
  const results = {}
  
  // 抓取所有平台
  for (const platform of PLATFORMS) {
    const templates = await crawlPlatform(platform)
    allTemplates.push(...templates)
    results[platform.name] = templates.length
  }
  
  // 保存到数据库
  console.log(`\n💾 保存数据到 Supabase...`)
  const saveResult = await saveToDatabase(allTemplates)
  
  // 清理旧数据
  const cleanResult = await cleanOldData(90)
  
  // 总结
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 抓取完成！')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ 成功抓取: ${Object.keys(results).filter(k => results[k] > 0).length}/${PLATFORMS.length} 个平台`)
  console.log(`📝 新增数据: ${saveResult.count} 条模板`)
  console.log(`🧹 清理数据: ${cleanResult.deleted} 条旧数据`)
  console.log(`📅 下次抓取: 建议每天执行一次`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('详细结果:')
  Object.entries(results).forEach(([platform, count]) => {
    const status = count > 0 ? '✅' : '❌'
    console.log(`  ${status} ${platform}: ${count} 条`)
  })
  
  console.log('\n💡 提示: 可以配置cron定时任务每天执行此脚本')
  console.log('   例如: 0 2 * * * /path/to/node /path/to/crawl-competitor-templates-v2.js\n')
}

main()

