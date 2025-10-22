#!/usr/bin/env node

/**
 * 竞品模板数据抓取脚本 - 使用 Firecrawl API
 * 真实抓取各竞品平台的最新模板数据
 * 数据存储到 Supabase 的 competitor_templates 表（追加模式）
 * 
 * 支持的平台：
 * - AI PPT: https://www.aippt.cn/template/
 * - 熊猫办公: https://www.tukuppt.com/ppt/time_0_0_0_0_0_0_1.html
 * - iSlide: https://www.islide.cc/ppt/template?filters=content-category.free&group=latest
 */

// 优先加载 .env.local，如果不存在则加载 .env
require('dotenv').config({ path: '.env.local' })
require('dotenv').config() // fallback to .env
const { createClient } = require('@supabase/supabase-js')

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少 Supabase 环境变量')
  process.exit(1)
}

// Firecrawl API 配置
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY
if (!FIRECRAWL_API_KEY) {
  console.error('❌ 错误: 缺少 FIRECRAWL_API_KEY 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * 竞品平台配置
 */
const PLATFORMS = [
  {
    id: 'aippt',
    name: 'AIPPT',
    url: 'https://www.aippt.cn/template/',
    parser: parseAIPPTData
  },
  {
    id: 'tukuppt',
    name: '熊猫办公',
    url: 'https://www.tukuppt.com/ppt/time_0_0_0_0_0_0_1.html',
    parser: parseTukupptData
  },
  {
    id: 'islide',
    name: 'iSlide',
    url: 'https://www.islide.cc/ppt/template?filters=content-category.free&group=latest',
    parser: parseISlideData
  }
]

/**
 * 使用 Firecrawl API 抓取网页内容
 * @param {string} url - 要抓取的网址
 * @returns {Promise<Object>} Firecrawl响应数据
 */
async function fetchWithFirecrawl(url) {
  console.log(`   🔥 使用 Firecrawl 抓取: ${url}`)
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        onlyMainContent: false,  // 保留完整内容以提取图片和标题
        waitFor: 3000,  // 增加等待时间到3秒
        timeout: 60000  // 设置60秒超时
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Firecrawl API错误 (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`Firecrawl返回失败: ${data.error || '未知错误'}`)
    }
    
    console.log(`   ✅ Firecrawl 抓取成功`)
    return data.data
    
  } catch (error) {
    console.error(`   ❌ Firecrawl抓取失败: ${error.message}`)
    return null
  }
}

/**
 * 解析 AIPPT 数据  
 */
function parseAIPPTData(firecrawlData) {
  const templates = []
  const { markdown, html } = firecrawlData
  
  console.log(`   📄 开始解析 AIPPT 数据...`)
  
  if (markdown) {
    // AIPPT格式: 在线编辑立即下载\\n\\n页数\\n\\n![](<Base64>)标题](URL)
    // 使用正则直接匹配: ![](...) + 标题 + ](URL)
    const templatePattern = /!\[\]\([^\)]*\)([^\]]+)\]\((https:\/\/www\.aippt\.cn\/template\/ppt\/detail\/\d+\.html)\)/g
    
    let match
    while ((match = templatePattern.exec(markdown)) !== null && templates.length < 10) {
      const title = match[1].trim()
      const url = match[2]
      
      // 过滤有效标题
      if (title && title.length > 3 && /[\u4e00-\u9fa5]/.test(title) && 
          !title.includes('在线编辑') && !title.includes('立即下载')) {
        
        // 从匹配位置向前找缩略图（第一张大图，通常是w_400）
        const beforeMatch = markdown.substring(Math.max(0, match.index - 1500), match.index)
        const thumbnailMatch = beforeMatch.match(/https:\/\/aippt-domestic\.aippt\.com\/[^\s)]+w_400[^\s)]*/i)
        const thumbnail = thumbnailMatch ? thumbnailMatch[0] : null
        
        // 从标题前面找页数（格式：15页\\n\\n）
        const pageMatch = beforeMatch.match(/(\d+)[页P]\s*\\\\\\n\\\\\\n\s*!\[\]/i)
        
        const cleanTitle = title.replace(/\d+[页P]/gi, '').replace(/\\+/g, '').trim()
        
        if (cleanTitle.length > 3) {
          templates.push({
            title: cleanTitle,
            type: pageMatch ? `${pageMatch[1]}P` : null,
            format: '未知',
            usage: extractUsageFromTitle(cleanTitle),
            platform: 'AIPPT',
            tags: extractTagsFromTitle(cleanTitle),
            date: null,
            hot_value: 0,
            url: url,
            thumbnail: thumbnail
          })
        }
      }
    }
  }
  
  console.log(`   ✅ AIPPT: 提取到 ${templates.length} 个模板`)
  return templates
}

/**
 * 解析熊猫办公数据
 */
