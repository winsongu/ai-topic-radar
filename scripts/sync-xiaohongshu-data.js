require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少 Supabase 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// MediaCrawler SQLite 数据库路径
const MEDIACRAWLER_DB_PATH = path.join(
  __dirname,
  '../../MediaCrawler/data/xhs/xhs.db'
)

/**
 * 从 MediaCrawler SQLite 读取数据
 * 
 * 注意：需要先安装 sqlite3
 * npm install sqlite3
 */
async function readFromSQLite() {
  try {
    // 动态导入 sqlite3
    const sqlite3 = require('sqlite3').verbose()
    
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(MEDIACRAWLER_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error('❌ 无法打开 SQLite 数据库:', err.message)
          console.log('📝 请确认路径:', MEDIACRAWLER_DB_PATH)
          console.log('💡 提示: 请先运行 MediaCrawler 爬取数据')
          reject(err)
          return
        }
        console.log('✅ 成功连接到 MediaCrawler 数据库')
      })
      
      // 查询最近24小时的笔记
      const query = `
        SELECT * FROM xhs_note 
        WHERE create_time >= datetime('now', '-1 day')
        ORDER BY create_time DESC
      `
      
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('❌ 查询失败:', err.message)
          reject(err)
        } else {
          resolve(rows || [])
        }
        db.close()
      })
    })
  } catch (error) {
    console.error('❌ 读取 SQLite 失败:', error.message)
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('💡 请先安装 sqlite3: npm install sqlite3')
    }
    throw error
  }
}

/**
 * 同步到 Supabase
 */
async function syncToSupabase(posts) {
  if (!posts || posts.length === 0) {
    console.log('⚠️ 没有数据需要同步')
    return { count: 0 }
  }
  
  console.log(`📦 准备同步 ${posts.length} 条笔记...`)
  
  const records = posts.map(post => {
    // 解析标签列表
    let tags = []
    try {
      if (post.tag_list) {
        tags = typeof post.tag_list === 'string' 
          ? JSON.parse(post.tag_list) 
          : post.tag_list
      }
    } catch (e) {
      console.warn('⚠️ 解析标签失败:', post.note_id)
    }
    
    // 解析图片列表
    let thumbnail = null
    try {
      if (post.image_list) {
        const images = typeof post.image_list === 'string'
          ? JSON.parse(post.image_list)
          : post.image_list
        thumbnail = images?.[0] || null
      }
    } catch (e) {
      console.warn('⚠️ 解析图片失败:', post.note_id)
    }
    
    return {
      note_id: post.note_id,
      title: post.title || '',
      desc: post.desc || '',
      type: post.type || 'normal',
      author_id: post.user_id,
      author_name: post.nickname || '',
      avatar_url: post.avatar || '',
      note_url: post.note_url || `https://www.xiaohongshu.com/explore/${post.note_id}`,
      thumbnail: thumbnail,
      liked_count: parseInt(post.liked_count) || 0,
      collected_count: parseInt(post.collected_count) || 0,
      comment_count: parseInt(post.comment_count) || 0,
      share_count: parseInt(post.share_count) || 0,
      tags: tags,
      ip_location: post.ip_location || '',
      published_at: post.time || post.create_time,
      crawled_at: new Date().toISOString()
    }
  })
  
  console.log('📝 数据示例:')
  console.log(JSON.stringify(records[0], null, 2))
  
  // 使用 upsert 避免重复
  const { data, error } = await supabase
    .from('xiaohongshu_posts')
    .upsert(records, { 
      onConflict: 'note_id',
      ignoreDuplicates: false 
    })
    .select()
  
  if (error) {
    console.error('❌ Supabase 插入失败:', error)
    throw error
  }
  
  return { count: records.length, data }
}

/**
 * 同步评论数据（可选）
 */
async function syncCommentsToSupabase(comments) {
  if (!comments || comments.length === 0) {
    return { count: 0 }
  }
  
  console.log(`💬 准备同步 ${comments.length} 条评论...`)
  
  const records = comments.map(comment => ({
    comment_id: comment.comment_id,
    note_id: comment.note_id,
    content: comment.content || '',
    user_id: comment.user_id,
    user_name: comment.nickname || '',
    liked_count: parseInt(comment.liked_count) || 0,
    sub_comment_count: parseInt(comment.sub_comment_count) || 0,
    ip_location: comment.ip_location || '',
    created_at: comment.create_time || new Date().toISOString()
  }))
  
  const { data, error } = await supabase
    .from('xiaohongshu_comments')
    .upsert(records, {
      onConflict: 'comment_id',
      ignoreDuplicates: false
    })
    .select()
  
  if (error) {
    console.error('❌ 评论同步失败:', error)
    throw error
  }
  
  return { count: records.length, data }
}

