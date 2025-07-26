# Netlify 部署配置指南

## 问题解决方案

### 已修复的问题

1. **✅ 移除模拟数据** - 系统现在只使用真实API数据
2. **✅ Yahoo Finance API优化** - 添加超时控制和错误处理
3. **✅ DeepSeek AI分析功能** - 实现真正的AI智能分析
4. **✅ 安全性改进** - 移除硬编码API密钥

## 环境变量配置

在Netlify控制台中配置以下环境变量：

### 必需配置
```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
NODE_ENV=production
```

### 配置步骤
1. 登录Netlify控制台
2. 选择你的项目
3. 进入 Site settings → Environment variables
4. 添加上述环境变量

## 功能说明

### 基金数据获取
- **数据源**: 仅使用Yahoo Finance API真实数据
- **股票范围**: 美股大盘、中概股、ETF基金、行业ETF
- **数据处理**: 实时转换股票数据为基金格式
- **错误处理**: 无法获取数据时返回503错误，不再使用模拟数据

### AI智能分析
- **AI引擎**: DeepSeek API
- **分析内容**: 基金推荐、市场分析、风险评估
- **降级机制**: AI不可用时自动使用本地算法
- **响应格式**: 统一的JSON格式输出

## 技术优化

### Yahoo Finance API优化
```javascript
// 超时控制
const timeout = (ms) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('请求超时')), ms)
);

// 单个请求4秒超时
const quote = await Promise.race([
  yahooFinance.quote(symbol),
  timeout(4000)
]);

// 总体请求10秒超时
const stockResponses = await Promise.race([
  Promise.all(stockDataPromises),
  timeout(10000)
]);
```

### DeepSeek AI集成
```javascript
// 环境变量检查
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const useAI = deepseekApiKey && deepseekApiKey.trim() !== '';

// AI分析调用
const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${deepseekApiKey}`
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: analysisPrompt }],
    temperature: 0.7,
    max_tokens: 2000
  })
});
```

## 部署验证

### 基金数据验证
1. 访问 `/api/funds` 端点
2. 检查返回数据是否包含 `source: 'Yahoo Finance'`
3. 验证数据实时性（`updateTime` 字段）
4. 确认无模拟数据标识

### AI分析验证
1. 发送POST请求到 `/api/analyze`
2. 检查返回的 `aiPowered` 字段
3. 验证 `message` 字段显示AI分析状态
4. 确认分析质量和准确性

## 常见问题

### Q: 为什么有时获取不到基金数据？
A: 可能原因：
- Yahoo Finance API网络限制
- 请求超时（已优化为4-10秒）
- 股票市场休市时间
- 解决方案：系统会返回503错误，提示稍后重试

### Q: AI分析功能不工作？
A: 检查项：
- 确认已配置 `DEEPSEEK_API_KEY` 环境变量
- 检查API密钥是否有效
- 查看控制台日志确认AI调用状态
- 系统会自动降级到本地算法

### Q: 部署后数据更新频率？
A: 
- 基金数据：每次请求实时获取
- 价格数据：跟随Yahoo Finance更新频率
- 分析结果：基于最新数据实时计算

## 性能优化建议

1. **缓存策略**: 考虑添加Redis缓存减少API调用
2. **CDN配置**: 启用Netlify CDN加速静态资源
3. **函数优化**: 监控函数执行时间和内存使用
4. **错误监控**: 集成Sentry等错误监控服务

## 安全注意事项

1. **API密钥管理**: 
   - 仅通过环境变量配置
   - 定期轮换API密钥
   - 监控API使用量

2. **CORS配置**: 
   - 生产环境建议限制域名
   - 当前配置允许所有来源（开发便利）

3. **错误信息**: 
   - 避免暴露敏感系统信息
   - 提供用户友好的错误提示

## 更新日志

### v2.0.0 (最新)
- ✅ 完全移除模拟数据
- ✅ 优化Yahoo Finance API调用
- ✅ 实现DeepSeek AI智能分析
- ✅ 增强错误处理和超时控制
- ✅ 改进安全性配置

### v1.0.0
- 基础功能实现
- 模拟数据支持
- 简单分析算法