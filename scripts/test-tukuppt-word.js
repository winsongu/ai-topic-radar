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
    
    console.log('\n✅ 抓取成功')
    console.log('Markdown 长度:', markdown.length)
    
    // 查找所有https://www.tukuppt.com开头的链接
    const allLinks = markdown.match(/https:\/\/www\.tukuppt\.com\/[^\s"'\)]+/g) || []
    console.log(`\n找到 ${allLinks.length} 个tukuppt链接`)
    
    // 统计不同类型的链接
    const linkTypes = {}
    allLinks.forEach(link => {
      const match = link.match(/tukuppt\.com\/([^\/]+)\//)
      if (match) {
        const type = match[1]
        linkTypes[type] = (linkTypes[type] || 0) + 1
      }
    })
    
    console.log('\n链接类型统计:')
    Object.entries(linkTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}个`)
    })
    
    // 查找word类型的链接
    const wordLinks = allLinks.filter(link => link.includes('/word/'))
    console.log(`\n包含/word/的链接: ${wordLinks.length}个`)
    wordLinks.slice(0, 15).forEach((link, i) => {
      console.log(`  ${i+1}. ${link}`)
    })
    
  } catch (error) {
    console.error('❌ 抓取失败:', error.message)
  }
}

test()
