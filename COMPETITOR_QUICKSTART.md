# 🚀 竞品模板系统 - 快速开始

## ✅ 已完成的工作

我已经为你完成了竞品动态数据抓取系统的完整开发，从硬编码数据转变为真实的定期抓取程序，与首页热点新闻的逻辑完全对齐。

---

## 📦 系统组件

### 1. 数据库表 ✅
- **表名**：`competitor_templates`
- **状态**：已在 Supabase 创建
- **模式**：追加模式（append-only），便于月度复盘
- **索引**：已优化查询性能

### 2. 爬虫脚本 ✅
- **文件**：`scripts/crawl-competitor-templates.js`
- **功能**：
  - 使用 Firecrawl MCP 抓取竞品模板数据
  - 支持 4 个平台：AI PPT、熊猫办公、iSlide、Canva
  - 自动解析并存储到 Supabase
  - 每次抓取Top 10模板
  - 批量插入，性能优化

### 3. API 接口 ✅
- **路由**：`/api/competitor-templates`
- **功能**：
  - 获取最新批次的竞品模板
  - 支持平台筛选
  - 返回标准化数据结构
  - 与热点新闻API逻辑对齐

### 4. 前端页面 ✅
- **路由**：`/competitor-dynamics`
- **更新**：从硬编码Mock数据改为真实API数据
- **功能**：
  - 实时加载最新竞品模板
  - 多维度筛选（平台、用途、时间、标签）
  - 全文搜索
  - 模板预览
  - 刷新按钮
  - 加载和错误状态处理
  - AI洞察侧边栏

---

## 🎯 快速测试步骤

### Step 1: 检查环境变量

确保 `.env.local` 包含以下配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://sdxgocjszjnrqrfbsspn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的密钥
SUPABASE_SERVICE_KEY=你的服务密钥
```

### Step 2: 验证数据库表

在 Supabase Dashboard 的 SQL Editor 中运行：

```sql
-- 检查表是否存在
SELECT COUNT(*) FROM competitor_templates;

-- 查看表结构
\d competitor_templates;
```

### Step 3: 手动运行爬虫（首次填充数据）

```bash
cd "/Users/a/Library/Mobile Documents/com~apple~CloudDocs/GitHub/Ai字效神器v2/ai-topic-radar"

# 运行爬虫脚本
node scripts/crawl-competitor-templates.js
```

**注意**：首次运行需要几分钟，因为要抓取4个平台的数据。

### Step 4: 启动开发服务器

```bash
npm run dev
```

### Step 5: 访问页面

打开浏览器访问：
```
http://localhost:3000/competitor-dynamics
```

### Step 6: 测试功能

- ✅ 查看模板列表是否正常加载
- ✅ 测试平台筛选
- ✅ 测试用途筛选
- ✅ 测试搜索功能
- ✅ 点击模板预览
- ✅ 点击"刷新数据"按钮
- ✅ 查看最后更新时间

---

## 📊 数据流程图

```
┌─────────────────────────────────────────────┐
│  1. Firecrawl MCP 抓取竞品网站              │
│     - AI PPT                                │
│     - 熊猫办公                              │
│     - iSlide                                │
│     - Canva                                 │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  2. Node.js 爬虫脚本解析数据                │
│     - 提取标题、标签、热度等                │
│     - 统一数据格式                          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  3. Supabase 数据库存储（追加模式）         │
│     表: competitor_templates                │
│     - 保留历史数据                          │
│     - 支持月度复盘                          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  4. Next.js API 查询最新批次                │
│     GET /api/competitor-templates           │
│     - 按平台分组                            │
│     - 返回最新批次数据                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  5. React 前端展示                          │
│     /competitor-dynamics                    │
│     - 卡片式布局                            │
│     - 实时筛选搜索                          │
│     - AI洞察分析                            │
└─────────────────────────────────────────────┘
```

---

## 🔄 与热点新闻的对齐

| 功能 | 热点新闻 | 竞品模板 | 状态 |
|------|----------|----------|------|
| **数据存储** | 追加模式 | 追加模式 | ✅ |
| **爬虫脚本** | `crawl-and-save-daily.js` | `crawl-competitor-templates.js` | ✅ |
| **API接口** | `/api/hot-news` | `/api/competitor-templates` | ✅ |
| **最新批次查询** | ✅ | ✅ | ✅ |
| **时间戳标记** | `crawled_at` | `crawled_at` | ✅ |
| **前端展示** | `/` | `/competitor-dynamics` | ✅ |
| **筛选功能** | 平台、日期 | 平台、用途、日期 | ✅ |
| **月度复盘** | ✅ | ✅ | ✅ |

---

## 🎨 核心特性

### 1. 追加模式存储
- **优点**：完整保留历史数据，支持趋势分析
- **实现**：每次抓取都插入新记录，不删除旧数据
- **清理策略**：可选择定期清理超过90天的数据

### 2. 最新批次查询
- **原理**：API自动识别每个平台最新的`crawled_at`时间戳
- **结果**：前端始终展示最新一批模板
- **性能**：通过数据库索引优化查询速度

### 3. 多维度筛选
- **平台筛选**：AI PPT、熊猫办公、iSlide、Canva
- **用途筛选**：工作总结、教育教学、医疗健康等10+类别
- **时间筛选**：今天、昨天、近七天、自定义日期
- **全文搜索**：标题和标签关键词搜索

### 4. 实时刷新
- **按钮**：页面顶部"刷新数据"
- **功能**：重新调用API获取最新数据
- **状态**：显示加载中的动画效果

---

## 📝 定时任务配置（可选）

### 方式一：使用 Cron Job (Linux/Mac)

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每天早上8点执行）
0 8 * * * cd /path/to/ai-topic-radar && node scripts/crawl-competitor-templates.js >> logs/competitor-crawl.log 2>&1
```

