-- 创建文字模板表
CREATE TABLE IF NOT EXISTS word_templates (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT,  -- 类型：手抄报、日历、海报等
  platform TEXT NOT NULL,  -- 平台：觅知手抄报、觅知营销日历、熊猫办公
  url TEXT NOT NULL,  -- 详情页链接
  thumbnail TEXT,  -- 缩略图
  tags TEXT[] DEFAULT '{}',  -- 标签数组
  category TEXT,  -- 分类：节日、教育、营销等
  description TEXT,  -- 描述
  author TEXT,  -- 作者
  hot_value INTEGER DEFAULT 0,  -- 热度值
  is_hot BOOLEAN DEFAULT false,  -- 是否热门
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- 抓取时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_word_templates_platform ON word_templates(platform);
CREATE INDEX IF NOT EXISTS idx_word_templates_type ON word_templates(type);
CREATE INDEX IF NOT EXISTS idx_word_templates_category ON word_templates(category);
CREATE INDEX IF NOT EXISTS idx_word_templates_crawled_at ON word_templates(crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_word_templates_url_title ON word_templates(url, title);  -- 用于去重

-- 添加注释
COMMENT ON TABLE word_templates IS '文字模板数据表（手抄报、日历、海报等）';
COMMENT ON COLUMN word_templates.title IS '模板标题';
COMMENT ON COLUMN word_templates.type IS '模板类型（手抄报、日历、海报等）';
COMMENT ON COLUMN word_templates.platform IS '来源平台';
COMMENT ON COLUMN word_templates.url IS '详情页链接';
COMMENT ON COLUMN word_templates.thumbnail IS '缩略图URL';
COMMENT ON COLUMN word_templates.tags IS '标签数组';
COMMENT ON COLUMN word_templates.category IS '分类（节日、教育、营销等）';
COMMENT ON COLUMN word_templates.crawled_at IS '抓取时间';
