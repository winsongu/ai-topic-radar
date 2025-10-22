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

async function analyzeLinks() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 分析网站链接格式')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // 1. 熊猫办公Word模板
  console.log('📱 1. 熊猫办公-Word模板')
  console.log('='.repeat(70))
  const tukupptResult = await fetchWithFirecrawl('https://www.tukuppt.com/word/time_0_0_0_0_0_0_1.html')
  const tukupptMarkdown = tukupptResult.markdown || ''
  
  console.log(`内容长度: ${tukupptMarkdown.length}`)
  
  // 查找所有tukuppt.com域名的链接
  const tukupptLinkPattern = /https:\/\/www\.tukuppt\.com\/[^\s)]+/gi
  const tukupptLinks = []
  let match
  while ((match = tukupptLinkPattern.exec(tukupptMarkdown)) !== null) {
    const link = match[0]
    if (!tukupptLinks.includes(link) && link.includes('/word/')) {
      tukupptLinks.push(link)
    }
  }
  
  console.log(`\n找到 ${tukupptLinks.length} 个word相关链接:`)
  tukupptLinks.slice(0, 15).forEach((link, idx) => {
    console.log(`  ${idx+1}. ${link}`)
  })
  
  // 保存到文件用于分析
  require('fs').writeFileSync('/tmp/tukuppt-markdown.txt', tukupptMarkdown)
  console.log(`\n已保存完整内容到: /tmp/tukuppt-markdown.txt`)
  
  console.log(`\n⏳ 等待3秒...\n`)
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // 2. 觅知手抄报
  console.log('\n📱 2. 觅知-热点手抄报')
  console.log('='.repeat(70))
  const mizResult = await fetchWithFirecrawl('https://www.51miz.com/shouchaobao/')
  const mizMarkdown = mizResult.markdown || ''
  
  console.log(`内容长度: ${mizMarkdown.length}`)
  
  // 查找所有51miz.com域名的链接
  const mizLinkPattern = /https:\/\/www\.51miz\.com\/[^\s)]+/gi
  const mizLinks = []
  let mizMatch
  while ((mizMatch = mizLinkPattern.exec(mizMarkdown)) !== null) {
    const link = mizMatch[0]
    if (!mizLinks.includes(link) && link.includes('/shouchaobao/')) {
      mizLinks.push(link)
    }
  }
  
  console.log(`\n找到 ${mizLinks.length} 个手抄报相关链接:`)
  mizLinks.slice(0, 15).forEach((link, idx) => {
    console.log(`  ${idx+1}. ${link}`)
  })
  
  // 保存到文件用于分析
  require('fs').writeFileSync('/tmp/miz-shouchaobao-markdown.txt', mizMarkdown)
  console.log(`\n已保存完整内容到: /tmp/miz-shouchaobao-markdown.txt`)
  
  console.log(`\n${'='.repeat(70)}`)
  console.log(`✅ 分析完成！请查看保存的markdown文件了解详细结构`)
  console.log(`${'='.repeat(70)}`)
}

analyzeLinks().catch(console.error)
