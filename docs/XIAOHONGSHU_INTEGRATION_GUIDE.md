# 小红书博主监控集成指南

## 📋 概述

本文档介绍如何将 MediaCrawler 项目集成到现有系统中，实现小红书博主动态监控功能。

---

## 🏗️ 架构设计

### 整体架构

```
主项目 (Next.js)          MediaCrawler (Python)
    │                           │
    ├── 前端展示页面            ├── 小红书扫码登录
    ├── API接口                ├── 定时爬取博主数据
    ├── Supabase数据库 ←──────┤ 数据同步脚本
    │   └── xiaohongshu_posts  └── 本地SQLite存储
    └── 定时任务触发
```

### 数据流程

1. **MediaCrawler** 每天自动爬取小红书博主笔记
2. **数据同步脚本** 将数据从 SQLite 同步到 Supabase
3. **Next.js API** 从 Supabase 读取数据
4. **前端页面** 展示博主动态

---

## 🎯 部署方案对比

### 方案一：Local 模式（推荐）✅

**部署位置**：与主项目并行的独立目录

```bash
GitHub/Ai字效神器v2/
├── ai-topic-radar/              # 主项目
└── MediaCrawler/                # 独立部署
    ├── main.py
    ├── config/
    └── data/
```

**优点**：
- ✅ 完全隔离，互不影响
- ✅ 可以独立更新和维护
- ✅ 符合微服务架构理念
- ✅ 便于单独调试和测试

**缺点**：
- ⚠️ 需要单独管理两个项目
- ⚠️ 需要编写数据同步脚本

---

### 方案二：Worktree 模式（不推荐）❌

**说明**：将 MediaCrawler 作为 Git Worktree 或 Submodule

**为什么不推荐**：
- ❌ 技术栈完全不同（Python vs JavaScript）
- ❌ 依赖环境冲突（Python venv vs Node.js）
- ❌ 增加项目复杂度
- ❌ Git 管理混乱

---

## 📦 安装部署（Local 模式）

### Step 1: 克隆 MediaCrawler

```bash
# 进入项目父目录
cd "/Users/a/Library/Mobile Documents/com~apple~CloudDocs/GitHub/Ai字效神器v2"

# 克隆 MediaCrawler
git clone https://github.com/NanmiCoder/MediaCrawler.git
cd MediaCrawler
```

### Step 2: 创建 Python 虚拟环境

```bash
# 创建虚拟环境（需要 Python 3.9+）
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows
```

### Step 3: 安装依赖

```bash
# 安装 Python 依赖
pip install -r requirements.txt

# 安装 Playwright 浏览器驱动
playwright install
```

### Step 4: 配置 MediaCrawler

编辑 `config/base_config.py`：

```python
# 平台配置 - 只启用小红书
PLATFORM = "xhs"  # xhs = 小红书

# 爬取类型
CRAWLER_TYPE = "search"  # search=搜索关键词, detail=指定笔记

# 是否开启评论爬取
ENABLE_GET_COMMENTS = True  # 根据需求开启

# 搜索关键词列表
KEYWORDS = [
    "PPT模板",
    "职场办公",
    "设计素材",
    # 添加你想监控的关键词
]

# 数据存储方式
SAVE_DATA_OPTION = "sqlite"  # sqlite 或 db(MySQL)
```

### Step 5: 首次登录

```bash
# 运行爬虫（首次需要扫码登录）
python main.py --platform xhs --lt qrcode --type search

# 打开小红书 APP 扫描终端显示的二维码
# 登录成功后会保存 Cookie，后续无需重复登录
```

---

## 🗄️ 数据库集成

### Step 1: 在 Supabase 创建表

在 Supabase Dashboard > SQL Editor 中执行：

