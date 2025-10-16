/**
 * 营销日历数据生成脚本
 * 生成未来180天的营销日历数据，包括节日、节气、纪念日等
 */

const { Lunar, Solar } = require('lunar-javascript');
const fs = require('fs');
const path = require('path');

// 公历节日配置（月-日：节日名称）- 极大丰富版本
const solarHolidays = {
  // 1月 - 新年、冬季
  '1-1': ['元旦', '世界和平日'],
  '1-4': ['世界盲文日'],
  '1-6': ['中国13亿人口日'],
  '1-8': ['周恩来逝世纪念日 (1976)'],
  '1-10': ['中国110宣传日', '中国人民警察节'],
  '1-20': ['大寒'],
  '1-21': ['国际拥抱日'],
  '1-26': ['国际海关日'],
  '1-27': ['国际大屠杀纪念日'],
  
  // 2月 - 春节、情人节
  '2-2': ['世界湿地日'],
  '2-4': ['世界抗癌日'],
  '2-7': ['京汉铁路罢工纪念日 (1923)'],
  '2-10': ['国际气象节'],
  '2-14': ['情人节'],
  '2-19': ['邓小平逝世纪念日 (1997)'],
  '2-21': ['国际母语日'],
  '2-24': ['第三世界青年日'],
  '2-28': ['世界居住条件调查日'],
  
  // 3月 - 春天、女性、环保
  '3-1': ['国际海豹日'],
  '3-3': ['全国爱耳日', '世界野生动植物日'],
  '3-5': ['学雷锋日', '中国青年志愿者服务日'],
  '3-6': ['世界青光眼日'],
  '3-7': ['女生节'],
  '3-8': ['妇女节', '国际劳动妇女节'],
  '3-9': ['保护母亲河日'],
  '3-12': ['植树节', '中国植树节'],
  '3-14': ['白色情人节', '国际警察日'],
  '3-15': ['消费者权益日', '国际消费者权益日'],
  '3-17': ['中国国医节', '爱尔兰圣帕特里克节'],
  '3-18': ['全国科技人才活动日'],
  '3-20': ['国际幸福日'],
  '3-21': ['世界森林日', '世界睡眠日', '世界儿歌日'],
  '3-22': ['世界水日'],
  '3-23': ['世界气象日'],
  '3-24': ['世界防治结核病日'],
  
  // 4月 - 清明、春游
  '4-1': ['愚人节', '国际爱鸟日'],
  '4-2': ['国际儿童图书日', '世界自闭症日'],
  '4-4': ['寒食节'],
  '4-7': ['世界卫生日', '反思卢旺达大屠杀国际日'],
  '4-8': ['国际珍稀动物保护日'],
  '4-11': ['世界帕金森病日'],
  '4-12': ['世界航天日'],
  '4-14': ['黑色情人节'],
  '4-15': ['全民国家安全教育日'],
  '4-16': ['世界噪音日'],
  '4-18': ['国际古迹遗址日'],
  '4-20': ['谷雨', '联合国中文日'],
  '4-21': ['企业家日'],
  '4-22': ['世界地球日', '世界法律日'],
  '4-23': ['世界读书日', '世界图书和版权日'],
  '4-24': ['中国航天日', '世界青年反对殖民主义日'],
  '4-25': ['儿童预防接种宣传日', '世界防治疟疾日'],
  '4-26': ['世界知识产权日'],
  '4-28': ['世界安全生产与健康日'],
  '4-30': ['全国交通安全反思日'],
  
  // 5月 - 劳动节、青年节、母亲节
  '5-1': ['劳动节', '国际劳动节'],
  '5-3': ['世界新闻自由日'],
  '5-4': ['青年节', '五四青年节', '科技传播日'],
  '5-5': ['全国碘缺乏病防治日'],
  '5-8': ['世界红十字日', '世界微笑日'],
  '5-9': ['战胜德国法西斯纪念日'],
  '5-11': ['世界防治肥胖日'],
  '5-12': ['护士节', '国际护士节', '全国防灾减灾日'],
  '5-15': ['国际家庭日'],
  '5-17': ['世界电信日', '世界高血压日'],
  '5-18': ['国际博物馆日'],
  '5-19': ['中国旅游日'],
  '5-20': ['网络情人节', '520', '全国学生营养日'],
  '5-21': ['国际茶日', '世界文化多样性日'],
  '5-22': ['国际生物多样性日'],
  '5-25': ['非洲解放日', '525大学生心理健康日'],
  '5-26': ['世界向人体条件挑战日'],
  '5-29': ['国际维和人员日'],
  '5-30': ['全国科技工作者日'],
  '5-31': ['世界无烟日'],
  
  // 6月 - 儿童节、父亲节、毕业季
  '6-1': ['儿童节', '国际儿童节'],
  '6-3': ['世界自行车日'],
  '6-5': ['世界环境日'],
  '6-6': ['全国爱眼日', '芒种'],
  '6-8': ['世界海洋日'],
  '6-9': ['中国文化和自然遗产日'],
  '6-11': ['中国人口日'],
  '6-12': ['世界无童工日'],
  '6-13': ['全国低碳日'],
  '6-14': ['世界献血者日'],
  '6-15': ['全国老年维权日'],
  '6-16': ['国际非洲儿童日'],
  '6-17': ['世界防治荒漠化和干旱日'],
  '6-18': ['618购物节'],
  '6-20': ['世界难民日'],
  '6-21': ['国际瑜伽日', '夏至'],
  '6-23': ['国际奥林匹克日', '世界手球日'],
  '6-25': ['全国土地日'],
  '6-26': ['国际禁毒日', '联合国宪章日'],
  '6-29': ['全国科普行动日'],
  '6-30': ['世界青年联欢节'],
  
  // 7月 - 暑假、建党节
  '7-1': ['建党节', '中国共产党诞生日', '香港回归纪念日'],
  '7-2': ['国际体育记者日'],
  '7-6': ['国际接吻日'],
  '7-7': ['中国人民抗日战争纪念日', '世界过敏性疾病日'],
  '7-8': ['世界过敏性疾病日'],
  '7-11': ['世界人口日', '中国航海日'],
  '7-14': ['银色情人节'],
  '7-18': ['曼德拉国际日'],
  '7-20': ['人类月球日'],
  '7-28': ['世界肝炎日'],
  '7-30': ['国际友谊日'],
  
  // 8月 - 建军节、七夕
  '8-1': ['建军节', '中国人民解放军建军节'],
  '8-3': ['男人节'],
  '8-5': ['恩格斯逝世纪念日 (1895)'],
  '8-6': ['国际电影节'],
  '8-8': ['全民健身日', '爸爸节', '立秋'],
  '8-9': ['世界土著人民国际日'],
  '8-12': ['国际青年节'],
  '8-13': ['国际左撇子日'],
  '8-14': ['绿色情人节'],
  '8-15': ['日本投降日', '中元节'],
  '8-19': ['中国医师节', '世界人道主义日'],
  '8-20': ['七夕节'],
  '8-22': ['邓小平诞辰纪念日 (1904)'],
  '8-23': ['处暑'],
  '8-26': ['全国律师咨询日'],
  '8-29': ['全国测绘法宣传日'],
  
  // 9月 - 开学季、教师节、中秋
  '9-3': ['抗日战争胜利纪念日', '中国抗日战争胜利纪念日'],
  '9-5': ['中华慈善日'],
  '9-7': ['白露'],
  '9-8': ['国际扫盲日', '世界新闻工作者日'],
  '9-9': ['毛泽东逝世纪念日 (1976)'],
  '9-10': ['教师节', '中国教师节', '世界预防自杀日'],
  '9-14': ['世界清洁地球日', '音乐情人节'],
  '9-15': ['国际民主日'],
  '9-16': ['国际臭氧层保护日', '中国脑健康日'],
  '9-17': ['世界骑行日'],
  '9-18': ['九一八事变纪念日'],
  '9-20': ['全国爱牙日', '公民道德宣传日'],
  '9-21': ['国际和平日', '世界老年痴呆日'],
  '9-22': ['世界无车日', '秋分'],
  '9-23': ['国际聋人节'],
  '9-25': ['世界心脏日'],
  '9-26': ['世界避孕日'],
  '9-27': ['世界旅游日'],
  '9-28': ['国际聋人节'],
  '9-29': ['世界心脏日'],
  '9-30': ['国际翻译日', '中国烈士纪念日'],
  
  // 10月 - 国庆节、重阳节
  '10-1': ['国庆节', '中华人民共和国国庆节', '国际音乐日', '国际老年人日'],
  '10-2': ['国际非暴力日', '世界农场动物日'],
  '10-3': ['世界建筑日', '德国统一日'],
  '10-4': ['世界动物日', '世界空间周开始'],
  '10-5': ['世界教师日'],
  '10-6': ['国际建筑日', '世界人居日', '老人节'],
  '10-7': ['世界住房日'],
  '10-8': ['寒露', '世界视觉日', '全国高血压日'],
  '10-9': ['世界邮政日'],
  '10-10': ['辛亥革命纪念日', '世界精神卫生日', '世界镇痛日'],
  '10-11': ['世界镇痛日', '国际女童日'],
  '10-12': ['世界关节炎日', '世界60亿人口日'],
  '10-13': ['国际标准时间日', '世界保健日', '中国少年先锋队诞辰'],
  '10-14': ['世界标准日', '国际标准化组织成立纪念'],
  '10-15': ['国际盲人节', '世界农村妇女日', '全球洗手日'],
  '10-16': ['世界粮食日', '世界脊柱日'],
  '10-17': ['国际消除贫困日', '世界创伤日'],
  '10-18': ['世界更年期关怀日'],
  '10-20': ['世界统计日', '世界骨质疏松日'],
  '10-21': ['世界传统医药日'],
  '10-22': ['世界传统医药日'],
  '10-23': ['霜降', '世界雪豹日'],
  '10-24': ['联合国日', '世界发展信息日', '程序员节'],
  '10-25': ['抗美援朝纪念日', '世界面食日'],
  '10-26': ['环卫工人节'],
  '10-27': ['世界音像遗产日'],
  '10-28': ['世界男性健康日'],
  '10-29': ['世界卒中日'],
  '10-30': ['世界勤俭日'],
  '10-31': ['万圣节', '世界城市日', '世界勤俭日'],
  
  // 11月 - 双十一、感恩节
  '11-1': ['万圣节'],
  '11-5': ['世界海啸日'],
  '11-7': ['立冬', '十月革命纪念日'],
  '11-8': ['中国记者节', '世界城市规划日'],
  '11-9': ['全国消防日', '吉尼斯世界纪录日'],
  '11-10': ['世界青年日'],
  '11-11': ['光棍节', '双十一购物节', '空军建军节', '国际科学与和平周'],
  '11-12': ['中国银行业服务日'],
  '11-14': ['世界糖尿病日', '电影情人节'],
  '11-16': ['国际宽容日'],
  '11-17': ['国际大学生节', '世界学生日'],
  '11-19': ['世界厕所日'],
  '11-20': ['世界儿童日', '非洲工业化日'],
  '11-21': ['世界电视日', '世界问候日'],
  '11-22': ['小雪'],
  '11-25': ['国际消除对妇女暴力日'],
  '11-29': ['国际声援巴勒斯坦人民日'],
  
  // 12月 - 圣诞节、冬季
  '12-1': ['世界艾滋病日'],
  '12-2': ['全国交通安全日'],
  '12-3': ['国际残疾人日', '世界残疾人日'],
  '12-4': ['全国法制宣传日', '中国法制宣传日'],
  '12-5': ['国际志愿者日', '世界土壤日'],
  '12-7': ['大雪', '国际民航日'],
  '12-9': ['世界足球日', '国际反腐败日', '一二九运动纪念日'],
  '12-10': ['世界人权日'],
  '12-11': ['国际山岳日'],
  '12-12': ['双十二购物节', '西安事变纪念日'],
  '12-13': ['南京大屠杀死难者国家公祭日'],
  '12-14': ['拥抱情人节'],
  '12-15': ['世界强化免疫日'],
  '12-18': ['国际移徙者日'],
  '12-19': ['联合国南南合作日'],
  '12-20': ['澳门回归纪念日', '国际人类团结日'],
  '12-21': ['冬至', '国际篮球日'],
  '12-22': ['冬至'],
  '12-24': ['平安夜'],
  '12-25': ['圣诞节'],
  '12-26': ['毛泽东诞辰纪念日 (1893)'],
};

