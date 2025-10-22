# 项目结构说明

> WPS稻壳内容选题神器 - AI驱动的热点追踪和竞品分析平台

---

## 📁 目录结构

```
ai-topic-radar/
├── .github/
│   └── workflows/
│       ├── daily-update.yml          # 热点新闻定时任务
│       └── competitor-update.yml     # 竞品动态定时任务
│
├── app/                              # Next.js应用主目录
│   ├── api/                          # API路由
│   │   ├── hot-news/                 # 热点新闻API
│   │   ├── competitor-templates/     # 竞品模板API
│   │   └── cron.disabled/            # 已禁用的cron API
│   ├── page.tsx                      # 首页（热点新闻）
│   ├── competitor-dynamics/          # 竞品动态页面
│   ├── marketing-calendar/           # 营销日历页面
│   └── ai-suggestions/               # AI选题建议页面
│
├── components/                       # React组件
│   ├── ui/                           # 通用UI组件（shadcn/ui）
│   ├── navigation.tsx                # 导航栏
│   ├── platform-card.tsx             # 平台卡片
│   ├── news-modal.tsx                # 新闻弹窗
│   ├── filter-modal.tsx              # 筛选弹窗
│   └── image-matting-tool.tsx        # 图片抠图工具
│
├── scripts/                          # 数据抓取脚本
│   ├── crawl-and-save-daily.js       # 热点新闻抓取（每日）
│   ├── crawl-competitor-templates-v2.js  # 竞品模板抓取（深度版）
│   ├── test-deduplication.js         # 去重功能测试
│   ├── generate-calendar-data.js     # 营销日历生成
│   └── setup-database.sql            # 数据库初始化
│
├── docs/                             # 文档
│   ├── GitHub_Actions定时任务配置.md  # 定时任务配置（主要文档）
│   ├── PPT竞品动态抓取来源及逻辑.md   # 竞品抓取详细说明
│   ├── 竞品抓取快速参考.md            # 快速参考手册
│   ├── CALENDAR_GUIDE.md             # 营销日历使用指南
│   └── IMAGE_MATTING_GUIDE.md        # 图片抠图功能说明
│
├── lib/                              # 工具库
│   ├── supabase.ts                   # Supabase客户端
│   └── utils.ts                      # 通用工具函数
│
├── data/                             # 静态数据
│   ├── calendar-events.json          # 营销日历事件
│   └── monthly-hotspots.json         # 月度热点
│
└── logs/                             # 日志目录（Git忽略）
    └── competitor-crawl.log
```

---

## 🎯 核心功能

### 1. 热点新闻追踪 ✅
- **文件**: `app/page.tsx`
- **API**: `app/api/hot-news/route.ts`
- **抓取**: `scripts/crawl-and-save-daily.js`
- **定时**: `.github/workflows/daily-update.yml`（每天2次）
- **数据源**: 抖音、百度、微博、知乎等11个平台

### 2. 竞品动态监控 ✅
- **文件**: `app/competitor-dynamics/page.tsx`
- **API**: `app/api/competitor-templates/route.ts`
- **抓取**: `scripts/crawl-competitor-templates-v2.js`
- **定时**: `.github/workflows/competitor-update.yml`（每天1次）
- **竞品**: AIPPT、熊猫办公、iSlide、Canva

### 3. 营销日历 ✅
- **文件**: `app/marketing-calendar/page.tsx`
- **数据**: `data/calendar-events.json`
- **功能**: 节日提醒、热点预测、内容规划

### 4. AI选题建议 🚧
- **文件**: `app/ai-suggestions/page.tsx`
- **状态**: 开发中

### 5. 图片抠图工具 ✅
- **组件**: `components/image-matting-tool.tsx`
- **文档**: `docs/IMAGE_MATTING_GUIDE.md`

---

