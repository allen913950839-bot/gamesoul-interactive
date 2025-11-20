# ⚙️ Vercel 环境变量配置指南

## 🎯 重要：必须配置环境变量才能使用真实 AI

为了让 Gemini API 正常工作，你需要在 Vercel 添加环境变量。

---

## 📋 需要配置的环境变量

| 变量名 | 值 |
|--------|-----|
| `GEMINI_API_KEY` | `AIzaSyBrDHxvH9MfAXLW-Jwu5huJfrjA6XwX6Sk` |

⚠️ **注意**：
- 变量名是 `GEMINI_API_KEY`（不带 `VITE_` 前缀）
- 这是服务器端环境变量，更安全

---

## 🔧 配置步骤

### 方法一：通过 Vercel 网站配置（推荐）

1. **访问项目设置**
   ```
   https://vercel.com/allen913950839-5794s-projects/game-soul-interactive/settings/environment-variables
   ```

2. **点击 "Add New" 按钮**

3. **填写信息**
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyBrDHxvH9MfAXLW-Jwu5huJfrjA6XwX6Sk`
   
4. **选择环境**（全选）
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **点击 "Save"**

6. **重新部署**
   - 配置环境变量后，需要重新部署才能生效
   - 在项目页面点击 "Redeploy"
   - 或执行：`npx vercel --prod`

---

### 方法二：通过命令行配置

```bash
# 进入项目目录
cd /Users/allenzqwei/Desktop/playtest/GameSoul-Interactive

# 添加生产环境变量
npx vercel env add GEMINI_API_KEY production

# 系统会提示输入值，粘贴：
# AIzaSyBrDHxvH9MfAXLW-Jwu5huJfrjA6XwX6Sk

# 添加预览环境变量
npx vercel env add GEMINI_API_KEY preview

# 添加开发环境变量
npx vercel env add GEMINI_API_KEY development

# 重新部署
npx vercel --prod
```

---

## ✅ 验证配置

配置完成并重新部署后：

1. **访问网站**
   ```
   https://game-soul-interactive-xxxx.vercel.app
   ```

2. **打开浏览器控制台**（F12）

3. **开始对话**
   - 选择"王者荣耀"
   - 输入任意消息

4. **查看控制台日志**
   
   **成功的日志**：
   ```
   🤖 调用 Gemini AI...
   📤 发送请求到 API 代理...
   ✅ Gemini AI 回复成功: [AI的回复内容]
   📊 数据来源: gemini-api
   ```

   **失败的日志**（API Key 未配置）：
   ```
   ⚠️ API 不可用，使用模拟回复
   💡 降级使用模拟回复
   ```

---

## 🏗️ 技术架构

### 之前（无法工作）
```
浏览器 → Gemini API
       ❌ CORS 错误
```

### 现在（完美工作）
```
浏览器 → Vercel Serverless Function → Gemini API
       ✅ 成功          ✅ 成功
```

**优势**：
- ✅ 绕过 CORS 限制
- ✅ API Key 在服务器端，更安全
- ✅ 完全免费（Vercel 免费计划）
- ✅ 自动扩展，高可用

---

## 📂 项目结构

```
GameSoul-Interactive/
├── api/
│   └── chat.js              # Vercel Serverless Function（API 代理）
├── src/
│   └── services/
│       └── geminiService.js # 前端调用代码
├── .env                      # 本地环境变量（不上传）
└── VERCEL_ENV_SETUP.md      # 本文档
```

---

## 🔄 工作流程

1. **用户输入消息**
2. **前端调用** `/api/chat`
3. **Vercel Function 接收请求**
4. **Function 调用 Gemini API**（使用服务器端的 API Key）
5. **Gemini 返回 AI 回复**
6. **Function 转发给前端**
7. **前端显示 AI 回复**

全程无 CORS 问题！✨

---

## 🐛 常见问题

### Q1: 配置后仍然显示"使用模拟回复"
**A**: 检查：
1. 环境变量名是否正确：`GEMINI_API_KEY`（不是 `VITE_GEMINI_API_KEY`）
2. 是否重新部署了项目
3. 查看 Vercel 部署日志是否有错误

### Q2: 如何查看 Vercel Function 日志？
**A**: 访问：
```
https://vercel.com/allen913950839-5794s-projects/game-soul-interactive/logs
```
可以看到 API 调用的详细日志

### Q3: API Key 会暴露吗？
**A**: 不会！
- API Key 存储在 Vercel 服务器端
- 前端代码中完全看不到
- 即使查看网络请求也看不到

### Q4: Vercel Function 免费吗？
**A**: 是的！免费计划包括：
- 100GB 带宽/月
- 100GB-Hrs Function 执行时间
- 对于个人项目完全够用

---

## 📊 对比：模拟回复 vs 真实 AI

| 特性 | 模拟回复 | 真实 Gemini AI |
|------|---------|---------------|
| 响应速度 | 即时 | 1-2秒 |
| 回复质量 | 预设回复库 | **AI 生成，更智能** |
| 回复多样性 | 30+条固定 | **无限可能** |
| 上下文理解 | 关键词匹配 | **深度理解** |
| 学习能力 | 无 | **持续学习** |
| 成本 | 免费 | 免费（API Key免费额度）|

---

## 🎉 配置完成后

你将获得：
- ✅ 真正的 Google Gemini AI 对话
- ✅ 智能的上下文理解
- ✅ 多样化的回复内容
- ✅ 更自然的对话体验
- ✅ 完全免费

---

**现在就去配置环境变量吧！** 🚀

1. 访问：https://vercel.com/allen913950839-5794s-projects/game-soul-interactive/settings/environment-variables
2. 添加 `GEMINI_API_KEY`
3. 重新部署
4. 享受真实 AI 对话！

*更新时间：2025-11-20*
