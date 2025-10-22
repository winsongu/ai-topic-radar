-- 数据库优化脚本
-- 用于追加模式下的性能优化
-- 在 Supabase Dashboard > SQL Editor 中执行

-- ========================================
-- 1. 创建复合索引（优化"最新批次"查询）
-- ========================================

-- 索引：平台ID + 抓取时间（降序）
-- 用于快速查询每个平台最新的抓取时间
CREATE INDEX IF NOT EXISTS idx_hot_news_platform_crawled_desc 
ON hot_news(platform_id, crawled_at DESC);

-- 索引：平台ID + 抓取时间 + 排名
-- 用于查询特定批次的排序数据
CREATE INDEX IF NOT EXISTS idx_hot_news_platform_crawled_rank 
ON hot_news(platform_id, crawled_at, rank_order);

-- 索引：抓取时间（降序）
-- 用于全局时间范围查询和数据清理
CREATE INDEX IF NOT EXISTS idx_hot_news_crawled_at_desc 
ON hot_news(crawled_at DESC);

-- ========================================
-- 2. 添加全文搜索索引（可选，用于标题搜索）
-- ========================================

-- 为标题字段添加 GIN 索引，支持 ILIKE 快速搜索
CREATE INDEX IF NOT EXISTS idx_hot_news_title_gin 
ON hot_news USING gin(title gin_trgm_ops);

-- 需要先启用 pg_trgm 扩展（如果还没启用）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ========================================
-- 3. 优化查询统计（可选）
-- ========================================

-- 更新表统计信息，帮助查询优化器选择更好的执行计划
ANALYZE hot_news;
ANALYZE platforms;

-- ========================================
-- 4. 添加分区表支持（可选，适用于海量数据）
-- ========================================

-- 如果数据量超过百万级，可以考虑按月分区
-- 示例：按月分区表（需要重建表结构，谨慎操作）

-- 注释掉的分区表示例（仅供参考）：
/*
CREATE TABLE hot_news_partitioned (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  hot_value BIGINT DEFAULT 0,
  time_label TEXT,
  published_at TIMESTAMP,
  rank_order INTEGER DEFAULT 0,
  keywords TEXT[],
  category TEXT,
  crawled_at TIMESTAMP DEFAULT NOW(),
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (crawled_at);

-- 创建按月分区
CREATE TABLE hot_news_2025_10 PARTITION OF hot_news_partitioned
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE hot_news_2025_11 PARTITION OF hot_news_partitioned
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
*/

-- ========================================
-- 5. 验证索引创建
-- ========================================

-- 查看所有相关索引
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'hot_news'
ORDER BY indexname;

-- ========================================
-- 6. 性能测试查询
-- ========================================

-- 测试1：查询最新批次（应该使用 idx_hot_news_platform_crawled_desc）
EXPLAIN ANALYZE
SELECT crawled_at 
FROM hot_news 
WHERE platform_id = 'baidu' 
ORDER BY crawled_at DESC 
LIMIT 1;

-- 测试2：查询特定批次的数据（应该使用 idx_hot_news_platform_crawled_rank）
EXPLAIN ANALYZE
SELECT * 
FROM hot_news 
WHERE platform_id = 'baidu' 
  AND crawled_at = (
    SELECT crawled_at 
    FROM hot_news 
    WHERE platform_id = 'baidu' 
    ORDER BY crawled_at DESC 
    LIMIT 1
  )
ORDER BY rank_order ASC 
LIMIT 10;

-- 测试3：标题搜索（应该使用 idx_hot_news_title_gin）
EXPLAIN ANALYZE
SELECT * 
FROM hot_news 
WHERE title ILIKE '%AI%' 
  AND crawled_at >= NOW() - INTERVAL '30 days';

-- ========================================
-- 执行完成！
-- ========================================

-- 预期效果：
-- 1. 查询最新批次速度提升 10-100倍
-- 2. 标题搜索性能提升 50-200倍
-- 3. 数据清理操作更快速