## 🔧 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | Next.js 15, React 19 |
| **UI组件** | Radix UI, Tailwind CSS, shadcn/ui |
| **数据库** | Supabase (PostgreSQL) |
| **数据抓取** | Firecrawl API |
| **定时任务** | GitHub Actions |
| **部署** | Vercel / 自托管 |
| **图表** | Recharts |
| **图标** | Lucide React |

---

## 📊 数据库表

### `hot_news` - 热点新闻
```sql
id, title, url, platform_id, rank_order, hot_value, 
crawled_at, is_visible, platform(关联)
```

### `competitor_templates` - 竞品模板
```sql
id, title, type, format, usage, platform, tags[], 
date, hot_value, url, thumbnail, is_free, author, 
crawled_at
```

### `platforms` - 平台配置
```sql
id, name, icon, color, is_active, display_order
```

---

## 🚀 快速开始

### 本地开发
```bash
# 安装依赖
npm install

# 配置环境变量（复制.env.example为.env.local）
NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase密钥
FIRECRAWL_API_KEY=你的Firecrawl密钥

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 测试数据抓取
```bash
# 测试热点新闻抓取
npm run test:update

# 测试竞品动态抓取（小样本）
npm run test:competitor

# 完整竞品数据抓取
npm run update:competitor
```

---

## ⚙️ GitHub Actions配置

### 必需的Secrets
在GitHub仓库的 `Settings > Secrets and variables > Actions` 中配置：

| Secret名称 | 说明 |
|-----------|------|
| `SUPABASE_URL` | Supabase项目URL |
| `SUPABASE_ANON_KEY` | Supabase匿名密钥 |
| `FIRECRAWL_API_KEY` | Firecrawl API密钥 |

### 定时任务时间

| 任务 | 执行时间（北京） | Cron表达式 |
|------|----------------|-----------|
| 热点新闻 | 08:00, 13:30 | `0 0 * * *`, `30 5 * * *` |
| 竞品动态 | 09:00 | `0 1 * * *` |

---

## 📖 重要文档

### 配置文档
- **[GitHub Actions定时任务配置](docs/GitHub_Actions定时任务配置.md)** ⭐主要配置文档
- [图片抠图功能说明](docs/IMAGE_MATTING_GUIDE.md)
- [营销日历使用指南](docs/CALENDAR_GUIDE.md)

### 技术文档
- [竞品动态抓取逻辑](docs/PPT竞品动态抓取来源及逻辑.md)
- [竞品抓取快速参考](docs/竞品抓取快速参考.md)
- [数据库设置](scripts/setup-database.sql)

---

## 🔒 数据安全

- ✅ 敏感信息使用GitHub Secrets
- ✅ `.env.local`已加入`.gitignore`
- ✅ API密钥不提交到代码库
- ✅ Supabase RLS策略保护数据

---

## 🐛 故障排查

### 前端显示"正在加载"卡住
1. 检查Supabase连接：查看浏览器Console
2. 验证数据库有数据：运行测试抓取
3. 检查API响应：访问 `/api/competitor-templates`

### GitHub Actions执行失败
1. 检查Secrets配置是否完整
2. 查看Actions日志定位错误
3. 手动运行测试：`npm run test:competitor`

### 数据重复问题
- 已实现全局去重，相同URL+标题只保留一条
- 历史数据保留90天自动清理

---

## 📝 开发规范

### Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

### 代码风格
- 使用TypeScript
- 遵循ESLint规则
- 组件使用函数式+Hooks
- CSS使用Tailwind工具类

---

## 🎯 路线图

- [x] 热点新闻追踪
- [x] 竞品动态监控
- [x] 营销日历
- [x] 图片抠图工具
- [x] GitHub Actions定时任务
- [ ] AI选题建议
- [ ] 数据导出功能
- [ ] 用户自定义平台
- [ ] 邮件/webhook通知

---

**版本**: 1.0.0  
**最后更新**: 2025-10-22  
**维护者**: AI Topic Radar Team  
**许可**: MIT

