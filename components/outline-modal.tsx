"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

interface TopicSuggestion {
  id: string
  title: string
  useCase: string[]
  targetAudience: string[]
  recommendedStyle: string[]
  estimatedPages: number
  marketValue: "高" | "中" | "低"
  description: string
  source: string
  coverImage: string
  heat: number
}

interface OutlineModalProps {
  isOpen: boolean
  onClose: () => void
  suggestion: TopicSuggestion
}

const generateOutline = (suggestion: TopicSuggestion) => {
  return [
    {
      title: "背景与现状分析",
      content: "深入剖析行业发展背景，梳理当前市场现状与面临的主要挑战，为后续内容奠定基础。",
      subPoints: ["行业发展历程回顾", "当前市场格局分析", "存在的问题与挑战"],
    },
    {
      title: "核心观点与案例解读",
      content: "提炼关键趋势与核心观点，结合成功案例进行深度分析，展示创新实践与经验总结。",
      subPoints: ["关键趋势与洞察", "标杆案例深度剖析", "创新实践经验分享"],
    },
    {
      title: "解决方案与实施策略",
      content: "提出系统性解决方案，设计可落地的实施路径，并制定相应的风险应对措施。",
      subPoints: ["战略规划与目标设定", "实施路径与步骤", "风险识别与应对"],
    },
    {
      title: "未来趋势与机遇展望",
      content: "预测行业未来发展趋势，分析潜在机遇与挑战，为决策提供前瞻性参考。",
      subPoints: ["发展趋势预测", "机遇与挑战并存", "战略建议与布局"],
    },
    {
      title: "总结与行动计划",
      content: "回顾核心要点，总结价值与意义，明确下一步行动计划与关键举措。",
      subPoints: ["核心要点总结", "价值与意义阐述", "行动计划与时间表"],
    },
  ]
}

export function OutlineModal({ isOpen, onClose, suggestion }: OutlineModalProps) {
  const outline = generateOutline(suggestion)
  const [copied, setCopied] = useState(false)

  const handleCopyOutline = () => {
    const content = `# ${suggestion.title}\n\n${outline.map((section, index) => `## ${index + 1}. ${section.title}\n\n${section.content}\n\n${section.subPoints.map((point) => `- ${point}`).join("\n")}`).join("\n\n")}`

    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{suggestion.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <h3 className="mb-2 font-semibold text-foreground">PPT基本信息</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">适用场景：</span>
                  <span className="text-foreground">{suggestion.useCase.join("、")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">推荐风格：</span>
                  <span className="text-foreground">{suggestion.recommendedStyle.join("、")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">目标受众：</span>
                  <span className="text-foreground">{suggestion.targetAudience.join("、")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">预估页数：</span>
                  <span className="text-foreground">{suggestion.estimatedPages}页</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">内容大纲</h3>
              <div className="space-y-5">
                {outline.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 font-semibold text-foreground">{section.title}</h4>
                        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{section.content}</p>
                        <ul className="space-y-1.5 pl-4">
                          {section.subPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {index < outline.length - 1 && <div className="ml-3.5 h-px bg-border/50" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl bg-transparent">
            <X className="mr-2 h-4 w-4" />
            关闭
          </Button>
          <Button onClick={handleCopyOutline} className="rounded-xl" disabled={copied}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "已复制" : "复制大纲"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}