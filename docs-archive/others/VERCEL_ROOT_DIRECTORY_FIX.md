# 🔧 Vercel 根目录配置修复指南

## 🚨 问题诊断

**Vercel 连接的是错误的目录！**

### 仓库结构
```
my-project/                    ← Vercel 当前连接这里（错误！）
├── .git/
├── GameSoul-Interactive/      ← 实际项目在这里（正确！）
│   ├── .git/
│   ├── src/
│   ├── api/
│   ├── public/
│   └── package.json
├── GameSoul游戏之魂/
└── 其他文件...
```

**Vercel 需要指向 `GameSoul-Interactive` 子目录！**

---

## ✅ 解决方案：配置 Root Directory

### 📋 详细步骤

#### 1️⃣ **打开 Vercel Dashboard**
- 访问：https://vercel.com/dashboard

#### 2️⃣ **进入项目**
- 点击 `game-soul-interactive` 项目

#### 3️⃣ **打开设置**
- 点击顶部的 **Settings** 标签

#### 4️⃣ **找到构建配置**
- 点击左侧菜单的 **Build and Development**

#### 5️⃣ **编辑 Root Directory**
找到 **Root Directory** 设置项：
```
┌─────────────────────────────────────────┐
│ Root Directory                           │
│ ┌─────────────────────────────────────┐ │
│ │ ./                              [Edit]│ │  ← 点击 Edit
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 6️⃣ **设置为子目录**
点击 **Edit** 后，输入：
```
GameSoul-Interactive
```
**注意**：
- ✅ 正确：`GameSoul-Interactive`
- ❌ 错误：`./GameSoul-Interactive`
- ❌ 错误：`/GameSoul-Interactive`

#### 7️⃣ **保存配置**
- 点击 **Save** 按钮

#### 8️⃣ **重新部署**
- 点击顶部的 **Deployments** 标签
- 找到最新的部署
- 点击右侧 `...` → **Redeploy**
- **取消勾选** "Use existing Build Cache"
- 点击 **Redeploy**

---

## 🔍 验证配置

部署完成后，访问：
```
https://game-soul-interactive.vercel.app
```

**检查源代码**（按 F12 → View Source）：
```html
<!-- 应该看到新的 JS 文件 -->
<script src="/assets/index-EpT-b8_t.js"></script>

<!-- 而不是旧的 -->
<script src="/assets/index-Cc_zbIII.js"></script>
```

---

## 📊 测试清单

部署成功后，测试以下功能：

### ✅ DeepSeek 测试
1. 点击"和平精英"
2. 按 F12 打开控制台
3. 发送消息
4. 控制台应显示：
   - `📤 Calling DeepSeek API...`
   - `数据来源: deepseek-api`

### ✅ 按钮测试
- 角色头像下方应该有 3 个按钮：
  - 💾 保存对话
  - 📜 历史记录
  - 🌍 广场

### ✅ 图片测试
- 角色头像应该显示自定义图片（不是 emoji）

---

## 🎯 如果还是不行

可能需要**完全重新导入项目**：

1. 在 Vercel Dashboard 删除 `game-soul-interactive` 项目
2. 点击 **Add New** → **Project**
3. 选择 GitHub 仓库：`allen913950839-bot/my-project`
4. **在导入界面**，设置：
   - **Root Directory**: `GameSoul-Interactive`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **添加环境变量**：
   - `DEEPSEEK_API_KEY`
   - `GEMINI_API_KEY`
6. 点击 **Deploy**

---

## ⚠️ 重要提示

- Root Directory 设置后，Vercel 会从该子目录读取 `package.json` 和其他配置
- 确保环境变量已配置（DEEPSEEK_API_KEY 和 GEMINI_API_KEY）
- 重新部署时不要使用缓存
