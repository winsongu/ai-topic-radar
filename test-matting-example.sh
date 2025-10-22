#!/bin/bash

# AI图片抠图快速测试脚本

echo "🎨 AI图片抠图测试工具"
echo "================================"
echo ""

# 检查是否提供了图片路径
if [ -z "$1" ]; then
  echo "❌ 请提供图片路径"
  echo ""
  echo "使用方法:"
  echo "  ./test-matting-example.sh <图片路径> [模型]"
  echo ""
  echo "示例:"
  echo "  ./test-matting-example.sh ./test.png comfyui"
  echo "  ./test-matting-example.sh ./test.png doubao"
  echo ""
  echo "可用模型: comfyui (推荐), doubao"
  exit 1
fi

IMAGE_PATH=$1
MODEL=${2:-comfyui}  # 默认使用 comfyui
API_URL="http://10.13.155.144:5001/api/matting/image"
OUTPUT_PATH="${IMAGE_PATH%.*}_matting_${MODEL}.png"

echo "📋 配置信息:"
echo "  输入图片: $IMAGE_PATH"
echo "  使用模型: $MODEL"
echo "  输出路径: $OUTPUT_PATH"
echo "  API地址: $API_URL"
echo ""

# 检查文件是否存在
if [ ! -f "$IMAGE_PATH" ]; then
  echo "❌ 文件不存在: $IMAGE_PATH"
  exit 1
fi

# 检查curl是否安装
if ! command -v curl &> /dev/null; then
  echo "❌ curl未安装，请先安装curl"
  exit 1
fi

echo "📤 正在上传图片并处理..."
echo ""

# 发送请求
START_TIME=$(date +%s)
HTTP_CODE=$(curl -s -w "%{http_code}" \
  --location "$API_URL" \
  --form "file=@$IMAGE_PATH" \
  --form "model=$MODEL" \
  --output "$OUTPUT_PATH" \
  --max-time 120)
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""

# 检查响应状态码
if [ "$HTTP_CODE" -eq 200 ]; then
  if [ -f "$OUTPUT_PATH" ] && [ -s "$OUTPUT_PATH" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)
    echo "✅ 抠图成功！"
    echo ""
    echo "📊 结果信息:"
    echo "  输出文件: $OUTPUT_PATH"
    echo "  文件大小: $FILE_SIZE"
    echo "  处理耗时: ${ELAPSED}秒"
    echo ""
    
    # 尝试打开图片（macOS）
    if [[ "$OSTYPE" == "darwin"* ]]; then
      echo "🖼️  正在预览结果..."
      open "$OUTPUT_PATH"
    fi
    
    echo "✨ 完成！"
  else
    echo "❌ 响应成功但文件为空"
    rm -f "$OUTPUT_PATH"
    exit 1
  fi
else
  echo "❌ 抠图失败"
  echo "  HTTP状态码: $HTTP_CODE"
  echo ""
  
  if [ "$HTTP_CODE" -eq 000 ]; then
    echo "💡 提示:"
    echo "  • 无法连接到服务器"
    echo "  • 请确认您在内网环境"
    echo "  • 检查API地址是否正确: $API_URL"
    echo "  • 联系运维确认服务是否运行"
  elif [ "$HTTP_CODE" -eq 400 ]; then
    echo "💡 可能的原因:"
    echo "  • 图片格式不支持"
    echo "  • 模型参数错误（应为 comfyui 或 doubao）"
  elif [ "$HTTP_CODE" -eq 413 ]; then
    echo "💡 可能的原因:"
    echo "  • 图片文件过大"
    echo "  • 建议压缩到10MB以下"
  elif [ "$HTTP_CODE" -eq 500 ]; then
    echo "💡 可能的原因:"
    echo "  • 服务器内部错误"
    echo "  • 尝试更换模型或稍后重试"
  fi
  
  rm -f "$OUTPUT_PATH"
  exit 1
fi


