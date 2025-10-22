#!/bin/bash

# 字效图片抠图测试脚本
# 从指定的字效图片目录随机选择图片进行测试

echo "🎨 字效图片AI抠图测试工具"
echo "================================"
echo ""

# 配置路径（可以通过参数修改）
FONT_IMAGES_DIR="${1:-$HOME/Downloads/MagicFont-main/downloads}"
OUTPUT_BASE_DIR="${2:-$HOME/Downloads/MagicFont-main/matting-results}"
TEST_COUNT="${3:-3}"  # 要测试的图片数量

echo "📋 配置信息:"
echo "  字效图片目录: $FONT_IMAGES_DIR"
echo "  结果保存目录: $OUTPUT_BASE_DIR"
echo "  测试图片数量: $TEST_COUNT"
echo ""

# 检查字效图片目录是否存在
if [ ! -d "$FONT_IMAGES_DIR" ]; then
  echo "❌ 错误: 字效图片目录不存在!"
  echo "   路径: $FONT_IMAGES_DIR"
  echo ""
  echo "💡 使用方法:"
  echo "   ./test-font-images.sh <字效图片目录> <结果保存目录> [测试数量]"
  echo ""
  echo "示例:"
  echo "   ./test-font-images.sh ~/Downloads/MagicFont-main/downloads ~/Downloads/MagicFont-main/matting-results 3"
  echo ""
  exit 1
fi

# 创建输出目录
mkdir -p "$OUTPUT_BASE_DIR"
echo "✅ 结果目录已创建: $OUTPUT_BASE_DIR"
echo ""

