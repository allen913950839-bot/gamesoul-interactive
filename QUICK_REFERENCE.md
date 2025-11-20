# 🚀 GameSoul-Interactive 快速参考

**一页看懂所有信息** | 更新: 2025-11-20

---

## 📍 项目信息

| 项目 | 信息 |
|-----|------|
| **名称** | GameSoul-Interactive |
| **版本** | V2.0 |
| **状态** | ✅ 已部署 78%完成 |
| **技术** | React 18 + Vite + Tailwind |
| **部署** | Vercel |
| **仓库** | `allen913950839-bot/my-project` |
| **URL** | https://game-soul-interactive.vercel.app |

---

## ⚡ 快速命令

```bash
# 本地开发
cd GameSoul-Interactive && npm run dev

# 构建
npm run build

# 部署
git add . && git commit -m "update" && git push

# 检查环境
curl https://game-soul-interactive.vercel.app/api/check-env
```

---

## 🎯 核心功能

| 功能 | 状态 | 说明 |
|-----|------|------|
| 🤖 AI对话（亚瑟） | ✅ 正常 | Gemini API |
| 🐥 AI对话（光子鸡） | ⚠️ 需验证 | DeepSeek API |
| 💾 保存对话 | ❌ 需KV | 数据库未配置 |
| 📜 历史记录 | ❌ 需KV | 数据库未配置 |
| 🌍 广场 | ❌ 需KV | 数据库未配置 |
| 💥 彩蛋（抽） | ✅ 正常 | 文字触发 |
| 🎨 界面动画 | ✅ 正常 | Framer Motion |

---

## 🔑 环境变量

| 变量名 | 状态 | 用途 |
|--------|------|------|
| `GEMINI_API_KEY` | ✅ | 亚瑟对话 |
| `DEEPSEEK_API_KEY` | ⚠️ | 光子鸡对话 |
| `KV_REST_API_URL` | ❌ | 数据库 |
| `KV_REST_API_TOKEN` | ❌ | 数据库 |

---

## 📝 待办事项（优先级）

### 🔴 必做
1. **配置 Vercel KV** (5分钟)
   - Vercel → Storage → Create KV
   - 启用保存/历史/广场

2. **验证 DeepSeek** (2分钟)
   - Vercel → Settings → Env Vars
   - 检查 DEEPSEEK_API_KEY

### 🟡 建议
3. **鞭子悬浮按钮** (30分钟)
   - 替换"抽"文字触发
   - UI改为右下角按钮

4. **上传角色图片** (5分钟)
   - arthur.png
   - pubg-character.png

---

## 📚 重要文档

| 文档 | 用途 |
|------|------|
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | **项目状态（最重要）** |
| [TODO.md](./TODO.md) | 待办清单 |
| [FEATURE_TEST.md](./FEATURE_TEST.md) | 功能测试 |
| [DOCS_INDEX.md](./DOCS_INDEX.md) | 文档索引 |
| [README.md](./README.md) | 项目介绍 |

---

## 🐛 故障排查

### AI 不回复
```
1. 访问 /api/check-env
2. 检查 API Key 是否配置
3. 查看控制台错误
```

### 保存失败
```
1. Vercel → Storage → Create KV
2. 重新部署
```

### 图片不显示
```
1. 检查 public/ 目录
2. 上传图片文件
3. 文件名: arthur.png, pubg-character.png
```

---

## 📁 项目结构（简化）

```
GameSoul-Interactive/
├── api/              # 8个API端点
├── src/
│   ├── App.jsx      # 主应用
│   ├── components/  # 3个组件
│   └── services/    # 2个服务
├── public/          # 静态资源
└── dist/            # 构建输出
```

---

## 🎮 角色说明

### 亚瑟（王者荣耀）
- **性格**: 傲慢毒舌
- **模型**: Gemini API
- **特点**: 犀利吐槽，偶尔傲娇

### 光子鸡（和平精英）
- **性格**: 萌系大叔
- **模型**: DeepSeek API
- **特点**: 温柔可爱，颜文字

---

## 🔍 测试清单

```
✅ 访问首页
✅ 点击游戏卡片
✅ 发送消息
✅ AI 回复
⚠️ 保存对话（需KV）
⚠️ 查看历史（需KV）
⚠️ 查看广场（需KV）
✅ 彩蛋触发
✅ 情绪动画
```

---

## 💡 快速提示

### 开发时
- 修改代码后自动热更新
- 查看控制台日志调试
- 使用 `npm run build` 测试生产构建

### 部署时
- 推送到 GitHub 自动部署
- Vercel Dashboard 查看日志
- 环境变量修改后需重新部署

### 测试时
- 使用无痕模式避免缓存
- F12 查看控制台错误
- 测试移动端响应式

---

## 📊 性能指标

| 指标 | 目标 | 当前 |
|------|------|------|
| 首屏加载 | < 2s | ✅ |
| AI响应 | < 5s | ✅ |
| 构建大小 | < 500KB | ✅ 301KB |
| 动画流畅度 | 60fps | ✅ |

---

## 🎉 项目亮点

1. ⚡ **快速响应** - Serverless架构
2. 🎨 **流畅动画** - Framer Motion
3. 🤖 **真实AI** - Gemini + DeepSeek
4. 📱 **响应式** - 支持移动端
5. 🎭 **个性角色** - 独特人设

---

## 📞 需要帮助？

1. **查看状态** → `PROJECT_STATUS.md`
2. **查看待办** → `TODO.md`
3. **测试功能** → `FEATURE_TEST.md`
4. **查找文档** → `DOCS_INDEX.md`

---

**提示**: 收藏此页面，随时快速查阅！ ⭐
