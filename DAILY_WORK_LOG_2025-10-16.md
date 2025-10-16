# 工作日志 - 2025年10月16日

## 📋 工作概述

今天主要完成了「稻壳热点选题神器」项目的核心数据抓取功能优化、前端交互提升，以及整合了营销日历和竞品动态两个新模块。

---

## ✅ 核心验证内容

### 1. 数据源链接修正 ⭐⭐⭐
**问题：** 之前使用的抓取链接不正确，导致数据质量差

**修正后的正确链接：**
- **百度热搜**：`https://top.baidu.com/board?tab=realtime` ✅
- **中新网教育**：`https://www.chinanews.com.cn/rss/importnews.xml` ✅ (RSS格式)
- **人民网重要讲话**：`https://jhsjk.people.cn/` ✅

**验证结果：**
```
✅ 百度热搜抓取成功: 10 条
✅ 中新网教育抓取成功: 10 条  
✅ 人民网重要讲话抓取成功: 10 条
```

**文件位置：** `scripts/news-crawler.js`

---

### 2. 数据提取优化 ⭐⭐⭐

#### 2.1 标题清理
- **百度热搜**：过滤"查看更多"等无效链接，去除`\\+`等特殊符号
- **中新网**：处理RSS/XML格式，去除`-cn`前缀、时间戳
- **人民网**：去除来源信息（如`_来源：《求是》_`），过滤导航链接

#### 2.2 摘要生成策略
**原策略：** 拼接来源后缀（如 "标题 - 中新网"、"标题 热度XXX万"）

**新策略：** 
- 纯净摘要，不带任何来源后缀
- 控制在65字符以内（约2行）
- 超出长度自动截断并添加"..."

**示例对比：**
```
❌ 旧：前三季度全国铁路完成旅客发送量35.37亿人 同比增6.0% - 中新网
✅ 新：前三季度全国铁路完成旅客发送量35.37亿人 同比增6.0%

❌ 旧：习近平给中国农业大学师生的回信 热度790万
✅ 新：习近平给中国农业大学师生的回信
```

---

### 3. Firecrawl API 集成 ⭐⭐⭐

#### 问题排查
**错误：** `Invalid character in header content ["Authorization"]`

**原因：** `@mendable/firecrawl-js` SDK 在某些情况下会在 Authorization 头部添加额外字符

**解决方案：** 使用原生 Node.js `https` 模块直接调用 Firecrawl REST API

```javascript
const https = require('https');

async function scrapeWithFirecrawl(url) {
  const cleanApiKey = FIRECRAWL_API_KEY.trim(); // 确保API Key干净
  
  const options = {
    hostname: 'api.firecrawl.dev',
    path: '/v1/scrape',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + cleanApiKey,
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  // ... 完整实现见 scripts/news-crawler.js
}
```

**验证结果：** 所有平台均成功抓取数据

---

### 4. 前端交互优化 ⭐⭐

#### 4.1 Toast 提示组件
**需求：** 点击"更新数据"按钮后，右下角显示提示："已执行、请5分钟后刷新"

**实现特性：**
- 深灰色背景（`bg-gray-800`），白色文字
- 1秒转圈动画后延迟显示
- 5秒自动消失，可手动关闭
- 淡入淡出动画效果

**文件位置：**
- 组件：`components/ui/toast.tsx`
- 使用：`app/page.tsx` (handleRefresh函数)

**交互流程：**
```
用户点击 → 转圈1秒 → Toast弹出 → 5秒后自动关闭
```

---

## 🎯 关键技术决策

### 1. RSS数据解析
**挑战：** 中新网使用RSS/XML格式，Firecrawl返回的Markdown不是标准的`[标题](链接)`格式

**解决：** 使用正则表达式匹配特殊格式
```javascript
const rssPattern = /([^http]+)(http:\/\/www\.chinanews\.com\/[^\s]+\.shtml)/g;
```

### 2. 人民网文章筛选
**问题：** 初始抓取会获取到很多旧文章（2020-2023年）

**解决：** 添加日期过滤
```javascript
const isRecent = /\/(2024|2025)\//.test(url);
```

### 3. GitHub Actions 定时任务
**权限问题：** OAuth App 无法直接创建/更新 `.github/workflows` 文件

**解决：** 手动在 GitHub 网站创建 workflow 文件，避免OAuth权限限制

---

## 📁 文件结构变化

