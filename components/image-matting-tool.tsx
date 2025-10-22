"use client"

import { useState, useRef } from "react"
import { Upload, Download, Loader2, X, Image as ImageIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

// API配置
const MATTING_API = {
  url: 'http://10.13.155.144:5001/api/matting/image',
  models: [
    { value: 'comfyui', label: 'ComfyUI（推荐）', description: '更适合复杂背景' },
    { value: 'doubao', label: 'Doubao', description: '速度更快' }
  ]
}

const WEB_UI_URL = 'http://10.13.146.159:5000/index.html#/generate'

export function ImageMattingTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState('comfyui')
  const [error, setError] = useState<string | null>(null)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    // 验证文件大小（限制10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过10MB')
      return
    }

    setSelectedFile(file)
    setError(null)
    setResultUrl(null)

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleMatting = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)
    setProcessingTime(null)
    const startTime = Date.now()

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('model', selectedModel)

      const response = await fetch(MATTING_API.url, {
        method: 'POST',
        body: formData,
      })

      const endTime = Date.now()
      setProcessingTime(endTime - startTime)

      if (!response.ok) {
        throw new Error(`抠图失败: ${response.status} ${response.statusText}`)
      }

      // 获取响应内容类型
      const contentType = response.headers.get('content-type')

      if (contentType?.includes('image')) {
        // 响应是图片
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setResultUrl(url)
      } else if (contentType?.includes('json')) {
        // 响应是JSON（可能包含图片URL）
        const data = await response.json()
        if (data.imageUrl) {
          setResultUrl(data.imageUrl)
        } else if (data.success && data.data) {
          setResultUrl(data.data)
        } else {
          throw new Error('API返回格式错误')
        }
      } else {
        throw new Error('未知的响应格式')
      }
    } catch (err) {
      console.error('抠图失败:', err)
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('无法连接到抠图服务，请确认您在内网环境且服务正在运行')
        } else {
          setError(err.message)
        }
      } else {
        setError('抠图失败，请重试')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultUrl) return

    const link = document.createElement('a')
    link.href = resultUrl
    link.download = `${selectedFile?.name.replace(/\.[^/.]+$/, '')}_matting.png` || 'matting_result.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResultUrl(null)
    setError(null)
    setProcessingTime(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          AI图片抠图工具
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          使用AI智能识别并去除图片背景，支持复杂背景处理
          <a 
            href={WEB_UI_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 text-blue-500 hover:underline"
          >
            打开完整版Web UI →
          </a>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：上传和设置 */}
        <div className="space-y-4">
          {/* 上传区域 */}
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            {!previewUrl ? (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium">点击上传图片</p>
                <p className="text-xs text-muted-foreground mt-2">
                  支持 JPG、PNG、WebP 等格式，最大10MB
                </p>
              </label>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="预览"
                  className="w-full h-auto rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReset}
                  className="absolute top-2 right-2 rounded-lg"
                >
                  <X className="h-4 w-4 mr-1" />
                  重新选择
                </Button>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>文件名: {selectedFile?.name}</p>
                  <p>大小: {((selectedFile?.size || 0) / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>

          {/* 模型选择 */}
          {selectedFile && (
            <div className="rounded-xl border bg-background p-4">
              <h3 className="font-semibold mb-3">选择抠图模型</h3>
              <div className="space-y-2">
                {MATTING_API.models.map((model) => (
                  <label
                    key={model.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedModel === model.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="model"
                      value={model.value}
                      checked={selectedModel === model.value}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{model.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {model.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 处理按钮 */}
          {selectedFile && (
            <Button
              onClick={handleMatting}
              disabled={isProcessing}
              className="w-full rounded-xl h-12"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在处理...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  开始抠图
                </>
              )}
            </Button>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">
              <p className="font-medium">❌ 处理失败</p>
              <p className="mt-1 text-xs">{error}</p>
            </div>
          )}
        </div>

        {/* 右侧：结果展示 */}
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-border bg-muted/30 p-8 min-h-[400px] flex items-center justify-center">
            {!resultUrl && !isProcessing && (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">抠图结果将显示在这里</p>
              </div>
            )}

            {isProcessing && (
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">AI正在处理中...</p>
                <p className="text-xs text-muted-foreground mt-2">
                  使用 {MATTING_API.models.find(m => m.value === selectedModel)?.label} 模型
                </p>
              </div>
            )}

            {resultUrl && (
              <div className="w-full">
                <div className="relative">
                  <img
                    src={resultUrl}
                    alt="抠图结果"
                    className="w-full h-auto rounded-lg"
                    style={{
                      background: 'repeating-conic-gradient(#00000008 0% 25%, transparent 0% 50%) 50% / 20px 20px'
                    }}
                  />
                </div>
                
                {processingTime && (
                  <div className="mt-3 text-xs text-muted-foreground text-center">
                    处理耗时: {(processingTime / 1000).toFixed(2)}秒
                  </div>
                )}

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full mt-4 rounded-xl"
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载抠图结果
                </Button>
              </div>
            )}
          </div>

          {/* 使用说明 */}
          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <p className="font-medium">💡 使用提示</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• ComfyUI模型适合复杂背景和细节处理</li>
              <li>• Doubao模型速度更快，适合批量处理</li>
              <li>• 透明背景会显示为棋盘格效果</li>
              <li>• 需要在内网环境下使用此功能</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


