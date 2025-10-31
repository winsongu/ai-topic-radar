require('dotenv').config({ path: '.env.local' })
const FirecrawlApp = require('@mendable/firecrawl-js').default

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

async function testMizhiCrawl() {
  console.log('🔍 测试爬取觅知手抄报详情页...\n')
  
  // 测试一个真实的URL
  const testUrl = 'https://www.51miz.com/shouchaobao/20191011141515.html'
  
  console.log('📄 爬取:', testUrl)
  
  try {
    const result = await firecrawl.scrapeUrl(testUrl, { formats: ['markdown'] })
    const markdown = result.markdown || ''
    
    console.log('\n✅ 爬取成功！\n')
    
    // 提取标题
    const titleMatch = markdown.match(/<title>([^<]+)<\/title>/i)
    console.log('标题:', titleMatch ? titleMatch[1] : '未找到')
    
    // 提取缩略图 - og:image
    const thumbnailMatch = markdown.match(/<meta property="og:image" content="([^"]+)"/i)
    console.log('OG缩略图:', thumbnailMatch ? thumbnailMatch[1] : '未找到')
    
    // 查找所有图片URL
    const allImages = markdown.match(/https:\/\/[^\s"']+\.(jpg|jpeg|png|webp)(\?[^\s"']*)?/gi) || []
    console.log('\n所有图片URL (前15个):')
    const uniqueImages = [...new Set(allImages)]
    uniqueImages.slice(0, 15).forEach((img, i) => {
      console.log(`  ${i+1}. ${img}`)
    })
    
  } catch (error) {
    console.error('❌ 爬取失败:', error.message)
  }
}

testMizhiCrawl()