```sql
-- 小红书博主笔记表
CREATE TABLE IF NOT EXISTS xiaohongshu_posts (
  id BIGSERIAL PRIMARY KEY,
  note_id TEXT UNIQUE NOT NULL,  -- 小红书笔记ID
  title TEXT NOT NULL,
  desc TEXT,  -- 笔记描述
  type TEXT,  -- 类型：normal, video
  author_id TEXT,  -- 博主ID
  author_name TEXT,  -- 博主昵称
  avatar_url TEXT,  -- 博主头像
  note_url TEXT,  -- 笔记链接
  thumbnail TEXT,  -- 封面图
  liked_count INTEGER DEFAULT 0,  -- 点赞数
  collected_count INTEGER DEFAULT 0,  -- 收藏数
  comment_count INTEGER DEFAULT 0,  -- 评论数
  share_count INTEGER DEFAULT 0,  -- 分享数
  tags TEXT[] DEFAULT '{}',  -- 标签数组
  ip_location TEXT,  -- IP属地
  published_at TIMESTAMPTZ,  -- 发布时间
  crawled_at TIMESTAMPTZ DEFAULT NOW(),  -- 爬取时间
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_xhs_note_id ON xiaohongshu_posts(note_id);
CREATE INDEX IF NOT EXISTS idx_xhs_author_id ON xiaohongshu_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_xhs_crawled_at ON xiaohongshu_posts(crawled_at DESC);

-- 小红书评论表（可选）
CREATE TABLE IF NOT EXISTS xiaohongshu_comments (
  id BIGSERIAL PRIMARY KEY,
  comment_id TEXT UNIQUE NOT NULL,
  note_id TEXT NOT NULL,  -- 关联笔记
  content TEXT,
  user_id TEXT,
  user_name TEXT,
  liked_count INTEGER DEFAULT 0,
  sub_comment_count INTEGER DEFAULT 0,  -- 回复数
  ip_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xhs_comment_note_id ON xiaohongshu_comments(note_id);
```

### Step 2: 编写数据同步脚本

在主项目 `scripts/` 目录下创建同步脚本：

```bash
touch scripts/sync-xiaohongshu-data.js
```

---

## 🔄 数据同步脚本

### 创建同步脚本

在 `scripts/sync-xiaohongshu-data.js` 中：

```javascript
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// MediaCrawler SQLite 数据库路径
const MEDIACRAWLER_DB_PATH = path.join(
  __dirname,
  '../../MediaCrawler/data/xhs/xhs.db'
)

/**
 * 从 MediaCrawler SQLite 读取数据
 */
async function readFromSQLite() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(MEDIACRAWLER_DB_PATH, (err) => {
      if (err) reject(err)
    })
    
    // 查询最近24小时的笔记
    const query = `
      SELECT * FROM xhs_note 
      WHERE create_time >= datetime('now', '-1 day')
      ORDER BY create_time DESC
    `
    
    db.all(query, [], (err, rows) => {
      if (err) reject(err)
      db.close()
      resolve(rows)
    })
  })
}

/**
 * 同步到 Supabase
 */
async function syncToSupabase(posts) {
  const records = posts.map(post => ({
    note_id: post.note_id,
    title: post.title,
    desc: post.desc,
    type: post.type,
    author_id: post.user_id,
    author_name: post.nickname,
    avatar_url: post.avatar,
    note_url: post.note_url,
    thumbnail: post.image_list?.[0],
    liked_count: post.liked_count || 0,
    collected_count: post.collected_count || 0,
    comment_count: post.comment_count || 0,
    share_count: post.share_count || 0,
    tags: post.tag_list ? JSON.parse(post.tag_list) : [],
    ip_location: post.ip_location,
    published_at: post.time,
    crawled_at: new Date().toISOString()
  }))
  
  // 使用 upsert 避免重复
  const { data, error } = await supabase
    .from('xiaohongshu_posts')
    .upsert(records, { 
      onConflict: 'note_id',
      ignoreDuplicates: false 
    })
  
  if (error) throw error
  return data
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始同步小红书数据...')
    
    // 1. 从 SQLite 读取
    console.log('📖 读取 MediaCrawler 数据...')
    const posts = await readFromSQLite()
    console.log(`✅ 读取到 ${posts.length} 条笔记`)
    
    if (posts.length === 0) {
      console.log('⚠️ 没有新数据需要同步')
      return
    }
    
    // 2. 同步到 Supabase
    console.log('💾 同步到 Supabase...')
    await syncToSupabase(posts)
    console.log(`✅ 成功同步 ${posts.length} 条数据`)
    
    console.log('🎉 同步完成！')
  } catch (error) {
    console.error('❌ 同步失败:', error)
    process.exit(1)
  }
}

main()
```

