require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'undefined')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
  console.log('\n🔍 测试查询 word_templates...\n')
  
  // 测试1: 查询总数
  const { count, error: countError } = await supabase
    .from('word_templates')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.log('❌ 查询总数失败:', countError.message)
    console.log('   详细错误:', countError)
  } else {
    console.log('✅ 数据库总数:', count)
  }
  
  // 测试2: 查询觅知手抄报
  const { data: templates1, error: error1 } = await supabase
    .from('word_templates')
    .select('*')
    .eq('platform', '觅知手抄报')
    .limit(5)
  
  if (error1) {
    console.log('❌ 查询觅知手抄报失败:', error1.message)
  } else {
    console.log(`✅ 觅知手抄报数据: ${templates1?.length || 0} 条`)
    if (templates1 && templates1.length > 0) {
      console.log('   示例:', templates1[0].title)
    }
  }
  
  // 测试3: 查询所有数据
  const { data: allTemplates, error: error2 } = await supabase
    .from('word_templates')
    .select('*')
    .limit(15)
  
  if (error2) {
    console.log('❌ 查询所有数据失败:', error2.message)
  } else {
    console.log(`\n✅ 所有数据: ${allTemplates?.length || 0} 条`)
    if (allTemplates && allTemplates.length > 0) {
      allTemplates.forEach((t, i) => {
        console.log(`   ${i+1}. [${t.platform}] ${t.title}`)
      })
    }
  }
}

testQuery().catch(console.error)