// 农历节日配置（月-日：节日名称）
const lunarHolidays = {
  '1-1': ['春节', '农历新年'],
  '1-15': ['元宵节', '上元节'],
  '2-2': ['龙抬头', '春龙节'],
  '5-5': ['端午节', '端阳节'],
  '7-7': ['七夕节', '中国情人节'],
  '7-15': ['中元节', '鬼节'],
  '8-15': ['中秋节'],
  '9-9': ['重阳节', '老人节'],
  '10-1': ['寒衣节'],
  '10-15': ['下元节'],
  '12-8': ['腊八节'],
  '12-23': ['小年（北方）'],
  '12-24': ['小年（南方）'],
  '12-30': ['除夕'],
};

// 重要纪念日和特殊事件（需要手动配置具体日期）
const specialEvents = {
  // 将在生成时根据具体年份动态添加
  // 例如：母亲节（5月第二个周日）、父亲节（6月第三个周日）
};

/**
 * 获取指定日期的农历节日
 */
function getLunarHolidays(solarDate) {
  const lunar = Lunar.fromDate(solarDate);
  const lunarMonth = lunar.getMonth();
  const lunarDay = lunar.getDay();
  const key = `${lunarMonth}-${lunarDay}`;
  
  const holidays = [...(lunarHolidays[key] || [])];
  
  // 特殊处理：检查是否是除夕（腊月最后一天）
  // 除夕可能是腊月二十九或三十
  if (lunarMonth === 12) {
    const nextDay = new Date(solarDate);
    nextDay.setDate(solarDate.getDate() + 1);
    const nextLunar = Lunar.fromDate(nextDay);
    
    // 如果明天是正月初一，今天就是除夕
    if (nextLunar.getMonth() === 1 && nextLunar.getDay() === 1) {
      holidays.push('除夕');
    }
  }
  
  return holidays;
}

