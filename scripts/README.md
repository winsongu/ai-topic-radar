# 后端数据服务使用指南

## 📋 目录

1. [架构说明](#架构说明)
2. [数据库配置](#数据库配置)
3. [定时任务配置](#定时任务配置)
4. [本地测试](#本地测试)
5. [故障排查](#故障排查)

---

## 🏗️ 架构说明

### **数据流程**

```
爬虫脚本 → Supabase 数据库 → Next.js API → 前端展示
```

1. **爬虫脚本**（`news-crawler.js`）
   - 抓取 8 个平台的热点新闻
   - 支持：百度、36氪、今日头条、抖音、微博、知乎、B站、小红书

2. **定时任务**（`crawl-and-save-daily.js`）
   - 每天 0 点自动执行
   - 清理旧数据 → 抓取新数据 → 存入数据库

3. **数据库**（Supabase PostgreSQL）
   - `platforms` 表：平台信息
   - `hot_news` 表：热点新闻

4. **API 接口**（`/api/hot-news`）
   - 前端调用获取最新数据
   - 自动格式化返回

---

## 🗄️ 数据库配置

### **步骤 1：创建 Supabase 项目**

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建新项目
3. 记录：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### **步骤 2：执行 SQL 脚本**

在 Supabase Dashboard > SQL Editor 中执行：

```bash
cat scripts/setup-database.sql
```

复制内容并执行，会自动创建：
- ✅ `platforms` 表
- ✅ `hot_news` 表
- ✅ 索引和初始数据

### **步骤 3：验证表结构**

在 Supabase Dashboard > Table Editor 中检查：
- `platforms` 表应该有 8 条记录
- `hot_news` 表初始为空

---

## ⏰ 定时任务配置

### **方式一：GitHub Actions（推荐）**

**优点**：
- ✅ 完全免费
- ✅ 自动运行
- ✅ 有日志记录

**配置步骤**：

1. **添加 GitHub Secrets**
   
   在仓库 Settings > Secrets and variables > Actions 中添加：
   
   ```
   SUPABASE_URL = 你的Supabase URL
   SUPABASE_ANON_KEY = 你的Supabase匿名密钥
   ```

2. **启用 Actions**
   
   - 文件：`.github/workflows/daily-update.yml` 已创建
   - 推送到 GitHub 后自动启用
   - 每天北京时间 0:00 执行

3. **手动触发测试**
   
   在 GitHub > Actions > 每日数据更新 > Run workflow

### **方式二：EdgeOne 定时任务**

在 EdgeOne 管理面板配置：

```
触发器类型：Cron
Cron 表达式：0 0 * * *
目标 URL：https://你的域名/api/cron/daily-update
请求方法：GET
Headers：
  Authorization: Bearer YOUR_CRON_SECRET
```

### **方式三：本地 Cron（Linux/Mac）**

编辑 crontab：

```bash
crontab -e
```

添加：

```
0 0 * * * cd /path/to/ai-topic-radar && node scripts/crawl-and-save-daily.js >> /path/to/logs/daily-update.log 2>&1
```

---

## 🧪 本地测试

### **步骤 1：安装依赖**

```bash
npm install @supabase/supabase-js
```

### **步骤 2：运行测试脚本**

```bash
node scripts/test-update.js
```

### **步骤 3：查看输出**

正常输出应该像这样：

```
🚀 开始每日数据更新任务
⏰时间: 2025-10-16 00:00:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 第一步：抓取数据源...

📌 处理: 百度热搜
   ✅ 抓取成功，获得 10 条新闻
   🗑️  清理 baidu 的旧数据...
   ✅ 旧数据已清理
   ✅ 成功插入 10 条新闻

📌 处理: 36氪
   ✅ 抓取成功，获得 3 条新闻
   ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 每日更新完成！
✅ 成功处理: 50/50 条新闻
📅 更新时间: 2025-10-16 00:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **步骤 4：验证数据库**

在 Supabase Dashboard 检查：

```sql
SELECT platform_id, COUNT(*) 
FROM hot_news 
GROUP BY platform_id;
```

应该看到 8 个平台都有数据。

---

## 🔍 故障排查

### **问题 1：数据没有更新**

**可能原因**：
- ❌ Supabase 配置错误
- ❌ 网络请求失败
- ❌ 定时任务未启用

**解决方法**：

1. 检查环境变量：
   ```bash
   echo $SUPABASE_URL
   echo $SUPABASE_ANON_KEY
   ```

2. 查看日志：
   ```bash
   cat scripts/daily-update.log
   ```

3. 手动运行测试：
   ```bash
   node scripts/test-update.js
   ```

### **问题 2：首页点击无反应**

**可能原因**：
- ❌ API 返回数据为空
- ❌ 前端状态管理问题

**解决方法**：

1. 打开浏览器控制台（F12）
2. 检查 Network 标签，查看 `/api/hot-news` 响应
3. 检查 Console 标签，查看错误信息

### **问题 3：爬虫抓取失败**

**可能原因**：
- ❌ 目标网站反爬虫
- ❌ 网络超时

**解决方法**：

目前使用**示例数据**作为备用方案，确保服务稳定：
- 百度热搜：尝试真实抓取
- 其他平台：使用示例数据

---

## 📝 维护建议

1. **每周检查一次**：
   - GitHub Actions 运行状态
   - Supabase 数据库数据量
   - 日志文件大小

2. **每月优化一次**：
   - 清理过期日志
   - 检查爬虫脚本是否需要更新
   - 优化数据库查询性能

3. **监控指标**：
   - 定时任务成功率 > 95%
   - 数据库响应时间 < 500ms
   - 前端页面加载时间 < 2s

---

## 🚀 快速命令

```bash
# 测试数据更新
npm run test:update

# 查看日志
tail -f scripts/daily-update.log

# 手动触发更新
node scripts/crawl-and-save-daily.js

# 检查数据库连接
node -e "const {createClient}=require('@supabase/supabase-js');const s=createClient('URL','KEY');s.from('platforms').select('*').then(d=>console.log(d))"
```

---

## 📞 技术支持

如有问题，请检查：
1. GitHub Issues
2. Supabase 文档：https://supabase.com/docs
3. 项目 README.md

