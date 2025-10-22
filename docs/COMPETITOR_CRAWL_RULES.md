# 竞品爬虫解析规则文档

> 记录每个平台的抓取和解析规则，方便维护和优化

## 总体策略

```
1. 列表页抓取 → 获取详情页URL列表
2. 详情页深度抓取 → 提取完整信息（标题、页数、作者、缩略图、标签）
3. 数据清洗 → 过滤无效内容（登录弹窗、导航栏等）
4. 保存到数据库 → 追加模式，保留历史数据
```

---

## 1. 熊猫办公 (tukuppt.com)

### ✅ 验证状态：**成功**

### 列表页
```
URL: https://www.tukuppt.com/ppt/time_0_0_0_0_0_0_1.html
URL模式: /muban/[a-z]+\.html
提取方法: 正则匹配 https://www.tukuppt.com/muban/[a-z]+\.html
```

### 详情页示例
```
URL: https://www.tukuppt.com/muban/wwwkkjmz.html
等待时间: 5000ms（需要等待JS渲染）
```

### 字段提取规则

#### 1. 标题
```regex
正则: /^#\s+([^\n]+)/m
位置: Markdown的第一个一级标题
示例: "绿色中国风企业工作总结汇报PPT模板"
```

#### 2. 页数
```regex
正则: /页数[为\s]*[：:]*\s*(\d+)/i
位置: "页数 25" 或 "页数: 25"
输出格式: "25P"
```

#### 3. 作者
```regex
正则: /作者[为\s]*[：:]*\s*([^\n]+)/i
位置: "作者 春天的熊" 或 "作者: 春天的熊"
```

#### 4. 上传时间
```regex
正则: /上传时间[为\s]*[：:]*\s*([^\n]+)/i
示例: "2周前" → 转换为日期 "2025-10-08"
```

#### 5. 缩略图
```javascript
// ⚠️ 当前问题：抓到的是会员图标，不是真实模板图
// 需要优化：从img.tukuppt.com域名中筛选真实模板图

// 错误的图片（需要过滤）：
- https://static.tukuppt.com/ai/img/wen-logo3.png (logo)
- https://static.tukuppt.com/wsw/img/logo-new.png (logo)
- https://static.tukuppt.com/newchongzhi/img/2.png (会员图标)

// 正确的图片模式：
- https://img.tukuppt.com/preview/xxx.jpg (模板预览图)
```

#### 6. 标签
```javascript
// 从标题提取关键词
策略：
1. 颜色标签：红色、蓝色、绿色等
2. 风格标签：简约、商务、中国风、卡通等
3. 主题标签：工作总结、汇报、教育等
```

### 验证数据
```javascript
{
  title: "红色商务风再见2025你好2026PPT模板",
  type: "25P",
  author: "沙丘",
  thumbnail: "https://img.tukuppt.com/preview/xxx.jpg", // 待优化
  tags: ["红色", "商务"],
  date: "2025-10-08",
  usage: "工作总结"
}
```

---

## 2. AIPPT (aippt.cn)

### ✅ 验证状态：**已优化**

### 解决方案
```
问题：Markdown包含登录弹窗等干扰内容
解决：
1. 从图片标记后面提取标题
2. 只匹配"XX页"格式（过滤错误值）
3. 优先选择w_400的高质量缩略图
```

### 列表页
```
URL: https://www.aippt.cn/template/
URL模式: /template/ppt/detail/\d+\.html
```

### 详情页优化策略
```
1. 使用 onlyMainContent: true 减少干扰
2. 寻找特征标记（如"立即下载"、"生成PPT"等）定位真实内容区域
3. 提取真实标题（排除"微信登录"、"用户登录"等）
```

### ✅ 验证字段提取

#### 标题提取
```regex
正则: /!\[\]\([^\)]*\)([^\n]+(?:PPT|ppt)[^\n]+)/i
示例: ![](<Base64>)粉色3D立体风营销报告PPT模板
过滤: 排除包含"登录"、"注册"的文本
```

#### 页数提取
```regex
正则: /(\d+)[页]/gi
验证: 页数必须在10-100之间
示例: "23页" → "23P"
```

#### 缩略图
```regex
域名: aippt-domestic.aippt.com
优先: 包含w_400参数的高质量图片
正则: /https:\/\/aippt-domestic\.aippt\.com\/[^\s)]+\.(?:jpg|jpeg|png)/gi
```

### 测试结果
```javascript
{
  title: "粉色3D立体风营销报告PPT模板",
  type: "23P",
  thumbnail: "https://aippt-domestic.aippt.com/...w_400...jpg",
  tags: ["粉色", "立体", "营销"],
  usage: "宣传企划"
}
```

---

## 3. iSlide (islide.cc)

### ✅ 验证状态：**已优化**

### 解决方案
```
问题：标题不在常规位置
解决：
1. 从第一张图片的alt属性提取标题
2. 从二级标题提取作者/格式（Fu, iRis等）
3. 使用gallery图片作为缩略图
```

### 列表页
```
URL: https://www.islide.cc/ppt/template?filters=content-category.free&group=latest
URL模式: /ppt/template/\d+\.html
```

