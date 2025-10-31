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

async function test() {
  const url = 'https://www.51miz.com/sucai/1513534.html'
  console.log('🔍 测试抓取营销日历详情页:', url)
  
  try {
    const result = await fetchWithFirecrawl(url)
    const markdown = result.markdown || ''
    
    console.log('\n✅ 抓取成功\n')
    console.log('Markdown 长度:', markdown.length)
    
    // 查找所有图片
    const imgPattern = /!\[[^\]]*\]\((https:\/\/[^\s)]+\.(?:jpg|png|webp))/gi
    const images = []
    let match
    while ((match = imgPattern.exec(markdown)) !== null) {
      images.push(match[1])
    }
    
    console.log(`\n找到 ${images.length} 个图片:`)
    images.slice(0, 10).forEach((img, i) => {
      console.log(`  ${i+1}. ${img}`)
    })
    
    // 查找imgs-qn.51miz.com的图片
    const mizhImages = images.filter(img => img.includes('imgs-qn.51miz.com'))
    console.log(`\n其中 imgs-qn.51miz.com 图片: ${mizhImages.length} 个`)
    mizhImages.forEach((img, i) => {
      console.log(`  ${i+1}. ${img}`)
    })
    
  } catch (error) {
    console.error('❌ 抓取失败:', error.message)
  }
}

test()