/**
 * 从 SQLite 读取评论
 */
async function readCommentsFromSQLite() {
  try {
    const sqlite3 = require('sqlite3').verbose()
    
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(MEDIACRAWLER_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          reject(err)
          return
        }
      })
      
      // 查询最近24小时的评论
      const query = `
        SELECT * FROM xhs_note_comment
        WHERE create_time >= datetime('now', '-1 day')
        ORDER BY create_time DESC
      `
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
        db.close()
      })
    })
  } catch (error) {
    console.error('⚠️ 读取评论数据失败:', error.message)
    return []
  }
}

/**
 * 统计信息
 */
async function printStats() {
  console.log('\n📊 统计信息:')
  
  // 总笔记数
  const { count: totalPosts } = await supabase
    .from('xiaohongshu_posts')
    .select('*', { count: 'exact', head: true })
  
  console.log(`  总笔记数: ${totalPosts}`)
  
  // 今日新增
  const { count: todayPosts } = await supabase
    .from('xiaohongshu_posts')
    .select('*', { count: 'exact', head: true })
    .gte('crawled_at', new Date().toISOString().split('T')[0])
  
  console.log(`  今日新增: ${todayPosts}`)
  
  // 独立作者数
  const { data: authors } = await supabase
    .from('xiaohongshu_posts')
    .select('author_id')
  
  const uniqueAuthors = new Set(authors?.map(a => a.author_id)).size
  console.log(`  独立博主: ${uniqueAuthors}`)
  
  // 最新笔记时间
  const { data: latest } = await supabase
    .from('xiaohongshu_posts')
    .select('published_at, title')
    .order('published_at', { ascending: false })
    .limit(1)
    .single()
  
  if (latest) {
    console.log(`  最新笔记: ${latest.title}`)
    console.log(`  发布时间: ${latest.published_at}`)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('=' .repeat(60))
  console.log('🚀 小红书数据同步脚本')
  console.log('=' .repeat(60))
  console.log()
  
  try {
    // 检查 MediaCrawler 数据库是否存在
    const fs = require('fs')
    if (!fs.existsSync(MEDIACRAWLER_DB_PATH)) {
      console.error('❌ MediaCrawler 数据库不存在')
      console.log('📝 期望路径:', MEDIACRAWLER_DB_PATH)
      console.log()
      console.log('💡 请先执行以下步骤:')
      console.log('   1. cd ../MediaCrawler')
      console.log('   2. source venv/bin/activate')
      console.log('   3. python main.py --platform xhs --type search')
      console.log()
      process.exit(1)
    }
    
    // 1. 从 SQLite 读取笔记
    console.log('📖 读取 MediaCrawler 笔记数据...')
    const posts = await readFromSQLite()
    console.log(`✅ 读取到 ${posts.length} 条笔记`)
    
    if (posts.length === 0) {
      console.log('⚠️ 没有新笔记需要同步')
      console.log('💡 可能原因:')
      console.log('   - MediaCrawler 还未运行过')
      console.log('   - 最近 24 小时内没有新数据')
      console.log('   - 数据库表为空')
      await printStats()
      return
    }
    
    // 2. 同步笔记到 Supabase
    console.log('\n💾 同步笔记到 Supabase...')
    const result = await syncToSupabase(posts)
    console.log(`✅ 成功同步 ${result.count} 条笔记`)
    
    // 3. 读取并同步评论（可选）
    console.log('\n📖 读取评论数据...')
    const comments = await readCommentsFromSQLite()
    
    if (comments.length > 0) {
      console.log(`✅ 读取到 ${comments.length} 条评论`)
      console.log('💾 同步评论到 Supabase...')
      const commentResult = await syncCommentsToSupabase(comments)
      console.log(`✅ 成功同步 ${commentResult.count} 条评论`)
    } else {
      console.log('⚠️ 没有评论数据（可能未启用评论爬取）')
    }
    
    // 4. 打印统计信息
    await printStats()
    
    console.log()
    console.log('🎉 数据同步完成！')
    console.log('=' .repeat(60))
    
  } catch (error) {
    console.error('\n❌ 同步失败:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// 运行主函数
if (require.main === module) {
  main()
}

module.exports = {
  readFromSQLite,
  syncToSupabase,
  readCommentsFromSQLite,
  syncCommentsToSupabase
}