# 查找所有图片文件
echo "🔍 正在扫描字效图片..."
IMAGE_FILES=($(find "$FONT_IMAGES_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) 2>/dev/null))

TOTAL_IMAGES=${#IMAGE_FILES[@]}

if [ $TOTAL_IMAGES -eq 0 ]; then
  echo "❌ 错误: 目录中没有找到图片文件!"
  echo "   目录: $FONT_IMAGES_DIR"
  echo ""
  exit 1
fi

echo "✅ 找到 $TOTAL_IMAGES 张字效图片"
echo ""

# 限制测试数量
if [ $TEST_COUNT -gt $TOTAL_IMAGES ]; then
  TEST_COUNT=$TOTAL_IMAGES
  echo "⚠️  测试数量调整为: $TEST_COUNT (目录中的全部图片)"
  echo ""
fi

# 随机选择图片
echo "🎲 随机选择 $TEST_COUNT 张图片进行测试..."
SELECTED_IMAGES=()

# 使用 shuf 命令随机打乱并选择（如果系统支持）
if command -v shuf &> /dev/null; then
  # Linux/Mac with shuf
  mapfile -t SELECTED_IMAGES < <(printf '%s\n' "${IMAGE_FILES[@]}" | shuf -n $TEST_COUNT)
else
  # 备用方案：使用 sort -R
  mapfile -t SELECTED_IMAGES < <(printf '%s\n' "${IMAGE_FILES[@]}" | sort -R | head -n $TEST_COUNT)
fi

echo ""
echo "📸 已选择以下图片:"
for i in "${!SELECTED_IMAGES[@]}"; do
  img_name=$(basename "${SELECTED_IMAGES[$i]}")
  echo "  $((i+1)). $img_name"
done
echo ""

# 模型列表
MODELS=("comfyui" "doubao")
TOTAL_TESTS=$((${#SELECTED_IMAGES[@]} * ${#MODELS[@]}))
CURRENT=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "开始测试 (总共 $TOTAL_TESTS 次)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 记录结果
RESULTS_FILE="$OUTPUT_BASE_DIR/test-results.txt"
echo "字效图片AI抠图测试结果 - $(date)" > "$RESULTS_FILE"
echo "================================" >> "$RESULTS_FILE"
echo "字效图片目录: $FONT_IMAGES_DIR" >> "$RESULTS_FILE"
echo "结果保存目录: $OUTPUT_BASE_DIR" >> "$RESULTS_FILE"
echo "测试图片数量: $TEST_COUNT" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

SUCCESS_COUNT=0
FAIL_COUNT=0

# 测试每张图片
for img_path in "${SELECTED_IMAGES[@]}"; do
  img_name=$(basename "$img_path")
  img_base="${img_name%.*}"
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📸 测试图片: $img_name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  for model in "${MODELS[@]}"; do
    CURRENT=$((CURRENT + 1))
    
    OUTPUT_PATH="$OUTPUT_BASE_DIR/${img_base}_${model}.png"
    
    echo ""
    echo "[$CURRENT/$TOTAL_TESTS] 测试模型: $model"
    echo "  输入: $img_name"
    
    # 记录到文件
    echo "---" >> "$RESULTS_FILE"
    echo "图片: $img_name" >> "$RESULTS_FILE"
    echo "模型: $model" >> "$RESULTS_FILE"
    
    # 开始计时
    START_TIME=$(date +%s)
    
    # 调用API
    HTTP_CODE=$(curl -s -w "%{http_code}" \
      --location "http://10.13.155.144:5001/api/matting/image" \
      --form "file=@$img_path" \
      --form "model=$model" \
      --output "$OUTPUT_PATH" \
      --max-time 120 \
      --connect-timeout 10)
    
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    
    # 检查结果
    if [ "$HTTP_CODE" -eq 200 ] && [ -f "$OUTPUT_PATH" ] && [ -s "$OUTPUT_PATH" ]; then
      FILE_SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)
      echo "  ✅ 成功! 耗时: ${ELAPSED}秒, 大小: $FILE_SIZE"
      echo "  💾 保存到: $OUTPUT_PATH"
      
      echo "状态: ✅ 成功" >> "$RESULTS_FILE"
      echo "耗时: ${ELAPSED}秒" >> "$RESULTS_FILE"
      echo "大小: $FILE_SIZE" >> "$RESULTS_FILE"
      echo "路径: $OUTPUT_PATH" >> "$RESULTS_FILE"
      
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
      echo "  ❌ 失败! HTTP: $HTTP_CODE"
      
      echo "状态: ❌ 失败" >> "$RESULTS_FILE"
      echo "错误: HTTP $HTTP_CODE" >> "$RESULTS_FILE"
      
      # 清理失败的文件
      rm -f "$OUTPUT_PATH"
      FAIL_COUNT=$((FAIL_COUNT + 1))
      
      if [ "$HTTP_CODE" -eq 000 ]; then
        echo "  💡 无法连接服务器，请确认在内网环境"
      fi
    fi
    
    echo "" >> "$RESULTS_FILE"
    
    # 避免请求过快
    sleep 1
  done
done

# 输出汇总
echo ""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 测试完成汇总"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "总测试数: $TOTAL_TESTS"
echo "✅ 成功: $SUCCESS_COUNT"
echo "❌ 失败: $FAIL_COUNT"
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
  echo "📁 抠图结果保存位置:"
  echo "  $OUTPUT_BASE_DIR"
  echo ""
  echo "  生成的文件:"
  ls -lh "$OUTPUT_BASE_DIR"/*.png 2>/dev/null | awk '{print "  • " $9 " (" $5 ")"}'
  echo ""
fi

echo "📄 详细日志: $RESULTS_FILE"
echo ""

# 在Mac上自动打开结果目录
if [[ "$OSTYPE" == "darwin"* ]] && [ $SUCCESS_COUNT -gt 0 ]; then
  echo "🖼️  正在打开结果目录..."
  open "$OUTPUT_BASE_DIR"
fi

echo ""
echo "✨ 测试完成！"
echo ""

# 返回状态
if [ $FAIL_COUNT -eq 0 ]; then
  exit 0
else
  exit 1
fi


