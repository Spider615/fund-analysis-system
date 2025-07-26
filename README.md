# 基金分析系统

这是一个基于Web的基金分析系统，可以获取基金列表，使用deepseek模型分析基金数据，并展示最适合投资的基金。

## 功能特点

- 获取基金列表数据（支持Yahoo Finance实时数据和模拟数据）
- 使用deepseek模型分析基金数据
- 展示推荐的基金及其分析结果
- 响应式Web界面

## 技术栈

- 前端：React.js, Ant Design, Vite
- 后端：Node.js, Express
- 数据分析：deepseek API
- 数据源：Yahoo Finance API

## 部署方案

### 🚀 方案1：Netlify 部署（推荐）

**优势**：
- 自动部署和持续集成
- 内置 Functions 支持
- 免费额度充足
- 配置简单

**部署步骤**：
1. 将代码推送到 GitHub/GitLab
2. 在 [Netlify](https://app.netlify.com/) 中导入项目
3. 配置构建设置（自动读取 netlify.toml）
4. 设置环境变量：
   ```
   DEEPSEEK_API_KEY = sk-0e7376d4dbc84cc0b97a47d658297635
   NODE_VERSION = 18
   ```
5. 部署完成

**详细指南**：参见 [NETLIFY_DEPLOYMENT_GUIDE.md](./NETLIFY_DEPLOYMENT_GUIDE.md)

**部署检查**：参见 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### 方案2：Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置环境变量：`DEEPSEEK_API_KEY`
4. 部署完成

### 方案3：传统服务器部署

需要同时部署前端和后端服务器。

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式（同时启动前端和后端）
npm start

# 或者分别启动
npm run dev    # 前端开发服务器
npm run serve  # 后端服务器

# 构建生产版本
npm run build

# 验证部署（部署后运行）
npm run verify-deployment https://your-site.netlify.app
```

## 环境变量配置

复制 `.env.example` 为 `.env` 并配置：

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
NODE_ENV=production
```

## 常见问题

### 部署后API返回404错误

**问题原因**：只部署了前端静态文件，没有部署后端API服务器。

**解决方案**：
1. 使用 Vercel 或 Netlify Functions 部署（推荐）
2. 或者使用支持全栈应用的云服务
3. 确保API路由正确配置

### Yahoo Finance API访问失败

**解决方案**：系统会自动降级使用模拟数据，确保基本功能正常。

## 项目结构

```
├── api/                 # Vercel API 函数
├── netlify/functions/   # Netlify Functions
├── server/             # Express 服务器
├── src/                # React 前端源码
├── dist/               # 构建输出
├── vercel.json         # Vercel 配置
├── netlify.toml        # Netlify 配置
└── package.json        # 项目配置
```

## 使用方法

1. 在浏览器中打开应用
2. 点击「获取基金数据」按钮
3. 系统将自动分析基金并展示推荐结果