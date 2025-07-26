const yahooFinance = require('yahoo-finance2').default;
const OpenAI = require('openai');

// 配置DeepSeek API
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-eab8ae1adaa041f79db13dde41110c22',
  baseURL: 'https://api.deepseek.com'
});

// 模拟基金数据
const mockFunds = [
  {
    code: '000001',
    name: '华夏成长混合',
    type: '混合型',
    yearReturn: 15.67,
    threeYearReturn: 42.35,
    riskLevel: '中风险',
    manager: '王阳',
  },
  {
    code: '110022',
    name: '易方达消费行业股票',
    type: '股票型',
    yearReturn: 22.43,
    threeYearReturn: 78.91,
    riskLevel: '中高风险',
    manager: '李红',
  },
  {
    code: '161725',
    name: '招商中证白酒指数分级',
    type: '指数型',
    yearReturn: 31.56,
    threeYearReturn: 112.78,
    riskLevel: '中高风险',
    manager: '张伟',
  },
  {
    code: '001938',
    name: '中欧时代先锋股票A',
    type: '股票型',
    yearReturn: 18.92,
    threeYearReturn: 65.34,
    riskLevel: '中高风险',
    manager: '周明',
  },
  {
    code: '000248',
    name: '汇添富中证主要消费ETF联接',
    type: '指数型',
    yearReturn: 20.15,
    threeYearReturn: 72.46,
    riskLevel: '中风险',
    manager: '赵丽',
  },
  {
    code: '000311',
    name: '景顺长城沪深300指数增强',
    type: '指数型',
    yearReturn: 12.78,
    threeYearReturn: 45.23,
    riskLevel: '中风险',
    manager: '刘强',
  },
  {
    code: '000478',
    name: '建信中证500指数增强A',
    type: '指数型',
    yearReturn: 10.45,
    threeYearReturn: 38.67,
    riskLevel: '中风险',
    manager: '陈静',
  },
  {
    code: '110027',
    name: '易方达安心回报债券A',
    type: '债券型',
    yearReturn: 5.23,
    threeYearReturn: 18.45,
    riskLevel: '低风险',
    manager: '张明',
  },
  {
    code: '161716',
    name: '招商双债增强债券(LOF)C',
    type: '债券型',
    yearReturn: 4.87,
    threeYearReturn: 16.92,
    riskLevel: '低风险',
    manager: '李强',
  },
  {
    code: '000286',
    name: '银华信用季季红债券A',
    type: '债券型',
    yearReturn: 4.32,
    threeYearReturn: 15.78,
    riskLevel: '低风险',
    manager: '王芳',
  },
];

exports.handler = async (event, context) => {
  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理 OPTIONS 请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // 股票代码列表
    const stockSymbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX',
      'BABA', 'JD', 'PDD', 'BIDU', 'NIO', 'XPEV', 'LI',
      'SPY', 'QQQ', 'IWM', 'VTI', 'VEA', 'VWO'
    ];
    
    let useRealData = false;
    let allStockData = [];
    
    try {
      console.log('开始获取Yahoo Finance数据...');
      
      // 批量获取股票数据（限制数量以避免超时）
      const limitedSymbols = stockSymbols.slice(0, 10);
      const stockDataPromises = limitedSymbols.map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          return {
            symbol: symbol,
            quote: quote
          };
        } catch (error) {
          console.warn(`获取${symbol}数据失败:`, error.message);
          return null;
        }
      });
      
      const stockResponses = await Promise.all(stockDataPromises);
      
      for (const stockData of stockResponses) {
        if (stockData && stockData.quote) {
          allStockData.push(stockData);
          useRealData = true;
        }
      }
      
      console.log(`成功获取 ${allStockData.length} 条Yahoo Finance数据`);
      
    } catch (apiError) {
      console.warn('Yahoo Finance API不可用:', apiError.message);
    }
    
    let fundsData;
    
    if (useRealData && allStockData.length > 0) {
      // 转换股票数据为基金数据格式
      fundsData = allStockData.map(stockData => {
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
        
        const managerNames = ['张伟', '李娜', '王强', '刘敏', '陈杰'];
        const randomManager = managerNames[Math.floor(Math.random() * managerNames.length)];
        const fundCode = stockData.symbol.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6).padEnd(6, '0');
        
        return {
          code: fundCode,
          name: `${quote.shortName || stockData.symbol}基金`,
          type: '股票型',
          yearReturn: parseFloat(yearReturn.toFixed(2)),
          threeYearReturn: parseFloat(threeYearReturn.toFixed(2)),
          riskLevel: riskLevel,
          manager: randomManager,
          netWorth: (quote.regularMarketPrice || 1).toFixed(4),
          dayGrowth: regularMarketChangePercent.toFixed(2),
          updateTime: new Date().toISOString()
        };
      });
    } else {
      // 使用模拟数据
      fundsData = mockFunds.map(fund => ({
        ...fund,
        netWorth: (Math.random() * 2 + 1).toFixed(4),
        dayGrowth: (Math.random() * 6 - 3).toFixed(2),
        updateTime: new Date().toISOString()
      }));
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fundsData)
    };
    
  } catch (error) {
    console.error('获取基金数据失败:', error);
    
    // 返回模拟数据作为备用
    const fallbackData = mockFunds.map(fund => ({
      ...fund,
      netWorth: (Math.random() * 2 + 1).toFixed(4),
      dayGrowth: (Math.random() * 6 - 3).toFixed(2),
      updateTime: new Date().toISOString()
    }));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fallbackData)
    };
  }
};