### 添加依赖

```bash
# 在主项目根目录
npm install sqlite3
```

---

## ⏰ 定时任务配置

### 方案一：GitHub Actions（推荐）

创建 `.github/workflows/xiaohongshu-crawler.yml`：

```yaml
name: 小红书数据爬取

on:
  schedule:
    # 每天上午 8:00 UTC (北京时间 16:00) 执行
    - cron: '0 8 * * *'
  workflow_dispatch:  # 允许手动触发

jobs:
  crawl-and-sync:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout 主项目
        uses: actions/checkout@v4
        with:
          path: ai-topic-radar
      
      - name: Checkout MediaCrawler
        uses: actions/checkout@v4
        with:
          repository: NanmiCoder/MediaCrawler
          path: MediaCrawler
      
      - name: 设置 Python 环境
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: 安装 Python 依赖
        run: |
          cd MediaCrawler
          pip install -r requirements.txt
          playwright install chromium
      
      - name: 运行爬虫
        env:
          XHS_COOKIE: ${{ secrets.XHS_COOKIE }}  # 需要在 GitHub Secrets 配置
        run: |
          cd MediaCrawler
          python main.py --platform xhs --type search
      
      - name: 设置 Node.js 环境
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: 同步数据到 Supabase
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: |
          cd ai-topic-radar
          npm install
          node scripts/sync-xiaohongshu-data.js
```

### 方案二：本地定时任务（macOS）

```bash
# 创建 crontab 任务
crontab -e

# 添加定时任务（每天 16:00 执行）
0 16 * * * cd "/Users/a/Library/Mobile Documents/com~apple~CloudDocs/GitHub/Ai字效神器v2/MediaCrawler" && source venv/bin/activate && python main.py --platform xhs --type search >> logs/crawler.log 2>&1

# 同步数据到 Supabase（16:30 执行）
30 16 * * * cd "/Users/a/Library/Mobile Documents/com~apple~CloudDocs/GitHub/Ai字效神器v2/ai-topic-radar" && node scripts/sync-xiaohongshu-data.js >> logs/sync.log 2>&1
```

---

## 🎨 前端页面开发

### Step 1: 创建 API 接口

`app/api/xiaohongshu/route.ts`：

```typescript
import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const authorId = searchParams.get('author_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const supabase = createClient()
    
    let query = supabase
      .from('xiaohongshu_posts')
      .select('*')
      .order('crawled_at', { ascending: false })
      .limit(limit)
    
    if (authorId) {
      query = query.eq('author_id', authorId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })
  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

### Step 2: 创建前端页面

`app/xiaohongshu-dynamics/page.tsx` （参考 `competitor-dynamics/page.tsx` 的结构）

---

## 📝 配置说明

### MediaCrawler 关键配置

在 `MediaCrawler/config/base_config.py` 中：

```python
# 1. 平台配置
PLATFORM = "xhs"

# 2. 爬取类型
CRAWLER_TYPE = "search"  # 或 "detail" 指定笔记ID

# 3. 搜索关键词
KEYWORDS = [
    "PPT模板",
    "办公效率",
    "职场技能"
]

# 4. 是否爬取评论
ENABLE_GET_COMMENTS = True

# 5. 数据保存方式
SAVE_DATA_OPTION = "sqlite"  # 推荐使用 SQLite

