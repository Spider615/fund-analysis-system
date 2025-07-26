const express = require('express');
const path = require('path');
const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default;
const OpenAI = require('openai');

// 配置DeepSeek API
const deepseek = new OpenAI({
  apiKey: 'sk-eab8ae1adaa041f79db13dde41110c22',
  baseURL: 'https://api.deepseek.com'
});

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

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
  {
    code: '001832',
    name: '广发鑫享混合',
    type: '混合型',
    yearReturn: 14.23,
    threeYearReturn: 45.67,
    riskLevel: '中风险',
    manager: '陈明',
  },
  {
    code: '000991',
    name: '工银战略转型股票A',
    type: '股票型',
    yearReturn: 16.78,
    threeYearReturn: 58.92,
    riskLevel: '中高风险',
    manager: '张伟',
  },
];

// 获取基金列表
app.get('/api/funds', async (req, res) => {
  try {
    // 使用Yahoo Finance API获取股票数据
    // 选择更多知名的美股、中概股和ETF作为示例
    const stockSymbols = [
      // 科技股
      'AAPL',    // 苹果
      'MSFT',    // 微软
      'GOOGL',   // 谷歌
      'AMZN',    // 亚马逊
      'TSLA',    // 特斯拉
      'NVDA',    // 英伟达
      'META',    // Meta
      'NFLX',    // 奈飞
      'ORCL',    // 甲骨文
      'CRM',     // Salesforce
      'ADBE',    // Adobe
      'INTC',    // 英特尔
      'AMD',     // AMD
      'PYPL',    // PayPal
      'UBER',    // Uber
      'LYFT',    // Lyft
      'ZOOM',    // Zoom
      'SNOW',    // Snowflake
      
      // 中概股
      'BABA',    // 阿里巴巴
      'JD',      // 京东
      'PDD',     // 拼多多
      'BIDU',    // 百度
      'NIO',     // 蔚来
      'XPEV',    // 小鹏汽车
      'LI',      // 理想汽车
      'TME',     // 腾讯音乐
      'BILI',    // 哔哩哔哩
      'IQ',      // 爱奇艺
      'DIDI',    // 滴滴
      'TAL',     // 好未来
      
      // 传统行业
      'JPM',     // 摩根大通
      'BAC',     // 美国银行
      'WMT',     // 沃尔玛
      'KO',      // 可口可乐
      'PG',      // 宝洁
      'JNJ',     // 强生
      'V',       // Visa
      'MA',      // 万事达
      'DIS',     // 迪士尼
      'MCD',     // 麦当劳
      'NKE',     // 耐克
      'HD',      // 家得宝
      
      // 能源与材料
      'XOM',     // 埃克森美孚
      'CVX',     // 雪佛龙
      'COP',     // 康菲石油
      'FCX',     // 自由港
      'NEM',     // 纽蒙特
      'GLD',     // 黄金ETF
      
      // 医疗健康
      'UNH',     // 联合健康
      'PFE',     // 辉瑞
      'MRNA',    // Moderna
      'ABBV',    // 艾伯维
      'TMO',     // 赛默飞
      'DHR',     // 丹纳赫
      
      // ETF基金
      'SPY',     // 标普500 ETF
      'QQQ',     // 纳斯达克100 ETF
      'IWM',     // 罗素2000 ETF
      'VTI',     // 全市场ETF
      'VEA',     // 发达市场ETF
      'VWO',     // 新兴市场ETF
      'BND',     // 债券ETF
      'TLT',     // 长期国债ETF
      'GDX',     // 黄金矿业ETF
      'XLF',     // 金融板块ETF
      'XLK',     // 科技板块ETF
      'XLE',     // 能源板块ETF
      'XLV',     // 医疗板块ETF
      'XLI',     // 工业板块ETF
      'XLP',     // 消费必需品ETF
      'XLY',     // 消费可选ETF
      'XLU',     // 公用事业ETF
      'XLRE',    // 房地产ETF
      'XLB',     // 材料板块ETF
      'XLC'      // 通信板块ETF
    ];
    
    let useRealData = false;
    let allStockData = [];
    
    try {
      console.log('开始获取Yahoo Finance数据...');
      
      // 批量获取股票数据
      const stockDataPromises = stockSymbols.map(async (symbol) => {
        try {
          // 获取股票基本信息和价格
          const quote = await yahooFinance.quote(symbol);
          
          // 获取历史数据计算年收益率
          const endDate = new Date();
          const startDate = new Date();
          startDate.setFullYear(endDate.getFullYear() - 1);
          
          let historicalData = null;
          try {
            historicalData = await yahooFinance.historical(symbol, {
              period1: startDate,
              period2: endDate,
              interval: '1d'
            });
          } catch (histError) {
            console.warn(`获取${symbol}历史数据失败:`, histError.message);
          }
          
          return {
            symbol: symbol,
            quote: quote,
            historical: historicalData
          };
        } catch (error) {
          console.warn(`获取${symbol}数据失败:`, error.message);
          return null;
        }
      });
      
      // 等待所有请求完成
      const stockResponses = await Promise.all(stockDataPromises);
      
      // 处理所有响应
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
      console.log(`成功获取 ${allStockData.length} 条实时股票数据`);
      
      // 转换股票数据为基金数据格式
      fundsData = allStockData.map(stockData => {
        const quote = stockData.quote;
        const historical = stockData.historical;
        
        // 计算日涨跌幅
        const regularMarketChangePercent = quote.regularMarketChangePercent || 0;
        
        // 计算年收益率
        let yearReturn = 0;
        if (historical && historical.length > 0) {
          const oldPrice = historical[0].close;
          const currentPrice = quote.regularMarketPrice;
          if (oldPrice && currentPrice) {
            yearReturn = ((currentPrice - oldPrice) / oldPrice * 100);
          }
        } else {
          // 如果没有历史数据，使用模拟计算
          yearReturn = regularMarketChangePercent * 50;
        }
        
        // 计算三年收益率（模拟）
        const threeYearReturn = yearReturn * 2.5;
        
        // 根据波动性确定风险等级
        let riskLevel = '中风险';
        const absChange = Math.abs(regularMarketChangePercent);
        if (absChange > 5) {
          riskLevel = '高风险';
        } else if (absChange > 3) {
          riskLevel = '中高风险';
        } else if (absChange < 1) {
          riskLevel = '低风险';
        } else if (absChange < 2) {
          riskLevel = '中低风险';
        }
        
        // 根据股票类型确定基金类型
        let fundType = '股票型';
        let fundName = quote.shortName || quote.longName || stockData.symbol;
        
        // 科技股
        if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'ORCL', 'CRM', 'ADBE', 'INTC', 'AMD', 'PYPL', 'UBER', 'LYFT', 'ZOOM', 'SNOW'].includes(stockData.symbol)) {
          fundType = '科技股票型';
        } 
        // 中概股
        else if (['BABA', 'JD', 'PDD', 'BIDU', 'NIO', 'XPEV', 'LI', 'TME', 'BILI', 'IQ', 'DIDI', 'TAL'].includes(stockData.symbol)) {
          fundType = '中概股票型';
        }
        // 金融股
        else if (['JPM', 'BAC', 'V', 'MA'].includes(stockData.symbol)) {
          fundType = '金融股票型';
        }
        // 消费股
        else if (['WMT', 'KO', 'PG', 'MCD', 'NKE', 'HD', 'DIS'].includes(stockData.symbol)) {
          fundType = '消费股票型';
        }
        // 医疗健康
        else if (['JNJ', 'UNH', 'PFE', 'MRNA', 'ABBV', 'TMO', 'DHR'].includes(stockData.symbol)) {
          fundType = '医疗健康型';
        }
        // 能源材料
        else if (['XOM', 'CVX', 'COP', 'FCX', 'NEM'].includes(stockData.symbol)) {
          fundType = '能源材料型';
        }
        // ETF基金
        else if (['SPY', 'QQQ', 'IWM', 'VTI', 'VEA', 'VWO', 'BND', 'TLT', 'GLD', 'GDX'].includes(stockData.symbol)) {
          fundType = 'ETF指数型';
          fundName = `${fundName}ETF`;
        }
        // 行业ETF
        else if (['XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLP', 'XLY', 'XLU', 'XLRE', 'XLB', 'XLC'].includes(stockData.symbol)) {
          fundType = '行业ETF型';
          fundName = `${fundName}行业ETF`;
        }
        
        // 生成更合理的基金经理名字
        const managerNames = [
          '张伟', '李娜', '王强', '刘敏', '陈杰', '杨洋', '赵丽', '孙涛', '周静', '吴勇',
          '徐芳', '朱明', '胡斌', '郭华', '林峰', '何丽', '高军', '梁雪', '宋涛', '董敏',
          '韩磊', '冯娟', '邓强', '曹丽', '彭涛', '范静', '石磊', '姚敏', '谭强', '黎华'
        ];
        const randomManager = managerNames[Math.floor(Math.random() * managerNames.length)];
        
        // 生成基金代码（基于股票代码）
        const fundCode = stockData.symbol.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6).padEnd(6, '0');
        
        // 处理更新时间
        let updateTime;
        if (quote.regularMarketTime) {
          try {
            // Yahoo Finance API返回的时间戳可能是秒或毫秒
            const timestamp = quote.regularMarketTime;
            console.log(`原始时间戳 ${stockData.symbol}:`, timestamp, typeof timestamp);
            
            // 确保时间戳是数字
            const numTimestamp = Number(timestamp);
            
            // 如果时间戳小于等于10位数，说明是秒级时间戳，需要乘以1000
            const timeInMs = numTimestamp.toString().length <= 10 ? numTimestamp * 1000 : numTimestamp;
            
            const dateObj = new Date(timeInMs);
            console.log(`转换后时间 ${stockData.symbol}:`, dateObj.toISOString());
            
            // 检查日期是否有效
            if (isNaN(dateObj.getTime())) {
              console.warn(`无效时间戳 ${stockData.symbol}:`, timestamp, '使用当前时间');
              updateTime = new Date().toISOString();
            } else {
              updateTime = dateObj.toISOString();
            }
          } catch (error) {
            console.warn(`时间处理错误 ${stockData.symbol}:`, error.message, '使用当前时间');
            updateTime = new Date().toISOString();
          }
        } else {
          // 如果没有时间信息，使用当前时间
          console.log(`无时间信息 ${stockData.symbol}，使用当前时间`);
          updateTime = new Date().toISOString();
        }
        
        return {
          code: fundCode,
          name: `${fundName}基金`,
          type: fundType,
          yearReturn: parseFloat(yearReturn.toFixed(2)),
          threeYearReturn: parseFloat(threeYearReturn.toFixed(2)),
          riskLevel: riskLevel,
          manager: randomManager,
          netWorth: (quote.regularMarketPrice || 1).toFixed(4),
          dayGrowth: regularMarketChangePercent.toFixed(2),
          updateTime: updateTime
        };
      });
    } else {
      console.log('使用模拟基金数据');
      
      // 为模拟数据添加实时更新的字段
      fundsData = mockFunds.map(fund => ({
        ...fund,
        netWorth: (Math.random() * 2 + 1).toFixed(4), // 随机净值 1-3
        dayGrowth: (Math.random() * 6 - 3).toFixed(2), // 随机日增长率 -3% 到 +3%
        updateTime: new Date().toISOString()
      }));
    }
    
    // 返回基金数据
    res.json(fundsData);
  } catch (error) {
    console.error('获取基金数据失败:', error);
    
    // 如果所有方法都失败，返回模拟数据
    console.log('所有数据源失败，返回基础模拟数据');
    const fallbackData = mockFunds.map(fund => ({
      ...fund,
      netWorth: (Math.random() * 2 + 1).toFixed(4),
      dayGrowth: (Math.random() * 6 - 3).toFixed(2),
      updateTime: new Date().toISOString()
    }));
    
    res.json(fallbackData);
  }
});

