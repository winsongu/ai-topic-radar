# 🎨 字效图片抠图测试指南

## 📋 说明

这个脚本专门用于测试 **MagicFont 字效图片** 的抠图效果：
- ✅ 从 `downloads` 文件夹**随机选择**字效图片
- ✅ 结果保存到 `MagicFont-main` 目录下
- ✅ 自动测试两个模型对比效果

---

## 🚀 使用方法

### 方式1：自动查找（需要标准路径）

如果您的目录结构是：
```
~/Downloads/MagicFont-main/
  ├── downloads/           # 字效图片目录
  │   ├── font1.png
  │   ├── font2.png
  │   └── ...
  └── matting-results/     # 结果目录（自动创建）
```

只需运行：
```bash
./test-font-images.sh
```

---

### 方式2：指定路径（推荐）

```bash
./test-font-images.sh <字效图片目录> <结果保存目录> [测试数量]
```

#### 参数说明
- **参数1**: 字效图片所在目录（必需）
- **参数2**: 结果保存目录（必需）
- **参数3**: 测试图片数量（可选，默认3张）

#### 示例命令

```bash
# 测试3张图片（默认）
./test-font-images.sh ~/Downloads/MagicFont-main/downloads ~/Downloads/MagicFont-main/matting-results

# 测试5张图片
./test-font-images.sh ~/Downloads/MagicFont-main/downloads ~/Downloads/MagicFont-main/matting-results 5

# 测试所有图片（假设有10张）
./test-font-images.sh ~/Downloads/MagicFont-main/downloads ~/Downloads/MagicFont-main/matting-results 10
```

---

## 📁 目录结构

### 执行前
```
MagicFont-main/
└── downloads/
    ├── 创建中秋节文本框.png
    ├── 国庆节字效.png
    ├── 双十一促销.png
    └── ...更多字效图片
```

### 执行后
```
MagicFont-main/
├── downloads/                    # 原始字效图片
│   ├── 创建中秋节文本框.png
│   └── ...
└── matting-results/              # 抠图结果（新创建）
    ├── 创建中秋节文本框_comfyui.png
    ├── 创建中秋节文本框_doubao.png
    ├── 国庆节字效_comfyui.png
    ├── 国庆节字效_doubao.png
    └── test-results.txt          # 测试报告
```

---

## 🎲 随机选择说明

脚本会：
1. ✅ 扫描指定目录下的**所有** `.png`, `.jpg`, `.jpeg` 图片
2. ✅ **随机打乱**顺序
3. ✅ 选择指定数量的图片（默认3张）
4. ✅ 对每张图片测试 ComfyUI 和 Doubao 两个模型

**每次运行都会选择不同的图片！** 🎰

---

## 📊 测试输出示例

```
🎨 字效图片AI抠图测试工具
================================

📋 配置信息:
  字效图片目录: /Users/a/Downloads/MagicFont-main/downloads
  结果保存目录: /Users/a/Downloads/MagicFont-main/matting-results
  测试图片数量: 3

🔍 正在扫描字效图片...
✅ 找到 25 张字效图片

🎲 随机选择 3 张图片进行测试...

📸 已选择以下图片:
  1. 创建中秋节文本框.png
  2. 双十一促销字效.png
  3. 春节快乐艺术字.png

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
开始测试 (总共 6 次)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 测试图片: 创建中秋节文本框.png
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/6] 测试模型: comfyui
  输入: 创建中秋节文本框.png
  ✅ 成功! 耗时: 5秒, 大小: 1.2M
  💾 保存到: /Users/a/Downloads/MagicFont-main/matting-results/创建中秋节文本框_comfyui.png

[2/6] 测试模型: doubao
  输入: 创建中秋节文本框.png
  ✅ 成功! 耗时: 2秒, 大小: 1.1M
  💾 保存到: /Users/a/Downloads/MagicFont-main/matting-results/创建中秋节文本框_doubao.png

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 测试完成汇总
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

总测试数: 6
✅ 成功: 6
❌ 失败: 0

📁 抠图结果保存位置:
  /Users/a/Downloads/MagicFont-main/matting-results

  生成的文件:
  • 创建中秋节文本框_comfyui.png (1.2M)
  • 创建中秋节文本框_doubao.png (1.1M)
  • 双十一促销字效_comfyui.png (987K)
  • 双十一促销字效_doubao.png (945K)
  • 春节快乐艺术字_comfyui.png (1.5M)
  • 春节快乐艺术字_doubao.png (1.4M)

📄 详细日志: /Users/a/Downloads/MagicFont-main/matting-results/test-results.txt

🖼️  正在打开结果目录...

✨ 测试完成！
```

