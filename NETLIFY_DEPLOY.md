# Netlify 部署指南

## 部署步骤

### 1. 准备代码
确保所有代码已提交到Git仓库（GitHub、GitLab等）

### 2. 连接Netlify
1. 登录 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择您的Git提供商并授权
4. 选择项目仓库

### 3. 配置构建设置
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 4. 环境变量配置
在Netlify控制台的 "Site settings" > "Environment variables" 中添加：

```
DEEPSEEK_API_KEY=sk-your-actual-api-key-here
NODE_ENV=production
```

### 5. 部署
点击 "Deploy site" 开始部署

## 重要配置文件

### netlify.toml
项目根目录的配置文件，包含：
- 构建设置
- 函数配置（60秒超时，1024MB内存）
- 重定向规则（/api/* → /.netlify/functions/*)
- Node.js版本设置

### Netlify Functions
位于 `netlify/functions/` 目录：
- `funds.js` - 获取基金数据
- `analyze.js` - AI智能分析

## 环境检测逻辑
前端会自动检测运行环境：
- Netlify环境：使用 `/.netlify/functions/*` 端点
- 本地开发：使用 `/api/*` 端点（通过Vite代理到localhost:5000）

## 故障排除

### 1. 函数超时
- 已配置60秒超时
- 如仍超时，检查DeepSeek API响应时间

### 2. API密钥问题
- 确保在Netlify环境变量中正确配置
- 检查API密钥是否有效且有余额

### 3. 构建失败
- 检查依赖项是否完整
- 确保Node.js版本兼容（推荐18+）

### 4. 函数错误
- 查看Netlify Functions日志
- 检查环境变量配置

## 本地测试Netlify Functions
```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 本地运行Netlify Functions
netlify dev
```

## 性能优化
- 函数冷启动：首次调用可能较慢
- 缓存策略：考虑添加适当的缓存
- 错误处理：已实现AI分析失败时的本地算法降级