/**
 * 获取指定日期的公历节日
 */
function getSolarHolidays(solarDate) {
  const month = solarDate.getMonth() + 1;
  const day = solarDate.getDate();
  const key = `${month}-${day}`;
  
  return solarHolidays[key] || [];
}

/**
 * 获取指定日期的节气
 */
function getSolarTerm(solarDate) {
  const solar = Solar.fromDate(solarDate);
  const lunar = solar.getLunar();
  const jieQi = lunar.getJieQi();
  
  return jieQi || null;
}

/**
 * 检查清明节（清明既是节气也是传统节日）
 */
function checkQingming(solarDate) {
  const solarTerm = getSolarTerm(solarDate);
  if (solarTerm === '清明') {
    return ['清明节'];  // 返回清明节
  }
  return [];
}

/**
 * 获取母亲节（5月第二个星期日）
 */
function getMothersDay(year) {
  const may = new Date(year, 4, 1); // 5月1日
  const firstSunday = may.getDay() === 0 ? may : new Date(year, 4, 7 - may.getDay() + 1);
  return new Date(firstSunday.getTime() + 7 * 24 * 60 * 60 * 1000); // 第二个星期日
}

/**
 * 获取父亲节（6月第三个星期日）
 */
function getFathersDay(year) {
  const june = new Date(year, 5, 1); // 6月1日
  const firstSunday = june.getDay() === 0 ? june : new Date(year, 5, 7 - june.getDay() + 1);
  return new Date(firstSunday.getTime() + 14 * 24 * 60 * 60 * 1000); // 第三个星期日
}

