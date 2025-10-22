# 🎨 AI图片抠图 - 快速开始

开发团队提供的AI图片抠图服务已集成！3种方式快速使用：

---

## ⚡ 方式1：命令行快速测试（最简单）

### Bash脚本（推荐）
```bash
# 给脚本执行权限（首次使用）
chmod +x test-matting-example.sh

# 使用ComfyUI模型（推荐，效果好）
./test-matting-example.sh ./your-image.png comfyui

# 使用Doubao模型（速度快）
./test-matting-example.sh ./your-image.png doubao
```

### Node.js脚本
```bash
# 测试单张图片
node scripts/test-matting-api.js ./your-image.png comfyui

# 测试所有模型对比效果
node scripts/test-matting-api.js ./your-image.png --all
```

---

## 🌐 方式2：使用Web UI（最直观）

直接在浏览器打开（需内网）：
```
http://10.13.146.159:5000/index.html#/generate
```

1. 上传图片
2. 选择模型
3. 点击生成
4. 下载结果

---

## 💻 方式3：cURL命令（最灵活）

### ComfyUI模型
```bash
curl -X POST http://10.13.155.144:5001/api/matting/image \
  -F "file=@./your-image.png" \
  -F "model=comfyui" \
  -o result.png
```

### Doubao模型
```bash
curl -X POST http://10.13.155.144:5001/api/matting/image \
  -F "file=@./your-image.png" \
  -F "model=doubao" \
  -o result.png
```

---

## 🎯 模型选择建议

| 场景 | 推荐模型 | 原因 |
|------|---------|------|
| 字效图片 | **comfyui** | 细节保留好，边缘清晰 |
| 复杂背景 | **comfyui** | 识别精度高 |
| 批量处理 | **doubao** | 速度快，适合大量图片 |
| 简单背景 | **doubao** | 效果够用，速度优势明显 |

---

## 📊 效果示例

输入图片 → 选择模型 → 获得透明背景PNG

**处理时间参考**：
- ComfyUI: 3-8秒
- Doubao: 1-3秒

---

## ⚠️ 重要提示

1. **必须在内网使用** - IP `10.13.155.144` 仅限内网访问
2. **图片大小限制** - 建议 < 10MB
3. **支持格式** - JPG、PNG、WebP等常见格式

---

## 🆘 遇到问题？

### 连接失败
```bash
# 测试网络连通性
ping 10.13.155.144

# 检查服务状态
curl http://10.13.146.159:5000
```

### 查看完整文档
```bash
cat docs/IMAGE_MATTING_GUIDE.md
```

---

## 🚀 批量处理示例

```bash
#!/bin/bash
# 批量处理当前目录所有PNG图片

for img in *.png; do
  echo "Processing: $img"
  ./test-matting-example.sh "$img" comfyui
done

echo "✅ 批量处理完成！"
```

---

## 🎉 一句话总结

**最简单的用法**：
```bash
./test-matting-example.sh 你的图片.png
```

就这么简单！🚀


