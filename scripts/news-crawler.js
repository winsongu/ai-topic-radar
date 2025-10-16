/**
 * 新闻爬虫工具
 * 支持多个平台的热点新闻抓取
 */

const https = require('https');
const http = require('http');

// 初始化 Firecrawl（如果有 API Key）
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';
let firecrawl = null;

if (FIRECRAWL_API_KEY) {
  try {
    const FirecrawlApp = require('@mendable/firecrawl-js').default;
    firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
  } catch (error) {
    console.warn('⚠️  Firecrawl 初始化失败:', error.message);
  }
}

/**
 * 通用的 HTTP 请求函数
 */
async function fetchHTML(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = options.timeout || 30000;

    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        ...options.headers
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 百度热搜爬虫（使用 Firecrawl）
 */
async function crawlBaidu() {
  console.log('🔍 开始抓取百度热搜...');
  
  if (!firecrawl) {
    console.error('❌ Firecrawl 未配置，无法抓取百度热搜');
    return { success: false, data: [], error: 'Firecrawl not configured' };
  }
  
  try {
    // 使用 Firecrawl 抓取页面
    const scrapeResult = await firecrawl.scrape('https://top.baidu.com/board?tab=realtime', {
      formats: ['markdown']
    });
    
    const markdown = scrapeResult.data?.markdown || scrapeResult.markdown || '';
    const items = [];
    
    // 从 Markdown 中提取热搜标题和链接
    // 格式：[标题](URL) ... 热搜指数数字
    const linkPattern = /\[([^\]]+)\]\(https:\/\/www\.baidu\.com\/s\?wd=([^)]+)\)/g;
    const hotPattern = /(\d{4,})\s*热搜指数/g;
    
    let match;
    let rank = 1;
    const titles = [];
    const hotValues = [];
    
    // 提取所有标题和链接
    while ((match = linkPattern.exec(markdown)) !== null && rank <= 10) {
      const title = match[1].trim();
      const url = match[0].match(/\((https:\/\/www\.baidu\.com[^)]+)\)/)?.[1] || `https://www.baidu.com/s?wd=${encodeURIComponent(title)}`;
      
      if (title.length > 3 && title.length < 200 && !title.includes('查看更多') && !title.includes('百度')) {
        titles.push({ title, url });
      }
    }
    
    // 提取所有热度值
    while ((match = hotPattern.exec(markdown)) !== null) {
      hotValues.push(parseInt(match[1]));
    }
    
    // 组合数据（取前10个）
    for (let i = 0; i < Math.min(10, titles.length); i++) {
      items.push({
        id: i + 1,
        title: titles[i].title,
        summary: `百度热搜第${i + 1}名`,
        url: titles[i].url,
        hot: hotValues[i] || (10 - i) * 100000,
        time: '刚刚'
      });
    }
    
    console.log(`✅ 百度热搜抓取成功: ${items.length} 条`);
    return { success: true, data: items };
    
  } catch (error) {
    console.error('❌ 百度热搜抓取失败:', error.message);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * 中新网教育爬虫（使用 Firecrawl）
 */
async function crawlChinanews() {
  console.log('🔍 开始抓取中新网教育...');
  
  if (!firecrawl) {
    console.error('❌ Firecrawl 未配置，无法抓取中新网');
    return { success: false, data: [], error: 'Firecrawl not configured' };
  }
  
  try {
    // 使用 Firecrawl 抓取页面
    const scrapeResult = await firecrawl.scrape('https://www.chinanews.com.cn/', {
      formats: ['markdown']
    });
    
    const markdown = scrapeResult.data?.markdown || scrapeResult.markdown || '';
    const items = [];
    
    // 从 Markdown 中提取新闻链接和标题
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let rank = 1;
    
    while ((match = linkPattern.exec(markdown)) !== null && rank <= 10) {
      const title = match[1].trim();
      let url = match[2].trim();
      
      // 处理相对URL
      if (!url.startsWith('http')) {
        url = url.startsWith('/') ? `https://www.chinanews.com.cn${url}` : `https://www.chinanews.com.cn/${url}`;
      }
      
      // 只保留新闻类链接，过滤导航等
      if (title.length > 5 && title.length < 100 && url.includes('chinanews.com.cn')) {
        items.push({
          id: rank,
          title: title,
          summary: '中新网要闻，关注社会热点和时事动态。',
          url: url,
          hot: (11 - rank) * 100000,
          time: '刚刚'
        });
        rank++;
      }
    }
    
    console.log(`✅ 中新网教育抓取成功: ${items.length} 条`);
    return { success: true, data: items };
    
  } catch (error) {
    console.error('❌ 中新网教育抓取失败:', error.message);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * 人民网重要讲话爬虫（使用 Firecrawl）
 */
async function crawlPeople() {
  console.log('🔍 开始抓取人民网重要讲话...');
  
  if (!firecrawl) {
    console.error('❌ Firecrawl 未配置，无法抓取人民网');
    return { success: false, data: [], error: 'Firecrawl not configured' };
  }
  
  try {
    // 使用 Firecrawl 抓取页面
    const scrapeResult = await firecrawl.scrape('http://politics.people.com.cn/GB/8198/426918/index.html', {
      formats: ['markdown']
    });
    
    const markdown = scrapeResult.data?.markdown || scrapeResult.markdown || '';
    const items = [];
    
    // 从 Markdown 中提取新闻链接和标题
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let rank = 1;
    
    while ((match = linkPattern.exec(markdown)) !== null && rank <= 10) {
      const title = match[1].trim();
      let url = match[2].trim();
      
      // 处理相对URL
      if (!url.startsWith('http')) {
        url = url.startsWith('/') ? `http://politics.people.com.cn${url}` : `http://politics.people.com.cn/${url}`;
      }
      
      // 只保留新闻类链接，过滤导航等
      if (title.length > 5 && title.length < 100 && url.includes('people.com.cn')) {
        items.push({
          id: rank,
          title: title,
          summary: '权威政策解读和重要讲话内容。',
          url: url,
          hot: (11 - rank) * 100000,
          time: '刚刚'
        });
        rank++;
      }
    }
    
    console.log(`✅ 人民网重要讲话抓取成功: ${items.length} 条`);
    return { success: true, data: items };
    
  } catch (error) {
    console.error('❌ 人民网重要讲话抓取失败:', error.message);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * 36氪热榜爬虫（使用虚拟数据）
 */
async function crawl36Kr() {
  console.log('🔍 开始抓取36氪热榜...');
  
  const mockData = [
    { id: 1, title: '某大厂宣布新一轮融资', summary: '科技创投新闻', url: 'https://36kr.com', hot: 1000000, time: '1小时前' },
    { id: 2, title: 'AI行业最新动态', summary: '人工智能领域突破', url: 'https://36kr.com', hot: 800000, time: '2小时前' },
    { id: 3, title: '电商平台推出新功能', summary: '互联网商业新闻', url: 'https://36kr.com', hot: 600000, time: '3小时前' }
  ];
  
  console.log(`✅ 36氪热榜抓取成功: ${mockData.length} 条（虚拟数据）`);
  return { success: true, data: mockData };
}

/**
 * 今日头条热榜爬虫（备用方案）
 */
async function crawlToutiao() {
  console.log('🔍 开始抓取今日头条热榜...');
  
  const mockData = [
    { id: 1, title: '今日社会热点', summary: '社会新闻', url: 'https://www.toutiao.com', hot: 5000000, time: '刚刚' },
    { id: 2, title: '娱乐八卦新闻', summary: '娱乐资讯', url: 'https://www.toutiao.com', hot: 3000000, time: '30分钟前' },
    { id: 3, title: '财经市场分析', summary: '财经资讯', url: 'https://www.toutiao.com', hot: 2000000, time: '1小时前' }
  ];
  
  console.log(`✅ 今日头条热榜抓取成功: ${mockData.length} 条（示例数据）`);
  return { success: true, data: mockData };
}

/**
 * 抖音热榜爬虫（备用方案）
 */
async function crawlDouyin() {
  console.log('🔍 开始抓取抖音热榜...');
  
  const mockData = [
    { id: 1, title: '热门短视频话题', summary: '视频内容', url: 'https://www.douyin.com', hot: 10000000, time: '刚刚' },
    { id: 2, title: '爆款音乐挑战', summary: '音乐话题', url: 'https://www.douyin.com', hot: 8000000, time: '15分钟前' },
    { id: 3, title: '明星直播动态', summary: '直播内容', url: 'https://www.douyin.com', hot: 6000000, time: '30分钟前' }
  ];
  
  console.log(`✅ 抖音热榜抓取成功: ${mockData.length} 条（示例数据）`);
  return { success: true, data: mockData };
}

/**
 * 微博热搜爬虫（使用虚拟数据）
 */
async function crawlWeibo() {
  console.log('🔍 开始抓取微博热搜...');
  
  const mockData = [
    { id: 1, title: '微博热门话题', summary: '社交话题', url: 'https://s.weibo.com', hot: 20000000, time: '刚刚' },
    { id: 2, title: '明星动态更新', summary: '娱乐新闻', url: 'https://s.weibo.com', hot: 15000000, time: '10分钟前' },
    { id: 3, title: '社会热点事件', summary: '时事新闻', url: 'https://s.weibo.com', hot: 12000000, time: '20分钟前' }
  ];
  
  console.log(`✅ 微博热搜抓取成功: ${mockData.length} 条（虚拟数据）`);
  return { success: true, data: mockData };
}

/**
 * 知乎热榜爬虫（使用虚拟数据）
 */
async function crawlZhihu() {
  console.log('🔍 开始抓取知乎热榜...');
  
  const mockData = [
    { id: 1, title: '如何看待最新科技发展', summary: '科技讨论', url: 'https://www.zhihu.com', hot: 5000000, time: '1小时前' },
    { id: 2, title: '职场经验分享', summary: '职场话题', url: 'https://www.zhihu.com', hot: 3000000, time: '2小时前' },
    { id: 3, title: '教育政策解读', summary: '教育话题', url: 'https://www.zhihu.com', hot: 2000000, time: '3小时前' }
  ];
  
  console.log(`✅ 知乎热榜抓取成功: ${mockData.length} 条（虚拟数据）`);
  return { success: true, data: mockData };
}

/**
 * B站热门爬虫（备用方案）
 */
async function crawlBilibili() {
  console.log('🔍 开始抓取B站热门...');
  
  const mockData = [
    { id: 1, title: 'B站热门视频合集', summary: '视频内容', url: 'https://www.bilibili.com', hot: 8000000, time: '刚刚' },
    { id: 2, title: '游戏直播精彩瞬间', summary: '游戏内容', url: 'https://www.bilibili.com', hot: 6000000, time: '30分钟前' },
    { id: 3, title: '动漫新番推荐', summary: '动漫内容', url: 'https://www.bilibili.com', hot: 4000000, time: '1小时前' }
  ];
  
  console.log(`✅ B站热门抓取成功: ${mockData.length} 条（示例数据）`);
  return { success: true, data: mockData };
}

/**
 * 小红书热门爬虫（备用方案）
 */
async function crawlXiaohongshu() {
  console.log('🔍 开始抓取小红书热门...');
  
  const mockData = [
    { id: 1, title: '美妆护肤心得', summary: '美妆内容', url: 'https://www.xiaohongshu.com', hot: 3000000, time: '1小时前' },
    { id: 2, title: '时尚穿搭分享', summary: '时尚内容', url: 'https://www.xiaohongshu.com', hot: 2500000, time: '2小时前' },
    { id: 3, title: '美食探店推荐', summary: '美食内容', url: 'https://www.xiaohongshu.com', hot: 2000000, time: '3小时前' }
  ];
  
  console.log(`✅ 小红书热门抓取成功: ${mockData.length} 条（示例数据）`);
  return { success: true, data: mockData };
}

/**
 * 解析热度值
 */
function parseHotValue(hotStr) {
  if (!hotStr) return 0;
  
  const str = hotStr.toString().replace(/[^\d.万千亿]+/g, '');
  
  if (str.includes('亿')) {
    return parseFloat(str) * 100000000;
  } else if (str.includes('万')) {
    return parseFloat(str) * 10000;
  } else if (str.includes('千')) {
    return parseFloat(str) * 1000;
  }
  
  return parseFloat(str) || 0;
}

/**
 * 爬虫映射表
 */
const crawlers = {
  'baidu': crawlBaidu,
  'chinanews': crawlChinanews,
  'people': crawlPeople,
  '36kr': crawl36Kr,
  'weibo': crawlWeibo,
  'zhihu': crawlZhihu,
  'toutiao': crawlToutiao,
  'douyin': crawlDouyin,
  'bilibili': crawlBilibili,
  'xiaohongshu': crawlXiaohongshu
};

/**
 * 执行指定平台的爬虫
 */
async function crawlPlatform(platformId) {
  const crawler = crawlers[platformId];
  
  if (!crawler) {
    console.warn(`⚠️ 未找到平台 ${platformId} 的爬虫`);
    return { success: false, data: [], error: 'Crawler not found' };
  }
  
  return await crawler();
}

/**
 * 批量抓取所有平台
 */
async function crawlAll() {
  const results = {};
  
  for (const [platformId, crawler] of Object.entries(crawlers)) {
    results[platformId] = await crawler();
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}

module.exports = {
  crawlPlatform,
  crawlAll,
  crawlBaidu,
  crawlChinanews,
  crawlPeople,
  crawl36Kr,
  crawlWeibo,
  crawlZhihu,
  crawlToutiao,
  crawlDouyin,
  crawlBilibili,
  crawlXiaohongshu
};

