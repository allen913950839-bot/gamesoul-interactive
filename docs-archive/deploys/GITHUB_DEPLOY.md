# 🚀 GitHub + Vercel 自动部署指南

## ✅ 代码已准备就绪

已完成的修复：
1. ✅ 更新 Gemini API 从 v1beta 到 v1（使用 gemini-1.5-flash 模型）
2. ✅ 修复 vite.svg 404 错误
3. ✅ 代码已提交到本地 Git

---

## 📋 接下来的步骤

### 步骤 1：创建 GitHub 仓库

1. 打开浏览器，访问：
   ```
   https://github.com/new
   ```

2. 填写仓库信息：
   - **Repository name**: `gamesoul-interactive`
   - **Description**: `GameSoul - AI游戏互动评价平台`
   - **Public** 或 **Private**: 任选（推荐 Public）
   - ⚠️ **不要**勾选 "Add a README file"
   - ⚠️ **不要**勾选 "Add .gitignore"
   - ⚠️ **不要**选择 License

3. 点击 **"Create repository"**

### 步骤 2：推送代码到 GitHub

创建仓库后，GitHub 会显示命令。在终端执行：

```bash
cd /Users/allenzqwei/Desktop/playtest/GameSoul-Interactive

# 关联 GitHub 仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/gamesoul-interactive.git

# 推送代码
git branch -M main
git push -u origin main
```

**如果遇到权限问题**，可能需要使用个人访问令牌（Personal Access Token）：

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：`repo` (完整仓库访问权限)
4. 生成并复制 token
5. 推送时使用：
   ```bash
   git push https://YOUR_TOKEN@github.com/YOUR_USERNAME/gamesoul-interactive.git main
   ```

### 步骤 3：连接 Vercel 到 GitHub

1. 访问 Vercel：
   ```
   https://vercel.com
   ```

2. 点击 **"Add New..."** → **"Project"**

3. 点击 **"Import Git Repository"**

4. 如果没看到你的仓库：
   - 点击 **"Adjust GitHub App Permissions"**
   - 授权 Vercel 访问你的 GitHub 账户
   - 选择允许访问的仓库（选择 `gamesoul-interactive`）

5. 找到并选择 `gamesoul-interactive` 仓库

6. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（自动检测）
   - **Output Directory**: `dist`（自动检测）

7. **重要**：添加环境变量
   - 展开 **"Environment Variables"** 部分
   - 添加以下变量：
     ```
     Name: VITE_GEMINI_API_KEY
     Value: AIzaSyBrDHxvH9MfAXLW-Jwu5huJfrjA6XwX6Sk
     ```
   - 环境选择：**Production**, **Preview**, **Development** 全选

8. 点击 **"Deploy"**

9. 等待 1-2 分钟，部署完成！

### 步骤 4：获取链接

部署成功后，Vercel 会显示：
```
https://gamesoul-interactive.vercel.app
```

或类似的链接。

---

## 🎯 自动部署工作流

连接后，每次你推送代码到 GitHub：

```bash
# 修改代码后...
git add .
git commit -m "你的提交信息"
git push
```

Vercel 会**自动**：
1. 检测到代码更新
2. 重新构建项目
3. 部署到生产环境
4. 更新你的在线链接

---

## 📱 最终分享链接

完成后，你将获得：

```
https://gamesoul-interactive.vercel.app
```

这个链接：
- ✅ 永久有效
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 代码推送自动更新
- ✅ 支持自定义域名

---

## 🔧 关键修复说明

### 1. Gemini API 更新
**修复文件**: `src/services/geminiService.js`

```javascript
// 旧版本（会报错）
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// 新版本（已修复）
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
```

**原因**：
- `gemini-pro` 模型在 v1beta 中已弃用
- 需要使用最新的 `gemini-1.5-flash` 模型
- API 版本从 `v1beta` 升级到 `v1`

### 2. vite.svg 404 修复
**修复文件**: `index.html`

```html
<!-- 移除了这行 -->
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

**原因**：
- 项目中没有 vite.svg 文件
- 移除图标引用可避免 404 错误
- 浏览器会使用默认图标

---

## ⚠️ 常见问题

### Q1: git push 时要求输入用户名密码
**A**: GitHub 已不支持密码登录，需要使用 Personal Access Token：
1. 访问：https://github.com/settings/tokens
2. 生成新 token，权限选择 `repo`
3. 使用 token 代替密码

### Q2: Vercel 找不到我的 GitHub 仓库
**A**: 需要授权：
1. 在 Vercel 点击 "Adjust GitHub App Permissions"
2. 授权访问特定仓库或所有仓库

### Q3: 部署后环境变量不生效
**A**: 检查：
1. Vercel 项目设置中是否添加了 `VITE_GEMINI_API_KEY`
2. 环境变量是否选择了 Production
3. 重新部署项目

### Q4: AI 仍然调用失败
**A**: 可能原因：
1. API Key 错误或过期
2. 网络问题（Gemini API 可能在某些地区受限）
3. 查看浏览器控制台的错误信息

---

## 📊 项目信息

- **项目名称**: GameSoul Interactive
- **技术栈**: React 18 + Vite + Tailwind CSS + Framer Motion
- **AI 服务**: Google Gemini 1.5 Flash
- **部署平台**: Vercel
- **代码托管**: GitHub

---

**祝部署顺利！** 🎉

*生成时间: 2025-11-20*
