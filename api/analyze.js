export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只处理 POST 请求
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { funds } = req.body;
    
    if (!funds || !Array.isArray(funds) || funds.length === 0) {
      res.status(400).json({ error: '无效的基金数据' });
      return;
    }
    
    console.log('📊 接收到基金数量:', funds.length);
    
    // 检查是否配置了DeepSeek API
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const useAI = deepseekApiKey && deepseekApiKey.trim() !== '';
    
    console.log('🤖 AI分析状态:', useAI ? '启用' : '禁用');
    
    if (useAI) {
      try {
        // 使用DeepSeek AI进行分析
        console.log('🚀 调用DeepSeek AI进行基金分析...');
        
        const analysisPrompt = `作为专业的基金分析师，请分析以下基金数据并提供投资建议：

基金数据：
${funds.slice(0, 10).map(fund => 
  `${fund.name}(${fund.code}): 年收益率${fund.yearReturn}%, 三年收益率${fund.threeYearReturn}%, 风险等级${fund.riskLevel}`
).join('\n')}

请提供：
1. 推荐前3只基金及理由
2. 市场分析和投资建议
3. 风险提示

请以JSON格式返回，包含recommendations数组和analysisReport数组。`;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekApiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'user',
                content: analysisPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        });

        if (response.ok) {
          const aiResult = await response.json();
          const aiAnalysis = aiResult.choices[0].message.content;
          
          console.log('✅ DeepSeek AI分析完成');
          
          // 解析AI返回的结果，如果解析失败则使用本地算法
          try {
            const parsedResult = JSON.parse(aiAnalysis);
            
            const result = {
              ...parsedResult,
              analysisDate: new Date().toISOString(),
              message: '基金分析完成（DeepSeek AI智能分析）',
              aiPowered: true
            };
            
            res.status(200).json(result);
            return;
            
          } catch (parseError) {
            console.warn('⚠️ AI返回结果解析失败，使用本地算法');
            // 继续执行本地分析算法
          }
        } else {
          console.warn('⚠️ DeepSeek API调用失败，使用本地算法');
          // 继续执行本地分析算法
        }
        
      } catch (aiError) {
        console.warn('⚠️ AI分析出错，使用本地算法:', aiError.message);
        // 继续执行本地分析算法
      }
    }
    
    // 本地分析算法（作为备用或默认方案）
    console.log('🔧 使用本地分析算法');
    
    // 选取前10条基金进行分析
    const top10Funds = funds.slice(0, 10);
    
    // 简化的分析算法
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
      
      return { ...fund, score };
    });
    
    const sortedFunds = [...analyzedFunds].sort((a, b) => b.score - a.score);
    const topFunds = sortedFunds.slice(0, 3);
    
    const analysisReport = topFunds.map(fund => ({
      code: fund.code,
      name: fund.name,
      score: fund.score.toFixed(2),
      yearReturn: fund.yearReturn.toFixed(2) + '%',
      threeYearReturn: fund.threeYearReturn.toFixed(2) + '%',
      riskLevel: fund.riskLevel,
      reasons: [
        `近1年收益率${fund.yearReturn.toFixed(2)}%，表现优秀`,
        `风险等级${fund.riskLevel}，适合投资`,
        `基金类型${fund.type}，投资策略明确`
      ],
      analysis: `${fund.name}(${fund.code})在过去一年的收益率为${fund.yearReturn.toFixed(2)}%，风险等级为${fund.riskLevel}，综合评分为${fund.score.toFixed(2)}。该基金具有良好的投资价值。`
    }));
    
    const result = {
      recommendations: topFunds.map(fund => fund.code),
      analysisReport,
      analysisDate: new Date().toISOString(),
      message: useAI ? '基金分析完成（本地算法备用）' : '基金分析完成（本地算法）',
      aiPowered: false,
      marketAnalysis: `基于当前市场数据分析，从${funds.length}只基金中推荐了3只优质基金。建议采用分散投资策略，平衡收益与风险。推荐的基金在收益性、稳定性和风险控制方面表现突出。`
    };
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('❌ 分析基金失败:', error);
    res.status(500).json({ 
      error: '分析基金失败', 
      message: error.message,
      code: 'ANALYSIS_ERROR'
    });
  }
}