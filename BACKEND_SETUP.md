# 🚀 后端服务快速配置指南

这是一个**5分钟快速配置**指南，帮助您启动后端数据服务。

---

## 📋 配置清单

- [ ] 步骤 1：配置 Supabase 数据库（3分钟）
- [ ] 步骤 2：配置 GitHub Actions 定时任务（2分钟）
- [ ] 步骤 3：测试数据更新（1分钟）
- [ ] 步骤 4：验证前端显示（1分钟）

---

## ⚡ 步骤 1：配置 Supabase 数据库

### **1.1 创建 Supabase 项目**

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `ai-topic-radar`
   - Database Password: （设置一个强密码）
   - Region: `Southeast Asia (Singapore)` 或离您最近的区域
4. 点击 "Create new project"（等待 2 分钟）

### **1.2 记录API密钥**

在项目 Settings > API 中，记录：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### **1.3 创建数据表**

1. 在 Supabase Dashboard，点击左侧 **SQL Editor**
2. 点击 **"New query"**
3. 复制 `scripts/setup-database.sql` 的全部内容
4. 粘贴并点击 **"Run"**
5. 看到 "Success. No rows returned"  ✅

### **1.4 验证表结构**

点击左侧 **Table Editor**，应该看到：
- ✅ `platforms` 表（8条记录）
- ✅ `hot_news` 表（0条记录）

---

## ⏰ 步骤 2：配置 GitHub Actions

### **2.1 添加 Secrets**

在 GitHub 仓库页面：

1. 点击 **Settings** 标签
2. 左侧菜单选择 **Secrets and variables** > **Actions**
3. 点击 **"New repository secret"**
4. 添加两个 secrets：

   **第一个：**
   - Name: `SUPABASE_URL`
   - Secret: 粘贴您的 Supabase URL

   **第二个：**
   - Name: `SUPABASE_ANON_KEY`
   - Secret: 粘贴您的 Supabase 匿名密钥

### **2.2 启用 Actions**

1. 点击仓库的 **Actions** 标签
2. 如果看到 "Workflows aren't being run"，点击 **"I understand my workflows, go ahead and enable them"**
3. 应该看到 **"每日数据更新"** workflow

### **2.3 手动触发测试**

1. 点击 **"每日数据更新"** workflow
2. 点击右侧 **"Run workflow"** 下拉菜单
3. 点击绿色 **"Run workflow"** 按钮
4. 等待 30 秒，刷新页面
5. 看到绿色 ✅ 表示成功

---

## 🧪 步骤 3：测试数据更新（本地）

### **3.1 配置本地环境变量**

编辑 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### **3.2 安装依赖**

```bash
npm install @supabase/supabase-js
```

### **3.3 运行测试**

```bash
npm run test:update
```

### **3.4 检查输出**

应该看到类似输出：

```
🚀 开始每日数据更新任务
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 第一步：抓取数据源...

📌 处理: 百度热搜
   ✅ 抓取成功，获得 10 条新闻
   ✅ 成功插入 10 条新闻

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 每日更新完成！
✅ 成功处理: 50/50 条新闻
```

---

## ✅ 步骤 4：验证前端显示

### **4.1 启动开发服务器**

```bash
npm run dev
```

### **4.2 打开浏览器**

访问 [http://localhost:3000](http://localhost:3000)

### **4.3 检查首页**

- ✅ 应该看到 8 个平台卡片
- ✅ 每个卡片显示数据更新时间
- ✅ 点击卡片应该弹出新闻列表

### **4.4 测试点击事件**

1. 点击任意平台卡片
2. 应该弹出模态框显示新闻列表
3. 点击新闻标题应该打开原文链接

---

## 🎉 完成！

您的后端服务已经配置完成！

### **自动化流程**

从现在开始：
1. 每天北京时间 0:00，GitHub Actions 自动运行
2. 爬虫抓取最新热点数据
3. 数据保存到 Supabase
4. 前端自动显示最新内容

### **监控运行状态**

- **GitHub Actions**：仓库 > Actions 标签
- **Supabase 数据**：Dashboard > Table Editor
- **前端显示**：访问您的网站

---

## 🔧 常见问题

### **Q1: GitHub Actions 运行失败？**

**检查清单**：
- [ ] Secrets 配置正确？
- [ ] Supabase URL 和 Key 有效？
- [ ] Actions 已启用？

**解决方法**：
```bash
# 本地测试
npm run test:update

# 如果本地成功，说明 GitHub Secrets 配置有误
```

### **Q2: 首页显示"无法加载数据"？**

**检查清单**：
- [ ] `.env.local` 配置正确？
- [ ] Supabase 数据库有数据？
- [ ] 网络连接正常？

**解决方法**：
```bash
# 打开浏览器控制台（F12）
# 查看 Network 标签，检查 API 请求
```

### **Q3: 数据不是最新的？**

**检查清单**：
- [ ] 定时任务是否运行？
- [ ] 数据库最后更新时间？

**解决方法**：
```bash
# 手动触发更新
npm run update:data
```

---

## 📞 需要帮助？

1. 查看详细文档：`scripts/README.md`
2. 查看错误日志：GitHub Actions > 运行详情
3. 检查 Supabase：Dashboard > Logs

---

**祝您使用愉快！** 🎊

