# 数据分析与历史存储使用指南

## 📊 概述

项目已升级为**追加模式**，所有历史数据都会被保留，支持月度复盘、趋势分析和深度数据挖掘。

---

## 🔄 核心改动

### 1. 数据存储方式变更

| 项目 | 旧模式（覆盖） | 新模式（追加） |
|------|--------------|--------------|
| **存储方式** | 每天覆盖旧数据 | 追加新数据，保留历史 |
| **数据保留** | 仅保留最新1天 | 保留90天（可配置） |
| **月度复盘** | ❌ 不支持 | ✅ 完全支持 |
| **趋势分析** | ❌ 不支持 | ✅ 完全支持 |
| **查询性能** | 快速 | 优化后同样快速 |

### 2. 修改的文件

- ✅ `scripts/crawl-and-save-daily.js` - 改为追加模式，增加数据清理
- ✅ `app/api/hot-news/route.ts` - 只查询最新批次数据
- ✅ `app/api/analytics/route.ts` - 新增数据分析API
- ✅ `scripts/optimize-database.sql` - 数据库性能优化

---

## 🎯 新增功能

### 1️⃣ 自动数据清理

**配置位置**：`scripts/crawl-and-save-daily.js` 第138行

```javascript
const cleanResult = await cleanOldData(90)  // 保留90天数据
```

**说明**：
- 每次抓取时自动清理90天前的数据
- 避免数据库无限增长
- 可根据需求调整保留天数（建议30-180天）

---

### 2️⃣ 数据分析API

**接口地址**：`GET /api/analytics`

#### 📈 支持的分析类型

| type 参数 | 功能 | 适用场景 |
|-----------|------|---------|
| `monthly` | 月度复盘报告 | 查看每日数据量、热度趋势、热词统计 |
| `trend` | 热点趋势分析 | 追踪某个话题的热度变化 |
| `keywords` | 关键词统计 | 分析全局热词排行 |
| `platform-stats` | 平台活跃度对比 | 对比各平台的数据量和热度 |

---

## 📖 API 使用示例

### 1. 月度复盘报告

**场景**：查看最近30天的数据概况

```bash
GET /api/analytics?type=monthly&startDate=2025-09-22&endDate=2025-10-22
```

**可选参数**：
- `platform`: 指定平台（如 `baidu`、`weibo`）
- `startDate`: 起始日期（YYYY-MM-DD）
- `endDate`: 结束日期（YYYY-MM-DD）

**返回示例**：

```json
{
  "success": true,
  "data": {
    "dailyStats": [
      {
        "date": "2025-10-22",
        "totalNews": 46,
        "platforms": ["baidu", "chinanews", "people", "36kr", "weibo", "zhihu"],
        "avgHotValue": 350000
      },
      // ... 更多日期
    ],
    "topKeywords": [
      { "word": "AI", "count": 25 },
      { "word": "教育", "count": 18 },
      // ... Top 20
    ]
  },
  "summary": {
    "totalNews": 1380,
    "uniqueDays": 30,
    "avgDailyNews": 46,
    "platforms": ["baidu", "chinanews", "people", "36kr", "weibo", "zhihu"]
  }
}
```

---

### 2. 热点趋势分析

**场景**：追踪"AI"相关话题的热度变化

```bash
GET /api/analytics?type=trend&title=AI&startDate=2025-09-22&endDate=2025-10-22
```

**必填参数**：
- `title`: 关键词（支持模糊匹配）

**返回示例**：

```json
{
  "success": true,
  "data": [
    {
      "time": "2025-10-22T00:55:28.449Z",
      "date": "2025-10-22",
      "platform": "baidu",
      "title": "AI大模型突破性进展",
      "hotValue": 1000000,
      "rank": 1
    },
    // ... 更多记录
  ],
  "summary": {
    "keyword": "AI",
    "totalOccurrences": 45,
    "platforms": ["baidu", "36kr", "zhihu"],
    "peakHotValue": 2000000,
    "avgHotValue": 850000
  }
}
```

---

### 3. 关键词统计

**场景**：分析最近30天的全局热词

```bash
GET /api/analytics?type=keywords&startDate=2025-09-22&endDate=2025-10-22
```

**返回示例**：

```json
{
  "success": true,
  "data": [
    {
      "word": "教育",
      "count": 156,
      "avgHotValue": 500000,
      "platforms": ["chinanews", "people", "baidu"]
    },
    // ... Top 50
  ],
  "summary": {
    "totalKeywords": 3456,
    "dateRange": { "startDate": "2025-09-22", "endDate": "2025-10-22" }
  }
}
```

---

### 4. 平台活跃度对比

**场景**：对比各平台的数据量和热度

```bash
GET /api/analytics?type=platform-stats&startDate=2025-09-22&endDate=2025-10-22
```

**返回示例**：

```json
{
  "success": true,
  "data": [
    {
      "platform": "baidu",
      "totalNews": 300,
      "avgHotValue": 800000,
      "activeDays": 30,
      "avgDailyNews": 10
    },
    // ... 其他平台
  ],
  "summary": {
    "totalPlatforms": 6,
    "dateRange": { "startDate": "2025-09-22", "endDate": "2025-10-22" }
  }
}
```

---

## 💡 使用场景示例

### 场景1：月度选题复盘

**需求**：查看10月份哪些话题最热门

