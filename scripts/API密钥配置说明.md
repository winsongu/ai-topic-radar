# API密钥配置说明

> 本项目需要以下API密钥，请在`.env.local`中配置

## 必需的API密钥

### 1. Firecrawl（内容抓取）
```env
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```
**获取方式**：https://firecrawl.dev/

### 2. Supabase（数据库存储）
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
**获取方式**：https://supabase.com/

### 3. Deepseek（内容生产）
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```
**获取方式**：https://platform.deepseek.com/

### 4. Figma（前端页面设计）
```env
FIGMA_ACCESS_TOKEN=your_figma_token_here
```
**获取方式**：Figma Settings → Personal Access Tokens

## 热点来源

### 百度热搜
https://top.baidu.com/board?tab=realtime

### 重要讲话
https://jhsjk.people.cn/

### 中新网教育
https://www.chinanews.com.cn/rss/importnews.xml

## 竞品页面（Top10）

### AIPPT
https://www.aippt.cn/template/

### 熊猫办公
https://www.tukuppt.com/ppt/time_0_0_0_0_0_0_1.html
- 热度值 = 赞

### iSlide
https://www.islide.cc/ppt/template?filters=content-category.free&group=latest
- 热度值 = 人气

### Canva精选模板
https://www.canva.cn/collections/presentation-selected-250923/

---

## ⚠️ 安全提醒

1. **永远不要提交包含真实密钥的文件到Git**
2. 使用`.env.local`存储密钥（已在`.gitignore`中）
3. 定期轮换API密钥
4. 不要在代码中硬编码密钥

