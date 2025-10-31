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
  return result.data
}

async function test() {
  const url = 'https://www.tukuppt.com/word/time_0_0_0_0_0_0_1.html'
  console.log('🔍 测试抓取熊猫办公Word列表页:', url)
  
  try {
    const result = await fetchWithFirecrawl(url)
    const markdown = result.markdown || ''
    
    console.log('\n✅ 抓取成功\n')
    
    // 查找muban链接（详情页）
    const mubanPattern = /https:\/\/www\.tukuppt\.com\/muban\/[a-z]+\.html/g
    const mubanLinks = [...new Set(markdown.match(mubanPattern) || [])]
    
    console.log(`找到 ${mubanLinks.length} 个详情页链接 (/muban/xxx.html):`)
    mubanLinks.slice(0, 15).forEach((link, i) => {
      console.log(`  ${i+1}. ${link}`)
    })
    
  } catch (error) {
    console.error('❌ 抓取失败:', error.message)
  }
}

test()
