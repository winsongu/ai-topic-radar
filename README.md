# AI选题雷达 🎯

智能热点内容聚合工具，帮助内容创作者发现热门话题，提升内容创作效率。

## ✨ 功能特性

### 🔥 热点数据聚合
- **百度热搜** - 实时抓取百度搜索热点
- **中新网教育** - 教育领域权威新闻
- **人民网重要讲话** - 政策解读和重要讲话

### 📅 营销日历
- 月视图和日程视图
- 事件筛选和分类
- 重要节点提醒

### 🤖 AI选题建议
- 基于热点数据的智能选题推荐
- 多平台内容适配
- 个性化推荐算法

### 🎨 现代化UI
- V0设计风格，扁平化配色
- 响应式设计，支持移动端
- 直观的数据可视化

## 🚀 技术栈

- **前端**: Next.js 15.2.4 + React 19 + TypeScript
- **样式**: Tailwind CSS + 自定义主题
- **后端**: Supabase (PostgreSQL)
- **数据抓取**: Firecrawl MCP
- **部署**: Vercel Ready

## 📊 数据策略

- **更新频率**: 每天0点自动更新
- **数据源**: 真实数据 + 虚拟展示数据
- **存储**: Supabase云数据库
- **缓存**: 智能缓存策略

## 🛠️ 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm
- Supabase账户

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/winsongu/ai-topic-radar.git
cd ai-topic-radar
```

2. **安装依赖**
```bash
npm install
# 或
pnpm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
# 编辑 .env.local 文件，填入你的 Supabase 配置
```

4. **启动开发服务器**
```bash
npm run dev
# 或
pnpm dev
```

5. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
ai-topic-radar/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── ai-suggestions/    # AI选题建议页面
│   ├── marketing-calendar/ # 营销日历页面
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # 基础UI组件
│   ├── navigation.tsx    # 导航组件
│   ├── platform-card.tsx # 平台卡片
│   └── ...
├── lib/                  # 工具库
│   ├── supabase.ts       # Supabase 客户端
│   └── utils.ts          # 通用工具函数
└── public/               # 静态资源
```

## 🔧 配置说明

### Supabase配置
1. 在 [Supabase](https://supabase.com) 创建新项目
2. 获取项目URL和Anon Key
3. 在 `.env.local` 中配置：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 数据抓取配置
项目使用Firecrawl MCP进行数据抓取，支持：
- 百度热搜榜
- 中新网教育新闻
- 人民网重要讲话

## 📈 数据流程

1. **数据抓取** → Firecrawl MCP定时抓取热点数据
2. **数据清洗** → 过滤无效标题，验证URL
3. **数据存储** → 保存到Supabase数据库
4. **数据展示** → 前端实时展示热点内容
5. **智能推荐** → AI算法生成选题建议

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Supabase](https://supabase.com/) - 后端即服务
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Firecrawl](https://firecrawl.dev/) - 网页抓取工具

---

**开发团队**: [winsongu](https://github.com/winsongu)

**项目地址**: https://github.com/winsongu/ai-topic-radar

**在线演示**: [即将上线]