function parseTukupptData(firecrawlData) {
  const templates = []
  const { markdown, html } = firecrawlData
  
  console.log(`   📄 开始解析 熊猫办公 数据...`)
  
  if (markdown) {
    // 熊猫办公格式: [![标题](placeholder.png)](URL)[标题](URL...
    // 标题重复了两次，提取第一次出现的标题
    const templatePattern = /\[!\[([^\]]+)\]\([^\)]*\)\]\((https:\/\/www\.tukuppt\.com\/muban\/[a-z]+\.html)\)/g
    
    let match
    while ((match = templatePattern.exec(markdown)) !== null && templates.length < 10) {
      const title = match[1].trim()
      const url = match[2]
      
      // 过滤有效标题
      if (title && title.length > 3 && /[\u4e00-\u9fa5]/.test(title)) {
        // 从URL详情页再抓取真实缩略图（占位图不准确）
        // 或者从前面的内容找真实图片
        const beforeMatch = markdown.substring(Math.max(0, match.index - 500), match.index)
        const thumbnailMatch = beforeMatch.match(/https:\/\/img\.tukuppt\.com\/[^\s)]+\.(?:jpg|jpeg|png)/i)
        const thumbnail = thumbnailMatch ? thumbnailMatch[0] : null
        
        // 提取页数信息
        const pageMatch = title.match(/(\d+P)/i)
        
        templates.push({
          title: title.replace(/\d+P/gi, '').trim(),
          type: pageMatch ? pageMatch[1] : null,
          format: 'PPT',
          usage: extractUsageFromTitle(title),
          platform: '熊猫办公',
          tags: extractTagsFromTitle(title),
          date: null,
          hot_value: 0,
          url: url,
          thumbnail: thumbnail
        })
      }
    }
  }
  
  console.log(`   ✅ 熊猫办公: 提取到 ${templates.length} 个模板`)
  return templates
}

/**
 * 解析 iSlide 数据
 */
function parseISlideData(firecrawlData) {
  const templates = []
  const { markdown, html } = firecrawlData
  
  console.log(`   📄 开始解析 iSlide 数据...`)
  
  if (markdown) {
    // iSlide格式: ![缩略图](...) ... 标题 ... ![icon](...) Fu](URL)
    // 使用更智能的正则来匹配完整块
    const urlPattern = /https:\/\/www\.islide\.cc\/ppt\/template\/(\d+)\.html/g
    const urls = []
    let match
    while ((match = urlPattern.exec(markdown)) !== null && urls.length < 10) {
      urls.push({ url: match[0], index: match.index })
    }
    
    console.log(`   🔗 找到 ${urls.length} 个模板链接`)
    
    urls.forEach(({url, index}) => {
      // 从URL向前找800个字符（包含缩略图和标题）
      const beforeUrl = markdown.substring(Math.max(0, index - 800), index)
      
      // 提取缩略图 - 找static.islide.cc的图片
      const thumbnailMatch = beforeUrl.match(/https:\/\/static\.islide\.cc\/site\/content\/[^\s)]+\.(?:jpg|jpeg|png)/i)
      const thumbnail = thumbnailMatch ? thumbnailMatch[0] : null
      
      // 提取标题 - 找最后一个包含中文且长度>5的行
      const lines = beforeUrl.split(/\\n|\\r|\\\\/)
      let title = null
      let pageMatch = null
      let formatMatch = null
      
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim()
        if (line && line.length > 5 && /[\u4e00-\u9fa5]/.test(line) && 
            !line.startsWith('http') && !line.includes('![') && !line.includes('](')) {
          
          // 检查是否包含PPT关键词
          if (line.includes('PPT') || line.includes('模板') || line.includes('风') || line.includes('介绍')) {
            pageMatch = line.match(/(\d+P)/i)
            formatMatch = line.match(/(Fu|iRis|Rin|Dai|Fish)/i)
            title = line
              .replace(/\d+P/gi, '')
              .replace(/(Fu|iRis|Rin|Dai|Fish)/gi, '')
              .replace(/\\+/g, '')
              .trim()
            break
          }
        }
      }
      
      if (title && title.length > 3) {
        templates.push({
          title: title,
          type: pageMatch ? pageMatch[1] : null,
          format: formatMatch ? formatMatch[1] : '8p',
          usage: extractUsageFromTitle(title),
          platform: 'iSlide',
          tags: extractTagsFromTitle(title),
          date: null,
          hot_value: 0,
          url: url,
          thumbnail: thumbnail
        })
      }
    })
  }
  
  console.log(`   ✅ iSlide: 提取到 ${templates.length} 个模板`)
  return templates
}

/**
 * 从标题中提取用途/行业
 */
