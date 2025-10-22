# AI图片抠图功能使用指南

## 📖 概述

开发团队提供了一个内网AI图片抠图服务，支持智能去除图片背景。本文档介绍如何使用和集成此功能。

---

## 🔧 API信息

### 接口地址
```
http://10.13.155.144:5001/api/matting/image
```

### Web UI
```
http://10.13.146.159:5000/index.html#/generate
```

### 请求方式
```bash
POST (multipart/form-data)
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 待抠图的图片文件 |
| model | String | 是 | 模型名称：`comfyui` 或 `doubao` |

### 模型对比

| 模型 | 优势 | 适用场景 |
|------|------|----------|
| **comfyui** | 精度高，细节好 | 复杂背景、人像抠图、需要高质量结果 |
| **doubao** | 速度快 | 批量处理、简单背景、对速度要求高 |

---

## 🚀 快速开始

### 方法1：使用命令行测试脚本

我已经创建了一个测试脚本，可以快速测试API功能。

#### 安装依赖
```bash
npm install form-data
```

#### 测试单个模型
```bash
node scripts/test-matting-api.js ./test-image.png comfyui
```

#### 测试所有模型（对比效果）
```bash
node scripts/test-matting-api.js ./test-image.png --all
```

#### 示例输出
```
🎨 开始测试抠图API...

配置信息:
  API地址: http://10.13.155.144:5001/api/matting/image
  模型: comfyui
  输入图片: ./test-image.png
  Web UI: http://10.13.146.159:5000/index.html#/generate

📤 正在上传图片...
✅ 请求成功! 状态码: 200

📸 收到抠图结果（图片格式）
   内容类型: image/png
   文件大小: 245.67 KB

💾 抠图结果已保存: ./test-image_matting.png

✨ 测试完成!
```

---

### 方法2：使用cURL命令

#### ComfyUI模型
```bash
curl --location 'http://10.13.155.144:5001/api/matting/image' \
  --form 'file=@"/path/to/your/image.png"' \
  --form 'model="comfyui"' \
  --output result_comfyui.png
```

#### Doubao模型
```bash
curl --location 'http://10.13.155.144:5001/api/matting/image' \
  --form 'file=@"/path/to/your/image.png"' \
  --form 'model="doubao"' \
  --output result_doubao.png
```

---

### 方法3：集成到前端页面

我创建了一个React组件 `ImageMattingTool`，可以直接集成到项目中。

#### 使用组件
```tsx
import { ImageMattingTool } from '@/components/image-matting-tool'

export default function Page() {
  return (
    <div>
      <ImageMattingTool />
    </div>
  )
}
```

#### 功能特性
- ✅ 拖拽/点击上传图片
- ✅ 实时预览原图
- ✅ 选择抠图模型
- ✅ 查看抠图结果（透明背景棋盘格显示）
- ✅ 下载抠图结果
- ✅ 显示处理耗时
- ✅ 友好的错误提示

---

## 💻 代码集成示例

### JavaScript/Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

async function mattingImage(imagePath, model = 'comfyui') {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  form.append('model', model);

  return new Promise((resolve, reject) => {
    const request = http.request('http://10.13.155.144:5001/api/matting/image', {
      method: 'POST',
      headers: form.getHeaders(),
    }, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    });

    request.on('error', reject);
    form.pipe(request);
  });
}

// 使用
const result = await mattingImage('./image.png', 'comfyui');
fs.writeFileSync('./result.png', result);
```

### React/TypeScript

```typescript
async function uploadAndMatting(file: File, model: 'comfyui' | 'doubao') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', model);

  const response = await fetch('http://10.13.155.144:5001/api/matting/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`抠图失败: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// 使用
const resultUrl = await uploadAndMatting(imageFile, 'comfyui');
```

### Python

```python
import requests

def matting_image(image_path, model='comfyui'):
    url = 'http://10.13.155.144:5001/api/matting/image'
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        data = {'model': model}
        
        response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            with open('result.png', 'wb') as out:
                out.write(response.content)
            return True
        else:
            print(f"Error: {response.status_code}")
            return False

# 使用
matting_image('./image.png', 'comfyui')
```

---

## 🎯 应用场景

### 1. 字效图片处理
将生成的字效图片进行抠图，去除背景后可以：
- 叠加到其他背景上
- 制作透明PNG素材
- 用于设计稿合成

### 2. 产品图处理
- 商品图去背景
- 制作主图
- 多角度合成

### 3. 人像处理
- 证件照换背景
- 头像制作
- 海报合成

### 4. 批量处理
使用脚本批量处理大量图片：

```bash
for file in ./images/*.png; do
  node scripts/test-matting-api.js "$file" comfyui
done
```

---

## ⚠️ 注意事项

### 1. 网络要求
- ✅ 必须在公司内网环境
- ✅ IP `10.13.155.144` 可访问
- ❌ 外网无法访问

### 2. 文件要求
- 支持格式：JPG、PNG、WebP 等常见图片格式
- 建议大小：< 10MB
- 建议尺寸：< 4096x4096

### 3. 性能参考
- ComfyUI模型：约 3-8秒/张
- Doubao模型：约 1-3秒/张
- 实际速度取决于图片大小和复杂度

### 4. 错误处理

#### 连接失败
```
无法连接到抠图服务
```
**解决方案**：
1. 检查是否在内网环境
2. 确认服务是否运行：访问 http://10.13.146.159:5000
3. 检查IP和端口是否正确

#### 文件过大
```
Request Entity Too Large
```
**解决方案**：压缩图片或调整分辨率

#### 模型错误
```
Invalid model
```
**解决方案**：确保使用 `comfyui` 或 `doubao`

---

## 📊 测试示例

### 创建测试图片目录
```bash
mkdir -p test-images
mkdir -p test-results
```

### 批量测试
```bash
#!/bin/bash
# batch-test.sh

for img in test-images/*.{png,jpg,jpeg}; do
  if [ -f "$img" ]; then
    echo "Processing: $img"
    node scripts/test-matting-api.js "$img" comfyui
  fi
done
```

### 性能对比测试
```bash
# 测试两个模型并对比
node scripts/test-matting-api.js ./test.png --all
```

---

## 🔗 相关资源

- **Web UI**: http://10.13.146.159:5000/index.html#/generate
- **API文档**: 询问开发团队获取完整API文档
- **测试脚本**: `scripts/test-matting-api.js`
- **前端组件**: `components/image-matting-tool.tsx`

---

## 🐛 问题排查

### Q: 提示"无法连接到服务器"
A: 
1. 确认在内网环境
2. ping 10.13.155.144 检查网络
3. 联系运维确认服务状态

### Q: 抠图效果不理想
A:
1. 尝试切换模型（comfyui vs doubao）
2. 确保图片清晰度足够
3. 复杂背景推荐使用 comfyui 模型

### Q: 处理速度很慢
A:
1. 检查图片大小，建议压缩到合理尺寸
2. Doubao模型速度更快
3. 避免高峰期使用

### Q: 透明背景显示异常
A:
- PNG格式才支持透明背景
- 使用支持透明度的图片查看器
- Web显示可以添加棋盘格背景

---

## 📝 更新日志

### 2025-10-16
- ✅ 创建测试脚本 `test-matting-api.js`
- ✅ 创建React组件 `image-matting-tool.tsx`
- ✅ 编写使用文档

---

## 🤝 支持

如有问题，请联系：
- 开发团队：询问API详细文档
- 运维团队：服务器访问权限
- 前端团队：UI集成支持

---

**祝使用愉快！🎉**


