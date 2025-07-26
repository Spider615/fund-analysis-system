# Netlify 部署检查清单 ✅

## 🚀 部署前检查

### 1. 代码准备
- [x] 代码已推送到 Git 仓库
- [x] package.json 配置正确
- [x] netlify.toml 配置文件存在
- [x] Netlify Functions 代码就绪

### 2. API 密钥配置
- [x] DeepSeek API 密钥: `sk-0e7376d4dbc84cc0b97a47d658297635`
- [x] API 密钥已添加到 netlify.toml
- [ ] API 密钥需要在 Netlify 控制台环境变量中配置

### 3. 构建配置
- [x] Build command: `npm run build`
- [x] Publish directory: `dist`
- [x] Functions directory: `netlify/functions`
- [x] Node.js version: 18

## 🌐 Netlify 控制台配置

### 环境变量设置
在 Netlify 站点设置 → Environment variables 中添加：

```
DEEPSEEK_API_KEY = sk-0e7376d4dbc84cc0b97a47d658297635
NODE_VERSION = 18
```

### 构建设置
- **Repository**: 你的 Git 仓库
- **Branch**: main (或你的主分支)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

## 🔧 部署步骤

1. **连接仓库**
   - 登录 Netlify
   - 点击 "New site from Git"
   - 选择你的代码仓库

2. **配置构建**
   - Netlify 会自动读取 netlify.toml 配置
   - 确认构建设置正确

3. **设置环境变量**
   - 进入站点设置
   - 添加 DEEPSEEK_API_KEY 环境变量

4. **触发部署**
   - 点击 "Deploy site"
   - 等待构建完成

## ✅ 部署后验证

### 自动验证
运行验证脚本：
```bash
npm run verify-deployment https://your-site.netlify.app
```

### 手动验证
1. **访问主页**
   - 打开部署的网站
   - 确认页面正常加载

2. **测试基金数据获取**
   - 点击"获取基金数据"按钮
   - 确认数据正常显示

3. **测试AI分析功能**
   - 选择几个基金
   - 点击"AI智能分析"
   - 确认分析结果正常显示

4. **检查控制台**
   - 打开浏览器开发者工具
   - 确认没有错误信息

## 🐛 常见问题排查

### 构建失败
- [ ] 检查 Node.js 版本
- [ ] 检查依赖安装
- [ ] 查看构建日志

### API 调用失败
- [ ] 检查环境变量配置
- [ ] 确认 API 密钥有效
- [ ] 查看 Functions 日志

### CORS 错误
- [ ] 确认 API 函数 CORS 配置
- [ ] 检查请求 URL 格式

## 📊 性能监控

### 关键指标
- 构建时间: < 3 分钟
- 首页加载时间: < 2 秒
- API 响应时间: < 10 秒
- Functions 执行时间: < 60 秒

### 监控工具
- Netlify Analytics
- 浏览器开发者工具
- Netlify Functions 日志

## 🔄 更新部署

### 自动部署
- 推送代码到主分支
- Netlify 自动触发重新部署

### 手动部署
- 在 Netlify 控制台点击 "Trigger deploy"
- 选择 "Deploy site"

## 📞 技术支持

### 文档资源
- [Netlify 官方文档](https://docs.netlify.com/)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [项目 README](./README.md)

### 故障排除
1. 查看 Netlify 部署日志
2. 检查 Functions 执行日志
3. 确认环境变量配置
4. 验证 API 密钥状态

---

**注意**: 确保 DeepSeek API 密钥有足够余额，避免因余额不足导致 AI 分析功能失效。