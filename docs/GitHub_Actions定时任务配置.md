# GitHub Actions 定时任务配置指南

> 使用GitHub Actions实现云端自动化数据抓取

---

## 📋 当前配置

### 1️⃣ 热点新闻（已配置 ✅）
- **配置文件**: `.github/workflows/daily-update.yml`
- **执行时间**: 
  - 北京时间 08:00（UTC 00:00）
  - 北京时间 13:30（UTC 05:30）
- **脚本**: `scripts/crawl-and-save-daily.js`
- **npm命令**: `npm run update:data`

### 2️⃣ 竞品动态（新增 ✨）
- **配置文件**: `.github/workflows/competitor-update.yml`
- **执行时间**: 北京时间 09:00（UTC 01:00）
- **脚本**: `scripts/crawl-competitor-templates-v2.js`
- **npm命令**: `npm run update:competitor`

---

## 🚀 快速开始

### 步骤1: 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets：

1. 进入仓库页面
2. 点击 **Settings** > **Secrets and variables** > **Actions**
3. 点击 **New repository secret** 添加以下密钥：

| Secret名称 | 说明 | 获取方式 |
|-----------|------|---------|
| `SUPABASE_URL` | Supabase项目URL | Supabase Dashboard > Settings > API |
| `SUPABASE_ANON_KEY` | Supabase匿名密钥 | Supabase Dashboard > Settings > API |
| `FIRECRAWL_API_KEY` | Firecrawl API密钥 | https://firecrawl.dev |

### 步骤2: 推送代码

```bash
# 提交新的workflow配置
git add .github/workflows/competitor-update.yml
git add package.json
git commit -m "feat: 添加竞品动态定时任务"
git push origin main
```

### 步骤3: 验证配置

1. 进入GitHub仓库
2. 点击 **Actions** 标签
3. 查看 **竞品动态每日更新** workflow
4. 点击 **Run workflow** 手动触发测试

---

## 📊 可用的npm命令

```bash
# 热点新闻更新
npm run update:data

# 竞品动态更新
npm run update:competitor

# 测试热点新闻抓取
npm run test:update

# 测试竞品动态抓取（小样本）
npm run test:competitor

# 生成营销日历数据
npm run generate:calendar
```

---

## 🔍 查看执行日志

### 方法1: GitHub Actions界面
1. 进入仓库的 **Actions** 页面
2. 点击对应的workflow运行记录
3. 展开各个步骤查看详细日志

### 方法2: Supabase数据库
```sql
-- 查看最近的抓取记录
SELECT 
  platform,
  COUNT(*) as total,
  MAX(crawled_at) as last_crawled
FROM competitor_templates
GROUP BY platform
ORDER BY last_crawled DESC;
```

---

## ⚙️ 修改执行时间

编辑 `.github/workflows/competitor-update.yml`：

```yaml
on:
  schedule:
    # 每天北京时间早上 9:00（UTC 1:00）
    - cron: '0 1 * * *'
    
    # 如果需要每天执行多次，添加更多cron表达式：
    # 每天北京时间下午 15:00（UTC 7:00）
    # - cron: '0 7 * * *'
```

**Cron表达式格式**：`分 时 日 月 周`

| 北京时间 | UTC时间 | Cron表达式 |
|---------|---------|-----------|
| 06:00 | 22:00 前一天 | `0 22 * * *` |
| 09:00 | 01:00 | `0 1 * * *` |
| 12:00 | 04:00 | `0 4 * * *` |
| 18:00 | 10:00 | `0 10 * * *` |
| 21:00 | 13:00 | `0 13 * * *` |

---

## 🐛 常见问题

### Q1: Workflow没有按时执行？

**可能原因**：
1. GitHub Actions在高峰期可能延迟5-15分钟
2. 免费账户有并发限制

**解决方案**：
- 手动触发测试：点击 **Run workflow**
- 检查Actions配额：Settings > Billing

### Q2: 执行失败显示401错误？

**原因**: Secrets配置错误

**解决方案**：
1. 检查Secrets名称是否正确
2. 确认Secrets值没有多余空格
3. 重新添加Secrets

### Q3: 如何临时停止定时任务？

```bash
# 方法1: 禁用workflow
# GitHub仓库 > Actions > 选择workflow > 点击右上角 "..." > Disable workflow

# 方法2: 修改workflow文件，注释掉schedule
on:
  # schedule:
  #   - cron: '0 1 * * *'
  workflow_dispatch: # 保留手动触发
```

### Q4: 数据没有更新到数据库？

**检查步骤**：
1. 查看Actions日志是否有错误
2. 确认Supabase RLS策略允许插入
3. 检查网络连接和API限流

---

## 📈 监控和优化

### 执行时长统计

GitHub Actions会显示每次执行的耗时，正常情况：
- **热点新闻**: ~2-5分钟
- **竞品动态**: ~3-8分钟（取决于抓取数量）

### 流量和配额

GitHub免费账户：
- ✅ 公共仓库：无限制
- ⚠️ 私有仓库：每月2000分钟

Firecrawl API：
- 根据你的套餐限制
- 建议在高峰期分散执行时间

---

## 🔒 安全建议

1. ✅ **使用Secrets**: 永远不要在代码中硬编码密钥
2. ✅ **最小权限**: 只赋予必要的数据库权限
3. ✅ **定期轮换**: 每3-6个月更新API密钥
4. ✅ **监控日志**: 定期检查异常活动

---

## 📚 相关文档

- [GitHub Actions文档](https://docs.github.com/actions)
- [Cron表达式生成器](https://crontab.guru/)
- [Supabase RLS策略](https://supabase.com/docs/guides/auth/row-level-security)
- 项目抓取文档: `docs/PPT竞品动态抓取来源及逻辑.md`

---

## ✅ 配置清单

使用这个清单确保所有步骤完成：

- [ ] GitHub Secrets已配置（3个）
- [ ] `.github/workflows/competitor-update.yml` 已创建
- [ ] `package.json` 已添加 `update:competitor` 命令
- [ ] 代码已推送到GitHub
- [ ] 手动触发测试成功
- [ ] 查看数据库确认数据已保存
- [ ] 前端页面能正常显示数据

---

**文档版本**: v1.0  
**最后更新**: 2025-10-22  
**维护者**: AI Topic Radar Team