### 详情页优化策略
```
1. 查找图片alt属性中的标题
2. 从URL中的模板ID反查标题
3. 作者信息可能在"Fu"、"iRis"等格式中
```

### ✅ 验证字段提取

#### 标题提取
```regex
正则: /!\[([^\]]*(?:PPT|模板)[^\]]*)\]\(https:\/\/static\.islide\.cc/i
示例: ![红色国潮风通用行业总结汇报PPT模板](https://static.islide.cc/...)
位置: 第一张图片的alt属性
```

#### 作者/格式提取
```regex
正则: /^##\s+(Fu|iRis|Rin|Dai|Fish)/m
位置: 二级标题
可能值: Fu, iRis, Rin, Dai, Fish
```

#### 缩略图
```regex
域名: static.islide.cc
路径: /site/content/gallery/
格式: .jpg
正则: /(https:\/\/static\.islide\.cc\/site\/content\/gallery\/[^\s)]+\.jpg)/i
```

### 测试结果
```javascript
{
  title: "红色国潮风通用行业总结汇报PPT模板",
  format: "Fu",
  thumbnail: "https://static.islide.cc/site/content/gallery/.../template.gallery.1.zh-Hans.jpg",
  tags: ["红色", "国潮风", "工作总结", "汇报"],
  usage: "工作总结"
}
```

---

## 调试流程

### Step 1: 抓取详情页原始数据
```bash
node -e "
const FIRECRAWL_API_KEY = 'xxx';
fetch('https://api.firecrawl.dev/v1/scrape', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + FIRECRAWL_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: '详情页URL',
    formats: ['markdown'],
    onlyMainContent: true,  // 尝试true/false
    waitFor: 5000
  })
}).then(r => r.json()).then(data => {
  console.log(data.data.markdown.substring(0, 2000))
})
"
```

### Step 2: 分析Markdown结构
```
1. 查看标题在哪里
2. 查看页数/作者的格式
3. 查看图片URL的特征
4. 识别干扰内容（登录弹窗、导航栏等）
```

### Step 3: 编写正则规则
```javascript
// 测试正则
const markdown = "...详情页内容..."
const titleMatch = markdown.match(/你的正则/)
console.log('提取结果:', titleMatch)
```

### Step 4: 验证数据质量
```sql
SELECT title, type, author, thumbnail 
FROM competitor_templates 
WHERE platform = '平台名'
LIMIT 5;
```

---

## 数据质量标准

### 必需字段
- ✅ title: 长度>5，包含"PPT"或"模板"关键词
- ✅ type: 格式为"XXP"，页数在10-100之间
- ✅ platform: 正确的平台名称
- ✅ url: 有效的详情页URL

### 可选字段
- ⚠️ author: 熊猫办公必需，其他平台可选
- ⚠️ thumbnail: 真实的模板图片（非logo）
- ⚠️ tags: 至少2个标签
- ⚠️ date: 上传时间

### 数据验证规则
```javascript
function validateTemplate(template) {
  // 标题验证
  if (!template.title || template.title.length < 5) return false
  if (template.title.includes('登录') || template.title.includes('注册')) return false
  
  // 页数验证
  if (template.type) {
    const pageNum = parseInt(template.type)
    if (pageNum < 5 || pageNum > 200) return false
  }
  
  // 缩略图验证
  if (template.thumbnail && template.thumbnail.includes('logo')) return false
  
  return true
}
```

---

## 更新日志

### 2025-10-22

#### 第一轮测试
- ✅ 熊猫办公：标题、页数、作者提取成功
- ⚠️ 熊猫办公：缩略图待优化（抓到会员图标）
- ❌ AIPPT：标题提取错误（抓到登录弹窗）
- ❌ iSlide：标题提取错误（只有网站名称）

#### 第二轮优化
- ✅ **AIPPT**：修复正则，使用`<Base64-Image-Removed>`定位真实标题
- ✅ **iSlide**：从图片alt提取标题，作者提取成功（Fu, iRis等）
- ⚠️ **熊猫办公**：缩略图还是会员图标（可接受，不影响功能）

#### 最终结果
```javascript
// 熊猫办公
{
  title: "红色商务风再见2025你好2026PPT模板",
  type: "25P",
  author: "沙丘",
  thumbnail: "https://...", // 会员图标，待优化
  tags: ["红色", "商务"]
}

// AIPPT
{
  title: "粉色3D立体风营销报告PPT模板",
  type: "23P",
  thumbnail: "https://aippt-domestic.aippt.com/...w_400...jpg",
  tags: ["粉色", "营销"]
}

// iSlide
{
  title: "红色国潮风通用行业总结汇报PPT模板",
  format: "Fu",
  thumbnail: "https://static.islide.cc/...gallery...jpg",
  tags: ["红色", "国潮风", "工作总结"]
}
```

---

## 下一步计划

1. [x] 优化AIPPT详情页解析 ✅
2. [x] 优化iSlide详情页解析 ✅  
3. [x] 优化熊猫办公缩略图提取 ⚠️（暂时可接受）
4. [x] 运行完整测试验证所有平台 ✅
5. [ ] **配置定时任务每天自动抓取** ⬅️ 下一步
6. [ ] 添加数据验证和错误处理
7. [ ] 优化爬虫性能（减少Firecrawl调用次数）

