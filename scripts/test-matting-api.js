/**
 * 图片抠图API测试脚本
 * 使用开发提供的内网抠图服务
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// API配置
const MATTING_API = {
  url: 'http://10.13.155.144:5001/api/matting/image',
  models: ['doubao', 'comfyui'] // 两个可用模型
};

const WEB_UI = 'http://10.13.146.159:5000/index.html#/generate';

/**
 * 测试抠图API
 * @param {string} imagePath - 本地图片路径
 * @param {string} model - 模型名称 (doubao 或 comfyui)
 * @param {string} outputPath - 输出路径（可选）
 */
async function testMattingAPI(imagePath, model = 'comfyui', outputPath = null) {
  console.log('🎨 开始测试抠图API...\n');
  console.log('配置信息:');
  console.log(`  API地址: ${MATTING_API.url}`);
  console.log(`  模型: ${model}`);
  console.log(`  输入图片: ${imagePath}`);
  console.log(`  Web UI: ${WEB_UI}\n`);

  try {
    // 检查文件是否存在
    if (!fs.existsSync(imagePath)) {
      throw new Error(`图片文件不存在: ${imagePath}`);
    }

    // 创建表单数据
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));
    form.append('model', model);

    console.log('📤 正在上传图片...');

    // 发送请求
    const response = await new Promise((resolve, reject) => {
      const request = http.request(MATTING_API.url, {
        method: 'POST',
        headers: form.getHeaders(),
        timeout: 60000 // 60秒超时
      }, (res) => {
        let data = [];
        
        res.on('data', (chunk) => {
          data.push(chunk);
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: Buffer.concat(data)
          });
        });
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('请求超时'));
      });

      form.pipe(request);
    });

    console.log(`✅ 请求成功! 状态码: ${response.statusCode}\n`);

    // 处理响应
    if (response.statusCode === 200) {
      const contentType = response.headers['content-type'];
      
      if (contentType && contentType.includes('image')) {
        // 返回的是图片
        console.log('📸 收到抠图结果（图片格式）');
        console.log(`   内容类型: ${contentType}`);
        console.log(`   文件大小: ${(response.data.length / 1024).toFixed(2)} KB\n`);

        // 保存图片
        if (outputPath) {
          fs.writeFileSync(outputPath, response.data);
          console.log(`💾 抠图结果已保存: ${outputPath}`);
        } else {
          const defaultOutput = path.join(
            path.dirname(imagePath),
            `${path.basename(imagePath, path.extname(imagePath))}_matting.png`
          );
          fs.writeFileSync(defaultOutput, response.data);
          console.log(`💾 抠图结果已保存: ${defaultOutput}`);
        }

        return {
          success: true,
          outputPath: outputPath || defaultOutput,
          size: response.data.length
        };
      } else if (contentType && contentType.includes('json')) {
        // 返回的是JSON
        const result = JSON.parse(response.data.toString());
        console.log('📋 API返回结果:');
        console.log(JSON.stringify(result, null, 2));
        
        return {
          success: true,
          data: result
        };
      } else {
        console.log('⚠️  未知的响应格式');
        console.log('响应内容:', response.data.toString().substring(0, 500));
        
        return {
          success: false,
          error: '未知的响应格式'
        };
      }
    } else {
      console.log(`❌ 请求失败: HTTP ${response.statusCode}`);
      console.log('响应内容:', response.data.toString());
      
      return {
        success: false,
        statusCode: response.statusCode,
        error: response.data.toString()
      };
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n提示: API服务器连接被拒绝，请确认:');
      console.error('  1. 是否在内网环境');
      console.error('  2. API服务是否正在运行');
      console.error('  3. IP地址和端口是否正确');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 批量测试多个模型
 */
async function testAllModels(imagePath) {
  console.log('🔄 开始批量测试所有模型...\n');
  
  const results = {};
  
  for (const model of MATTING_API.models) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`测试模型: ${model}`);
    console.log('='.repeat(60));
    
    const outputPath = path.join(
      path.dirname(imagePath),
      `${path.basename(imagePath, path.extname(imagePath))}_${model}.png`
    );
    
    results[model] = await testMattingAPI(imagePath, model, outputPath);
    
    // 等待1秒再测试下一个
    if (model !== MATTING_API.models[MATTING_API.models.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  
  for (const [model, result] of Object.entries(results)) {
    const status = result.success ? '✅ 成功' : '❌ 失败';
    console.log(`${model}: ${status}`);
    if (result.outputPath) {
      console.log(`  输出: ${result.outputPath}`);
    }
    if (result.error) {
      console.log(`  错误: ${result.error}`);
    }
  }
  
  return results;
}

/**
 * 使用示例
 */
async function main() {
  console.log('🎯 图片抠图API测试工具\n');
  console.log('📖 使用说明:');
  console.log('  node scripts/test-matting-api.js <图片路径> [模型名称]\n');
  console.log('可用模型: doubao, comfyui\n');
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('⚠️  请提供图片路径');
    console.log('\n示例:');
    console.log('  node scripts/test-matting-api.js ./test-image.png');
    console.log('  node scripts/test-matting-api.js ./test-image.png comfyui');
    console.log('  node scripts/test-matting-api.js ./test-image.png --all  # 测试所有模型\n');
    process.exit(1);
  }
  
  const imagePath = args[0];
  const model = args[1] || 'comfyui';
  
  if (model === '--all') {
    // 测试所有模型
    await testAllModels(imagePath);
  } else {
    // 测试单个模型
    if (!MATTING_API.models.includes(model)) {
      console.error(`❌ 未知的模型: ${model}`);
      console.error(`可用模型: ${MATTING_API.models.join(', ')}`);
      process.exit(1);
    }
    
    await testMattingAPI(imagePath, model);
  }
  
  console.log('\n✨ 测试完成!');
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

// 导出函数供其他模块使用
module.exports = {
  testMattingAPI,
  testAllModels,
  MATTING_API,
  WEB_UI
};


