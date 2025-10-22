# PPT竞品动态抓取来源及逻辑

> 记录各竞品平台的数据抓取方法、解析规则及常见问题解决方案  
> 最后更新：2025-10-22

---

## 📋 目录

1. [抓取概述](#抓取概述)
2. [平台抓取规则](#平台抓取规则)
   - [熊猫办公 (tukuppt.com)](#1-熊猫办公-tukupptcom)
   - [AIPPT (aippt.cn)](#2-aippt-aipptcn)
   - [iSlide (islide.cc)](#3-islide-islidecc)
   - [Canva (canva.cn)](#4-canva-canvacn)
3. [数据存储逻辑](#数据存储逻辑)
4. [前端展示优化](#前端展示优化)
5. [定时任务配置](#定时任务配置)
6. [常见问题 FAQ](#常见问题-faq)

---

## 抓取概述

### 核心工具
- **Firecrawl API**：用于网页抓取，自动处理JavaScript渲染
- **Supabase**：数据存储，追加模式保留历史数据
- **Node.js脚本**：`scripts/crawl-competitor-templates-v2.js`

### 抓取策略
- **深度抓取**：先获取列表页URL，再逐个访问详情页提取完整信息
- **追加模式**：所有数据按时间戳追加存储，支持月度复盘
- **批次标识**：同一次抓取的数据共享相同的`crawled_at`时间戳
- **自动清理**：自动删除90天前的旧数据

---

## 平台抓取规则

### 1. 熊猫办公 (tukuppt.com)

#### ✅ 抓取状态
**已验证，稳定运行**

#### 📍 数据来源
- **列表页**：`https://www.tukuppt.com/ppt/time_0_0_0_0_0_0_1.html`
- **详情页URL模式**：`https://www.tukuppt.com/muban/[a-z]+\.html`
- **示例**：`https://www.tukuppt.com/muban/kbbpwwxo.html`

#### 🔍 字段提取规则

##### 标题
```regex
正则: /^#\s+([^\n]+)/m
位置: 第一个一级标题（Markdown格式）
示例: "# 红色商务风再见2025你好2026PPT模板"
```

##### 页数
```regex
正则: /页数[为\s]*[：:]*\s*(\d+)/i
示例: "页数为：25" → "25P"
```

##### 作者
```regex
正则: /作者[为\s]*[：:]*\s*([^\n]+)/i
示例: "作者：熊猫办公"
```

##### 缩略图
```javascript
策略：
1. 优先：img.tukuppt.com/preview/ = 真实封面图 ✅
2. 其次：其他非logo图片
过滤：排除logo、icon、vip、member、avatar
正则: /!\[[^\]]*\]\((https:\/\/(?:img|static)\.tukuppt\.com\/[^\s)]+\.(?:jpg|jpeg|png))/gi
```

**关键代码**：
```javascript
// 优先选择preview路径的封面图（真实封面）
const previewImg = imgs.find(img => img.includes('img.tukuppt.com/preview/'))
if (previewImg) {
  template.thumbnail = previewImg
} else if (imgs.length > 0) {
  template.thumbnail = imgs[0]
}
```

#### ⚠️ 注意事项
- **缩略图问题**：部分页面可能返回完整PPT拼接图，前端已通过`object-top`优化显示
- **作者字段**：熊猫办公有完整的作者信息

---

### 2. AIPPT (aippt.cn)

#### ✅ 抓取状态
**已验证，标题提取已优化**

#### 📍 数据来源
- **列表页**：`https://www.aippt.cn/template/`
- **详情页URL模式**：`https://www.aippt.cn/template/ppt/detail/\d+\.html`
- **示例**：`https://www.aippt.cn/template/ppt/detail/643741.html`

#### 🔍 字段提取规则

##### 标题
```javascript
策略：
1. 优先：从<Base64-Image-Removed>后面提取标题
2. 备用：在前30行查找（避免匹配推荐模板）
正则: /!\[\]\(<Base64-Image-Removed>\)([^\n]+(?:PPT|ppt|模板))/i

过滤规则：
- 排除包含"登录"、"注册"、"下载客户端"的文本
- 排除以"["开头的链接文本
- 排除推荐模板关键词："推荐"、"相关"、"简约风+产品"、"我心向党"等

示例：
![](<Base64-Image-Removed>)绿色古风霜降教学课件通用模板
→ "绿色古风霜降教学课件通用模板" ✅
```

**关键代码**：
```javascript
// 注意：标题可能以"模板"结尾，所以不要求后面还有内容
const titleMatch = markdown.match(/!\[\]\(<Base64-Image-Removed>\)([^\n]+(?:PPT|ppt|模板))/i)

// Fallback: 只搜索前30行，跳过推荐词汇
const lines = markdown.split('\n').slice(0, 30)
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  if (line.includes('推荐') || line.includes('相关') || 
      line.includes('简约风+产品') || line.includes('我心向党')) {
    continue  // 跳过推荐模板
  }
  // ... 提取标题逻辑
}
```

##### 页数
```regex
正则: /(\d+)[页]/gi
验证: 页数必须在10-100之间
示例: "23页" → "23P"
```

##### 缩略图
```javascript
策略：
1. 优先：第一张图（无w_参数）= 首屏封面 ✅
2. 其次：w_400图片 = 高质量缩略图
3. 最后：其他图片

域名: aippt-domestic.aippt.com
正则: /https:\/\/aippt-domestic\.aippt\.com\/[^\s)]+\.(?:jpg|jpeg|png)/gi
```

**关键代码**：
```javascript
// 优先选择第一张图（首屏封面，无压缩参数）
const coverImg = imgs.find(img => !img.includes('w_200') && !img.includes('w_400'))
if (coverImg) {
  template.thumbnail = coverImg
} else {
  const highQualityImg = imgs.find(img => img.includes('w_400'))
  if (highQualityImg) {
    template.thumbnail = highQualityImg
  } else if (imgs.length > 0) {
    template.thumbnail = imgs[0]
  }
}
```

#### ⚠️ 注意事项
- **干扰内容多**：页面包含登录弹窗、推荐模板等干扰内容
- **标题位置特殊**：标题在`<Base64-Image-Removed>`图片标记后面
- **正则优化历史**：
  - ❌ 旧版：`/([^\n]+(?:PPT|ppt|模板)[^\n]+)/i` - 要求"模板"后还有内容
  - ✅ 新版：`/([^\n]+(?:PPT|ppt|模板))/i` - 允许"模板"结尾
- **作者字段**：AIPPT无作者信息

---

### 3. iSlide (islide.cc)

#### ✅ 抓取状态
**已验证，使用固定ID列表**

#### 📍 数据来源
- **列表页**：`https://www.islide.cc/ppt/template?filters=content-category.free&group=latest`
  - ⚠️ **问题**：列表页有反爬限制（返回500错误）
  - ✅ **解决**：使用固定的热门模板ID列表
- **详情页URL模式**：`https://www.islide.cc/ppt/template/\d+\.html`
- **示例**：`https://www.islide.cc/ppt/template/5254284.html`

#### 🔧 固定模板ID列表
```javascript
const islideIds = [
  '5254284', '5254283', '5254282', '5254281',  // 最新免费模板
  '5226210', '5196382', '4986178', '4951759', 
  '4951758', '4925828'
]
```

#### 🔍 字段提取规则

##### 标题
```regex
正则: /!\[([^\]]*(?:PPT|模板)[^\]]*)\]\(https:\/\/static\.islide\.cc/i
位置: 第一张图片的alt属性
示例: ![红色国潮风通用行业总结汇报PPT模板](https://static.islide.cc/...)
```

##### 作者/格式
```regex
正则: /^##\s+(Fu|iRis|Rin|Dai|Fish)/m
位置: 二级标题
可能值: Fu, iRis, Rin, Dai, Fish
示例: "## Fu" → format = "Fu"
```

##### 缩略图
```regex
域名: static.islide.cc
路径: /site/content/gallery/
格式: .jpg
正则: /(https:\/\/static\.islide\.cc\/site\/content\/gallery\/[^\s)]+\.jpg)/i
```

##### 标签
```
策略：从标题提取关键词（颜色+风格+用途）
示例："红色国潮风通用行业总结汇报PPT模板"
     → ["红色", "国潮", "汇报"]
```

#### ⚠️ 注意事项
- **反爬限制**：列表页经常返回500错误或验证码
- **抓取速率**：需要在请求之间等待3秒，避免触发限流
- **固定ID维护**：ID列表需要定期手动更新（建议每月）
- **作者字段**：使用format字段（Fu, iRis等设计师名称）

---

### 4. Canva (canva.cn)

#### ⚠️ 抓取状态
**暂未实现**

#### 📍 数据来源
- **目标页面**：`https://www.canva.cn/collections/presentation-selected-250923/`
- **状态**：待开发

#### 💡 实现建议
1. Canva页面结构复杂，需要单独测试
2. 可能需要处理更复杂的JavaScript渲染
3. 建议先用Firecrawl测试页面结构后再编写解析逻辑

---

## 数据存储逻辑

### 数据库表结构
**表名**：`competitor_templates`

```sql
CREATE TABLE competitor_templates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,                    -- 模板标题
  type TEXT,                              -- 页数（如"25P"）
  format TEXT,                            -- 格式（如"Fu"）
  usage TEXT,                             -- 用途分类
  platform TEXT NOT NULL,                 -- 平台名称
  tags TEXT[],                            -- 标签数组
  date TEXT,                              -- 网站上的日期（如果有）
  hot_value INTEGER DEFAULT 0,           -- 热度值
  url TEXT NOT NULL,                      -- 详情页URL
  thumbnail TEXT,                         -- 缩略图URL
  is_free BOOLEAN DEFAULT true,          -- 是否免费
  author TEXT,                            -- 作者
  crawled_at TIMESTAMP WITH TIME ZONE,   -- 抓取时间（入库时间）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 索引优化
```sql
-- 平台 + 抓取时间索引（用于查询最新批次）
CREATE INDEX idx_competitor_platform_crawled 
ON competitor_templates(platform, crawled_at DESC);

-- 抓取时间索引（用于数据清理）
CREATE INDEX idx_competitor_crawled_at 
ON competitor_templates(crawled_at DESC);
```

### 存储模式
- **追加模式**：所有数据按时间戳追加，不删除历史记录
- **批次标识**：同一次抓取的所有数据共享相同的`crawled_at`
- **自动清理**：脚本会自动删除90天前的数据（可配置）

### 数据查询示例

#### 1. 获取最新批次数据
```sql
-- 查询某平台最新批次的模板
SELECT * FROM competitor_templates
WHERE platform = 'AIPPT'
  AND crawled_at = (
    SELECT MAX(crawled_at) 
    FROM competitor_templates 
    WHERE platform = 'AIPPT'
  )
ORDER BY hot_value DESC
LIMIT 10;
```

#### 2. 月度复盘查询
```sql
-- 查询某个月的所有数据
SELECT 
  platform,
  COUNT(*) as total,
  array_agg(DISTINCT usage) as usages
FROM competitor_templates
WHERE crawled_at >= '2025-10-01'
  AND crawled_at < '2025-11-01'
GROUP BY platform;
```

#### 3. 热门趋势分析
```sql
-- 查询某个话题的热度变化
SELECT 
  DATE(crawled_at) as date,
  COUNT(*) as count,
  AVG(hot_value) as avg_hot
FROM competitor_templates
WHERE title LIKE '%霜降%'
GROUP BY DATE(crawled_at)
ORDER BY date DESC;
```

---

## 前端展示优化

### 缩略图显示优化
**问题**：抓取的缩略图可能是完整PPT拼接图（包含所有页面），而不是单独的封面

**解决方案**：CSS优化，只显示图片顶部（封面部分）
```css
/* app/competitor-dynamics/page.tsx */
className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
```

**原理**：
```
PPT拼接图结构：
┌─────────────┐
│  封面页 (1) │ ← object-top 显示这里
├─────────────┤
│  第2页      │
├─────────────┤
│  第3页      │
└─────────────┘
```

### 入库时间显示
**显示格式**：`入库时间: 2025-10-22`
```typescript
// 前端显示代码
<span className="text-xs text-muted-foreground">
  入库时间: {new Date(template.crawled_at).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')}
</span>
```

### API返回格式
```typescript
// GET /api/competitor-templates
{
  success: true,
  data: {
    platforms: [
      {
        id: "aippt",
        name: "AIPPT",
        templates: [
          {
            id: 1,
            title: "绿色古风霜降教学课件通用模板",
            thumbnail: "https://...",
            crawled_at: "2025-10-22T06:17:13.696Z",
            tags: ["绿色", "古风", "教学"],
            // ... 其他字段
          }
        ],
        updateTime: "2025-10-22T06:17:13.696Z",
        totalCount: 7
      }
    ]
  }
}
```

---

## 定时任务配置

### 方案1：Linux/Mac Cron（推荐）
```bash
# 编辑crontab
crontab -e

# 添加定时任务（每天凌晨2点执行）
0 2 * * * cd /path/to/ai-topic-radar && /usr/local/bin/node scripts/crawl-competitor-templates-v2.js >> /var/log/competitor-crawl.log 2>&1
```

### 方案2：GitHub Actions（云端）
```yaml
# .github/workflows/crawl-competitors.yml
name: Daily Competitor Crawl
on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨2点（UTC）
jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node scripts/crawl-competitor-templates-v2.js
        env:
          FIRECRAWL_API_KEY: ${{ secrets.FIRECRAWL_API_KEY }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### 方案3：手动执行
```bash
cd /path/to/ai-topic-radar
node scripts/crawl-competitor-templates-v2.js
```

---

## 常见问题 FAQ

### Q1: 为什么iSlide使用固定ID列表而不抓取列表页？
**A**: iSlide的列表页有严格的反爬限制，经常返回500错误。使用固定ID列表可以绕过这个限制，同时保证数据的稳定性。

**维护建议**：每月手动访问iSlide网站，更新ID列表为最新的免费模板。

---

### Q2: AIPPT的标题为什么经常提取错误？
**A**: AIPPT页面包含大量干扰内容（登录弹窗、推荐模板等）。已通过以下方式优化：
1. 限制搜索范围到前30行
2. 过滤推荐模板的关键词
3. 优化正则表达式，允许标题以"模板"结尾

**验证方法**：
```bash
node --no-warnings -e "..." # 见文档中的测试代码
```

---

### Q3: 缩略图为什么是完整PPT拼接图？
**A**: Firecrawl抓取的缩略图可能包含所有页面的拼接图。已通过前端CSS优化：
```css
object-cover object-top
```
只显示图片顶部（封面部分），无需修改抓取逻辑。

---

### Q4: 如何添加新的竞品平台？
**A**: 按以下步骤操作：

1. **测试页面结构**
```bash
# 使用Firecrawl测试页面
curl -X POST https://api.firecrawl.dev/v1/scrape \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "目标URL", "formats": ["markdown"]}'
```

2. **编写解析函数**
```javascript
// scripts/crawl-competitor-templates-v2.js
function parseDetailPage_NewPlatform(markdown, url) {
  const template = {
    title: null,
    platform: '新平台名称',
    // ... 其他字段
  }
  
  // 编写解析逻辑
  // ...
  
  return template
}
```

3. **更新列表页逻辑**
```javascript
// 在 extractDetailUrls 函数中添加
case 'new-platform':
  const newPattern = /URL模式的正则表达式/g
  // ...
  break
```

4. **测试并验证**
```bash
node scripts/crawl-competitor-templates-v2.js
```

---

### Q5: Firecrawl API限流怎么办？
**A**: 
1. **检查当前配额**：登录Firecrawl Dashboard查看使用量
2. **增加等待时间**：在请求之间增加`await new Promise(r => setTimeout(r, 3000))`
3. **分批抓取**：不要一次性抓取所有平台，可以分多次执行
4. **升级套餐**：如果经常触发限流，考虑升级Firecrawl套餐

---

### Q6: 数据库中有重复数据怎么办？
**A**: 由于采用追加模式，重复抓取会导致重复数据。前端API已做处理，只返回最新批次。

**手动清理**：
```sql
-- 删除特定平台的旧数据，只保留最新批次
DELETE FROM competitor_templates
WHERE platform = 'AIPPT'
  AND crawled_at < (
    SELECT MAX(crawled_at) 
    FROM competitor_templates 
    WHERE platform = 'AIPPT'
  );
```

---

### Q7: 如何调试某个平台的抓取问题？
**A**: 使用单独测试脚本：

```bash
# 测试单个详情页
node --no-warnings -e "
require('dotenv').config({ path: '.env.local' });

(async () => {
  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
  const url = '测试URL';
  
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${FIRECRAWL_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      formats: ['markdown'],
      onlyMainContent: true,
      waitFor: 5000
    })
  });
  
  const data = await res.json();
  if (data.success) {
    console.log(data.data.markdown);
  }
})();
"
```

---

## 📞 联系方式

如有问题或需要优化，请参考以下资源：
- **Firecrawl文档**：https://docs.firecrawl.dev/
- **Supabase文档**：https://supabase.com/docs
- **项目脚本**：`scripts/crawl-competitor-templates-v2.js`
- **API文档**：`app/api/competitor-templates/route.ts`

---

**文档版本**：v1.0  
**最后更新**：2025-10-22  
**维护者**：AI开发团队