/**
 * 获取感恩节（11月第四个星期四）
 */
function getThanksgiving(year) {
  const november = new Date(year, 10, 1); // 11月1日
  const firstThursday = november.getDay() <= 4 
    ? new Date(year, 10, 4 - november.getDay() + 1)
    : new Date(year, 10, 11 - november.getDay() + 1);
  return new Date(firstThursday.getTime() + 21 * 24 * 60 * 60 * 1000); // 第四个星期四
}

/**
 * 判断节日是否为重点节日（显示橙色星标）
 */
function isHighProfileHoliday(title) {
  const highProfile = [
    // 中国传统节日
    '春节', '除夕', '元宵节', '清明节', '端午节', '七夕', '中秋节', '重阳节', '小年',
    // 法定节假日
    '元旦', '国庆节', '劳动节',
    // 重要国际节日
    '情人节', '妇女节', '植树节', '儿童节', '教师节', '建党节', '建军节',
    '万圣节', '圣诞节',
    // 营销节日
    '双十一', '母亲节', '父亲节', '感恩节', '青年节', '世界动物日'
  ];
  
  // 排除的节日（不应有星标）
  const excludeProfile = ['白色情人节', '黑色情人节', '绿色情人节', '银色情人节'];
  
  // 如果在排除列表中，不标注
  if (excludeProfile.some(holiday => title.includes(holiday))) {
    return false;
  }
  
  return highProfile.some(holiday => title.includes(holiday));
}

