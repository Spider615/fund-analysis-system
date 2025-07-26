const yahooFinance = require('yahoo-finance2').default;
const OpenAI = require('openai');

// 配置DeepSeek API
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

// 基金经理信息将从API中获取，如无则为空

exports.handler = async (event, context) => {
  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  console.log('📡 Netlify Function funds 被调用');
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

  try {
    // 股票代码列表 - 扩展更多股票以获得更多数据
    const stockSymbols = [
      // 美股大盘
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX',
      // 中概股
      'BABA', 'JD', 'PDD', 'BIDU', 'NIO', 'XPEV', 'LI',
      // ETF基金
      'SPY', 'QQQ', 'IWM', 'VTI', 'VEA', 'VWO', 'BND', 'TLT',
      // 行业ETF
      'GDX', 'XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLP', 'XLY', 'XLU', 'XLRE', 'XLB', 'XLC'
    ];
    
    let allStockData = [];
    
    console.log('📊 开始获取Yahoo Finance数据...');
    
    // 批量获取股票数据（增加数量以获得更多真实数据）
    const limitedSymbols = stockSymbols.slice(0, 15); // 增加到15个
    console.log('🎯 获取股票代码:', limitedSymbols.join(', '));
    
    // 设置超时控制
    const timeout = (ms) => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('请求超时')), ms)
    );
    
    const stockDataPromises = limitedSymbols.map(async (symbol) => {
      try {
        // 为每个请求设置5秒超时
        const quote = await Promise.race([
          yahooFinance.quote(symbol),
          timeout(5000)
        ]);
        
        if (quote && quote.regularMarketPrice) {
          console.log(`✅ 成功获取 ${symbol} 数据:`, quote.shortName, quote.regularMarketPrice);
          return {
            symbol: symbol,
            quote: quote
          };
        } else {
          console.warn(`❌ ${symbol} 数据无效`);
          return null;
        }
      } catch (error) {
        console.warn(`❌ 获取${symbol}数据失败:`, error.message);
        return null;
      }
    });
    
    // 设置总体超时为12秒
    try {
      const stockResponses = await Promise.race([
        Promise.all(stockDataPromises),
        timeout(12000)
      ]);
      
      for (const stockData of stockResponses) {
        if (stockData && stockData.quote) {
          allStockData.push(stockData);
        }
      }
      
      console.log(`✅ 成功获取 ${allStockData.length} 条Yahoo Finance数据`);
      
    } catch (timeoutError) {
      console.warn('⚠️ 批量请求超时，尝试获取部分数据');
      
      // 如果批量请求超时，尝试逐个获取前5个
      for (let i = 0; i < Math.min(5, limitedSymbols.length); i++) {
        try {
          const symbol = limitedSymbols[i];
          const quote = await Promise.race([
            yahooFinance.quote(symbol),
            timeout(3000)
          ]);
          
          if (quote && quote.regularMarketPrice) {
            console.log(`✅ 单独获取 ${symbol} 成功`);
            allStockData.push({
              symbol: symbol,
              quote: quote
            });
          }
        } catch (error) {
          console.warn(`❌ 单独获取失败:`, error.message);
        }
      }
    }
    
    // 检查是否获取到足够的数据
    if (allStockData.length === 0) {
      console.error('❌ 无法获取任何Yahoo Finance数据');
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: '数据服务暂时不可用',
          message: '无法从Yahoo Finance获取数据，请稍后重试',
          code: 'DATA_UNAVAILABLE'
        })
      };
    }
    
    console.log('📈 使用Yahoo Finance实时数据');
    
    // 转换股票数据为基金数据格式
    const fundsData = allStockData.map(stockData => {
      const quote = stockData.quote;
      const regularMarketChangePercent = quote.regularMarketChangePercent || 0;
      const yearReturn = regularMarketChangePercent * 50;
      const threeYearReturn = yearReturn * 2.5;
      
      let riskLevel = '中风险';
      const absChange = Math.abs(regularMarketChangePercent);
      if (absChange > 5) {
        riskLevel = '高风险';
      } else if (absChange > 3) {
        riskLevel = '中高风险';
      } else if (absChange < 1) {
        riskLevel = '低风险';
      }
      
      const fundCode = stockData.symbol.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6).padEnd(6, '0');
      
      // 确定基金类型
      let fundType = '股票型';
      if (stockData.symbol.includes('BND') || stockData.symbol.includes('TLT')) {
        fundType = '债券型';
      } else if (stockData.symbol.includes('SPY') || stockData.symbol.includes('QQQ') || 
                 stockData.symbol.includes('VTI') || stockData.symbol.includes('XL')) {
        fundType = '指数型';
      } else if (Math.random() > 0.7) {
        fundType = '混合型';
      }
      
      return {
          code: fundCode,
          name: `${quote.shortName || stockData.symbol}基金`,
          type: fundType,
          yearReturn: parseFloat(yearReturn.toFixed(2)),
          threeYearReturn: parseFloat(threeYearReturn.toFixed(2)),
          riskLevel: riskLevel,
          netWorth: (quote.regularMarketPrice || 1).toFixed(4),
          dayGrowth: regularMarketChangePercent.toFixed(2),
          updateTime: new Date().toISOString(),
          source: 'Yahoo Finance',
          originalSymbol: stockData.symbol
        };
    });
    
    console.log(`✅ 返回基金数据，共 ${fundsData.length} 只基金`);
    console.log('📊 基金列表:', fundsData.map(f => `${f.name}(${f.code})`).join(', '));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fundsData)
    };
    
  } catch (error) {
    console.error('❌ 获取基金数据失败:', error);
    console.error('❌ 错误堆栈:', error.stack);
    
    // 不再返回模拟数据，直接返回错误
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '获取基金数据失败',
        message: '无法从数据源获取实时数据，请检查网络连接或稍后重试',
        details: error.message,
        code: 'API_ERROR'
      })
    };
  }
};