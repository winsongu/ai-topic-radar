#!/bin/bash

# 自动测试3张图片的抠图效果
# 结果将保存到 test-matting-results 目录

echo "🎨 开始批量测试AI抠图功能"
echo "================================"
echo ""

# 创建结果目录
mkdir -p test-matting-results

# 定义要测试的3张图片
TEST_IMAGES=(
  "./wps-news-aggregator2/public/red-chinese-style-ppt-template.jpg"
  "./wps-news-aggregator2/public/pink-hand-drawn-marketing-ppt-template.jpg"
  "./wps-news-aggregator2/public/yellow-cartoon-teacher-day-ppt.jpg"
)

MODELS=("comfyui" "doubao")
TOTAL_TESTS=$((${#TEST_IMAGES[@]} * ${#MODELS[@]}))
CURRENT=0

echo "📋 测试计划:"
echo "  • 图片数量: ${#TEST_IMAGES[@]}"
echo "  • 模型数量: ${#MODELS[@]}"
echo "  • 总测试数: $TOTAL_TESTS"
echo ""

# 记录结果
RESULTS_FILE="test-matting-results/test-results.txt"
echo "AI抠图测试结果 - $(date)" > "$RESULTS_FILE"
echo "================================" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

SUCCESS_COUNT=0
FAIL_COUNT=0

# 遍历每张图片和每个模型
for img_path in "${TEST_IMAGES[@]}"; do
  if [ ! -f "$img_path" ]; then
    echo "⚠️  图片不存在: $img_path"
    echo "跳过此图片..."
    echo ""
    continue
  fi
  
  img_name=$(basename "$img_path")
  img_base="${img_name%.*}"
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📸 测试图片: $img_name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  for model in "${MODELS[@]}"; do
    CURRENT=$((CURRENT + 1))
    
    OUTPUT_PATH="test-matting-results/${img_base}_${model}.png"
    
    echo ""
    echo "[$CURRENT/$TOTAL_TESTS] 测试模型: $model"
    echo "  输入: $img_path"
    echo "  输出: $OUTPUT_PATH"
    
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
  echo "  目录: test-matting-results/"
  echo ""
  echo "  生成的文件:"
  ls -lh test-matting-results/*.png 2>/dev/null | awk '{print "  • " $9 " (" $5 ")"}'
  echo ""
fi

echo "📄 详细日志: $RESULTS_FILE"
echo ""

# 在Mac上自动打开结果目录
if [[ "$OSTYPE" == "darwin"* ]] && [ $SUCCESS_COUNT -gt 0 ]; then
  echo "🖼️  正在打开结果目录..."
  open test-matting-results/
fi

echo ""
echo "✨ 测试脚本执行完成！"
echo ""

# 返回状态
if [ $FAIL_COUNT -eq 0 ]; then
  exit 0
else
  exit 1
fi