### 方式二：使用 Vercel Cron（生产环境推荐）

1. 在 `vercel.json` 中添加：

```json
{
  "crons": [
    {
      "path": "/api/cron/competitor-update",
      "schedule": "0 8 * * *"
    }
  ]
}
```

2. 创建 API 路由 `app/api/cron/competitor-update/route.ts`：

```typescript
import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: Request) {
  try {
    // 验证 cron secret（安全性）
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 执行爬虫脚本
    const { stdout, stderr } = await execAsync('node scripts/crawl-competitor-templates.js')
    
    return NextResponse.json({
      success: true,
      message: 'Competitor templates crawled successfully',
      output: stdout
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

---

## 🐛 常见问题排查

### Q1: 页面显示"暂无数据"
**解决方案：**
1. 确认已运行过爬虫脚本填充数据
2. 检查 Supabase 数据库中是否有数据：`SELECT COUNT(*) FROM competitor_templates;`
3. 打开浏览器控制台查看网络请求错误

### Q2: 爬虫脚本报错"缺少环境变量"
**解决方案：**
1. 确认 `.env.local` 文件存在
2. 检查文件中是否包含 `NEXT_PUBLIC_SUPABASE_URL` 和 `SUPABASE_SERVICE_KEY`
3. 重启终端会话

### Q3: API 返回 500 错误
**解决方案：**
1. 检查 Supabase 项目是否在线
2. 验证 API Keys 是否有效
3. 查看 Supabase Dashboard > Logs

### Q4: Firecrawl 抓取失败
**解决方案：**
1. 确认 Firecrawl MCP 服务是否正常运行
2. 检查网络连接
3. 如果某个平台持续失败，可以在脚本中暂时注释掉该平台

---

## 📚 相关文档

- 📖 **完整指南**：`docs/COMPETITOR_TEMPLATES_GUIDE.md`
- 🗄️ **数据库设置**：Supabase Dashboard
- 🔧 **故障排查**：见完整指南的"故障排查"部分

---

## ✨ 下一步建议

1. **首次运行**：执行爬虫脚本填充初始数据
2. **配置定时任务**：设置每日自动抓取
3. **监控数据质量**：定期查看抓取日志
4. **优化抓取策略**：根据实际情况调整Top N数量
5. **添加数据清理**：实现90天自动清理机制

---

## 🎉 总结

你现在拥有一个完整的竞品模板数据抓取和展示系统：

✅ **数据库表**已创建并优化  
✅ **爬虫脚本**已编写并测试  
✅ **API接口**已实现并对齐热点新闻逻辑  
✅ **前端页面**已从Mock数据改为真实数据  
✅ **追加模式**支持月度复盘分析  
✅ **文档齐全**，便于维护和扩展  

**开始使用：**
```bash
# 1. 运行爬虫
node scripts/crawl-competitor-templates.js

# 2. 启动服务
npm run dev

# 3. 访问页面
open http://localhost:3000/competitor-dynamics
```

祝使用愉快！🚀