### 新增文件
```
components/ui/toast.tsx              # Toast提示组件
data/calendar-events.json            # 日历事件数据
data/monthly-hotspots.json           # 月度热点数据
docs/CALENDAR_GUIDE.md               # 日历使用指南
scripts/generate-calendar-data.js    # 日历数据生成脚本
scripts/verify-calendar-data.js      # 数据验证脚本
CALENDAR_UPDATE_LOG.md               # 日历更新日志
IMPLEMENTATION_SUMMARY.md            # 实现总结
VERIFICATION_REPORT.md               # 验证报告
```

### 修改文件
```
app/page.tsx                         # 添加Toast，优化handleRefresh
app/api/hot-news/route.ts            # 调整平台顺序和数量
app/competitor-dynamics/page.tsx     # 竞品动态页面（其他对话中更新）
app/marketing-calendar/page.tsx      # 营销日历页面（其他对话中更新）
scripts/news-crawler.js              # 核心：修改抓取链接和逻辑
scripts/crawl-and-save-daily.js      # 调整平台列表为6个
.gitignore                           # 添加wps-news-aggregator2/, scripts/*.log
package.json                         # 无实质变更
```

---

## 🔧 环境配置

### Supabase 配置
```bash
# 已配置的环境变量
NEXT_PUBLIC_SUPABASE_URL=https://sdxgocjszjnrqrfbsspn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...（完整key见.env.local）
```

### Firecrawl API
```bash
FIRECRAWL_API_KEY=fc-c34842bb4fd54a58a7b001c5369a3bcb
```

### GitHub Secrets（已配置）
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `FIRECRAWL_API_KEY`

---

## 📊 数据展示配置

### 首页6个平台卡片
| 平台 | 数据源 | 数据量 |
|-----|--------|--------|
| 百度热搜 | Firecrawl + 真实API | 10条 |
| 中新网教育 | Firecrawl + RSS | 10条 |
| 人民网重要讲话 | Firecrawl + 真实API | 10条 |
| 36氪 | 虚拟数据 | 3条 |
| 微博热搜 | 虚拟数据 | 3条 |
| 知乎热榜 | 虚拟数据 | 3条 |

**总计：39条新闻数据**

### 更新时间显示
- 使用数据库中的 `crawled_at` 字段
- 格式化为"月日 时:分"（如"10月16日 17:42"）
- 工具函数：`formatChineseDateTime()` in `lib/utils.ts`

---

## 🐛 已修复的问题

### 1. 百度热搜"查看更多"乱码
**错误：** 抓取到"查看更���>"这样的乱码标题

**修复：** 添加过滤规则
```javascript
if (title.length > 3 && title.length < 200 && 
    !title.includes('查看更多') && 
    !title.includes('查看更') &&
    !title.includes('百度') &&
    !/^查看/.test(title)) {
  // 有效标题
}
```

### 2. 中新网时间戳显示
**错误：** 标题包含"2025 16:39:55 +0800"等时间戳

**修复：** 正则清理
```javascript
.replace(/\d{4}\s+\d{2}:\d{2}:\d{2}\s+\+\d{4}/, '')  // 去除时间戳
```

### 3. 人民网导航链接
**错误：** 抓取到"中国共产党新闻网"等导航链接

**修复：** 添加到过滤关键词列表
```javascript
const filterKeywords = ['首页', '登录', '中国共产党新闻网', ...];
```

### 4. EdgeOne 部署失败
**错误：** `module not found: can't resolve '../extract-news-with-real-links.js'`

**原因：** `app/api/cron/daily-update/route.ts` 试图导入不存在的模块

**修复：** 将该文件重命名为 `app/api/cron.disabled/daily-update/route.ts`，因为定时任务已改用 GitHub Actions

---

## 📈 数据质量验证

### 测试命令
```bash
# 本地测试数据更新
npm run test:update

# 验证数据库内容
node -e "查询脚本..." # 见上文数据验证部分
```

### 验证结果
✅ **所有平台数据正常**
- 标题干净，无乱码
- 链接有效，可跳转
- 摘要简洁，无来源后缀
- 时间格式正确

---

## 🚀 部署状态

### Git 提交
```bash
Commit: 89b035a
Message: feat: 完整功能更新
Files: 16 files changed, 6692 insertions(+), 443 deletions(-)
Branch: main
Remote: origin/main
```

