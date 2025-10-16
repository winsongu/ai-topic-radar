/**
 * 营销日历数据完整性验证脚本
 * 检查所有重要节日是否完整
 */

const calendarData = require('../data/calendar-events.json');

console.log('🔍 开始严格验证营销日历数据...\n');

// 必须包含的重要节日清单
const criticalHolidays = {
  '中国传统节日': [
    { name: '春节', month: 2, star: true },
    { name: '除夕', month: 2, star: true },
    { name: '元宵节', month: 3, star: true },
    { name: '清明节', month: 4, star: true },
    { name: '端午节', month: 6, star: true },
    { name: '七夕节', month: 8, star: true },  // 中国情人节，应该有星标
    { name: '中秋节', month: 9, star: true },
    { name: '重阳节', month: 10, star: true },
    { name: '腊八节', month: 1, star: false },
    { name: '小年', month: 2, star: true }
  ],
  
  '法定节假日': [
    { name: '元旦', month: 1, star: true },
    { name: '国庆节', month: 10, star: true },
    { name: '劳动节', month: 5, star: true }
  ],
  
  '重要国际节日': [
    { name: '情人节', month: 2, star: true },
    { name: '妇女节', month: 3, star: true },
    { name: '植树节', month: 3, star: true },
    { name: '愚人节', month: 4, star: false },
    { name: '儿童节', month: 6, star: true },
    { name: '建党节', month: 7, star: true },
    { name: '建军节', month: 8, star: true },
    { name: '教师节', month: 9, star: true },
    { name: '万圣节', month: 10, star: true },
    { name: '圣诞节', month: 12, star: true },
    { name: '平安夜', month: 12, star: false }
  ],
  
  '电商营销节日': [
    { name: '520', month: 5, star: false },
    { name: '618', month: 6, star: false },
    { name: '双十一', month: 11, star: true },
    { name: '双十二', month: 12, star: false }
  ],
  
  '24节气': [
    { name: '立春', month: 2, star: false },
    { name: '雨水', month: 2, star: false },
    { name: '惊蛰', month: 3, star: false },
    { name: '春分', month: 3, star: false },
    { name: '清明', month: 4, star: false },
    { name: '谷雨', month: 4, star: false },
    { name: '立夏', month: 5, star: false },
    { name: '小满', month: 5, star: false },
    { name: '芒种', month: 6, star: false },
    { name: '夏至', month: 6, star: false },
    { name: '小暑', month: 7, star: false },
    { name: '大暑', month: 7, star: false },
    { name: '立秋', month: 8, star: false },
    { name: '处暑', month: 8, star: false },
    { name: '白露', month: 9, star: false },
    { name: '秋分', month: 9, star: false },
    { name: '寒露', month: 10, star: false },
    { name: '霜降', month: 10, star: false },
    { name: '立冬', month: 11, star: false },
    { name: '小雪', month: 11, star: false },
    { name: '大雪', month: 12, star: false },
    { name: '冬至', month: 12, star: false },
    { name: '小寒', month: 1, star: false },
    { name: '大寒', month: 1, star: false }
  ],
  
  '特殊营销节日': [
    { name: '母亲节', month: 5, star: true },
    { name: '父亲节', month: 6, star: true },
    { name: '感恩节', month: 11, star: true },
    { name: '白色情人节', month: 3, star: false },
    { name: '青年节', month: 5, star: true }
  ]
};

