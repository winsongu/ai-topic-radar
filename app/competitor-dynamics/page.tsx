"use client"

import { useState } from "react"
import { Search, ExternalLink, TrendingUp, Eye, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock data for competitor templates - 四个平台真实数据
const mockTemplates = [
  // ========== iSlide 数据 (真实抓取的缩略图) ==========
  {
    id: 1,
    title: "红色国潮风通用行业总结汇报PPT模板",
    type: "17P",
    format: "Fu",
    usage: "工作总结",
    platform: "iSlide",
    tags: ["插画风", "年中总结", "工作总结", "红色", "国潮风"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://static.islide.cc/site/content/gallery/2025-07-16/164354/df78568e-b864-4794-965b-b15418b65ef9-template.gallery.1.zh-Hans.jpg?x-oss-process=style/gallery",
    isFree: true,
    link: "https://www.islide.cc/ppt/template/5254284.html",
  },
  {
    id: 2,
    title: "红色手绘风通用行业总结汇报PPT模板",
    type: "18P",
    format: "Fu",
    usage: "工作总结",
    platform: "iSlide",
    tags: ["插画风", "卡通风", "红色", "工作总结", "汇报"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://static.islide.cc/site/content/gallery/2025-07-16/164319/78dce068-d39a-43b3-a1ba-bff2b67c0714-template.gallery.1.zh-Hans.jpg?x-oss-process=style/gallery",
    isFree: true,
    link: "https://www.islide.cc/ppt/template/5254283.html",
  },
  {
    id: 3,
    title: "粉色手绘风通用行业营销方案PPT模板",
    type: "17P",
    format: "Fu",
    usage: "市场营销",
    platform: "iSlide",
    tags: ["营销方案", "手绘风", "创意", "品牌推广", "活动策划"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    isFree: true,
    link: "https://www.islide.cc/ppt/template/5254282.html",
  },
  {
    id: 4,
    title: "绿色手绘风通用行业年中总结PPT模板",
    type: "16P",
    format: "Fu",
    usage: "工作总结",
    platform: "iSlide",
    tags: ["插画风", "卡通风", "绿色", "年中总结", "工作总结"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://static.islide.cc/site/content/gallery/2025-07-16/164231/308735d8-a566-4035-92c1-957732d94cc3-template.gallery.1.zh-Hans.jpg?x-oss-process=style/gallery",
    isFree: true,
    link: "https://www.islide.cc/ppt/template/5254281.html",
  },
  {
    id: 5,
    title: "巴黎奥运会PPT",
    type: "13P",
    format: "iRis",
    usage: "教育教学",
    platform: "iSlide",
    tags: ["体育赛事", "奥运会", "教育培训", "知识普及"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://static.islide.cc/site/content/gallery/2025-06-19/115338/6ba2df07-96cc-4b49-a29b-a33bc4e77426.gallery.1.zh-Hans.jpg?x-oss-process=style/gallery",
    isFree: true,
    link: "https://www.islide.cc/ppt/template/4986178.html",
  },
  {
    id: 6,
    title: "《你知道吗？2025》六一儿童节特别策划",
    type: "23P",
    format: "iRis",
    usage: "节日庆典",
    platform: "iSlide",
    tags: ["儿童节", "节日", "教育", "创意策划"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop",
    isFree: true,
    link: "https://www.islide.cc/ppt/template/5226210.html",
  },
  {
    id: 7,
    title: "粉色公益宣传糗糗桃花源",
    type: "14P",
    format: "Rin",
    usage: "宣传企划",
    platform: "iSlide",
    tags: ["公益", "宣传", "创意", "粉色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop",
    isFree: true,
    link: "https://www.islide.cc/ppt/template/5196382.html",
  },
  {
    id: 8,
    title: "绿色我的阿勒泰介绍PPT",
    type: "18P",
    format: "Dai",
    usage: "宣传企划",
    platform: "iSlide",
    tags: ["旅游", "地域", "文化", "绿色", "介绍"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    isFree: true,
    link: "https://www.islide.cc/ppt/template/4951759.html",
  },
  {
    id: 9,
    title: "蓝色我的阿勒泰介绍PPT",
    type: "17P",
    format: "Fu",
    usage: "宣传企划",
    platform: "iSlide",
    tags: ["旅游", "地域", "文化", "蓝色", "介绍"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop",
    isFree: true,
    link: "https://www.islide.cc/ppt/template/4951758.html",
  },
  {
    id: 10,
    title: "红色喜庆风2023感动中国十大年度人物介绍PPT模板",
    type: "32P",
    format: "Fish",
    usage: "宣传企划",
    platform: "iSlide",
    tags: ["人物介绍", "喜庆", "红色", "年度人物", "感动中国"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop",
    isFree: true,
    link: "https://www.islide.cc/ppt/template/4925828.html",
  },
  
  // ========== AIPPT 数据 ==========
  {
    id: 11,
    title: "黄色卡通创意风假期综合征通用模板",
    type: "19P",
    format: "未知",
    usage: "教育教学",
    platform: "AIPPT",
    tags: ["教育", "卡通", "创意", "假期", "心理", "黄色主题"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/33144/6628834/20251009172931pgekviy.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    isFree: false,
    link: "https://www.aippt.cn/template/ppt/detail/643716.html",
  },
  {
    id: 12,
    title: "紫色项目汇报通用PPT模板",
    type: "19P",
    format: "未知",
    usage: "职场办公",
    platform: "AIPPT",
    tags: ["项目汇报", "商务", "通用", "紫色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/44377/8875541/20251010112030vrglcsj.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    isFree: false,
    link: "https://www.aippt.cn/template/ppt/detail/643715.html",
  },
  {
    id: 13,
    title: "蓝色简约Q4季度工作计划PPT模板",
    type: "19P",
    format: "未知",
    usage: "工作总结",
    platform: "AIPPT",
    tags: ["工作计划", "商务", "季度", "Q4", "年度规划", "蓝色主题"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/33144/6628834/20251009155522pibmnnn.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    isFree: false,
    link: "https://www.aippt.cn/template/ppt/detail/643720.html",
  },
  {
    id: 14,
    title: "蓝色创意风季度工作汇报通用PPT模板",
    type: "19P",
    format: "未知",
    usage: "工作总结",
    platform: "AIPPT",
    tags: ["工作汇报", "季度", "创意", "蓝色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/43929/8785939/20251009163847jazcqrd.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    isFree: false,
    link: "https://www.aippt.cn/template/ppt/detail/643723.html",
  },
  {
    id: 15,
    title: "橙色商务秋季传染病科学有效防控策略通用PPT模板",
    type: "19P",
    format: "未知",
    usage: "医疗健康",
    platform: "AIPPT",
    tags: ["医疗", "防控", "秋季", "传染病", "橙色主题"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/43929/8785939/20251009165905vimehxc.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    isFree: false,
    link: "https://www.aippt.cn/template/ppt/detail/643721.html",
  },
  {
    id: 16,
    title: "蓝色商务Q4季度工作计划通用PPT模板",
    type: "19P",
    format: "未知",
    usage: "职场办公",
    platform: "AIPPT",
    tags: ["工作计划", "商务", "季度", "Q4", "年度规划"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/33144/6628834/20251009110352fynwvsl.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    isFree: false,
    link: "https://www.aippt.cn/template/ppt/detail/643722.html",
  },
  {
    id: 17,
    title: "橙黄色复古剪切画风软装全案策划PPT模板",
    type: "18P",
    format: "未知",
    usage: "建筑房地产",
    platform: "AIPPT",
    tags: ["软装", "策划", "复古", "橙黄色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/33144/6628827/20251009144550hryfnst.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    isFree: false,
    link: "https://www.aippt.cn/template/ppt/detail/643724.html",
  },
  
  // ========== 熊猫办公 数据 (真实抓取的缩略图) ==========
  {
    id: 18,
    title: "绿色中国风企业工作总结汇报PPT模板",
    type: "20P",
    format: "PPT",
    usage: "工作总结",
    platform: "熊猫办公",
    tags: ["中国风", "企业", "工作汇报", "绿色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/19111921/27/47/53/68e8b589cb06e1760081289.jpg-0.jpg!/fw/288",
    isFree: true,
    link: "https://www.tukuppt.com/muban/wwwkkjmz.html",
  },
  {
    id: 19,
    title: "绿色简约风日本脑卒中治疗指南PPT模版",
    type: "18P",
    format: "PPT",
    usage: "医疗健康",
    platform: "熊猫办公",
    tags: ["简约风", "医疗", "治疗指南", "绿色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/19111921/27/47/56/68e8c1c9dcf741760084425.jpg-0.jpg!/fw/288",
    isFree: true,
    link: "https://www.tukuppt.com/muban/grrppdpk.html",
  },
  {
    id: 20,
    title: "蓝色卡通风患者健康宣教方法与技巧PPT模版",
    type: "22P",
    format: "PPT",
    usage: "医疗健康",
    platform: "熊猫办公",
    tags: ["卡通风", "健康宣教", "蓝色", "技巧"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/24500321/27/47/55/68e89a76e7d471760074358.jpg-0.jpg!/fw/288",
    isFree: true,
    link: "https://www.tukuppt.com/muban/ennxxoxb.html",
  },
  {
    id: 21,
    title: "绿色卡通风新生儿母乳喂养PPT模版",
    type: "19P",
    format: "PPT",
    usage: "医疗健康",
    platform: "熊猫办公",
    tags: ["卡通风", "新生儿", "母乳喂养", "绿色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/24500321/27/47/55/68e89f76001411760075637.jpg-0.jpg!/fw/288",
    isFree: true,
    link: "https://www.tukuppt.com/muban/rrrmmbmz.html",
  },
  {
    id: 22,
    title: "蓝色商务风市场调研分析报告PPT模板",
    type: "25P",
    format: "PPT",
    usage: "市场营销",
    platform: "熊猫办公",
    tags: ["商务风", "市场调研", "分析报告", "蓝色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/19111921/27/47/56/68e8b2e6cd0161760080614.jpg-0.jpg!/fw/288",
    isFree: true,
    link: "https://www.tukuppt.com/muban/aeexxaxr.html",
  },
  {
    id: 23,
    title: "棕色商务风工作总结汇报PPT通用模板",
    type: "21P",
    format: "PPT",
    usage: "工作总结",
    platform: "熊猫办公",
    tags: ["商务风", "工作总结", "汇报", "棕色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/29844528/27/47/54/68e85cbb2b72b1760058555.jpg-0.jpg!/fw/288",
    isFree: true,
    link: "https://www.tukuppt.com/muban/xppddmdb.html",
  },
  {
    id: 24,
    title: "红色插画风二十四节气之立冬介绍PPT模板",
    type: "18P",
    format: "PPT",
    usage: "宣传企划",
    platform: "熊猫办公",
    tags: ["插画风", "二十四节气", "立冬", "红色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/19111921/27/47/54/68e87390c476f1760064400.jpg-0.jpg!/fw/288",
    isFree: true,
    link: "https://www.tukuppt.com/muban/kbbppapa.html",
  },
  {
    id: 25,
    title: "蓝色中国风冬季中医养生保健指南PPT模版",
    type: "23P",
    format: "PPT",
    usage: "医疗健康",
    platform: "熊猫办公",
    tags: ["中国风", "中医", "养生保健", "蓝色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/24500321/27/47/54/68e895db63a901760073179.jpg-0.jpg!/fw/288",
    isFree: true,
    link: "https://www.tukuppt.com/muban/baaxxrxy.html",
  },
  {
    id: 26,
    title: "黄色卡通风勤俭节约主题班会PPT模版",
    type: "20P",
    format: "PPT",
    usage: "教育教学",
    platform: "熊猫办公",
    tags: ["卡通风", "勤俭节约", "主题班会", "黄色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/75014235/27/47/53/68e782fea15f91760002814.jpg-0.jpg!/fw/288",
    isFree: true,
    link: "https://www.tukuppt.com/muban/aeexxyom.html",
  },
  {
    id: 27,
    title: "粉色卡通风新生儿呕吐疑难病例讨论PPT模版",
    type: "24P",
    format: "PPT",
    usage: "医疗健康",
    platform: "熊猫办公",
    tags: ["卡通风", "新生儿", "病例讨论", "粉色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/75014235/27/47/53/68e78458e57e91760003160.jpg-0.jpg!/fw/288",
    isFree: true,
    link: "https://www.tukuppt.com/muban/kbbppmex.html",
  },
  
  // ========== Canva 数据 (真实抓取的缩略图) ==========
  {
    id: 28,
    title: "黄黑色趣味插画风格人生规划演示文稿",
    type: "18P",
    format: "PPTX",
    usage: "职场办公",
    platform: "Canva",
    tags: ["趣味插画", "人生规划", "黄黑色", "风格"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGy8YdkNoU/1/0/800w/canva-mSoEC9Vl5e0.jpg",
    isFree: true,
    link: "https://www.canva.cn/templates/EAGy8YdkNoU/",
  },
  {
    id: 29,
    title: "蓝紫绿色潮流插画大学生社团招新演示文稿",
    type: "20P",
    format: "PPTX",
    usage: "宣传企划",
    platform: "Canva",
    tags: ["潮流插画", "社团招新", "蓝紫绿色", "大学生"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGxteAqVis/1/0/800w/canva-Qg6KOCuryGM.jpg",
    isFree: true,
    link: "https://www.canva.cn/templates/EAGxteAqVis/",
  },
  {
    id: 30,
    title: "黄蓝色3D风格大学生职业规划汇报演示文稿",
    type: "22P",
    format: "PPTX",
    usage: "职场办公",
    platform: "Canva",
    tags: ["3D风格", "职业规划", "黄蓝色", "大学生"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGzAvRrG5Y/1/0/800w/canva-r1DsBg3akL4.jpg",
    isFree: true,
    link: "https://www.canva.cn/templates/EAGzAvRrG5Y/",
  },
  {
    id: 31,
    title: "蓝色极简风工作总结演示文稿结构页精选",
    type: "16P",
    format: "PPTX",
    usage: "工作总结",
    platform: "Canva",
    tags: ["极简风", "工作总结", "蓝色", "结构页"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGwtKHOt3U/1/0/800w/canva-RLWH4V_OD4c.jpg",
    isFree: true,
    link: "https://www.canva.cn/templates/EAGwtKHOt3U/",
  },
  {
    id: 32,
    title: "绿色半调简约风自我介绍个人作品集通用演示文稿",
    type: "19P",
    format: "PPTX",
    usage: "职场办公",
    platform: "Canva",
    tags: ["半调简约", "自我介绍", "作品集", "绿色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGyGd98nIM/1/0/800w/canva-cyLWBqwM9k.jpg",
    isFree: true,
    link: "https://www.canva.cn/templates/EAGyGd98nIM/",
  },
  {
    id: 33,
    title: "黑白色简约风摄影作品集演示文稿",
    type: "21P",
    format: "PPTX",
    usage: "宣传企划",
    platform: "Canva",
    tags: ["简约风", "摄影作品集", "黑白色", "艺术"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGxcnxUGuM/1/0/800w/canva-LWUDrU6uhrs.jpg",
    isFree: true,
    link: "https://www.canva.cn/templates/EAGxcnxUGuM/",
  },
  {
    id: 34,
    title: "绿色仿黑板粉笔效果校园通用PPT模板演示文稿",
    type: "24P",
    format: "PPTX",
    usage: "教育教学",
    platform: "Canva",
    tags: ["黑板粉笔", "校园通用", "绿色", "效果"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGyTtzy5Eo/2/0/800w/canva-FNMb_ff7rgc.jpg",
    isFree: true,
    link: "https://www.canva.cn/templates/EAGyTtzy5Eo/",
  },
  {
    id: 35,
    title: "黄绿色简约宣传工作汇报演示文稿",
    type: "18P",
    format: "PPTX",
    usage: "宣传企划",
    platform: "Canva",
    tags: ["简约", "宣传工作", "黄绿色", "汇报"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGxcoNBQKw/1/0/800w/canva-sXhLbBypm5s.jpg",
    isFree: true,
    link: "https://www.canva.cn/templates/EAGxcoNBQKw/",
  },
  {
    id: 36,
    title: "咖色传统风格校园课件演示文稿",
    type: "20P",
    format: "PPTX",
    usage: "教育教学",
    platform: "Canva",
    tags: ["传统风格", "校园课件", "咖色", "教育"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGzByQQEBs/1/0/800w/canva-Fp5c1wl6f8Y.jpg",
    isFree: true,
    link: "https://www.canva.cn/templates/EAGzByQQEBs/",
  },
  {
    id: 37,
    title: "黑白色线描插画风个人介绍求职简历演示文稿",
    type: "17P",
    format: "PPTX",
    usage: "职场办公",
    platform: "Canva",
    tags: ["线描插画", "个人介绍", "求职简历", "黑白色"],
    date: "入库时间: 2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGxuqUQGgY/1/0/800w/canva-rPwEmixipqU.jpg",
    isFree: true,
    link: "https://www.canva.cn/templates/EAGxuqUQGgY/",
  },
]

const platforms = ["全部", "iSlide", "AIPPT", "熊猫办公", "Canva"]
const timeRanges = ["全部", "今天", "昨天", "近七天"]
const usages = [
  "全部",
  "工作总结",
  "教育教学", 
  "医疗健康",
  "职场办公",
  "宣传企划",
  "产品发布",
  "市场营销",
  "节日庆典",
  "建筑房地产",
]

const allUsages = [
  ...usages,
  "科技互联网",
  "金融保险",
  "餐饮美食",
  "旅游出行",
  "体育运动",
  "文化娱乐",
  "法律服务",
  "房地产",
  "制造业",
]

export default function CompetitorDynamicsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("全部")
  const [selectedTime, setSelectedTime] = useState("全部")
  const [selectedUsage, setSelectedUsage] = useState("全部")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [showUsagePopover, setShowUsagePopover] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<(typeof mockTemplates)[0] | null>(null)

  const additionalUsages = allUsages.filter((usage) => !usages.includes(usage))

  // Filter templates
  const filteredTemplates = mockTemplates.filter((template) => {
    // Platform filter
    if (selectedPlatform !== "全部" && template.platform !== selectedPlatform) return false
    
    // Usage filter
    if (selectedUsage !== "全部" && template.usage !== selectedUsage) return false
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        template.title.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">竞品动态</h1>
          <p className="text-muted-foreground">实时追踪PPT模板市场动态，把握设计趋势</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-2xl bg-card p-6 shadow-sm border">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索模板标题、描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Platform Filter */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">平台:</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Button
                  key={platform}
                  variant={selectedPlatform === platform ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlatform(platform)}
                  className="rounded-full"
                >
                  {platform}
                </Button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">时间:</label>
            <div className="flex flex-wrap gap-2">
              {timeRanges.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className="rounded-full"
                >
                  {time}
                </Button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full">
                    <Calendar className="h-4 w-4" />
                    自定义日期
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4">
                    <p className="mb-2 text-sm font-medium">选择日期范围（最多30天）</p>
                    <CalendarComponent
                      mode="range"
                      selected={dateRange}
                      onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                      numberOfMonths={1}
                      disabled={(date) => {
                        const today = new Date()
                        const thirtyDaysAgo = new Date(today)
                        thirtyDaysAgo.setDate(today.getDate() - 30)
                        return date > today || date < thirtyDaysAgo
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Usage Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">用途:</label>
            <div className="flex flex-wrap gap-2">
              {usages.map((usage) => (
                <Button
                  key={usage}
                  variant={selectedUsage === usage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedUsage(usage)}
                  className="rounded-full"
                >
                  {usage}
                </Button>
              ))}
              {additionalUsages.length > 0 && (
                <Popover open={showUsagePopover} onOpenChange={setShowUsagePopover}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full text-primary">
                      更多
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-2">
                      <p className="mb-3 text-sm font-medium">更多用途类别</p>
                      <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
                        {additionalUsages.map((usage) => (
                          <Button
                            key={usage}
                            variant={selectedUsage === usage ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedUsage(usage)
                              setShowUsagePopover(false)
                            }}
                            className="justify-start"
                          >
                            {usage}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">共找到 {filteredTemplates.length} 个模板</p>
          <p className="text-sm text-muted-foreground">最后更新: 2025/01/11</p>
        </div>

        {/* Results Grid - Optimized Card Layout */}
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-md"
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex gap-6 p-6">
                {/* Thumbnail - Larger and more prominent */}
                <div className="relative flex-shrink-0">
                  <div
                    className="relative h-40 w-60 cursor-pointer overflow-hidden rounded-xl bg-muted"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <img
                      src={template.thumbnail || "/placeholder.svg"}
                      alt={template.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {template.isFree && (
                      <div className="absolute left-3 top-3">
                        <Badge className="bg-emerald-500 text-white shadow-md">Free</Badge>
                      </div>
                    )}
                    {/* Hover overlay with preview button */}
                    {hoveredId === template.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
                        <Button size="sm" variant="secondary" className="gap-2">
                          <Eye className="h-4 w-4" />
                          预览
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content - Better organized information */}
                <div className="flex flex-1 flex-col justify-between">
                  {/* Title and metadata */}
                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 text-lg font-semibold leading-tight text-foreground group-hover:text-primary">
                          {template.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{template.type}</span>
                          <span>•</span>
                          <span>{template.format}</span>
                        </div>
                      </div>
                      <a
                        href={template.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>

                    {/* Tags - More prominent and organized */}
                    <div className="space-y-2">
                      {/* Usage - Primary category with distinct styling */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">用途:</span>
                        <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">{template.usage}</Badge>
                      </div>

                      {/* Platform - Secondary info with different styling */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">平台:</span>
                        <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
                          {template.platform}
                        </Badge>
                      </div>

                      {/* Tags - Tertiary info with subtle styling */}
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-xs font-medium text-muted-foreground">标签:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {template.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-muted/50 text-xs text-muted-foreground hover:bg-muted"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Date and actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{template.date}</span>
                    <div className="flex gap-2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{previewTemplate?.title}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-6">
              {/* Large preview image */}
              <div className="relative overflow-hidden rounded-xl bg-muted">
                <img
                  src={previewTemplate.thumbnail || "/placeholder.svg"}
                  alt={previewTemplate.title}
                  className="h-auto w-full object-contain"
                />
                {previewTemplate.isFree && (
                  <div className="absolute left-4 top-4">
                    <Badge className="bg-emerald-500 text-white shadow-md">Free</Badge>
                  </div>
                )}
              </div>

              {/* Key information */}
              <div className="space-y-4">
                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{previewTemplate.type}</span>
                  <span>•</span>
                  <span>{previewTemplate.format}</span>
                  <span>•</span>
                  <span>{previewTemplate.date}</span>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">用途:</span>
                    <Badge className="bg-blue-500/10 text-blue-700">{previewTemplate.usage}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">平台:</span>
                    <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
                      {previewTemplate.platform}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-sm font-medium text-muted-foreground">标签:</span>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-muted/50 text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex justify-end">
                  <a href={previewTemplate.link} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      访问原链接
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}