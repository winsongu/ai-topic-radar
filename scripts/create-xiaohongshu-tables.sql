-- ============================================================
-- 小红书数据表创建脚本
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================================

-- 1. 小红书笔记表
CREATE TABLE IF NOT EXISTS xiaohongshu_posts (
  id BIGSERIAL PRIMARY KEY,
  
  -- 笔记基本信息
  note_id TEXT UNIQUE NOT NULL,  -- 小红书笔记ID（唯一标识）
  title TEXT NOT NULL,           -- 笔记标题
  desc TEXT,                     -- 笔记描述/正文
  type TEXT,                     -- 类型：normal（图文）, video（视频）
  
  -- 作者信息
  author_id TEXT,                -- 博主ID
  author_name TEXT,              -- 博主昵称
  avatar_url TEXT,               -- 博主头像URL
  
  -- 链接和封面
  note_url TEXT,                 -- 笔记链接
  thumbnail TEXT,                -- 封面图片URL
  
  -- 互动数据
  liked_count INTEGER DEFAULT 0,      -- 点赞数
  collected_count INTEGER DEFAULT 0,  -- 收藏数
  comment_count INTEGER DEFAULT 0,    -- 评论数
  share_count INTEGER DEFAULT 0,      -- 分享数
  
  -- 分类和标签
  tags TEXT[] DEFAULT '{}',      -- 标签数组
  ip_location TEXT,              -- IP属地（如：广东）
  
  -- 时间戳
  published_at TIMESTAMPTZ,      -- 笔记发布时间
  crawled_at TIMESTAMPTZ DEFAULT NOW(),  -- 数据爬取时间
  created_at TIMESTAMPTZ DEFAULT NOW(),  -- 记录创建时间
  updated_at TIMESTAMPTZ DEFAULT NOW()   -- 记录更新时间
);

-- 2. 小红书评论表（可选）
CREATE TABLE IF NOT EXISTS xiaohongshu_comments (
  id BIGSERIAL PRIMARY KEY,
  
  -- 评论基本信息
  comment_id TEXT UNIQUE NOT NULL,   -- 评论ID（唯一标识）
  note_id TEXT NOT NULL,             -- 关联的笔记ID
  content TEXT,                      -- 评论内容
  
  -- 评论者信息
  user_id TEXT,                      -- 评论者ID
  user_name TEXT,                    -- 评论者昵称
  
  -- 互动数据
  liked_count INTEGER DEFAULT 0,     -- 点赞数
  sub_comment_count INTEGER DEFAULT 0,  -- 回复数
  
  -- 其他信息
  ip_location TEXT,                  -- IP属地
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),  -- 评论时间
  crawled_at TIMESTAMPTZ DEFAULT NOW()   -- 爬取时间
);

-- ============================================================
-- 创建索引（提升查询性能）
-- ============================================================

-- 笔记表索引
CREATE INDEX IF NOT EXISTS idx_xhs_posts_note_id 
  ON xiaohongshu_posts(note_id);

CREATE INDEX IF NOT EXISTS idx_xhs_posts_author_id 
  ON xiaohongshu_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_xhs_posts_crawled_at 
  ON xiaohongshu_posts(crawled_at DESC);

CREATE INDEX IF NOT EXISTS idx_xhs_posts_published_at 
  ON xiaohongshu_posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_xhs_posts_liked_count 
  ON xiaohongshu_posts(liked_count DESC);

-- 标签 GIN 索引（支持数组搜索）
CREATE INDEX IF NOT EXISTS idx_xhs_posts_tags 
  ON xiaohongshu_posts USING GIN(tags);

-- 评论表索引
CREATE INDEX IF NOT EXISTS idx_xhs_comments_comment_id 
  ON xiaohongshu_comments(comment_id);

CREATE INDEX IF NOT EXISTS idx_xhs_comments_note_id 
  ON xiaohongshu_comments(note_id);

CREATE INDEX IF NOT EXISTS idx_xhs_comments_user_id 
  ON xiaohongshu_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_xhs_comments_created_at 
  ON xiaohongshu_comments(created_at DESC);

-- ============================================================
-- 添加注释（方便理解）
-- ============================================================

COMMENT ON TABLE xiaohongshu_posts IS '小红书笔记数据表';
COMMENT ON TABLE xiaohongshu_comments IS '小红书评论数据表';

COMMENT ON COLUMN xiaohongshu_posts.note_id IS '小红书笔记唯一ID';
COMMENT ON COLUMN xiaohongshu_posts.title IS '笔记标题';
COMMENT ON COLUMN xiaohongshu_posts.desc IS '笔记描述内容';
COMMENT ON COLUMN xiaohongshu_posts.type IS '笔记类型：normal=图文, video=视频';
COMMENT ON COLUMN xiaohongshu_posts.tags IS '标签数组，支持多个标签';
COMMENT ON COLUMN xiaohongshu_posts.ip_location IS 'IP属地，如：广东、北京';

COMMENT ON COLUMN xiaohongshu_comments.comment_id IS '评论唯一ID';
COMMENT ON COLUMN xiaohongshu_comments.note_id IS '关联的笔记ID';
COMMENT ON COLUMN xiaohongshu_comments.sub_comment_count IS '该评论的回复数量';

-- ============================================================
-- 创建更新时间触发器（自动更新 updated_at）
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为笔记表添加触发器
DROP TRIGGER IF EXISTS update_xiaohongshu_posts_updated_at ON xiaohongshu_posts;
CREATE TRIGGER update_xiaohongshu_posts_updated_at
  BEFORE UPDATE ON xiaohongshu_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 数据清理函数（可选）
-- ============================================================

-- 创建清理旧数据的函数
CREATE OR REPLACE FUNCTION clean_old_xiaohongshu_data(days_to_keep INTEGER DEFAULT 90)
RETURNS TABLE(deleted_posts INTEGER, deleted_comments INTEGER) AS $$
DECLARE
  posts_deleted INTEGER;
  comments_deleted INTEGER;
BEGIN
  -- 删除旧笔记
  DELETE FROM xiaohongshu_posts
  WHERE crawled_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS posts_deleted = ROW_COUNT;
  
  -- 删除旧评论
  DELETE FROM xiaohongshu_comments
  WHERE crawled_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS comments_deleted = ROW_COUNT;
  
  RETURN QUERY SELECT posts_deleted, comments_deleted;
END;
$$ LANGUAGE plpgsql;

-- 使用示例：
-- SELECT * FROM clean_old_xiaohongshu_data(90);  -- 清理 90 天前的数据

-- ============================================================
-- 验证表结构
-- ============================================================

-- 查看表信息
-- \d xiaohongshu_posts
-- \d xiaohongshu_comments

-- 统计数据
SELECT 
  'xiaohongshu_posts' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT author_id) as unique_authors,
  MAX(crawled_at) as last_crawl_time
FROM xiaohongshu_posts
UNION ALL
SELECT 
  'xiaohongshu_comments' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(crawled_at) as last_crawl_time
FROM xiaohongshu_comments;

-- ============================================================
-- 完成提示
-- ============================================================

-- 表创建成功！
-- 
-- 下一步:
-- 1. 部署 MediaCrawler
-- 2. 运行数据同步脚本: node scripts/sync-xiaohongshu-data.js
-- 3. 创建 API 接口: app/api/xiaohongshu/route.ts
-- 4. 创建前端页面: app/xiaohongshu-dynamics/page.tsx




