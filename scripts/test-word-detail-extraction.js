require('dotenv').config({ path: '.env.local' })

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

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

// 提取熊猫办公Word模板详情页URL
function extractTukupptWordUrls(markdown) {
  const urls = []
  // 熊猫办公Word详情页格式: /word/xxxx.html
  const pattern = /https:\/\/www\.tukuppt\.com\/word\/([a-z0-9]+)\.html/gi
  let match
  while ((match = pattern.exec(markdown)) !== null) {
    const url = match[0]
    if (!urls.includes(url)) {
      urls.push(url)
    }
  }
  return urls
}

// 提取觅知手抄报详情页URL
function extractMizShouchaobaoUrls(markdown) {
  const urls = []
  // 觅知手抄报详情页格式: /shouchaobao/xxxxx.html
  const pattern = /https:\/\/www\.51miz\.com\/shouchaobao\/([0-9]+)\.html/gi
  let match
  while ((match = pattern.exec(markdown)) !== null) {
    const url = match[0]
    if (!urls.includes(url)) {
      urls.push(url)
    }
  }
  return urls
}

// 提取觅知设计素材详情页URL
function extractMizSucaiUrls(markdown) {
  const urls = []
  // 觅知设计详情页格式: /sucai/xxxxx.html 或 /muban/xxxxx.html
  const patterns = [
    /https:\/\/www\.51miz\.com\/sucai\/([0-9]+)\.html/gi,
    /https:\/\/www\.51miz\.com\/muban\/([0-9]+)\.html/gi
  ]
  
  patterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(markdown)) !== null) {
      const url = match[0]
      if (!urls.includes(url)) {
        urls.push(url)
      }
    }
  })
  
  return urls
}

async function testDetailExtraction() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 测试详情页URL提取')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  const tests = [
    {
      name: '熊猫办公-Word模板',
      url: 'https://www.tukuppt.com/word/time_0_0_0_0_0_0_1.html',
      extractor: extractTukupptWordUrls,
      limit: 10
    },
    {
      name: '觅知-热点手抄报',
      url: 'https://www.51miz.com/shouchaobao/',
      extractor: extractMizShouchaobaoUrls,
      limit: 8
    },
    {
      name: '觅知-营销日历',
      url: 'https://www.51miz.com/sucai/',
      extractor: extractMizSucaiUrls,
      limit: 6
    }
  ]
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i]
    console.log(`\n${'='.repeat(70)}`)
    console.log(`📱 [${i+1}/3] ${test.name}`)
    console.log(`${'='.repeat(70)}`)
    
    try {
      console.log(`🔥 抓取列表页: ${test.url}`)
      const result = await fetchWithFirecrawl(test.url)
      const markdown = result.markdown || ''
      
      console.log(`✅ 抓取成功！内容长度: ${markdown.length} 字符`)
      
      // 提取详情页URL
      const detailUrls = test.extractor(markdown)
      console.log(`\n📊 找到 ${detailUrls.length} 个详情页URL`)
      console.log(`🎯 取前 ${test.limit} 个:`)
      
      const urlsToTest = detailUrls.slice(0, test.limit)
      urlsToTest.forEach((url, idx) => {
        console.log(`   ${idx+1}. ${url}`)
      })
      
      // 抓取第一个详情页进行测试
      if (urlsToTest.length > 0) {
        console.log(`\n🔍 测试第一个详情页...`)
        const testUrl = urlsToTest[0]
        console.log(`   URL: ${testUrl}`)
        
        try {
          const detailResult = await fetchWithFirecrawl(testUrl)
          const detailMarkdown = detailResult.markdown || ''
          
          console.log(`   ✅ 详情页抓取成功！内容长度: ${detailMarkdown.length} 字符`)
          console.log(`\n   📄 详情页内容预览（前1500字符）:`)
          console.log(`   ${'─'.repeat(66)}`)
          const preview = detailMarkdown.substring(0, 1500).split('\n').map(line => `   ${line}`).join('\n')
          console.log(preview)
          console.log(`   ${'─'.repeat(66)}`)
          
          // 分析详情页内容
          console.log(`\n   🔎 详情页分析:`)
          
          // 查找标题
          const titlePatterns = [
            /#+\s*([^#\n]+)/,  // Markdown标题
            /(?:标题|名称|作品名)[：:]\s*(.+)/,  // 标签后的标题
          ]
          
          let title = null
          for (const pattern of titlePatterns) {
            const match = detailMarkdown.match(pattern)
            if (match && match[1] && match[1].trim().length > 3) {
              title = match[1].trim()
              break
            }
          }
          
          if (title) {
            console.log(`      标题: ${title}`)
          } else {
            console.log(`      标题: 未找到`)
          }
          
          // 查找图片
          const imgPattern = /!\[[^\]]*\]\((https?:\/\/[^\s)]+\.(?:jpg|jpeg|png|webp|gif))/gi
          const images = []
          let imgMatch
          while ((imgMatch = imgPattern.exec(detailMarkdown)) !== null && images.length < 5) {
            images.push(imgMatch[1])
          }
          console.log(`      图片数量: ${images.length}`)
          if (images.length > 0) {
            console.log(`      首图: ${images[0]}`)
          }
          
        } catch (error) {
          console.log(`   ❌ 详情页抓取失败: ${error.message}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ 失败: ${error.message}`)
    }
    
    if (i < tests.length - 1) {
      console.log(`\n⏳ 等待3秒...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  console.log(`\n${'='.repeat(70)}`)
  console.log(`✅ 测试完成！`)
  console.log(`${'='.repeat(70)}`)
}

testDetailExtraction().catch(console.error)