// 验证函数
function verifyHolidays() {
  let totalChecked = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const failedList = [];
  const starIssues = [];
  
  console.log('📋 开始检查各类节日...\n');
  
  for (const [category, holidays] of Object.entries(criticalHolidays)) {
    console.log(`\n=== ${category} ===`);
    
    for (const holiday of holidays) {
      totalChecked++;
      
      // 查找该节日是否存在
      const found = calendarData.find(day => {
        return day.events.some(event => 
          event.title.includes(holiday.name)
        );
      });
      
      if (found) {
        // 检查是否有星标
        const event = found.events.find(e => e.title.includes(holiday.name));
        const hasStar = event.isHighProfile;
        const shouldHaveStar = holiday.star;
        
        if (shouldHaveStar && !hasStar) {
          console.log(`⚠️  ${holiday.name} - 找到但缺少星标 (${found.month}月${found.date}日)`);
          starIssues.push({ 
            name: holiday.name, 
            date: `${found.month}月${found.date}日`,
            issue: '缺少星标'
          });
          totalPassed++;
        } else if (!shouldHaveStar && hasStar) {
          console.log(`⚠️  ${holiday.name} - 找到但不应有星标 (${found.month}月${found.date}日)`);
          starIssues.push({ 
            name: holiday.name, 
            date: `${found.month}月${found.date}日`,
            issue: '不应有星标'
          });
          totalPassed++;
        } else {
          const star = hasStar ? '⭐' : '  ';
          console.log(`✅ ${star} ${holiday.name} - 已包含 (${found.month}月${found.date}日)`);
          totalPassed++;
        }
      } else {
        console.log(`❌ ${holiday.name} - 缺失！`);
        failedList.push({ 
          name: holiday.name, 
          expectedMonth: holiday.month,
          category 
        });
        totalFailed++;
      }
    }
  }
  
  // 输出汇总
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 验证结果汇总');
  console.log('='.repeat(60));
  console.log(`总检查项: ${totalChecked}`);
  console.log(`✅ 通过: ${totalPassed} (${(totalPassed/totalChecked*100).toFixed(1)}%)`);
  console.log(`❌ 失败: ${totalFailed} (${(totalFailed/totalChecked*100).toFixed(1)}%)`);
  console.log(`⚠️  星标问题: ${starIssues.length}`);
  
  // 输出缺失列表
  if (failedList.length > 0) {
    console.log('\n\n⚠️  缺失节日清单:');
    failedList.forEach(item => {
      console.log(`  ❌ ${item.name} (预期在${item.expectedMonth}月) - ${item.category}`);
    });
  }
  
  // 输出星标问题
  if (starIssues.length > 0) {
    console.log('\n\n⚠️  星标标注问题:');
    starIssues.forEach(item => {
      console.log(`  ⚠️  ${item.name} (${item.date}) - ${item.issue}`);
    });
  }
  
  // 最终结论
  console.log('\n\n' + '='.repeat(60));
  if (totalFailed === 0 && starIssues.length === 0) {
    console.log('🎉 验证通过！所有重要节日都已正确包含！');
  } else if (totalFailed === 0) {
    console.log('⚠️  节日完整，但有星标标注问题需要修正');
  } else {
    console.log('❌ 验证失败！发现缺失节日，需要补充');
  }
  console.log('='.repeat(60));
  
  return {
    total: totalChecked,
    passed: totalPassed,
    failed: totalFailed,
    failedList,
    starIssues
  };
}

// 额外检查：数据统计
function checkDataStats() {
  console.log('\n\n📈 数据统计分析');
  console.log('='.repeat(60));
  
  const monthStats = {};
  
  calendarData.forEach(day => {
    const key = `${day.year}-${day.month}`;
    if (!monthStats[key]) {
      monthStats[key] = {
        year: day.year,
        month: day.month,
        eventDays: 0,
        totalEvents: 0,
        starEvents: 0
      };
    }
    monthStats[key].eventDays++;
    monthStats[key].totalEvents += day.events.length;
    monthStats[key].starEvents += day.events.filter(e => e.isHighProfile).length;
  });
  
  console.log('\n各月数据统计:');
  Object.values(monthStats).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  }).forEach(stat => {
    const daysInMonth = new Date(stat.year, stat.month, 0).getDate();
    const coverage = (stat.eventDays / daysInMonth * 100).toFixed(1);
    console.log(`  ${stat.year}年${stat.month}月: ${stat.eventDays}天有事件 (${coverage}%), ${stat.totalEvents}个事件, ${stat.starEvents}个重点`);
  });
}

// 检查重复
function checkDuplicates() {
  console.log('\n\n🔍 检查重复数据');
  console.log('='.repeat(60));
  
  const dateMap = new Map();
  let hasDuplicates = false;
  
  calendarData.forEach(day => {
    const key = `${day.year}-${day.month}-${day.date}`;
    if (dateMap.has(key)) {
      console.log(`⚠️  发现重复日期: ${key}`);
      hasDuplicates = true;
    } else {
      dateMap.set(key, true);
    }
  });
  
  if (!hasDuplicates) {
    console.log('✅ 无重复日期');
  }
}

// 执行验证
const result = verifyHolidays();
checkDataStats();
checkDuplicates();

// 返回结果
process.exit(result.failed === 0 && result.starIssues.length === 0 ? 0 : 1);