function extractUsageFromTitle(title) {
  const usageMap = {
    '工作总结': ['总结', '汇报', '年终', '年中', '季度总结'],
    '教育教学': ['教育', '教学', '课件', '培训', '学习', '教案', '学校'],
    '医疗健康': ['医疗', '健康', '医院', '护理', '治疗', '疾病'],
    '职场办公': ['职场', '办公', '商务', '企业', '公司', '项目'],
    '宣传企划': ['宣传', '企划', '策划', '活动', '推广', '品牌'],
    '产品发布': ['产品', '发布', '上市', '新品'],
    '市场营销': ['营销', '市场', '销售', '推销'],
    '节日庆典': ['节日', '庆典', '儿童节', '奥运', '新年'],
    '建筑房地产': ['建筑', '房地产', '地产', '装修', '软装']
  }
  
  for (const [usage, keywords] of Object.entries(usageMap)) {
    if (keywords.some(keyword => title.includes(keyword))) {
      return usage
    }
  }
  
  return '通用'
}

/**
 * 从标题中提取标签
 */
function extractTagsFromTitle(title) {
  const tags = []
  
  // 颜色标签
  const colors = ['红色', '蓝色', '绿色', '黄色', '紫色', '橙色', '粉色', '黑色', '白色', '棕色', '咖色']
  colors.forEach(color => {
    if (title.includes(color)) tags.push(color)
  })
  
  // 风格标签
  const styles = ['简约', '商务', '卡通', '插画', '国风', '中国风', '科技', '创意', '手绘', '喜庆', '复古', '3D', '极简']
  styles.forEach(style => {
    if (title.includes(style)) tags.push(style)
  })
  
  // 场景标签
  const scenes = ['年终', '年中', '季度', '述职', '竞聘', '答辩', '培训', '教学', '发布会', '汇报']
  scenes.forEach(scene => {
    if (title.includes(scene)) tags.push(scene)
  })
  
  return [...new Set(tags)] // 去重
}

/**
 * 抓取单个平台的数据
 */
async function crawlPlatform(platform) {
  console.log(`\n📊 正在抓取: ${platform.name}`)
  console.log(`   🌐 URL: ${platform.url}`)
  
  try {
    // 1. 使用 Firecrawl 抓取网页内容
    const firecrawlData = await fetchWithFirecrawl(platform.url)
    if (!firecrawlData) {
      console.log(`   ⚠️  ${platform.name}: Firecrawl抓取失败，跳过`)
      return []
    }
    
    // 2. 解析数据
    const templates = platform.parser(firecrawlData)
    
    if (templates.length === 0) {
      console.log(`   ⚠️  ${platform.name}: 未提取到模板数据`)
      return []
    }
    
    // 3. 批次时间戳（用于追加模式）
    const batchTimestamp = new Date().toISOString()
    
    // 4. 插入数据到 Supabase
    const { data, error } = await supabase
      .from('competitor_templates')
      .insert(templates.map(t => ({
        ...t,
        crawled_at: batchTimestamp
      })))
    
    if (error) {
      console.error(`   ❌ 数据库插入失败: ${error.message}`)
      return []
    }
    
    console.log(`   💾 成功保存 ${templates.length} 条数据到数据库`)
    return templates
    
  } catch (error) {
    console.error(`   ❌ ${platform.name} 处理失败: ${error.message}`)
    return []
  }
}

/**
 * 清理旧数据（保留最近N天）
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
    }
    
    console.log(`   ✅ 已清理 ${data?.length || 0} 条旧数据`)
    return { success: true, deleted: data?.length || 0 }
    
  } catch (error) {
    console.log(`   ❌ 清理异常: ${error.message}`)
    return { success: false, deleted: 0 }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始抓取竞品模板数据')
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}`)
  console.log(`🔥 使用 Firecrawl API: ${FIRECRAWL_API_KEY.substring(0, 10)}...`)
  console.log('━'.repeat(60))
  
  let totalTemplates = 0
  const results = []
  
  // 抓取所有平台
  for (const platform of PLATFORMS) {
    const templates = await crawlPlatform(platform)
    totalTemplates += templates.length
    results.push({
      platform: platform.name,
      count: templates.length,
      success: templates.length > 0
    })
    
    // 避免请求过快，等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // 清理旧数据
  const cleanResult = await cleanOldData(90)
  
  // 打印统计
  console.log('\n' + '━'.repeat(60))
  console.log('📊 抓取完成！')
  console.log('━'.repeat(60))
  console.log(`✅ 成功抓取: ${results.filter(r => r.success).length}/${PLATFORMS.length} 个平台`)
  console.log(`📝 新增数据: ${totalTemplates} 条模板`)
  console.log(`🧹 清理数据: ${cleanResult.deleted} 条旧数据`)
  console.log(`📅 下次抓取: 建议每天执行一次`)
  console.log('━'.repeat(60))
  
  // 打印详细结果
  console.log('\n详细结果:')
  results.forEach(r => {
    const status = r.success ? '✅' : '❌'
    console.log(`  ${status} ${r.platform}: ${r.count} 条`)
  })
}

// 执行主函数
main().catch(error => {
  console.error('❌ 执行出错:', error)
  process.exit(1)
})
