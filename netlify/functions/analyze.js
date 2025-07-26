const OpenAI = require('openai');

// 配置DeepSeek API
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-eab8ae1adaa041f79db13dde41110c22',
  baseURL: 'https://api.deepseek.com'
});

exports.handler = async (event, context) => {
  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  console.log('📡 Netlify Function analyze 被调用');
  console.log('🔍 HTTP方法:', event.httpMethod);
  console.log('🌐 请求来源:', event.headers.origin || event.headers.referer);

  // 处理 OPTIONS 请求
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ 处理 OPTIONS 预检请求');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // 只处理 POST 请求
  if (event.httpMethod !== 'POST') {
    console.log('❌ 不支持的HTTP方法:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📝 请求体:', event.body);
    
    if (!event.body) {
      console.log('❌ 请求体为空');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '请求体不能为空' })
      };
    }

    const { funds } = JSON.parse(event.body);
    
    if (!funds || !Array.isArray(funds) || funds.length === 0) {
      console.log('❌ 无效的基金数据:', funds);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '无效的基金数据' })
      };
    }
    
    console.log('📊 接收到基金数量:', funds.length);
    console.log('📋 基金列表:', funds.map(f => `${f.name}(${f.code})`).join(', '));
    
    // 选取前10条基金进行分析
    const top10Funds = funds.slice(0, 10);
    console.log('🔍 分析基金数量:', top10Funds.length);
    
    // 简化的分析算法（避免 Netlify Functions 超时）
    const analyzedFunds = top10Funds.map(fund => {
      // 计算风险因子
      let riskFactor = 1.0;
      switch(fund.riskLevel) {
        case '低风险': riskFactor = 1.2; break;
        case '中低风险': riskFactor = 1.1; break;
        case '中风险': riskFactor = 1.0; break;
        case '中高风险': riskFactor = 0.9; break;
        case '高风险': riskFactor = 0.8; break;
        default: riskFactor = 1.0;
      }
      
      // 计算综合得分
      const score = (
        fund.yearReturn * 0.4 + 
        fund.threeYearReturn * 0.3 / 3 + 
        (fund.yearReturn / 3) * riskFactor * 0.3
      );
      
      console.log(`📈 ${fund.name}: 得分=${score.toFixed(2)}, 年收益=${fund.yearReturn}%, 风险=${fund.riskLevel}`);
      
      return { ...fund, score };
    });
    
    const sortedFunds = [...analyzedFunds].sort((a, b) => b.score - a.score);
    const topFunds = sortedFunds.slice(0, 3);
    
    console.log('🏆 推荐基金:', topFunds.map(f => `${f.name}(${f.score.toFixed(2)})`).join(', '));
    
    const analysisReport = topFunds.map((fund, index) => ({
      code: fund.code,
      name: fund.name,
      score: fund.score.toFixed(2),
      yearReturn: fund.yearReturn.toFixed(2) + '%',
      threeYearReturn: fund.threeYearReturn.toFixed(2) + '%',
      excessYearReturn: `+${(fund.yearReturn - 8).toFixed(2)}%`, // 假设基准收益率为8%
      riskLevel: fund.riskLevel,
      manager: fund.manager,
      reasons: [
        `近1年收益率${fund.yearReturn.toFixed(2)}%，表现优秀`,
        `风险等级${fund.riskLevel}，适合投资`,
        `基金经理${fund.manager}管理经验丰富`,
        `综合评分${fund.score.toFixed(2)}，位列前${index + 1}名`
      ],
      analysis: `${fund.name}(${fund.code})在过去一年的收益率为${fund.yearReturn.toFixed(2)}%，三年收益率为${fund.threeYearReturn.toFixed(2)}%，风险等级为${fund.riskLevel}，综合评分为${fund.score.toFixed(2)}。该基金由${fund.manager}管理，具有良好的投资价值。基于历史表现和风险控制能力，该基金在同类产品中表现突出，适合追求稳健收益的投资者。`
    }));
    
    const result = {
      recommendations: topFunds.map(fund => fund.code),
      analysisReport,
      analysisDate: new Date().toISOString(),
      message: '基金分析完成（Netlify Functions版本）',
      marketAnalysis: `基于当前市场数据分析，从${funds.length}只基金中推荐了${topFunds.length}只优质基金。建议采用分散投资策略，平衡收益与风险。推荐的基金在收益性、稳定性和风险控制方面表现突出，适合当前市场环境下的投资配置。`
    };
    
    console.log('✅ 分析完成，返回结果');
    console.log('📊 推荐基金代码:', result.recommendations);
    console.log('📈 分析报告数量:', result.analysisReport.length);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error('❌ 分析基金失败:', error);
    console.error('❌ 错误堆栈:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '分析基金失败', 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};