/**
 * 获取星期几的中文
 */
function getWeekdayCN(date) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[date.getDay()];
}

/**
 * 生成完整年度营销日历数据（365天）
 */
function generate180DaysCalendar() {
  // 从当前月份的1号开始，生成完整一年的数据
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const calendarData = [];
  const monthlyHotspots = {}; // 每月热点数据
  
  // 生成365天，确保覆盖完整12个月
  for (let i = 0; i < 365; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const weekday = getWeekdayCN(currentDate);
    
    const events = [];
    
    // 1. 获取节气
    const solarTerm = getSolarTerm(currentDate);
    if (solarTerm) {
      events.push({
        title: solarTerm,
        category: 'weather',
        isHighProfile: false
      });
    }
    
    // 2. 获取公历节日
    const solarHolidayList = getSolarHolidays(currentDate);
    solarHolidayList.forEach(holiday => {
      events.push({
        title: holiday,
        category: 'solar',
        isHighProfile: isHighProfileHoliday(holiday)
      });
    });
    
    // 3. 获取农历节日
    const lunarHolidayList = getLunarHolidays(currentDate);
    lunarHolidayList.forEach(holiday => {
      events.push({
        title: holiday,
        category: 'lunar',
        isHighProfile: isHighProfileHoliday(holiday)
      });
    });
    
    // 3.5 特殊处理：清明节（既是节气也是传统节日）
    const qingmingList = checkQingming(currentDate);
    qingmingList.forEach(holiday => {
      events.push({
        title: holiday,
        category: 'lunar',
        isHighProfile: isHighProfileHoliday(holiday)
      });
    });
    
    // 4. 添加特殊节日（母亲节、父亲节等）
    const mothersDay = getMothersDay(year);
    const fathersDay = getFathersDay(year);
    const thanksgiving = getThanksgiving(year);
    
    if (currentDate.toDateString() === mothersDay.toDateString()) {
      events.push({
        title: '母亲节',
        category: 'international',
        isHighProfile: true
      });
    }
    
    if (currentDate.toDateString() === fathersDay.toDateString()) {
      events.push({
        title: '父亲节',
        category: 'international',
        isHighProfile: true
      });
    }
    
    if (currentDate.toDateString() === thanksgiving.toDateString()) {
      events.push({
        title: '感恩节',
        category: 'international',
        isHighProfile: true
      });
    }
    
    // 只保存有事件的日期
    if (events.length > 0) {
      calendarData.push({
        year,
        month,
        date: day,
        weekday,
        events
      });
      
      // 收集每月的重点节日
      const monthKey = `${year}-${month}`;
      if (!monthlyHotspots[monthKey]) {
        monthlyHotspots[monthKey] = {
          year,
          month,
          holidays: [],
          solarTerms: [],
          keywords: []
        };
      }
      
      events.forEach(event => {
        if (event.isHighProfile && event.category !== 'weather') {
          monthlyHotspots[monthKey].holidays.push({
            name: event.title,
            date: day,
            important: true
          });
        }
        if (event.category === 'weather') {
          monthlyHotspots[monthKey].solarTerms.push({
            name: event.title,
            date: day
          });
        }
      });
    }
  }
  
  // 为每个月生成关键词
  Object.keys(monthlyHotspots).forEach(monthKey => {
    const hotspot = monthlyHotspots[monthKey];
    const keywords = generateKeywords(hotspot.holidays, hotspot.month);
    hotspot.keywords = keywords;
  });
  
  return { calendarData, monthlyHotspots };
}

/**
 * 根据节日生成关键词
 */
