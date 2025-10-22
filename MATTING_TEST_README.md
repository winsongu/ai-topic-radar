# 🧪 AI抠图测试说明

## 📋 测试准备

我已经为您准备好了完整的测试方案，将测试**3张不同类型的图片**：

### 测试图片列表
1. ✅ **red-chinese-style-ppt-template.jpg** - 中国风红色PPT模板
2. ✅ **pink-hand-drawn-marketing-ppt-template.jpg** - 粉色手绘营销PPT
3. ✅ **yellow-cartoon-teacher-day-ppt.jpg** - 黄色卡通教师节PPT

### 测试模型
- ✅ **ComfyUI** - 高精度模型
- ✅ **Doubao** - 快速模型

**总共将执行**: 3张图片 × 2个模型 = **6次测试**

---

## 🚀 开始测试

### 一键运行测试（最简单）

```bash
./run-matting-test.sh
```

就这么简单！脚本会自动：
1. ✅ 创建结果目录 `test-matting-results/`
2. ✅ 依次测试3张图片
3. ✅ 对比2个模型效果
4. ✅ 保存所有结果
5. ✅ 生成测试报告
6. ✅ 自动打开结果目录（Mac）

---

## 📊 测试过程示例

运行后您会看到类似这样的输出：

```
🎨 开始批量测试AI抠图功能
================================

📋 测试计划:
  • 图片数量: 3
  • 模型数量: 2
  • 总测试数: 6

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 测试图片: red-chinese-style-ppt-template.jpg
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/6] 测试模型: comfyui
  输入: ./wps-news-aggregator2/public/red-chinese-style-ppt-template.jpg
  输出: test-matting-results/red-chinese-style-ppt-template_comfyui.png
  ✅ 成功! 耗时: 5秒, 大小: 1.2M

[2/6] 测试模型: doubao
  输入: ./wps-news-aggregator2/public/red-chinese-style-ppt-template.jpg
  输出: test-matting-results/red-chinese-style-ppt-template_doubao.png
  ✅ 成功! 耗时: 2秒, 大小: 1.1M

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 测试完成汇总
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

总测试数: 6
✅ 成功: 6
❌ 失败: 0

📁 抠图结果保存位置:
  目录: test-matting-results/

  生成的文件:
  • test-matting-results/red-chinese-style-ppt-template_comfyui.png (1.2M)
  • test-matting-results/red-chinese-style-ppt-template_doubao.png (1.1M)
  • test-matting-results/pink-hand-drawn-marketing-ppt-template_comfyui.png (987K)
  • test-matting-results/pink-hand-drawn-marketing-ppt-template_doubao.png (945K)
  • test-matting-results/yellow-cartoon-teacher-day-ppt_comfyui.png (1.5M)
  • test-matting-results/yellow-cartoon-teacher-day-ppt_doubao.png (1.4M)

📄 详细日志: test-matting-results/test-results.txt

✨ 测试脚本执行完成！
```

---

## 📁 结果文件位置

所有抠图结果都会保存在：

```
test-matting-results/
├── red-chinese-style-ppt-template_comfyui.png
├── red-chinese-style-ppt-template_doubao.png
├── pink-hand-drawn-marketing-ppt-template_comfyui.png
├── pink-hand-drawn-marketing-ppt-template_doubao.png
├── yellow-cartoon-teacher-day-ppt_comfyui.png
├── yellow-cartoon-teacher-day-ppt_doubao.png
└── test-results.txt (详细测试报告)
```

### 文件命名规则
```
原图名称_模型名称.png

例如:
red-chinese-style-ppt-template_comfyui.png
                                 ^^^^^^^^
                                 模型名称
```

---

## 📄 测试报告

测试完成后，会生成详细报告：`test-matting-results/test-results.txt`

报告内容包括：
- ✅ 每张图片的测试状态
- ✅ 每个模型的处理耗时
- ✅ 生成文件的大小
- ✅ 文件保存路径
- ✅ 失败原因（如果有）

---

## ⚠️ 重要提示

### 1. 需要内网环境
```
❌ 如果看到 "无法连接服务器"
💡 确认您在公司内网环境
💡 测试网络: ping 10.13.155.144
```

### 2. 首次运行可能较慢
- ComfyUI: 3-8秒/张
- Doubao: 1-3秒/张

### 3. 透明背景显示
生成的PNG文件有透明背景，用支持透明度的图片查看器打开效果最佳：
- Mac: 预览.app
- Windows: Windows照片查看器
- 浏览器: 拖入Chrome查看

---

## 🔧 进阶用法

### 测试其他图片
编辑 `run-matting-test.sh` 文件，修改 `TEST_IMAGES` 数组：

```bash
TEST_IMAGES=(
  "./你的图片1.png"
  "./你的图片2.jpg"
  "./你的图片3.png"
)
```

### 只测试单个模型
编辑 `MODELS` 数组：

```bash
MODELS=("comfyui")  # 只测试ComfyUI
# 或
MODELS=("doubao")   # 只测试Doubao
```

### 清空之前的结果
```bash
rm -rf test-matting-results/
./run-matting-test.sh
```

---

## 🆘 常见问题

### Q: 连接失败怎么办？
```bash
# 1. 测试网络
ping 10.13.155.144

# 2. 检查服务状态
curl http://10.13.146.159:5000

# 3. 确认VPN连接
```

### Q: 测试很慢？
- 正常！图片处理需要时间
- ComfyUI约3-8秒，Doubao约1-3秒
- 可以先测试小图片

### Q: 如何对比效果？
1. 打开 `test-matting-results/` 目录
2. 同时查看同一张图片的两个版本：
   - `xxx_comfyui.png`
   - `xxx_doubao.png`
3. 对比边缘细节和透明度

---

## 🎯 快速命令汇总

```bash
# 运行测试
./run-matting-test.sh

# 查看结果
open test-matting-results/  # Mac
explorer test-matting-results\  # Windows

# 查看报告
cat test-matting-results/test-results.txt

# 清空重测
rm -rf test-matting-results/ && ./run-matting-test.sh
```

---

## ✨ 祝测试顺利！

有任何问题随时告诉我 😊


