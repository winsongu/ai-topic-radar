/**
 * 生成日报数据 - 获取竞品PPT和Word模板真实数据
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase配置缺失');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 获取最近7天的日期
function getRecentDates(days = 7) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

// 获取竞品PPT数据
async function getCompetitorPPT() {
  console.log('\n📊 获取竞品PPT数据...');
  
  const { data, error } = await supabase
    .from('competitor_templates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('❌ 获取PPT数据失败:', error);
    return [];
  }
  
  console.log(`✅ 获取到 ${data?.length || 0} 条PPT数据`);
  return data || [];
}

// 获取竞品Word模板数据
async function getCompetitorWord() {
  console.log('\n📄 获取竞品Word模板数据...');
  
  const { data, error } = await supabase
    .from('word_templates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('❌ 获取Word数据失败:', error);
    return [];
  }
  
  console.log(`✅ 获取到 ${data?.length || 0} 条Word数据`);
  return data || [];
}

// 分析今日新增
function analyzeToday(data) {
  const today = new Date().toISOString().split('T')[0];
  const todayData = data.filter(item => {
    const itemDate = new Date(item.created_at).toISOString().split('T')[0];
    return itemDate === today;
  });
  return todayData;
}

// 分析本周新增
function analyzeWeek(data) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekData = data.filter(item => {
    const itemDate = new Date(item.created_at);
    return itemDate >= weekAgo;
  });
  return weekData;
}

// 提取主题关键词
function extractThemes(data) {
  const themes = {};
  
  data.forEach(item => {
    const title = item.title || item.template_title || '';
    
    // 提取颜色
    const colors = ['红色', '蓝色', '绿色', '黄色', '粉色', '橙色', '紫色', '白色', '黑色'];
    colors.forEach(color => {
      if (title.includes(color)) {
        themes[color] = (themes[color] || 0) + 1;
      }
    });
    
    // 提取风格
    const styles = ['简约', '商务', '清新', '卡通', '中国风', '扁平', '极简', '手绘', '可爱', '古风'];
    styles.forEach(style => {
      if (title.includes(style)) {
        themes[style] = (themes[style] || 0) + 1;
      }
    });
    
    // 提取主题
    const topics = ['年会', '总结', '汇报', '培训', '教育', '节日', '春节', '国庆', '教师节', '儿童节'];
    topics.forEach(topic => {
      if (title.includes(topic)) {
        themes[topic] = (themes[topic] || 0) + 1;
      }
    });
  });
  
  // 排序
  const sorted = Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  return sorted;
}

// 识别机会点
function identifyOpportunities(pptData, wordData) {
  const opportunities = [];
  
  // 分析今日新增的主题
  const todayPPT = analyzeToday(pptData);
  const todayWord = analyzeToday(wordData);
  
  // 提取今日热门主题
  const todayThemes = extractThemes([...todayPPT, ...todayWord]);
  
  todayThemes.forEach(([theme, count]) => {
    if (count >= 2) {
      opportunities.push({
        priority: count >= 5 ? 'P0' : 'P1',
        title: `${theme}主题模板`,
        reason: `竞品今日上新${count}个相关模板，市场需求活跃`,
        suggestion: `补充差异化风格，建议产出2-3个模板`,
        estimate: `预估 ${count * 100}-${count * 200}次/月`
      });
    }
  });
  
  return opportunities.slice(0, 5);
}

// 生成AI洞察
async function generateInsights() {
  console.log('\n🤖 开始生成AI洞察报告...\n');
  
  // 获取数据
  const pptData = await getCompetitorPPT();
  const wordData = await getCompetitorWord();
  
  // 统计分析
  const todayPPT = analyzeToday(pptData);
  const todayWord = analyzeToday(wordData);
  const weekPPT = analyzeWeek(pptData);
  const weekWord = analyzeWeek(wordData);
  
  // 主题分析
  const pptThemes = extractThemes(weekPPT);
  const wordThemes = extractThemes(weekWord);
  
  // 机会点识别
  const opportunities = identifyOpportunities(pptData, wordData);
  
  // 生成报告
  const report = {
    date: new Date().toISOString().split('T')[0],
    summary: {
      ppt_total: pptData.length,
      word_total: wordData.length,
      today_ppt: todayPPT.length,
      today_word: todayWord.length,
      week_ppt: weekPPT.length,
      week_word: weekWord.length
    },
    today_ppt: todayPPT.slice(0, 10).map(item => ({
      title: item.title || item.template_title,
      platform: item.platform || '未知平台',
      url: item.url || item.detail_url,
      tags: extractTagsFromTitle(item.title || item.template_title)
    })),
    today_word: todayWord.slice(0, 10).map(item => ({
      title: item.title || item.template_title,
      platform: item.platform || '未知平台',
      url: item.url || item.detail_url,
      tags: extractTagsFromTitle(item.title || item.template_title)
    })),
    themes: {
      ppt: pptThemes,
      word: wordThemes
    },
    opportunities: opportunities
  };
  
  console.log('\n📊 === 日报数据统计 ===');
  console.log(`📅 日期: ${report.date}`);
  console.log(`\n📈 数据概览:`);
  console.log(`   - PPT总数: ${report.summary.ppt_total} 条`);
  console.log(`   - Word总数: ${report.summary.word_total} 条`);
  console.log(`   - 今日PPT: ${report.summary.today_ppt} 个`);
  console.log(`   - 今日Word: ${report.summary.today_word} 个`);
  console.log(`   - 本周PPT: ${report.summary.week_ppt} 个`);
  console.log(`   - 本周Word: ${report.summary.week_word} 个`);
  
  console.log(`\n🎨 PPT热门主题 Top 5:`);
  report.themes.ppt.slice(0, 5).forEach(([theme, count], i) => {
    console.log(`   ${i + 1}. ${theme}: ${count}次`);
  });
  
  console.log(`\n📄 Word热门主题 Top 5:`);
  report.themes.word.slice(0, 5).forEach(([theme, count], i) => {
    console.log(`   ${i + 1}. ${theme}: ${count}次`);
  });
  
  console.log(`\n💡 识别机会点: ${report.opportunities.length}个`);
  report.opportunities.forEach((opp, i) => {
    console.log(`   ${i + 1}. [${opp.priority}] ${opp.title}`);
    console.log(`      ${opp.reason}`);
  });
  
  console.log('\n✅ 报告生成完成！');
  
  return report;
}

// 提取标题中的标签
function extractTagsFromTitle(title) {
  const tags = [];
  
  // 颜色
  const colors = ['红色', '蓝色', '绿色', '黄色', '粉色', '橙色', '紫色'];
  colors.forEach(color => {
    if (title.includes(color)) tags.push(color);
  });
  
  // 风格
  const styles = ['简约', '商务', '清新', '卡通', '中国风'];
  styles.forEach(style => {
    if (title.includes(style)) tags.push(style);
  });
  
  return tags;
}

// 主函数
async function main() {
  try {
    const report = await generateInsights();
    
    // 保存到JSON文件
    const fs = await import('fs');
    const outputPath = './daily-report-data.json';
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 数据已保存到: ${outputPath}`);
    
  } catch (error) {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  }
}

main();