function generateKeywords(holidays, month) {
  const keywordMap = {
    '春节': '新年,红包,春联,团圆,年夜饭,放鞭炮,拜年,压岁钱',
    '元宵节': '汤圆,花灯,猜灯谜,闹元宵,圆月',
    '情人节': '爱情,玫瑰,巧克力,浪漫,约会,表白',
    '妇女节': '女性,女王,女神,独立,美丽,关爱',
    '植树节': '绿化,环保,种树,春天,生态',
    '清明节': '踏青,祭祖,缅怀,扫墓,春游',
    '劳动节': '假期,旅游,劳动,工作,休息',
    '青年节': '青春,活力,梦想,奋斗,年轻',
    '母亲节': '妈妈,感恩,康乃馨,母爱,孝顺',
    '儿童节': '童年,欢乐,玩具,游乐园,亲子',
    '父亲节': '父爱,爸爸,感恩,陪伴,坚强',
    '端午节': '粽子,龙舟,屈原,艾草,传统',
    '七夕节': '牛郎织女,爱情,浪漫,约会,情侣',
    '教师节': '老师,感恩,教育,园丁,传道授业',
    '中秋节': '月饼,赏月,团圆,嫦娥,思念',
    '国庆节': '国庆,阅兵,7天假期,旅游,爱国',
    '重阳节': '登高,敬老,饮酒,赏菊,关爱',
    '万圣节': '恶搞,惊悚,化妆舞会,装扮,party,南瓜',
    '圣诞节': '圣诞树,礼物,雪花,平安夜,狂欢',
    '元旦': '新年,愿望,跨年,倒计时,新起点'
  };
  
  const keywords = [];
  
  holidays.forEach(holiday => {
    const keyword = keywordMap[holiday.name];
    if (keyword && !keywords.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // 根据月份添加季节性关键词
  const seasonalKeywords = {
    1: '新年,冬季,温暖,年货',
    2: '春节,红包,团圆,春天',
    3: '春天,踏青,赏花,植树',
    4: '春游,清明,花季,户外',
    5: '劳动,旅游,初夏,放假',
    6: '夏天,儿童,毕业,父亲',
    7: '暑假,夏日,海边,避暑',
    8: '夏末,返校,军训,开学',
    9: '秋天,教师,开学,中秋',
    10: '国庆,秋游,重阳,万圣节',
    11: '秋季,感恩,购物,双十一',
    12: '冬季,圣诞,元旦,跨年'
  };
  
  if (seasonalKeywords[month]) {
    keywords.push(seasonalKeywords[month]);
  }
  
  return keywords;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始生成180天营销日历数据...');
  
  const { calendarData, monthlyHotspots } = generate180DaysCalendar();
  
  // 保存日历数据
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const calendarFilePath = path.join(dataDir, 'calendar-events.json');
  fs.writeFileSync(
    calendarFilePath,
    JSON.stringify(calendarData, null, 2),
    'utf-8'
  );
  
  console.log(`✅ 日历数据已保存: ${calendarFilePath}`);
  console.log(`   总共 ${calendarData.length} 个有事件的日期`);
  
  // 保存每月热点数据
  const hotspotsFilePath = path.join(dataDir, 'monthly-hotspots.json');
  fs.writeFileSync(
    hotspotsFilePath,
    JSON.stringify(monthlyHotspots, null, 2),
    'utf-8'
  );
  
  console.log(`✅ 月度热点数据已保存: ${hotspotsFilePath}`);
  console.log(`   总共 ${Object.keys(monthlyHotspots).length} 个月的数据`);
  
  // 打印部分示例数据
  console.log('\n📊 示例数据预览:');
  console.log('前5个事件:');
  calendarData.slice(0, 5).forEach(day => {
    console.log(`  ${day.year}-${day.month}-${day.date} (${day.weekday}):`);
    day.events.forEach(event => {
      const star = event.isHighProfile ? '⭐' : '  ';
      console.log(`    ${star} ${event.title} [${event.category}]`);
    });
  });
  
  // 检查重阳节是否存在
  const chongyang = calendarData.find(day => 
    day.events.some(e => e.title.includes('重阳节'))
  );
  
  if (chongyang) {
    console.log(`\n✅ 重阳节数据已包含: ${chongyang.year}-${chongyang.month}-${chongyang.date}`);
  } else {
    console.log('\n⚠️  未找到重阳节数据（可能不在180天范围内）');
  }
  
  console.log('\n✨ 数据生成完成！');
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  generate180DaysCalendar,
  getLunarHolidays,
  getSolarHolidays,
  getSolarTerm
};

