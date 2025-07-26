#!/usr/bin/env node

/**
 * Netlify 部署验证脚本
 * 用于验证部署后的功能是否正常
 */

const https = require('https');
const http = require('http');

// 配置
const SITE_URL = process.argv[2] || 'https://your-site.netlify.app';
const API_ENDPOINTS = [
  '/api/funds',
  '/api/analyze'
];

console.log('🚀 开始验证 Netlify 部署...');
console.log('🌐 站点URL:', SITE_URL);

// 验证函数
async function verifyEndpoint(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

// 主验证流程
async function main() {
  console.log('\n📋 验证清单:');
  
  // 1. 验证主页
  try {
    console.log('\n1️⃣ 验证主页访问...');
    const homeResponse = await verifyEndpoint(SITE_URL);
    if (homeResponse.status === 200) {
      console.log('✅ 主页访问正常');
    } else {
      console.log('❌ 主页访问异常，状态码:', homeResponse.status);
    }
  } catch (error) {
    console.log('❌ 主页访问失败:', error.message);
  }
  
  // 2. 验证API端点
  for (let i = 0; i < API_ENDPOINTS.length; i++) {
    const endpoint = API_ENDPOINTS[i];
    const fullUrl = SITE_URL + endpoint;
    
    try {
      console.log(`\n${i + 2}️⃣ 验证API端点: ${endpoint}`);
      const response = await verifyEndpoint(fullUrl);
      
      if (response.status === 200) {
        console.log('✅ API端点正常');
        
        // 尝试解析JSON响应
        try {
          const jsonData = JSON.parse(response.data);
          console.log('📊 响应数据类型:', Array.isArray(jsonData) ? '数组' : typeof jsonData);
          if (Array.isArray(jsonData)) {
            console.log('📊 数据条数:', jsonData.length);
          }
        } catch (parseError) {
          console.log('⚠️ 响应不是有效的JSON格式');
        }
      } else {
        console.log('❌ API端点异常，状态码:', response.status);
      }
    } catch (error) {
      console.log('❌ API端点访问失败:', error.message);
    }
  }
  
  // 3. 验证环境变量
  console.log('\n3️⃣ 环境变量检查:');
  console.log('📝 请确认以下环境变量已在Netlify控制台配置:');
  console.log('   - DEEPSEEK_API_KEY: sk-0e7376d4dbc84cc0b97a47d658297635');
  console.log('   - NODE_VERSION: 18');
  
  // 4. 验证构建配置
  console.log('\n4️⃣ 构建配置检查:');
  console.log('📝 请确认以下构建配置:');
  console.log('   - Build command: npm run build');
  console.log('   - Publish directory: dist');
  console.log('   - Functions directory: netlify/functions');
  
  console.log('\n🎉 验证完成！');
  console.log('\n📋 部署后测试步骤:');
  console.log('1. 访问站点主页，确认页面正常加载');
  console.log('2. 点击"获取基金数据"按钮，确认数据正常获取');
  console.log('3. 选择几个基金，点击"AI智能分析"，确认分析功能正常');
  console.log('4. 检查浏览器控制台，确认没有错误信息');
  
  console.log('\n🔧 如果遇到问题:');
  console.log('1. 检查Netlify部署日志');
  console.log('2. 检查Functions执行日志');
  console.log('3. 确认环境变量配置正确');
  console.log('4. 确认API密钥有效且有余额');
}

// 运行验证
main().catch(console.error);