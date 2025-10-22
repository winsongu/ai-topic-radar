# 竞品模板抓取系统 - 完整指南

## 📋 系统概述

本系统实现了竞品PPT模板数据的自动化抓取、存储和展示，采用追加模式存储数据以便月度复盘分析。

**支持的竞品平台：**
- ✅ AI PPT (https://www.aippt.cn/template/)
- ✅ 熊猫办公 (https://www.tukuppt.com/ppt/)
- ✅ iSlide (https://www.islide.cc/ppt/template)
- ⚠️ Canva (需要进一步优化抓取策略)

---

## 🏗️ 系统架构

```
┌─────────────────┐
│  Firecrawl MCP  │  ← 抓取服务
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  爬虫脚本       │  ← scripts/crawl-competitor-templates.js
│  (Node.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Supabase DB   │  ← competitor_templates 表（追加模式）
│  (PostgreSQL)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js API    │  ← /api/competitor-templates
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  前端页面       │  ← /competitor-dynamics
│  (React)        │
└─────────────────┘
```

---

## 📊 数据库表结构

### `competitor_templates` 表

```sql
CREATE TABLE competitor_templates (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,                      -- 模板标题
  type TEXT,                                -- 页数，如 "17P"
  format TEXT,                              -- 格式标识，如 "PPTX"
  usage TEXT,                               -- 用途/行业
  platform TEXT NOT NULL,                   -- 平台名称
  tags TEXT[],                              -- 标签数组
  date TEXT,                                -- 入库时间
  hot_value INTEGER DEFAULT 0,              -- 热度值/人气值
  url TEXT,                                 -- 模板链接
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- 抓取时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引（已自动创建）
CREATE INDEX idx_competitor_templates_platform_crawled ON competitor_templates(platform, crawled_at DESC);
CREATE INDEX idx_competitor_templates_crawled_at ON competitor_templates(crawled_at DESC);
CREATE INDEX idx_competitor_templates_platform_hot ON competitor_templates(platform, hot_value DESC);
```

---

## ⚙️ 环境配置

### 1. 环境变量设置

在项目根目录创建 `.env.local` 文件（如果没有的话）：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_KEY=你的Supabase服务密钥（用于后台脚本）

# 可选：如果有 Firecrawl API Key
FIRECRAWL_API_KEY=你的Firecrawl密钥
```

**获取 Supabase 密钥的步骤：**
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 Settings > API
4. 复制 URL 和 Keys

### 2. 数据库初始化

数据库表已通过 MCP 工具自动创建。如需手动创建，请在 Supabase SQL Editor 中执行：

```sql
-- 见上方"数据库表结构"部分的 SQL
```

---

## 🚀 使用方法

### 方式一：手动运行爬虫脚本

```bash
# 进入项目目录
cd /path/to/ai-topic-radar

# 运行爬虫脚本
node scripts/crawl-competitor-templates.js
```

**预期输出：**
```
🚀 开始抓取竞品模板数据...
当前时间: 2025-10-22 10:30:00

📊 [1/4] 正在抓取: AI PPT
   🔍 URL: https://www.aippt.cn/template/
   ✅ 抓取成功: 10 个模板
   💾 数据已保存到数据库

📊 [2/4] 正在抓取: 熊猫办公
   ...

✅ 所有平台抓取完成！
总计: 40 个新模板已保存
```

### 方式二：设置定时任务（推荐）

**使用 cron（Linux/Mac）：**

```bash
# 编辑 crontab
crontab -e

# 每天早上8点执行
0 8 * * * cd /path/to/ai-topic-radar && node scripts/crawl-competitor-templates.js >> logs/competitor-crawl.log 2>&1
```

**使用 Vercel Cron（生产环境）：**

在 `vercel.json` 中添加：

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

然后创建对应的 API 路由 `app/api/cron/competitor-update/route.ts`。

---

## 🌐 API 使用

### GET `/api/competitor-templates`

获取最新批次的竞品模板数据。

**查询参数：**
- `platform`（可选）：平台筛选 - `aippt`, `tukuppt`, `islide`, `canva`
- `limit`（可选）：每个平台返回的数量，默认 10

**响应示例：**

```json
{
  "success": true,
  "data": {
    "platforms": [
      {
        "id": "aippt",
        "name": "AI PPT",
        "templates": [
          {
            "id": 1,
            "title": "黄色卡通创意风假期综合征通用模板",
            "type": "19P",
            "format": "PPTX",
            "usage": "教育教学",
            "platform": "AIPPT",
            "tags": ["教育", "卡通", "创意"],
            "hot_value": 1234,
            "url": "https://...",
            "crawled_at": "2025-10-22T02:30:00Z"
          }
        ],
        "updateTime": "2025-10-22T02:30:00Z",
        "totalCount": 10
      }
    ]
  }
}
```

---

## 📱 前端页面功能

访问 `/competitor-dynamics` 查看竞品动态页面。

**核心功能：**
- ✅ 实时展示最新抓取的竞品模板
- ✅ 多维度筛选（平台、用途、时间）
- ✅ 全文搜索（标题、标签）
- ✅ 模板预览对话框
- ✅ AI洞察侧边栏（趋势分析、热门类别）
- ✅ 响应式设计（支持移动端）
- ✅ 自动刷新按钮

---

## 🔧 故障排查

### 问题1：环境变量未配置

**错误信息：**
```
❌ 错误: 缺少 Supabase 环境变量
```

**解决方案：**
1. 确认 `.env.local` 文件存在
2. 检查文件中是否包含所有必需的变量
3. 重启开发服务器：`npm run dev`

### 问题2：数据库连接失败

**错误信息：**
```
Error fetching competitor data: Failed to fetch
```

**解决方案：**
1. 检查 Supabase 项目是否在线
2. 验证 API Keys 是否正确
3. 检查数据库表 `competitor_templates` 是否存在
4. 查看 Supabase Dashboard > Logs

### 问题3：Firecrawl 抓取失败

**错误信息：**
```
⚠️ 抓取失败: [平台名称]
```

**可能原因：**
- 目标网站结构变更
- 网络连接问题
- Firecrawl MCP 服务未运行

**解决方案：**
1. 检查 Firecrawl MCP 是否正常运行
2. 手动访问目标URL确认页面可访问
3. 如需要，调整 `scripts/crawl-competitor-templates.js` 中的解析逻辑

### 问题4：前端显示"暂无数据"

**可能原因：**
- 数据库中确实没有数据
- API 请求失败

**解决方案：**
1. 先运行一次爬虫脚本填充数据
2. 检查浏览器控制台的网络请求
3. 验证 API 路由是否正常工作

---

## 📈 数据分析

由于采用**追加模式**存储，可以进行历史趋势分析：

### 查询月度热门模板

```sql
SELECT 
  platform,
  title,
  hot_value,
  crawled_at::DATE as date
FROM competitor_templates
WHERE crawled_at >= NOW() - INTERVAL '30 days'
ORDER BY hot_value DESC
LIMIT 20;
```

### 统计各平台活跃度

```sql
SELECT 
  platform,
  COUNT(*) as total_templates,
  AVG(hot_value) as avg_hot_value,
  MAX(crawled_at) as last_crawl
FROM competitor_templates
WHERE crawled_at >= NOW() - INTERVAL '30 days'
GROUP BY platform
ORDER BY total_templates DESC;
```

### 热门标签排行

```sql
SELECT 
  UNNEST(tags) as tag,
  COUNT(*) as count
FROM competitor_templates
WHERE crawled_at >= NOW() - INTERVAL '30 days'
GROUP BY tag
ORDER BY count DESC
LIMIT 20;
```

---

## 🗑️ 数据清理

为避免数据库无限膨胀，建议定期清理旧数据：

```sql
-- 删除90天前的数据
DELETE FROM competitor_templates 
WHERE crawled_at < NOW() - INTERVAL '90 days';

-- 查看表大小
SELECT pg_size_pretty(pg_total_relation_size('competitor_templates'));
```

或在脚本中添加自动清理逻辑（类似 `hot_news` 表的清理机制）。

---

## 🎯 未来优化方向

### 短期优化
- [ ] 添加更多竞品平台（如：包图网、觅知网）
- [ ] 优化 Canva 抓取逻辑
- [ ] 实现增量抓取（只抓取新增模板）
- [ ] 添加数据去重逻辑

### 中期优化
- [ ] 实现模板封面图自动下载和存储
- [ ] 添加模板热度变化趋势分析
- [ ] 接入 AI 自动生成标签
- [ ] 实现模板相似度对比

### 长期优化
- [ ] 构建竞品模板知识图谱
- [ ] AI 驱动的选题建议系统
- [ ] 自动化月度竞品分析报告
- [ ] 集成推送通知（热点模板预警）

---

## 📞 技术支持

如遇到问题，请检查：
1. 本文档的"故障排查"部分
2. 项目根目录的 `README.md`
3. Supabase 官方文档：https://supabase.com/docs

---

**更新日期：** 2025-10-22  
**版本：** v1.0.0  
**维护者：** AI Topic Radar Team