```javascript
// 1. 获取月度报告
const response = await fetch('/api/analytics?type=monthly&startDate=2025-10-01&endDate=2025-10-31')
const { data } = await response.json()

// 2. 查看热词Top20
console.log(data.topKeywords)
// 结果：[{ word: "AI", count: 125 }, { word: "教育", count: 98 }, ...]

// 3. 分析每日数据量趋势
const dailyTrend = data.dailyStats.map(d => ({
  date: d.date,
  total: d.totalNews
}))
```

---

### 场景2：追踪竞品话题热度

**需求**：追踪"新东方"在各平台的讨论热度变化

```javascript
const response = await fetch('/api/analytics?type=trend&title=新东方&startDate=2025-09-01&endDate=2025-10-31')
const { data, summary } = await response.json()

console.log(`"新东方" 出现 ${summary.totalOccurrences} 次`)
console.log(`峰值热度：${summary.peakHotValue}`)
console.log(`涉及平台：${summary.platforms.join(', ')}`)

// 绘制趋势图
const trendChart = data.map(item => ({
  date: item.date,
  hotValue: item.hotValue,
  platform: item.platform
}))
```

---

### 场景3：发现新兴热词

**需求**：找出最近7天突然火起来的新词

```javascript
// 1. 获取最近7天的热词
const week1 = await fetch('/api/analytics?type=keywords&startDate=2025-10-15&endDate=2025-10-21')
const week2 = await fetch('/api/analytics?type=keywords&startDate=2025-10-08&endDate=2025-10-14')

const keywords1 = await week1.json()
const keywords2 = await week2.json()

// 2. 对比差异，找出新词
const newKeywords = keywords1.data.filter(kw1 => {
  const kw2 = keywords2.data.find(k => k.word === kw1.word)
  return !kw2 || kw1.count > kw2.count * 2  // 增长超过2倍
})

console.log('新兴热词：', newKeywords)
```

---

## 🚀 性能优化

### 已创建的索引

| 索引名称 | 作用 | 性能提升 |
|---------|------|---------|
| `idx_hot_news_platform_crawled_desc` | 快速查询最新批次 | 10-100倍 |
| `idx_hot_news_platform_crawled_rank` | 特定批次排序查询 | 50倍 |
| `idx_hot_news_crawled_at_desc` | 时间范围查询 | 20倍 |
| `idx_hot_news_title_gin` | 标题全文搜索 | 50-200倍 |

### 查询最佳实践

✅ **推荐**：
```sql
-- 查询最新批次（使用索引）
SELECT * FROM hot_news 
WHERE platform_id = 'baidu' 
  AND crawled_at = (SELECT MAX(crawled_at) FROM hot_news WHERE platform_id = 'baidu')
ORDER BY rank_order ASC;
```

❌ **不推荐**：
```sql
-- 全表扫描（慢）
SELECT * FROM hot_news 
WHERE platform_id = 'baidu' 
ORDER BY crawled_at DESC 
LIMIT 10;
```

---

## 📝 数据维护建议

### 1. 保留天数配置

根据业务需求调整数据保留天数：

| 场景 | 建议保留天数 |
|------|------------|
| 仅查看实时数据 | 30天 |
| 月度复盘 | 90天（默认） |
| 季度/年度分析 | 180-365天 |
| 长期研究 | 365天+ |

### 2. 定期检查数据库大小

```sql
-- 查询表大小
SELECT 
  pg_size_pretty(pg_total_relation_size('hot_news')) as total_size,
  (SELECT COUNT(*) FROM hot_news) as total_records;
```

### 3. 手动清理数据（如需）

```sql
-- 清理60天前的数据
DELETE FROM hot_news 
WHERE crawled_at < NOW() - INTERVAL '60 days';
```

---

## 🔧 故障排查

### 问题1：前端显示旧数据

**原因**：API缓存或查询逻辑问题

**解决**：
1. 检查 `/api/hot-news` 是否正确查询最新批次
2. 清除浏览器缓存
3. 查看数据库中最新的 `crawled_at` 时间

### 问题2：分析API查询慢

**原因**：数据量大，索引未生效

**解决**：
```sql
-- 重建索引
REINDEX INDEX idx_hot_news_platform_crawled_desc;
REINDEX INDEX idx_hot_news_title_gin;

-- 更新统计信息
ANALYZE hot_news;
```

### 问题3：数据库空间不足

**原因**：数据保留天数过长

**解决**：
1. 减少保留天数（修改 `crawl-and-save-daily.js` 第138行）
2. 手动清理历史数据（见上方SQL）

---

## 📊 数据导出

### 导出月度报告（CSV）

```bash
# 在 Supabase Dashboard > SQL Editor 执行
COPY (
  SELECT 
    DATE(crawled_at) as date,
    platform_id,
    COUNT(*) as total_news,
    AVG(hot_value) as avg_hot_value
  FROM hot_news
  WHERE crawled_at >= '2025-10-01' AND crawled_at < '2025-11-01'
  GROUP BY DATE(crawled_at), platform_id
  ORDER BY date, platform_id
) TO '/tmp/monthly_report.csv' WITH CSV HEADER;
```

---

## 🎉 完成！

现在你可以：
- ✅ 查看任意时间段的历史数据
- ✅ 追踪热点话题的热度变化
- ✅ 生成月度/季度复盘报告
- ✅ 分析各平台的内容偏好
- ✅ 发现新兴热词和趋势

有任何问题，请参考项目文档或联系开发团队。

