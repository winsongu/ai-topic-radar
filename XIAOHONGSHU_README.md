# 小红书博主监控 - 快速开始

## 📚 文档索引

| 文档 | 说明 | 适用场景 |
|------|------|---------|
| 📖 [快速决策指南](docs/XIAOHONGSHU_QUICK_DECISION.md) | **5分钟**了解是否应该集成 | 决策阶段 |
| 📘 [完整集成指南](docs/XIAOHONGSHU_INTEGRATION_GUIDE.md) | **详细步骤**和配置说明 | 实施阶段 |
| 📄 本文档 | **超快速**开始（仅核心步骤） | 快速上手 |

---

## ⚡ 超快速开始（30分钟）

### 前置条件

- ✅ Python 3.9+
- ✅ Node.js 18+
- ✅ Supabase 账户
- ✅ 小红书账号（用于扫码登录）

---

## 🚀 Step 1: 部署 MediaCrawler（15分钟）

```bash
# 1. 克隆项目到并行目录
cd "/Users/a/Library/Mobile Documents/com~apple~CloudDocs/GitHub/Ai字效神器v2"
git clone https://github.com/NanmiCoder/MediaCrawler.git
cd MediaCrawler

# 2. 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 3. 安装依赖
pip install -r requirements.txt
playwright install

# 4. 配置文件
vim config/base_config.py
```

**关键配置**：

```python
PLATFORM = "xhs"                    # 小红书平台
CRAWLER_TYPE = "search"             # 搜索模式
KEYWORDS = ["PPT模板", "职场办公"]  # 监控关键词
ENABLE_GET_COMMENTS = True          # 爬取评论
SAVE_DATA_OPTION = "sqlite"         # SQLite存储
```

```bash
# 5. 扫码登录（首次）
python main.py --platform xhs --lt qrcode --type search
# 用小红书 APP 扫描终端二维码

# 6. 验证数据
ls -lh data/xhs/xhs.db
```

---

## 🗄️ Step 2: 创建数据表（5分钟）

在 **Supabase Dashboard > SQL Editor** 中执行：

```bash
# 打开 SQL 文件
cat scripts/create-xiaohongshu-tables.sql
```

复制内容并在 Supabase 执行，创建：
- ✅ `xiaohongshu_posts` 表
- ✅ `xiaohongshu_comments` 表
- ✅ 索引和触发器

---

## 🔄 Step 3: 数据同步（10分钟）

```bash
# 1. 回到主项目
cd "/Users/a/Library/Mobile Documents/com~apple~CloudDocs/GitHub/Ai字效神器v2/ai-topic-radar"

# 2. 安装依赖
npm install sqlite3

# 3. 运行同步脚本
npm run update:xiaohongshu
# 或
node scripts/sync-xiaohongshu-data.js
```

**预期输出**：

```
🚀 小红书数据同步脚本
====================================================
📖 读取 MediaCrawler 笔记数据...
✅ 读取到 20 条笔记
💾 同步笔记到 Supabase...
✅ 成功同步 20 条笔记
🎉 数据同步完成！
```

---

## ✅ 验证集成

### 在 Supabase 中查询：

```sql
-- 查看笔记数量
SELECT COUNT(*) FROM xiaohongshu_posts;

-- 查看最新笔记
SELECT title, author_name, liked_count, published_at 
FROM xiaohongshu_posts 
ORDER BY published_at DESC 
LIMIT 5;

-- 统计博主数量
SELECT COUNT(DISTINCT author_id) as unique_authors 
FROM xiaohongshu_posts;
```

---

## ⏰ 配置定时任务

### 方案 A: macOS Crontab（本地）

```bash
# 编辑 crontab
crontab -e

# 添加任务（每天下午4点执行）
# MediaCrawler 爬取
0 16 * * * cd "/Users/a/Library/Mobile Documents/com~apple~CloudDocs/GitHub/Ai字效神器v2/MediaCrawler" && source venv/bin/activate && python main.py --platform xhs --type search >> logs/crawler.log 2>&1

# 数据同步（30分钟后）
30 16 * * * cd "/Users/a/Library/Mobile Documents/com~apple~CloudDocs/GitHub/Ai字效神器v2/ai-topic-radar" && node scripts/sync-xiaohongshu-data.js >> logs/sync-xhs.log 2>&1
```

### 方案 B: GitHub Actions（云端）

详见 [完整集成指南](docs/XIAOHONGSHU_INTEGRATION_GUIDE.md#定时任务配置)

---

## 🎨 前端开发（下一步）

### 1. 创建 API 接口

`app/api/xiaohongshu/route.ts` - 参考 `app/api/competitor-templates/route.ts`

### 2. 创建前端页面

`app/xiaohongshu-dynamics/page.tsx` - 参考 `app/competitor-dynamics/page.tsx`

### 3. 添加导航链接

在 `components/navigation.tsx` 中添加小红书动态入口

---

## 🐛 常见问题速查

| 问题 | 解决方案 |
|------|---------|
| **Cookie 过期** | `rm -rf MediaCrawler/browser_data/` 重新登录 |
| **SQLite 找不到** | 先运行 MediaCrawler 爬取数据 |
| **Playwright 安装失败** | `playwright install chromium` |
| **同步脚本报错** | `npm install sqlite3` |
| **数据库表不存在** | 执行 `create-xiaohongshu-tables.sql` |

---

## 📂 项目结构

```
ai-topic-radar/
├── docs/
│   ├── XIAOHONGSHU_QUICK_DECISION.md      ← 决策指南
│   └── XIAOHONGSHU_INTEGRATION_GUIDE.md   ← 完整指南
├── scripts/
│   ├── sync-xiaohongshu-data.js           ← 数据同步脚本 ✨
│   └── create-xiaohongshu-tables.sql      ← SQL 创建表 ✨
├── package.json                            ← 新增 update:xiaohongshu ✨
└── XIAOHONGSHU_README.md                   ← 本文档 ✨

MediaCrawler/ (并行目录)
├── config/base_config.py                   ← 爬虫配置
├── main.py                                 ← 爬虫入口
└── data/xhs/xhs.db                        ← 数据存储
```

---

## 🔐 安全提醒

1. **不要提交** `MediaCrawler/browser_data/` 到 Git
2. **不要提交** `.env.local` 和敏感配置
3. **不要泄露** Supabase 密钥
4. **不要高频爬取**，避免被封号

---

## 📊 数据监控

### 查看日志

```bash
# MediaCrawler 日志
tail -f MediaCrawler/logs/crawler.log

# 同步日志
tail -f ai-topic-radar/logs/sync-xhs.log
```

### 数据统计

```bash
# 运行同步脚本会自动显示统计信息
npm run update:xiaohongshu
```

---

## 🎯 下一步行动

1. [ ] 阅读 [快速决策指南](docs/XIAOHONGSHU_QUICK_DECISION.md)
2. [ ] 按本文档完成基础部署
3. [ ] 参考 [完整集成指南](docs/XIAOHONGSHU_INTEGRATION_GUIDE.md) 开发前端
4. [ ] 配置定时任务实现自动化
5. [ ] 根据需求添加评论分析、趋势分析等功能

---

## 📞 获取帮助

- **MediaCrawler**: https://github.com/NanmiCoder/MediaCrawler/issues
- **项目文档**: `docs/` 目录
- **Supabase 文档**: https://supabase.com/docs

---

**祝您集成顺利！🎉**

如有问题，请查看详细文档或提交 Issue。




