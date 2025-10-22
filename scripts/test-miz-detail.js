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

async function testMizDetail() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 测试觅知手抄报详情页抓取')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  const testUrls = [
    'https://www.51miz.com/shouchaobao/xiaoxuesheng/1142454.html',
    'https://www.51miz.com/shouchaobao/xiaoxuesheng/1141403.html',
    'https://www.51miz.com/shouchaobao/jieri/1151264.html'
  ]
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i]
    console.log(`\n[${ i+1}/${testUrls.length}] ${url}`)
    console.log('='.repeat(70))
    
    try {
      const result = await fetchWithFirecrawl(url)
      const markdown = result.markdown || ''
      
      console.log(`✅ 抓取成功！内容长度: ${markdown.length} 字符`)
      
      // 分析内容
      console.log(`\n📊 内容分析:`)
      
      // 查找标题
      const titlePatterns = [
        /^#+\s*([^#\n]+)/m,  // Markdown标题
        /作品标题[：:]\s*(.+)/,
        /标题[：:]\s*(.+)/,
      ]
      
      let title = null
      for (const pattern of titlePatterns) {
        const match = markdown.match(pattern)
        if (match && match[1] && match[1].trim().length > 3) {
          title = match[1].trim()
          break
        }
      }
      
      // 如果还没找到，尝试从前50行中查找看起来像标题的内容
      if (!title) {
        const lines = markdown.split('\n').slice(0, 50)
        for (const line of lines) {
          const cleaned = line.trim()
          if (cleaned.length > 5 && cleaned.length < 50 && 
              !cleaned.startsWith('[![') &&
              !cleaned.startsWith('![') &&
              !cleaned.startsWith('[') &&
              !cleaned.startsWith('http') &&
              (cleaned.includes('手抄报') || cleaned.includes('小报') || cleaned.includes('模板'))) {
            title = cleaned
            break
          }
        }
      }
      
      console.log(`   标题: ${title || '未找到'}`)
      
      // 查找图片
      const imgPattern = /!\[[^\]]*\]\((https?:\/\/[^\s)]+\.(?:jpg|jpeg|png|webp|gif))/gi
      const images = []
      let imgMatch
      while ((imgMatch = imgPattern.exec(markdown)) !== null && images.length < 10) {
        const imgUrl = imgMatch[1]
        // 过滤logo等无用图片
        if (!imgUrl.includes('logo') && 
            !imgUrl.includes('icon') && 
            !imgUrl.includes('assets-v2')) {
          images.push(imgUrl)
        }
      }
      
      console.log(`   图片数量: ${images.length}`)
      if (images.length > 0) {
        console.log(`   首图: ${images[0]}`)
      }
      
      // 查找标签/关键词
      const tagPattern = /(?:标签|关键词|分类)[：:]\s*(.+)/
      const tagMatch = markdown.match(tagPattern)
      if (tagMatch) {
        console.log(`   标签: ${tagMatch[1].trim()}`)
      }
      
      // 保存第一个详情页的完整内容
      if (i === 0) {
        require('fs').writeFileSync('/tmp/miz-detail-sample.txt', markdown)
        console.log(`\n   📄 已保存完整内容到: /tmp/miz-detail-sample.txt`)
      }
      
    } catch (error) {
      console.log(`❌ 抓取失败: ${error.message}`)
    }
    
    if (i < testUrls.length - 1) {
      console.log(`\n⏳ 等待3秒...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  console.log(`\n${'='.repeat(70)}`)
  console.log(`✅ 测试完成！`)
  console.log(`${'='.repeat(70)}`)
}

testMizDetail().catch(console.error)
