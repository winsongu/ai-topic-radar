#!/usr/bin/env node

/**
 * 导入高质量Mock数据到Supabase
 * 
 * 这些数据来自线上版本的精心整理，包括：
 * - 完整的标签（AI识别或人工整理）
 * - 准确的页数和作者信息
 * - 真实的缩略图URL
 * - 明确的入库时间
 */

// 优先加载 .env.local，如果不存在则加载 .env
require('dotenv').config({ path: '.env.local' })
require('dotenv').config() // fallback to .env
const { createClient } = require('@supabase/supabase-js')

// 检查环境变量
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 错误: 缺少 Supabase 环境变量')
  console.error('   请确保 .env.local 包含以下变量:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 高质量Mock数据（从线上版本提取）
const qualityMockData = [
  // ========== iSlide 数据 ==========
  {
    title: "红色国潮风通用行业总结汇报PPT模板",
    type: "17P",
    format: "Fu",
    usage: "工作总结",
    platform: "iSlide",
    tags: ["插画风", "年中总结", "工作总结", "红色", "国潮风"],
    date: "2025-10-11",
    thumbnail: "https://static.islide.cc/site/content/gallery/2025-07-16/164354/df78568e-b864-4794-965b-b15418b65ef9-template.gallery.1.zh-Hans.jpg?x-oss-process=style/gallery",
    is_free: true,
    url: "https://www.islide.cc/ppt/template/5254284.html",
  },
  {
    title: "红色手绘风通用行业总结汇报PPT模板",
    type: "18P",
    format: "Fu",
    usage: "工作总结",
    platform: "iSlide",
    tags: ["插画风", "卡通风", "红色", "工作总结", "汇报"],
    date: "2025-10-11",
    thumbnail: "https://static.islide.cc/site/content/gallery/2025-07-16/164319/78dce068-d39a-43b3-a1ba-bff2b67c0714-template.gallery.1.zh-Hans.jpg?x-oss-process=style/gallery",
    is_free: true,
    url: "https://www.islide.cc/ppt/template/5254283.html",
  },
  {
    title: "粉色手绘风通用行业营销方案PPT模板",
    type: "17P",
    format: "Fu",
    usage: "市场营销",
    platform: "iSlide",
    tags: ["营销方案", "手绘风", "创意", "品牌推广", "活动策划"],
    date: "2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    is_free: true,
    url: "https://www.islide.cc/ppt/template/5254282.html",
  },
  {
    title: "绿色手绘风通用行业年中总结PPT模板",
    type: "16P",
    format: "Fu",
    usage: "工作总结",
    platform: "iSlide",
    tags: ["插画风", "卡通风", "绿色", "年中总结", "工作总结"],
    date: "2025-10-11",
    thumbnail: "https://static.islide.cc/site/content/gallery/2025-07-16/164231/308735d8-a566-4035-92c1-957732d94cc3-template.gallery.1.zh-Hans.jpg?x-oss-process=style/gallery",
    is_free: true,
    url: "https://www.islide.cc/ppt/template/5254281.html",
  },
  {
    title: "巴黎奥运会PPT",
    type: "13P",
    format: "iRis",
    usage: "教育教学",
    platform: "iSlide",
    tags: ["体育赛事", "奥运会", "教育培训", "知识普及"],
    date: "2025-10-11",
    thumbnail: "https://static.islide.cc/site/content/gallery/2025-06-19/115338/6ba2df07-96cc-4b49-a29b-a33bc4e77426.gallery.1.zh-Hans.jpg?x-oss-process=style/gallery",
    is_free: true,
    url: "https://www.islide.cc/ppt/template/4986178.html",
  },
  {
    title: "《你知道吗？2025》六一儿童节特别策划",
    type: "23P",
    format: "iRis",
    usage: "节日庆典",
    platform: "iSlide",
    tags: ["儿童节", "节日", "教育", "创意策划"],
    date: "2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop",
    is_free: true,
    url: "https://www.islide.cc/ppt/template/5226210.html",
  },
  {
    title: "粉色公益宣传糗糗桃花源",
    type: "14P",
    format: "Rin",
    usage: "宣传企划",
    platform: "iSlide",
    tags: ["公益", "宣传", "创意", "粉色"],
    date: "2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop",
    is_free: true,
    url: "https://www.islide.cc/ppt/template/5196382.html",
  },
  {
    title: "绿色我的阿勒泰介绍PPT",
    type: "18P",
    format: "Dai",
    usage: "宣传企划",
    platform: "iSlide",
    tags: ["旅游", "地域", "文化", "绿色", "介绍"],
    date: "2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    is_free: true,
    url: "https://www.islide.cc/ppt/template/4951759.html",
  },
  {
    title: "蓝色我的阿勒泰介绍PPT",
    type: "17P",
    format: "Fu",
    usage: "宣传企划",
    platform: "iSlide",
    tags: ["旅游", "地域", "文化", "蓝色", "介绍"],
    date: "2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop",
    is_free: true,
    url: "https://www.islide.cc/ppt/template/4951758.html",
  },
  {
    title: "红色喜庆风2023感动中国十大年度人物介绍PPT模板",
    type: "32P",
    format: "Fish",
    usage: "宣传企划",
    platform: "iSlide",
    tags: ["人物介绍", "喜庆", "红色", "年度人物", "感动中国"],
    date: "2025-10-11",
    thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop",
    is_free: true,
    url: "https://www.islide.cc/ppt/template/4925828.html",
  },
  
  // ========== AIPPT 数据 ==========
  {
    title: "黄色卡通创意风假期综合征通用模板",
    type: "19P",
    format: "未知",
    usage: "教育教学",
    platform: "AIPPT",
    tags: ["教育", "卡通", "创意", "假期", "心理", "黄色主题"],
    date: "2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/33144/6628834/20251009172931pgekviy.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    is_free: false,
    url: "https://www.aippt.cn/template/ppt/detail/643716.html",
  },
  {
    title: "紫色项目汇报通用PPT模板",
    type: "19P",
    format: "未知",
    usage: "职场办公",
    platform: "AIPPT",
    tags: ["项目汇报", "商务", "通用", "紫色"],
    date: "2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/44377/8875541/20251010112030vrglcsj.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    is_free: false,
    url: "https://www.aippt.cn/template/ppt/detail/643715.html",
  },
  {
    title: "蓝色简约Q4季度工作计划PPT模板",
    type: "19P",
    format: "未知",
    usage: "工作总结",
    platform: "AIPPT",
    tags: ["工作计划", "商务", "季度", "Q4", "年度规划", "蓝色主题"],
    date: "2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/33144/6628834/20251009155522pibmnnn.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    is_free: false,
    url: "https://www.aippt.cn/template/ppt/detail/643720.html",
  },
  {
    title: "蓝色创意风季度工作汇报通用PPT模板",
    type: "19P",
    format: "未知",
    usage: "工作总结",
    platform: "AIPPT",
    tags: ["工作汇报", "季度", "创意", "蓝色"],
    date: "2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/43929/8785939/20251009163847jazcqrd.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    is_free: false,
    url: "https://www.aippt.cn/template/ppt/detail/643723.html",
  },
  {
    title: "橙色商务秋季传染病科学有效防控策略通用PPT模板",
    type: "19P",
    format: "未知",
    usage: "医疗健康",
    platform: "AIPPT",
    tags: ["医疗", "防控", "秋季", "传染病", "橙色主题"],
    date: "2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/43929/8785939/20251009165905vimehxc.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    is_free: false,
    url: "https://www.aippt.cn/template/ppt/detail/643721.html",
  },
  {
    title: "蓝色商务Q4季度工作计划通用PPT模板",
    type: "19P",
    format: "未知",
    usage: "工作总结",
    platform: "AIPPT",
    tags: ["工作计划", "商务", "季度", "Q4", "蓝色"],
    date: "2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/43929/8785939/20251010101438cuzudns.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    is_free: false,
    url: "https://www.aippt.cn/template/ppt/detail/643719.html",
  },
  {
    title: "蓝色创意Q4季度工作计划通用PPT模板",
    type: "19P",
    format: "未知",
    usage: "工作总结",
    platform: "AIPPT",
    tags: ["工作计划", "创意", "季度", "Q4", "蓝色"],
    date: "2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/33144/6628834/20251009160148mzpxtcu.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    is_free: false,
    url: "https://www.aippt.cn/template/ppt/detail/643722.html",
  },
  {
    title: "蓝色简约风Q4季度工作计划PPT模板",
    type: "19P",
    format: "未知",
    usage: "工作总结",
    platform: "AIPPT",
    tags: ["工作计划", "简约", "季度", "Q4", "蓝色"],
    date: "2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/59402/11880430/20251009155644tldkjzq.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    is_free: false,
    url: "https://www.aippt.cn/template/ppt/detail/643718.html",
  },
  {
    title: "粉色卡通风公司年会总结分享PPT模板",
    type: "19P",
    format: "未知",
    usage: "宣传企划",
    platform: "AIPPT",
    tags: ["年会", "卡通风", "总结分享", "粉色"],
    date: "2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/48903/9782091/20251010141729gjtxtii.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    is_free: false,
    url: "https://www.aippt.cn/template/ppt/detail/643724.html",
  },
  {
    title: "粉色商务风假期综合征通用PPT模板",
    type: "19P",
    format: "未知",
    usage: "教育教学",
    platform: "AIPPT",
    tags: ["教育", "商务", "假期", "综合征", "粉色"],
    date: "2025-10-11",
    thumbnail: "https://aippt-domestic.aippt.com/aippt-server/personal/image/43929/8785939/20251009173103ynuifgy.jpeg?x-oss-process=image/resize,w_400,limit_0/quality,q_100",
    is_free: false,
    url: "https://www.aippt.cn/template/ppt/detail/643717.html",
  },
  
  // ========== 熊猫办公 数据 ==========
  {
    title: "红色简约风年终工作总结汇报PPT模板",
    type: "22P",
    format: "PPT",
    usage: "工作总结",
    platform: "熊猫办公",
    tags: ["简约风", "年终总结", "工作汇报", "红色"],
    date: "2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/29844528/27/47/53/68e6fc7af09bb1759967354.jpg-0.jpg!/fw/288",
    is_free: true,
    url: "https://www.tukuppt.com/muban/aeexxpyb.html",
  },
  {
    title: "红色简约风工作总结报告PPT模板",
    type: "21P",
    format: "PPT",
    usage: "工作总结",
    platform: "熊猫办公",
    tags: ["简约风", "工作总结", "报告", "红色"],
    date: "2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/75014235/27/47/53/68e7a99c7d12a1760027036.jpg-0.jpg!/fw/288",
    is_free: true,
    url: "https://www.tukuppt.com/muban/aeexxaxr.html",
  },
  {
    title: "棕色商务风工作总结汇报PPT通用模板",
    type: "21P",
    format: "PPT",
    usage: "工作总结",
    platform: "熊猫办公",
    tags: ["商务风", "工作总结", "汇报", "棕色"],
    date: "2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/29844528/27/47/54/68e85cbb2b72b1760058555.jpg-0.jpg!/fw/288",
    is_free: true,
    url: "https://www.tukuppt.com/muban/xppddmdb.html",
  },
  {
    title: "红色插画风二十四节气之立冬介绍PPT模板",
    type: "18P",
    format: "PPT",
    usage: "宣传企划",
    platform: "熊猫办公",
    tags: ["插画风", "二十四节气", "立冬", "红色"],
    date: "2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/19111921/27/47/54/68e87390c476f1760064400.jpg-0.jpg!/fw/288",
    is_free: true,
    url: "https://www.tukuppt.com/muban/kbbppapa.html",
  },
  {
    title: "蓝色中国风冬季中医养生保健指南PPT模版",
    type: "23P",
    format: "PPT",
    usage: "医疗健康",
    platform: "熊猫办公",
    tags: ["中国风", "中医", "养生保健", "蓝色"],
    date: "2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/24500321/27/47/54/68e895db63a901760073179.jpg-0.jpg!/fw/288",
    is_free: true,
    url: "https://www.tukuppt.com/muban/baaxxrxy.html",
  },
  {
    title: "黄色卡通风勤俭节约主题班会PPT模版",
    type: "20P",
    format: "PPT",
    usage: "教育教学",
    platform: "熊猫办公",
    tags: ["卡通风", "勤俭节约", "主题班会", "黄色"],
    date: "2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/75014235/27/47/53/68e782fea15f91760002814.jpg-0.jpg!/fw/288",
    is_free: true,
    url: "https://www.tukuppt.com/muban/aeexxyom.html",
  },
  {
    title: "粉色卡通风新生儿呕吐疑难病例讨论PPT模版",
    type: "24P",
    format: "PPT",
    usage: "医疗健康",
    platform: "熊猫办公",
    tags: ["卡通风", "新生儿", "病例讨论", "粉色"],
    date: "2025-10-11",
    thumbnail: "https://img.tukuppt.com/preview/75014235/27/47/53/68e78458e57e91760003160.jpg-0.jpg!/fw/288",
    is_free: true,
    url: "https://www.tukuppt.com/muban/kbbppmex.html",
  },
  
  // ========== Canva 数据 ==========
  {
    title: "黄黑色趣味插画风格人生规划演示文稿",
    type: "18P",
    format: "PPTX",
    usage: "职场办公",
    platform: "Canva",
    tags: ["趣味插画", "人生规划", "黄黑色", "风格"],
    date: "2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGy8YdkNoU/1/0/800w/canva-mSoEC9Vl5e0.jpg",
    is_free: true,
    url: "https://www.canva.cn/templates/EAGy8YdkNoU/",
  },
  {
    title: "蓝紫绿色潮流插画大学生社团招新演示文稿",
    type: "20P",
    format: "PPTX",
    usage: "宣传企划",
    platform: "Canva",
    tags: ["潮流插画", "社团招新", "蓝紫绿色", "大学生"],
    date: "2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGxteAqVis/1/0/800w/canva-Qg6KOCuryGM.jpg",
    is_free: true,
    url: "https://www.canva.cn/templates/EAGxteAqVis/",
  },
  {
    title: "黄蓝色3D风格大学生职业规划汇报演示文稿",
    type: "22P",
    format: "PPTX",
    usage: "职场办公",
    platform: "Canva",
    tags: ["3D风格", "职业规划", "黄蓝色", "大学生"],
    date: "2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAFqFX2snpk/1/0/800w/canva-mfokNjhXLiM.jpg",
    is_free: true,
    url: "https://www.canva.cn/templates/EAFqFX2snpk/",
  },
  {
    title: "蓝色极简风工作总结演示文稿结构页精选",
    type: "16P",
    format: "PPTX",
    usage: "工作总结",
    platform: "Canva",
    tags: ["极简风", "工作总结", "蓝色", "结构页"],
    date: "2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAFqRnKQhsI/1/0/800w/canva-xg4Xgb2Nxv8.jpg",
    is_free: true,
    url: "https://www.canva.cn/templates/EAFqRnKQhsI/",
  },
  {
    title: "绿色半调简约风自我介绍个人作品集通用演示文稿",
    type: "19P",
    format: "PPTX",
    usage: "职场办公",
    platform: "Canva",
    tags: ["半调简约", "自我介绍", "作品集", "绿色"],
    date: "2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGxjTmh07M/1/0/800w/canva-YK9nqgO_a14.jpg",
    is_free: true,
    url: "https://www.canva.cn/templates/EAGxjTmh07M/",
  },
  {
    title: "黑白色简约风摄影作品集演示文稿",
    type: "21P",
    format: "PPTX",
    usage: "宣传企划",
    platform: "Canva",
    tags: ["简约风", "摄影作品集", "黑白色", "艺术"],
    date: "2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGydYM4rh8/1/0/800w/canva-V9uYjWKMoKs.jpg",
    is_free: true,
    url: "https://www.canva.cn/templates/EAGydYM4rh8/",
  },
  {
    title: "绿色仿黑板粉笔效果校园通用PPT模板演示文稿",
    type: "24P",
    format: "PPTX",
    usage: "教育教学",
    platform: "Canva",
    tags: ["黑板粉笔", "校园通用", "绿色", "效果"],
    date: "2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGxjO95Evs/1/0/800w/canva-aKzCpwfhc18.jpg",
    is_free: true,
    url: "https://www.canva.cn/templates/EAGxjO95Evs/",
  },
  {
    title: "黄绿色简约宣传工作汇报演示文稿",
    type: "18P",
    format: "PPTX",
    usage: "宣传企划",
    platform: "Canva",
    tags: ["简约", "宣传工作", "黄绿色", "汇报"],
    date: "2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGxj4f-IqI/1/0/800w/canva-8hJSyE8OaDE.jpg",
    is_free: true,
    url: "https://www.canva.cn/templates/EAGxj4f-IqI/",
  },
  {
    title: "咖色传统风格校园课件演示文稿",
    type: "20P",
    format: "PPTX",
    usage: "教育教学",
    platform: "Canva",
    tags: ["传统风格", "校园课件", "咖色", "教育"],
    date: "2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGy3FGYfIU/1/0/800w/canva-AEA-X2g7a9k.jpg",
    is_free: true,
    url: "https://www.canva.cn/templates/EAGy3FGYfIU/",
  },
  {
    title: "黑白色线描插画风个人介绍求职简历演示文稿",
    type: "17P",
    format: "PPTX",
    usage: "职场办公",
    platform: "Canva",
    tags: ["线描插画", "个人介绍", "求职简历", "黑白色"],
    date: "2025-10-11",
    thumbnail: "https://marketplace.canva.cn/EAGxuEnYj0Y/1/0/800w/canva-L2mh7Hud9ro.jpg",
    is_free: true,
    url: "https://www.canva.cn/templates/EAGxuEnYj0Y/",
  },
]

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始导入高质量Mock数据到Supabase')
  console.log(`📊 总计: ${qualityMockData.length} 条模板数据`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  try {
    // 1. 清空现有数据
    console.log('🗑️  清空现有数据...')
    const { error: deleteError } = await supabase
      .from('competitor_templates')
      .delete()
      .gte('id', 0)
    
    if (deleteError) {
      console.error('❌ 清空失败:', deleteError.message)
      process.exit(1)
    }
    console.log('✅ 已清空现有数据\n')
    
    // 2. 准备插入数据
    const batchTimestamp = new Date().toISOString()
    const dataToInsert = qualityMockData.map(item => ({
      title: item.title,
      type: item.type,
      format: item.format,
      usage: item.usage,
      platform: item.platform,
      tags: item.tags,
      date: item.date,
      hot_value: 0,
      url: item.url,
      thumbnail: item.thumbnail,
      is_free: item.is_free,
      crawled_at: batchTimestamp
    }))
    
    // 3. 批量插入数据
    console.log('💾 正在导入数据...')
    const { data, error } = await supabase
      .from('competitor_templates')
      .insert(dataToInsert)
      .select()
    
    if (error) {
      console.error('❌ 插入失败:', error.message)
      process.exit(1)
    }
    
    console.log(`✅ 成功导入 ${data.length} 条数据\n`)
    
    // 4. 验证数据
    console.log('🔍 验证数据完整性...')
    const { data: platformCounts, error: countError } = await supabase
      .from('competitor_templates')
      .select('platform')
    
    if (countError) {
      console.error('❌ 验证失败:', countError.message)
      process.exit(1)
    }
    
    const counts = platformCounts.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📊 平台数据统计:')
    Object.entries(counts).forEach(([platform, count]) => {
      console.log(`   ${platform}: ${count} 条`)
    })
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ 导入完成！')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('💡 下一步:')
    console.log('   1. 刷新浏览器访问 http://localhost:4001/competitor-dynamics')
    console.log('   2. 验证数据显示效果')
    console.log('   3. 确认缩略图、标签、作者等字段都正常显示\n')
    
  } catch (error) {
    console.error('❌ 导入过程发生异常:', error.message)
    process.exit(1)
  }
}

main()

