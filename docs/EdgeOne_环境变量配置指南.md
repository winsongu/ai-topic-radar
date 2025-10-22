# EdgeOne Pages 环境变量配置指南

## 📋 问题说明

如果部署后看到"竞品动态"页面没有数据，或显示"Supabase未配置"错误，说明环境变量没有正确配置。

## ✅ 配置步骤

### 1. 登录 EdgeOne Pages 控制台

访问：https://console.cloud.tencent.com/edgeone

### 2. 找到项目设置

1. 在左侧菜单选择 **"Pages"**
2. 找到项目 **"ai-topic-radar"**
3. 点击进入项目详情
4. 找到 **"设置"** 或 **"环境变量"** 选项卡

### 3. 添加环境变量

点击"添加环境变量"，逐个添加以下配置：

#### 必需的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sdxgocjszjnrqrfbsspn.supabase.co` | Supabase数据库地址 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeGdvY2pzempucnFyZmJzc3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTM4NjgsImV4cCI6MjA3NTU2OTg2OH0.8lJ8dCBTT3qwmwNdL71EMPcVAmZHAgBeEp3rr-X6GJU` | Supabase匿名密钥 |
| `FIRECRAWL_API_KEY` | `fc-c34842bb4fd54a58a7b001c5369a3bcb` | Firecrawl爬虫API |

#### 可选的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DEEPSEEK_API_KEY` | `sk-your-key-here` | DeepSeek AI API（如需AI功能） |

### 4. 环境变量作用范围

**重要**：确保环境变量应用到正确的环境：

- ✅ **生产环境（Production）** - 必须配置
- ✅ **预览环境（Preview）** - 建议配置（用于测试）
- ⚠️ 注意不同环境可能需要分别配置

### 5. 保存并重新部署

1. **保存环境变量**后，需要触发重新部署
2. 两种方式触发重新部署：
   
   **方式A：在控制台手动重新部署**
   - 在 EdgeOne Pages 控制台找到"部署"选项
   - 点击"重新部署最新版本"

   **方式B：推送新的提交到GitHub**
   ```bash
   git commit --allow-empty -m "chore: trigger redeploy with env vars"
   git push origin main
   ```

### 6. 验证配置

部署完成后，访问你的网站：
- 打开"竞品动态"页面
- 应该能看到从数据库加载的模板数据
- 右上角应显示"最后更新时间"

## 🔍 故障排查

### 问题1：配置后仍然看不到数据

**检查清单**：
1. ✅ 确认环境变量名称完全正确（包括大小写）
2. ✅ 确认环境变量值没有多余的空格
3. ✅ 确认已经重新部署（只保存环境变量不会立即生效）
4. ✅ 清除浏览器缓存后重新访问

### 问题2：如何查看部署日志

1. 在 EdgeOne Pages 控制台
2. 进入项目 -> "部署历史"
3. 点击最新的部署记录
4. 查看"构建日志"和"部署日志"

### 问题3：如何验证环境变量是否生效

在本地测试（可选）：
```bash
# 创建 .env.local 文件
cp .env.example .env.local

# 本地运行
npm install
npm run dev

# 访问 http://localhost:3000/competitor-dynamics
```

## 📸 配置截图参考

EdgeOne Pages 环境变量配置界面通常长这样：

```
┌─────────────────────────────────────────────────┐
│ 环境变量管理                                     │
├─────────────────────────────────────────────────┤
│ [+ 添加环境变量]                                 │
│                                                  │
│ 变量名: NEXT_PUBLIC_SUPABASE_URL                │
│ 值:     https://sdxgocjszjnrqrfbsspn...         │
│ 环境:   [✓] Production  [✓] Preview              │
│ [保存] [删除]                                    │
│                                                  │
│ 变量名: NEXT_PUBLIC_SUPABASE_ANON_KEY           │
│ 值:     eyJhbGciOiJIUzI1NiIsInR5cCI...         │
│ 环境:   [✓] Production  [✓] Preview              │
│ [保存] [删除]                                    │
│                                                  │
│ 变量名: FIRECRAWL_API_KEY                       │
│ 值:     fc-c34842bb4fd54a58a7b001c5...          │
│ 环境:   [✓] Production  [✓] Preview              │
│ [保存] [删除]                                    │
└─────────────────────────────────────────────────┘
```

## 🎯 常见错误及解决

### 错误1: "Supabase未配置"

**原因**：环境变量缺失或配置错误

**解决**：
1. 检查 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. 确保变量名前缀是 `NEXT_PUBLIC_`（Next.js 要求）
3. 重新部署

### 错误2: "获取数据失败"

**原因**：数据库连接问题或API密钥错误

**解决**：
1. 登录 Supabase 控制台验证项目状态
2. 检查 API 密钥是否过期
3. 查看 Supabase 项目的"API Settings"确认密钥

### 错误3: 构建成功但运行时错误

**原因**：环境变量只在运行时生效

**解决**：
1. 环境变量配置后必须重新部署
2. 不要只保存配置，要触发新的构建

## 📞 获取帮助

如果按照上述步骤仍无法解决问题：

1. **查看完整的部署日志**
   - 在 EdgeOne Pages 控制台查看详细错误信息

2. **检查 Supabase 状态**
   - 访问：https://supabase.com/dashboard
   - 确认项目运行正常

3. **本地测试**
   - 使用相同的环境变量在本地运行
   - 确认功能正常后再部署

## 🎉 配置完成检查清单

部署成功后，请确认：

- [ ] EdgeOne Pages 环境变量已全部配置
- [ ] 已触发重新部署
- [ ] 部署日志显示"Build completed"
- [ ] 访问网站可以看到竞品动态数据
- [ ] 数据更新时间正常显示
- [ ] 筛选和搜索功能正常
- [ ] 浏览器控制台没有API错误

---

**最后更新**: 2025-10-22  
**适用版本**: ai-topic-radar v1.0.0

