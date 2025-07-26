# Netlify 部署指南

## 项目概述
这是一个基金分析系统，使用 React + Vite 构建前端，Netlify Functions 提供后端API服务，集成 DeepSeek AI 进行智能分析。

## 部署步骤

### 1. 准备工作
- 确保你有 Netlify 账户
- 确保代码已推送到 GitHub/GitLab 等代码仓库
- 已配置 DeepSeek API 密钥：`sk-0e7376d4dbc84cc0b97a47d658297635`

### 2. Netlify 部署配置

#### 方法一：通过 Netlify 控制台部署
1. 登录 [Netlify](https://app.netlify.com/)
2. 点击 "New site from Git"
3. 选择你的代码仓库
4. 配置构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

#### 方法二：通过 netlify.toml 自动配置
项目已包含 `netlify.toml` 配置文件，Netlify 会自动读取配置。

### 3. 环境变量配置

在 Netlify 控制台中设置以下环境变量：

```
DEEPSEEK_API_KEY = sk-0e7376d4dbc84cc0b97a47d658297635
NODE_VERSION = 18
```

**设置步骤：**
1. 进入你的 Netlify 站点控制台
2. 点击 "Site settings"
3. 在左侧菜单选择 "Environment variables"
4. 点击 "Add variable" 添加上述变量

### 4. 构建配置说明

#### netlify.toml 配置
```toml
[build]
  publish = "dist"
  command = "npm run build"
  functions = "netlify/functions"

[functions]
  timeout = 60
  memory = 1024

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[build.environment]
  NODE_VERSION = "18"
  DEEPSEEK_API_KEY = "sk-0e7376d4dbc84cc0b97a47d658297635"
```

### 5. API 端点

部署后，以下 API 端点将可用：

- **获取基金数据**: `https://your-site.netlify.app/api/funds`
- **AI 分析**: `https://your-site.netlify.app/api/analyze`

### 6. 功能特性

#### 前端功能
- 基金数据展示
- 实时数据更新
- AI 智能分析结果展示
- 响应式设计

#### 后端功能
- Yahoo Finance 数据获取
- DeepSeek AI 智能分析
- 本地算法备用分析
- CORS 支持

### 7. 故障排除

#### 常见问题

**1. 构建失败**
- 检查 Node.js 版本是否为 18+
- 确保所有依赖都在 package.json 中
- 查看构建日志中的具体错误信息

**2. API 调用失败**
- 检查环境变量是否正确设置
- 确认 DeepSeek API 密钥有效
- 查看 Netlify Functions 日志

**3. CORS 错误**
- 确认 API 函数中已设置正确的 CORS 头
- 检查前端请求的 URL 是否正确

#### 调试方法
1. 查看 Netlify 部署日志
2. 查看 Functions 执行日志
3. 使用浏览器开发者工具检查网络请求

### 8. 性能优化

- Functions 超时设置为 60 秒
- 内存限制设置为 1024MB
- 启用了请求缓存
- 使用了错误重试机制

### 9. 安全注意事项

- API 密钥通过环境变量安全存储
- 不在代码中硬编码敏感信息
- 启用了 CORS 保护

### 10. 更新部署

当你更新代码后：
1. 推送代码到仓库
2. Netlify 会自动触发重新部署
3. 等待构建完成即可

## 联系支持

如果遇到部署问题，可以：
1. 查看 Netlify 官方文档
2. 检查项目的 GitHub Issues
3. 联系技术支持

---

**注意**: 确保 DeepSeek API 密钥有足够的余额和调用限制，以保证 AI 分析功能正常工作。