# API密钥配置模板

> ⚠️ 此文件仅作为配置参考，实际密钥请保存在.env.local中

## 必需的环境变量

### Supabase配置
```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

获取方式：Supabase Dashboard > Settings > API

### Firecrawl配置
```
FIRECRAWL_API_KEY=你的Firecrawl API密钥
```

获取方式：https://firecrawl.dev

## 数据源说明

### 热点新闻源
- 抖音热榜
- 百度热搜
- 微博热搜
- 知乎热榜
- 36氪
- 少数派
- 等11个平台

### 竞品PPT模板源
- AIPPT: https://www.aippt.cn
- 熊猫办公: https://www.tukuppt.com
- iSlide: https://www.islide.cc
- Canva: https://www.canva.cn

## GitHub Secrets配置

在GitHub仓库的 Settings > Secrets and variables > Actions 中添加：
- SUPABASE_URL
- SUPABASE_ANON_KEY
- FIRECRAWL_API_KEY

## 安全提示

1. ✅ 永远不要提交.env.local到Git
2. ✅ 使用GitHub Secrets管理密钥
3. ✅ 定期轮换API密钥
4. ✅ 不要在代码中硬编码密钥
