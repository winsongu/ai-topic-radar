-- Supabase 数据库表结构
-- 执行此脚本在 Supabase Dashboard > SQL Editor 中创建必要的表

-- 1. 平台表
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'blue',
  update_frequency TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 热点新闻表
CREATE TABLE IF NOT EXISTS hot_news (
  id BIGSERIAL PRIMARY KEY,
  platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  hot_value BIGINT DEFAULT 0,
  time_label TEXT,
  rank_order INTEGER NOT NULL,
  crawled_at TIMESTAMPTZ DEFAULT NOW(),
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_hot_news_platform_id ON hot_news(platform_id);
CREATE INDEX IF NOT EXISTS idx_hot_news_rank_order ON hot_news(rank_order);
CREATE INDEX IF NOT EXISTS idx_hot_news_is_visible ON hot_news(is_visible);
CREATE INDEX IF NOT EXISTS idx_hot_news_crawled_at ON hot_news(crawled_at DESC);

-- 4. 插入初始平台数据
INSERT INTO platforms (id, name, description, color) VALUES
  ('baidu', '百度热搜', '百度实时热点榜单', 'blue'),
  ('36kr', '36氪', '创业资讯和科技新闻', 'blue'),
  ('toutiao', '今日头条', '个性化推荐资讯平台', 'red'),
  ('douyin', '抖音热榜', '短视频平台热门内容', 'black'),
  ('weibo', '微博热搜', '社交媒体热门话题', 'orange'),
  ('zhihu', '知乎热榜', '知识问答社区热门内容', 'blue'),
  ('bilibili', 'B站热门', '视频弹幕网站热门视频', 'pink'),
  ('xiaohongshu', '小红书', '生活方式分享社区热门笔记', 'red')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  updated_at = NOW();

-- 5. 启用 RLS（Row Level Security）- 可选
-- ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hot_news ENABLE ROW LEVEL SECURITY;

-- 6. 创建公开读取策略（如果启用了 RLS）
-- CREATE POLICY "Allow public read access" ON platforms FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON hot_news FOR SELECT USING (is_visible = true);

-- 完成！