---

## 💡 使用技巧

### 1. 如何找到字效图片目录？

```bash
# 方法1：直接看
ls ~/Downloads/MagicFont-main/downloads

# 方法2：搜索
find ~/Downloads -name "MagicFont-main" -type d

# 方法3：查看脚本提示
./test-font-images.sh
# 会显示当前尝试的路径
```

### 2. 测试不同数量的图片

```bash
# 只测试1张（快速验证）
./test-font-images.sh ~/Downloads/MagicFont-main/downloads ~/Downloads/MagicFont-main/results 1

# 测试3张（默认，推荐）
./test-font-images.sh ~/Downloads/MagicFont-main/downloads ~/Downloads/MagicFont-main/results 3

# 测试10张（全面对比）
./test-font-images.sh ~/Downloads/MagicFont-main/downloads ~/Downloads/MagicFont-main/results 10
```

### 3. 对比两个模型效果

抠图完成后，在 Finder 中同时打开：
- `xxx_comfyui.png` - ComfyUI模型结果
- `xxx_doubao.png` - Doubao模型结果

对比：
- ✨ 边缘处理质量
- ✨ 透明度效果
- ✨ 细节保留程度

---

## ⚠️ 常见问题

### Q: 找不到字效图片目录？
```bash
# 确认目录路径
ls ~/Downloads/MagicFont-main/
ls ~/Downloads/MagicFont-main/downloads/

# 或者直接指定完整路径
./test-font-images.sh /path/to/your/downloads /path/to/save/results
```

### Q: 没有图片被选择？
确保目录中有 `.png`, `.jpg`, 或 `.jpeg` 格式的图片：
```bash
ls ~/Downloads/MagicFont-main/downloads/*.png
ls ~/Downloads/MagicFont-main/downloads/*.jpg
```

### Q: 想测试特定图片而不是随机？
修改脚本或者手动测试：
```bash
# 单张图片测试
curl -X POST http://10.13.155.144:5001/api/matting/image \
  -F "file=@/path/to/your/font-image.png" \
  -F "model=comfyui" \
  -o result.png
```

### Q: 结果保存在哪里？
- 默认: `~/Downloads/MagicFont-main/matting-results/`
- 可自定义: 通过第二个参数指定

---

## 🎯 快速命令汇总

```bash
# 1. 标准测试（默认路径，3张图片）
./test-font-images.sh

# 2. 指定路径和数量
./test-font-images.sh ~/Downloads/MagicFont-main/downloads ~/Downloads/MagicFont-main/results 5

# 3. 查看结果
open ~/Downloads/MagicFont-main/matting-results/

# 4. 查看测试报告
cat ~/Downloads/MagicFont-main/matting-results/test-results.txt

# 5. 清空结果重新测试
rm -rf ~/Downloads/MagicFont-main/matting-results/
./test-font-images.sh
```

---

## 🎨 文件命名规则

```
原始字效图片: 创建中秋节文本框.png

↓ 抠图后

ComfyUI结果: 创建中秋节文本框_comfyui.png
Doubao结果:  创建中秋节文本框_doubao.png
```

---

## ✨ 祝测试顺利！

如有问题随时询问 😊