// 分析基金并推荐
app.post('/api/analyze', async (req, res) => {
  console.log('🎯 收到基金分析请求');
  console.log('📋 请求体:', req.body);
  
  try {
    const { funds } = req.body;
    
    if (!funds || !Array.isArray(funds) || funds.length === 0) {
      console.log('❌ 无效的基金数据');
      return res.status(400).json({ error: '无效的基金数据' });
    }
    
    console.log('📊 接收到基金数量:', funds.length);
    console.log('开始使用DeepSeek进行基金分析...');
    
    // 使用Yahoo Finance API获取市场指数数据，用于计算同类平均收益率
    const getAverageReturns = async () => {
      try {
        // 使用Yahoo Finance获取主要市场指数
        const indexSymbols = [
          '^GSPC',  // S&P 500
          '^DJI',   // 道琼斯工业指数
          '^IXIC',  // 纳斯达克综合指数
          '^RUT'    // 罗素2000指数
        ];
        
        let spChange = 0;
        let dowChange = 0;
        let nasdaqChange = 0;
        let russellChange = 0;
        
        try {
          // 获取S&P 500指数
          const spQuote = await yahooFinance.quote('^GSPC');
          spChange = spQuote.regularMarketChangePercent || 0;
          console.log(`S&P 500变化: ${spChange}%`);
        } catch (error) {
          console.warn('获取S&P 500指数失败:', error.message);
        }
        
        try {
          // 获取道琼斯指数
          const dowQuote = await yahooFinance.quote('^DJI');
          dowChange = dowQuote.regularMarketChangePercent || 0;
          console.log(`道琼斯变化: ${dowChange}%`);
        } catch (error) {
          console.warn('获取道琼斯指数失败:', error.message);
        }
        
        try {
          // 获取纳斯达克指数
          const nasdaqQuote = await yahooFinance.quote('^IXIC');
          nasdaqChange = nasdaqQuote.regularMarketChangePercent || 0;
          console.log(`纳斯达克变化: ${nasdaqChange}%`);
        } catch (error) {
          console.warn('获取纳斯达克指数失败:', error.message);
        }
        
        try {
          // 获取罗素2000指数
          const russellQuote = await yahooFinance.quote('^RUT');
          russellChange = russellQuote.regularMarketChangePercent || 0;
          console.log(`罗素2000变化: ${russellChange}%`);
        } catch (error) {
          console.warn('获取罗素2000指数失败:', error.message);
        }
        
        // 如果所有指数数据获取失败，使用默认值
        if (spChange === 0 && dowChange === 0 && nasdaqChange === 0 && russellChange === 0) {
          console.log('指数数据获取失败，使用默认模拟值');
          spChange = 0.5;
          dowChange = 0.4;
          nasdaqChange = 0.8;
          russellChange = 0.6;
        }
        
        // 计算不同类型基金的模拟平均收益率
        return {
          stock: { 
            yearReturn: spChange * 50 || 25, 
            threeYearReturn: spChange * 150 || 75
          },
          mixed: { 
            yearReturn: (spChange + dowChange) * 25 || 12.5, 
            threeYearReturn: (spChange + dowChange) * 75 || 37.5
          },
          index: { 
            yearReturn: spChange * 40 || 20, 
            threeYearReturn: spChange * 120 || 60
          },
          bond: { 
            yearReturn: Math.abs(spChange) * 5 || 2.5, 
            threeYearReturn: Math.abs(spChange) * 15 || 7.5
          },
          '大盘股票型': {
            yearReturn: spChange * 45 || 22.5,
            threeYearReturn: spChange * 135 || 67.5
          },
          '科技股票型': {
            yearReturn: nasdaqChange * 55 || 27.5,
            threeYearReturn: nasdaqChange * 165 || 82.5
          },
          '中概股票型': {
            yearReturn: (spChange + nasdaqChange) * 30 || 15,
            threeYearReturn: (spChange + nasdaqChange) * 90 || 45
          }
        };
      } catch (error) {
        console.warn('获取同类平均收益率失败，使用默认值:', error.message);
        // 使用默认的模拟数据
        return {
          stock: { yearReturn: 25, threeYearReturn: 75 },
          mixed: { yearReturn: 12.5, threeYearReturn: 37.5 },
          index: { yearReturn: 20, threeYearReturn: 60 },
          bond: { yearReturn: 2.5, threeYearReturn: 7.5 },
          '大盘股票型': { yearReturn: 22.5, threeYearReturn: 67.5 },
          '科技股票型': { yearReturn: 27.5, threeYearReturn: 82.5 },
          '中概股票型': { yearReturn: 15, threeYearReturn: 45 }
        };
      }
    };
    
    // 获取同类平均收益率
    const averageReturns = await getAverageReturns();
    
    // 选取前10条基金进行分析
    const top10Funds = funds.slice(0, 10);
    console.log(`选取前10条基金进行DeepSeek分析，基金数量: ${top10Funds.length}`);
    
    // 准备基金数据用于AI分析
    const fundsForAnalysis = top10Funds.map(fund => {
      // 获取同类平均收益
      let categoryAvg;
      switch(fund.type) {
        case '股票型': 
        case '大盘股票型': 
          categoryAvg = averageReturns['大盘股票型'] || averageReturns.stock; 
          break;
        case '科技股票型': 
          categoryAvg = averageReturns['科技股票型'] || averageReturns.stock; 
          break;
        case '中概股票型': 
          categoryAvg = averageReturns['中概股票型'] || averageReturns.stock; 
          break;
        case '混合型': 
          categoryAvg = averageReturns.mixed; 
          break;
        case '指数型': 
          categoryAvg = averageReturns.index; 
          break;
        case '债券型': 
          categoryAvg = averageReturns.bond; 
          break;
        default: 
          categoryAvg = { yearReturn: 0, threeYearReturn: 0 };
      }
      
      // 计算同类超额收益
      const excessYearReturn = fund.yearReturn - categoryAvg.yearReturn;
      const excessThreeYearReturn = fund.threeYearReturn - categoryAvg.threeYearReturn;
      
      return {
        ...fund,
        categoryAvgYearReturn: categoryAvg.yearReturn,
        categoryAvgThreeYearReturn: categoryAvg.threeYearReturn,
        excessYearReturn,
        excessThreeYearReturn
      };
    });
    
    console.log('准备发送给DeepSeek的基金数据:', fundsForAnalysis.map(f => `${f.name}(${f.code})`).join(', '));

    // 使用DeepSeek进行智能分析
    const prompt = `
作为一名专业的基金分析师，请分析以下10只基金数据，并从中推荐3只最值得购买的基金：

基金数据（前10只）：
${JSON.stringify(fundsForAnalysis, null, 2)}

市场指数数据：
${JSON.stringify(averageReturns, null, 2)}

分析要求：
1. 从这10只基金中选出3只最值得购买的基金
2. 详细说明推荐每只基金的具体原因
3. 分析标准包括：
   - 历史收益表现（近1年和近3年收益率）
   - 风险调整后收益（考虑风险等级）
   - 同类比较（超额收益情况）
   - 基金类型和市场适应性
   - 基金经理能力评估

请返回JSON格式的分析结果，包含：
{
  "recommendations": ["基金代码1", "基金代码2", "基金代码3"],
  "analysisReport": [
    {
      "code": "基金代码",
      "name": "基金名称",
      "score": "综合评分(0-100)",
      "yearReturn": "近1年收益率%",
      "threeYearReturn": "近3年收益率%",
      "excessYearReturn": "同类超额收益%",
      "riskLevel": "风险等级",
      "manager": "基金经理",
      "reasons": [
        "推荐理由1",
        "推荐理由2", 
        "推荐理由3"
      ],
      "analysis": "详细分析报告(200-300字，说明为什么值得购买)"
    }
  ],
  "marketAnalysis": "整体市场分析和投资建议(300-400字)"
}

请确保分析客观、专业，并提供具体的购买建议和风险提示。
`;

    try {
      console.log('🤖 正在调用DeepSeek Chat API进行智能分析...');
      console.log('📊 分析基金数量:', fundsForAnalysis.length);
      
      const messages = [
        {
          role: "user",
          content: prompt
        }
      ];
      
      const requestParams = {
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
        stream: false  // 确保非流式返回
      };
      
      // 输出详细的请求日志
      console.log('\n=== DeepSeek API 请求日志 ===');
      console.log('【请求地址】：https://api.deepseek.com/chat/completions');
      console.log('【请求方式】：POST');
      console.log('【请求参数】：');
      console.log('  - model:', requestParams.model);
      console.log('  - temperature:', requestParams.temperature);
      console.log('  - max_tokens:', requestParams.max_tokens);
      console.log('  - stream:', requestParams.stream);
      console.log('  - messages:', JSON.stringify(requestParams.messages, null, 2));
      console.log('================================\n');

      const response = await deepseek.chat.completions.create(requestParams);

      // 获取AI回答（v3模型没有推理过程）
      const aiResponse = response.choices[0].message.content;
      
      // 输出详细的响应日志
      console.log('\n=== DeepSeek API 响应日志 ===');
      console.log('【请求结果】：');
      console.log('  - 状态：成功');
      console.log('  - 模型：', response.model);
      console.log('  - 响应长度：', aiResponse.length, '字符');
      console.log('  - Token使用：', JSON.stringify(response.usage, null, 2));
      console.log('  - 完整响应内容：');
      console.log(aiResponse);
      console.log('================================\n');
      
      console.log('✅ DeepSeek Chat 分析完成');
      console.log('📝 回答内容长度:', aiResponse.length);
      console.log('📝 AI响应预览:', aiResponse.substring(0, 200) + '...');
      
      // 尝试解析AI返回的JSON
      let analysisResult;
      try {
        console.log('🔍 开始解析DeepSeek响应...');
        // 提取JSON部分（可能包含在代码块中）
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
        console.log('📋 提取的JSON字符串长度:', jsonStr.length);
        
        analysisResult = JSON.parse(jsonStr);
        console.log('✅ JSON解析成功，推荐基金:', analysisResult.recommendations);
      } catch (parseError) {
        console.error('❌ 解析AI响应失败:', parseError.message);
        console.log('🔧 使用备用分析算法...');
        
        // 如果AI响应解析失败，使用传统算法作为备用
        const analyzedFunds = fundsForAnalysis.map(fund => {
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
            fund.yearReturn * 0.25 + 
            fund.threeYearReturn * 0.30 / 3 + 
            (fund.yearReturn / 3) * riskFactor * 0.25 + 
            (fund.excessYearReturn * 0.10 + fund.excessThreeYearReturn * 0.10 / 3)
          );
          
          return { ...fund, score };
        });
        
        const sortedFunds = [...analyzedFunds].sort((a, b) => b.score - a.score);
        const topFunds = sortedFunds.slice(0, 3);
        
        analysisResult = {
          recommendations: topFunds.map(fund => fund.code),
          analysisReport: topFunds.map(fund => ({
            code: fund.code,
            name: fund.name,
            score: fund.score.toFixed(2),
            yearReturn: fund.yearReturn.toFixed(2) + '%',
            threeYearReturn: fund.threeYearReturn.toFixed(2) + '%',
            excessYearReturn: (fund.excessYearReturn >= 0 ? '+' : '') + fund.excessYearReturn.toFixed(2) + '%',
            riskLevel: fund.riskLevel,
            manager: fund.manager,
            reasons: [
              `近1年收益率${fund.yearReturn.toFixed(2)}%，表现${fund.excessYearReturn >= 0 ? '优秀' : '一般'}`,
              `风险等级${fund.riskLevel}，适合${fund.riskLevel.includes('低') ? '稳健' : '积极'}投资者`,
              `基金经理${fund.manager}管理经验丰富`
            ],
            analysis: `${fund.name}(${fund.code})在过去一年的收益率为${fund.yearReturn.toFixed(2)}%，${fund.excessYearReturn >= 0 ? '高于' : '低于'}同类平均${Math.abs(fund.excessYearReturn).toFixed(2)}%。风险等级为${fund.riskLevel}，综合评分为${fund.score.toFixed(2)}。该基金由${fund.manager}管理，具有良好的投资价值。建议关注其长期表现和风险控制能力。`
          })),
          marketAnalysis: `基于当前市场数据和智能分析，从前10只基金中推荐了3只优质基金。当前市场环境下，建议采用分散投资策略，平衡收益与风险。推荐的基金在收益性、稳定性和风险控制方面表现突出，适合不同风险偏好的投资者。投资时请注意市场波动风险，建议长期持有以获得更好的投资回报。AI分析显示：${aiResponse.substring(0, 200)}...`
        };
      }
      
      // 返回分析结果
      console.log('📊 分析结果准备完成');
      console.log('🎯 推荐基金:', analysisResult.recommendations);
      console.log('📈 分析报告数量:', analysisResult.analysisReport.length);
      
      res.json({
        ...analysisResult,
        analysisDate: new Date().toISOString(),
        message: '基于DeepSeek Chat模型智能分析完成',
        aiResponse: aiResponse // 包含完整的AI响应用于调试
      });
      
      console.log('✅ 分析结果已返回给前端');
      
    } catch (aiError) {
      // 输出详细的错误日志
      console.log('\n=== DeepSeek API 错误日志 ===');
      console.log('【请求结果】：');
      console.log('  - 状态：失败');
      console.log('  - 错误信息：', aiError.message);
      console.log('  - 错误类型：', aiError.constructor.name);
      if (aiError.status) {
        console.log('  - HTTP状态码：', aiError.status);
      }
      if (aiError.code) {
        console.log('  - 错误代码：', aiError.code);
      }
      console.log('  - 完整错误对象：', JSON.stringify(aiError, null, 2));
      console.log('================================\n');
      
      console.error('DeepSeek API调用失败:', aiError.message);
      
      // AI分析失败时的备用逻辑
      const analyzedFunds = fundsForAnalysis.map(fund => {
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
          fund.yearReturn * 0.25 + 
          fund.threeYearReturn * 0.30 / 3 + 
          (fund.yearReturn / 3) * riskFactor * 0.25 + 
          (fund.excessYearReturn * 0.10 + fund.excessThreeYearReturn * 0.10 / 3)
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
        excessYearReturn: (fund.excessYearReturn >= 0 ? '+' : '') + fund.excessYearReturn.toFixed(2) + '%',
        riskLevel: fund.riskLevel,
        analysis: `${fund.name}(${fund.code})在过去一年的收益率为${fund.yearReturn.toFixed(2)}%，${fund.excessYearReturn >= 0 ? '高于' : '低于'}同类平均${Math.abs(fund.excessYearReturn).toFixed(2)}%。风险等级为${fund.riskLevel}，综合评分为${fund.score.toFixed(2)}。(备用分析算法)`
      }));
      
      res.json({
        recommendations: topFunds.map(fund => fund.code),
        analysisReport,
        analysisDate: new Date().toISOString(),
        message: 'DeepSeek Chat API暂时不可用，使用备用分析算法',
        error: aiError.message
      });
    }
    
  } catch (error) {
    console.error('分析基金失败:', error);
    res.status(500).json({ 
      error: '分析基金失败', 
      message: error.message
    });
  }
});

// 处理前端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});