# 6. 爬取页数
CRAWLER_MAX_NOTES_COUNT = 20  # 每个关键词爬取的笔记数量
```

---

## 🔐 安全注意事项

### 1. Cookie 管理

MediaCrawler 登录后会保存 Cookie 到本地文件：
- 路径：`MediaCrawler/browser_data/`
- ⚠️ **不要** 提交到 Git
- 在 `.gitignore` 中添加：`MediaCrawler/browser_data/`

### 2. 环境变量

不要在代码中硬编码敏感信息，使用 `.env` 文件：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. 爬虫频率控制

- 建议每天爬取 1-2 次
- 避免高频请求被封号
- 遵守平台 robots.txt

---

## 🐛 常见问题

### Q1: 登录失败或 Cookie 过期

**解决方案**：
```bash
# 删除旧的 Cookie
rm -rf MediaCrawler/browser_data/

# 重新扫码登录
cd MediaCrawler
python main.py --platform xhs --lt qrcode --type search
```

### Q2: Playwright 浏览器安装失败

**解决方案**：
```bash
# 手动安装 Chromium
playwright install chromium

# 如果网络问题，设置镜像
export PLAYWRIGHT_DOWNLOAD_HOST=https://playwright.azureedge.net
playwright install
```

### Q3: SQLite 数据库路径找不到

**解决方案**：
```bash
# 检查 MediaCrawler 数据目录
ls -la MediaCrawler/data/xhs/

# 确认 xhs.db 文件存在
file MediaCrawler/data/xhs/xhs.db
```

### Q4: 数据同步脚本报错

**解决方案**：
```bash
# 检查 sqlite3 模块是否安装
npm list sqlite3

# 重新安装
npm install sqlite3 --save
```

---

## 📊 监控与维护

### 1. 查看爬取日志

```bash
# MediaCrawler 日志
tail -f MediaCrawler/logs/crawler.log

# 同步脚本日志
tail -f ai-topic-radar/logs/sync.log
```

### 2. 数据质量检查

```sql
-- 在 Supabase SQL Editor 中
-- 查看最近爬取的数据
SELECT 
  COUNT(*) as total,
  MAX(crawled_at) as last_crawl,
  COUNT(DISTINCT author_id) as unique_authors
FROM xiaohongshu_posts
WHERE crawled_at >= NOW() - INTERVAL '7 days';
```

### 3. 定期清理旧数据

```sql
-- 删除 90 天前的数据
DELETE FROM xiaohongshu_posts
WHERE crawled_at < NOW() - INTERVAL '90 days';
```

---

## 🚀 快速启动检查清单

- [ ] 克隆 MediaCrawler 到并行目录
- [ ] 创建 Python 虚拟环境并安装依赖
- [ ] 配置 `config/base_config.py`
- [ ] 首次扫码登录小红书
- [ ] 在 Supabase 创建数据表
- [ ] 创建数据同步脚本
- [ ] 配置定时任务（GitHub Actions 或 Crontab）
- [ ] 创建 API 接口和前端页面
- [ ] 测试完整数据流程

---

## 📚 相关文档

- [MediaCrawler 官方文档](https://nanmicoder.github.io/MediaCrawler/)
- [Supabase 文档](https://supabase.com/docs)
- [Playwright 文档](https://playwright.dev/)

---

## 💡 扩展建议

### 1. 监控特定博主

修改 MediaCrawler 配置为 `detail` 模式，指定博主的笔记列表。

### 2. 添加评论分析

启用 `ENABLE_GET_COMMENTS = True`，同步评论数据到 `xiaohongshu_comments` 表。

### 3. 数据可视化

在前端添加：
- 博主活跃度趋势图
- 热门话题词云
- 笔记互动数据对比

### 4. 智能推荐

基于爬取的数据，使用 AI 分析热门内容特征，为创作者提供选题建议。

---

**集成完成后，您将拥有：**
- ✅ 自动化的小红书数据爬取
- ✅ 统一的数据存储和管理
- ✅ 可视化的博主动态监控
- ✅ 完整的数据分析能力

