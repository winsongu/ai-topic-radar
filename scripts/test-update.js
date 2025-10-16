/**
 * 测试数据更新流程
 * 用于本地测试定时任务是否正常工作
 */

const { dailyUpdate } = require('./crawl-and-save-daily.js');

console.log('🧪 开始测试数据更新流程...\n');

dailyUpdate()
  .then(() => {
    console.log('\n✅ 测试完成！');
    console.log('📝 请检查 Supabase 数据库中的数据是否已更新');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  });

