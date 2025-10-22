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

async function testScraping() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 测试文字模板网站抓取')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  const testUrls = [
    {
      name: '熊猫办公-Word模板',
      url: 'https://www.tukuppt.com/word/time_0_0_0_0_0_0_1.html',
      description: '最新上传的Word模板（手抄报）'
    },
    {
      name: '觅知-热点手抄报',
      url: 'https://www.51miz.com/shouchaobao/',
      description: '热点推荐的手抄报模板'
    },
    {
      name: '觅知-营销日历',
      url: 'https://www.51miz.com/sucai/',
      description: '营销日历素材（海报、日历）'
    }
  ]
  
  for (let i = 0; i < testUrls.length; i++) {
    const test = testUrls[i]
    console.log(`\n${'='.repeat(70)}`)
    console.log(`📱 [${i+1}/3] ${test.name}`)
    console.log(`${'='.repeat(70)}`)
    console.log(`🌐 URL: ${test.url}`)
    console.log(`📝 说明: ${test.description}`)
    console.log(`\n🔥 开始抓取...`)
    
    try {
      const result = await fetchWithFirecrawl(test.url)
      
      const markdown = result.markdown || ''
      console.log(`✅ 抓取成功！内容长度: ${markdown.length} 字符\n`)
      
      // 分析内容
      console.log(`📊 内容分析:`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      
      // 查找图片链接
      const imgPattern = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+\.(?:jpg|jpeg|png|webp|gif))/gi
      const images = []
      let imgMatch
      while ((imgMatch = imgPattern.exec(markdown)) !== null && images.length < 10) {
        images.push({
          alt: imgMatch[1],
          url: imgMatch[2]
        })
      }
      console.log(`🖼️  图片数量: ${images.length} 个`)
      if (images.length > 0) {
        console.log(`   前3个图片:`)
        images.slice(0, 3).forEach((img, idx) => {
          console.log(`   ${idx+1}. ${img.alt || '(无描述)'}`)
          console.log(`      ${img.url.substring(0, 80)}...`)
        })
      }
      
      // 查找链接
      const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi
      const links = []
      let linkMatch
      while ((linkMatch = linkPattern.exec(markdown)) !== null && links.length < 15) {
        const text = linkMatch[1]
        const url = linkMatch[2]
        // 过滤登录、注册等无用链接
        if (!text.includes('登录') && 
            !text.includes('注册') && 
            !text.includes('下载') &&
            !url.includes('login') &&
            !url.includes('register')) {
          links.push({
            text: text,
            url: url
          })
        }
      }
      console.log(`\n🔗 有效链接数量: ${links.length} 个`)
      if (links.length > 0) {
        console.log(`   前5个链接:`)
        links.slice(0, 5).forEach((link, idx) => {
          console.log(`   ${idx+1}. ${link.text}`)
          console.log(`      ${link.url}`)
        })
      }
      
      // 查找可能的标题
      const titlePattern = /^#+\s+(.+)$/gm
      const titles = []
      let titleMatch
      while ((titleMatch = titlePattern.exec(markdown)) !== null && titles.length < 10) {
        titles.push(titleMatch[1].trim())
      }
      console.log(`\n📋 标题数量: ${titles.length} 个`)
      if (titles.length > 0) {
        console.log(`   前5个标题:`)
        titles.slice(0, 5).forEach((title, idx) => {
          console.log(`   ${idx+1}. ${title.substring(0, 60)}${title.length > 60 ? '...' : ''}`)
        })
      }
      
      // 保存前2000字符用于分析
      console.log(`\n📄 内容预览（前2000字符）:`)
      console.log(`${'─'.repeat(70)}`)
      console.log(markdown.substring(0, 2000))
      console.log(`${'─'.repeat(70)}`)
      if (markdown.length > 2000) {
        console.log(`... 还有 ${markdown.length - 2000} 字符未显示`)
      }
      
    } catch (error) {
      console.log(`❌ 抓取失败: ${error.message}`)
      if (error.response) {
        console.log(`   HTTP状态: ${error.response.status}`)
      }
    }
    
    // 等待一下避免请求过快
    if (i < testUrls.length - 1) {
      console.log(`\n⏳ 等待3秒后继续下一个...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  console.log(`\n${'='.repeat(70)}`)
  console.log(`✅ 测试完成！`)
  console.log(`${'='.repeat(70)}`)
}

testScraping().catch(console.error)