### GitHub Actions
- Workflow: `.github/workflows/daily-update.yml`
- 触发时间: 每天凌晨 00:00 (UTC+8)
- 最后运行: 2025-10-16 08:34 (成功)
- 状态: ✅ 正常运行

### 线上网站
- URL: https://ai.winsongu.com/
- 状态: ✅ 已部署最新版本
- 部署时间: 2025-10-16 ~15:10

---

## 💡 重要发现与经验

### 1. Firecrawl API 最佳实践
- ✅ 使用原生HTTP模块比SDK更稳定
- ✅ API Key 必须 `.trim()` 去除隐藏字符
- ✅ 设置合理的超时时间（30秒）
- ✅ 处理好错误回调和重试机制

### 2. RSS 数据处理
- ✅ RSS/XML 格式的Markdown解析需要特殊处理
- ✅ 正则表达式比标准链接匹配更灵活
- ✅ 注意处理中文编码和特殊字符

### 3. GitHub Secrets 管理
- ✅ 环境变量必须在 GitHub Actions 的 `env` 中显式声明
- ✅ Secrets 对大小写敏感
- ✅ 本地 `.env.local` 和 GitHub Secrets 需要保持同步

### 4. Next.js 开发技巧
- ✅ 使用 `"use client"` 标记客户端组件
- ✅ Toast 等 UI 组件使用 `useState` + `useEffect` 管理状态
- ✅ API Route 适合简单的服务端逻辑
- ✅ 定时任务推荐使用 GitHub Actions 而非 Next.js API

---

## 📝 待优化项

### 短期（1-2天）
- [ ] 监控 GitHub Actions 定时任务运行情况
- [ ] 观察 Firecrawl API 稳定性，必要时添加重试机制
- [ ] 优化数据库查询性能（添加索引）

### 中期（1周）
- [ ] 添加数据抓取失败的邮件/钉钉通知
- [ ] 实现数据变化监控（新闻热度变化趋势）
- [ ] 添加更多数据源（如微信公众号热文）

### 长期（1个月）
- [ ] 使用AI总结新闻内容
- [ ] 添加用户订阅功能
- [ ] 实现数据可视化图表
- [ ] 开发移动端适配优化

---

## 🔗 相关资源

### 文档链接
- [Firecrawl API 文档](https://docs.firecrawl.dev/)
- [Supabase 文档](https://supabase.com/docs)
- [GitHub Actions 文档](https://docs.github.com/actions)
- [Next.js 15 文档](https://nextjs.org/docs)

### 内部文档
- `BACKEND_SETUP.md` - 后端配置指南
- `docs/CALENDAR_GUIDE.md` - 日历功能使用指南
- `scripts/README.md` - 脚本使用说明

### 数据源文档
- `scripts/稻壳热点选题神器API与抓取内容源` - API和数据源清单

---

## 👥 团队协作

### 当前角色
- **开发者**：AI Assistant (Claude Sonnet 4.5)
- **产品负责人**：用户

### 沟通要点
- ✅ 使用中文沟通
- ✅ 优先实现功能，再优化体验
- ✅ 本地测试通过后再推送
- ✅ 保持文档更新

---

## 🎓 学习收获

1. **RSS/XML 数据处理**：不同格式需要不同的解析策略
2. **API 集成最佳实践**：原生实现有时比SDK更可控
3. **GitHub OAuth 权限**：workflow 文件需要特殊权限才能通过 API 创建
4. **Next.js 13+ App Router**：Server Components 和 Client Components 的区别
5. **Supabase 实时数据**：PostgreSQL + Real-time Subscriptions 的强大组合

---

## 📅 下次对话要点

如果上下文不够，快速回顾以下关键信息：

1. **数据源链接**：百度(`https://top.baidu.com/board?tab=realtime`)、中新网RSS、人民网(`https://jhsjk.people.cn/`)
2. **核心文件**：`scripts/news-crawler.js`、`app/page.tsx`、`components/ui/toast.tsx`
3. **Firecrawl**：使用原生 `https` 模块，不用 SDK
4. **摘要策略**：65字符以内，不带来源后缀
5. **GitHub Actions**：已配置定时任务，每天0点运行
6. **平台配置**：6个平台，前3个真实数据，后3个虚拟数据

---

**文档创建时间：** 2025-10-16 18:00  
**最后更新：** 2025-10-16 18:00  
**版本：** v1.0  
**状态：** ✅ 已完成

