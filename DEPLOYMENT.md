# EdgeOne 部署指南

## 🚀 自动部署配置

### 1. EdgeOne Pages 配置

在 EdgeOne Pages 中配置以下设置：

#### 构建配置
- **框架**: Next.js
- **构建命令**: `npm run build`
- **输出目录**: `.next`
- **Node.js版本**: 18.x 或更高

#### 环境变量（⚠️ 重要）

**必须在 EdgeOne Pages 控制台配置以下环境变量，否则应用将无法正常工作！**

配置步骤：
1. 登录 EdgeOne Pages 控制台
2. 进入项目设置 -> 环境变量
3. 添加以下变量（注意变量名大小写）

```bash
# Supabase配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://sdxgocjszjnrqrfbsspn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeGdvY2pzempucnFyZmJzc3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTM4NjgsImV4cCI6MjA3NTU2OTg2OH0.8lJ8dCBTT3qwmwNdL71EMPcVAmZHAgBeEp3rr-X6GJU

# Firecrawl API Key（必需）
FIRECRAWL_API_KEY=fc-c34842bb4fd54a58a7b001c5369a3bcb

# Deepseek API Key（可选，如果需要AI功能）
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
```

**重要提示**：
- ⚠️ 配置环境变量后必须重新部署才能生效
- ⚠️ 确保应用到 Production 环境
- ⚠️ 变量名必须完全匹配（包括 `NEXT_PUBLIC_` 前缀）
- 📚 详细配置指南请查看：`docs/EdgeOne_环境变量配置指南.md`

### 2. 自动更新配置

#### 方案A: EdgeOne Cron Jobs (推荐)
在 EdgeOne Pages 中配置定时任务：

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-update",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### 方案B: GitHub Actions
创建 `.github/workflows/daily-update.yml`：

```yaml
name: Daily Data Update
on:
  schedule:
    - cron: '0 0 * * *'  # 每天0点执行
  workflow_dispatch:  # 支持手动触发

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/crawl-and-save-daily.js
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
          FIRECRAWL_API_KEY: ${{ secrets.FIRECRAWL_API_KEY }}
```

### 3. 域名配置

#### 自定义域名
- **主域名**: `ai.winsongu.com` (已配置)
- **SSL证书**: 自动申请和续期
- **CDN加速**: 全球节点分发

#### DNS设置
确保DNS记录正确指向EdgeOne：
```
ai.winsongu.com CNAME f1d192f4.ai.winsongu.com.dnsoe3.com.
```

## 📊 监控和日志

### 1. 部署日志
在EdgeOne Pages控制台查看：
- 构建日志
- 部署状态
- 错误信息

### 2. 应用日志
在Supabase控制台查看：
- 数据库操作日志
- API调用记录
- 错误追踪

### 3. 定时任务日志
```bash
# 查看每日更新日志
tail -f daily-update.log

# 查看cron任务日志
tail -f cron.log
```

## 🔧 故障排除

### 常见问题

#### 1. 构建失败
- 检查Node.js版本兼容性
- 确认所有依赖包已安装
- 查看构建日志中的具体错误

#### 2. 环境变量问题（最常见）
**症状**：构建成功但页面无数据，显示"Supabase未配置"
**原因**：环境变量未配置或配置错误
**解决**：
- ✅ 在 EdgeOne Pages 控制台配置环境变量（不是在代码中）
- ✅ 确认变量名完全正确：`NEXT_PUBLIC_SUPABASE_URL`（注意前缀）
- ✅ 确认变量值没有多余空格
- ✅ 配置后必须触发重新部署
- ✅ 确保应用到 Production 环境
- 📚 详细步骤：`docs/EdgeOne_环境变量配置指南.md`

#### 3. 数据库连接失败
- 检查Supabase URL和密钥
- 确认数据库表结构正确
- 验证网络连接

#### 4. 定时任务不执行
- 检查cron表达式是否正确
- 确认脚本路径和权限
- 查看定时任务日志

## 🎯 性能优化

### 1. 缓存策略
- 静态资源CDN缓存
- API响应缓存
- 数据库查询优化

### 2. 监控指标
- 页面加载时间
- API响应时间
- 数据库查询性能
- 错误率统计

## 📝 更新流程

### 1. 代码更新
1. 本地开发测试
2. 提交到GitHub
3. EdgeOne自动部署
4. 验证线上功能

### 2. 数据更新
1. 每天0点自动执行
2. 抓取最新热点数据
3. 更新Supabase数据库
4. 前端自动显示新内容

## 🎉 部署完成检查清单

- [ ] EdgeOne Pages项目创建成功
- [ ] GitHub仓库连接正常
- [ ] ⚠️ **环境变量配置完整**（最关键！）
  - [ ] NEXT_PUBLIC_SUPABASE_URL 已配置
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY 已配置
  - [ ] FIRECRAWL_API_KEY 已配置
  - [ ] 已触发重新部署
- [ ] 域名解析正确
- [ ] SSL证书生效
- [ ] 前端页面正常访问
- [ ] ✅ **API接口正常工作**
  - [ ] 访问 /competitor-dynamics 能看到数据
  - [ ] 访问 /api/competitor-templates 返回 success: true
  - [ ] 浏览器控制台无错误
- [ ] 数据库连接正常
- [ ] 定时任务配置完成（可选）
- [ ] 监控和日志正常

### 快速验证命令

```bash
# 验证API是否正常
curl https://你的域名.com/api/competitor-templates

# 应该返回：
# {"success": true, "data": {...}}

# 如果返回 "Supabase未配置"，说明环境变量没配置
```

---

**注意**: 请确保所有敏感信息（如API密钥）都通过环境变量配置，不要直接写在代码中。