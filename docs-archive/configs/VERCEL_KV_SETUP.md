# Vercel KV 数据库配置指南

本项目使用 Vercel KV (基于Redis) 来存储对话记录、用户数据等。

## 🚀 快速配置

### 1. 创建 Vercel KV 数据库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击项目 `game-soul-interactive`
3. 进入 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **KV**（Key-Value）
6. 数据库名称：`gamesoul-kv`
7. 选择区域：**Hong Kong** (或离你最近的区域)
8. 点击 **Create**

### 2. 连接数据库到项目

创建数据库后，Vercel会自动将以下环境变量添加到你的项目：

- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 3. 配置 DeepSeek API Key（可选）

如果要使用和平精英的萌系大叔角色（使用DeepSeek模型），需要配置：

1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册并获取 API Key
3. 在 Vercel 项目的 **Settings** → **Environment Variables** 添加：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: 你的 DeepSeek API Key
   - **Environment**: Production, Preview, Development

### 4. 重新部署

配置完成后，重新部署项目：

```bash
cd /Users/allenzqwei/Desktop/playtest/GameSoul-Interactive
git push origin main
```

或使用 Vercel CLI：

```bash
npx vercel --prod
```

## 📊 数据结构说明

### 对话记录 (Conversation)

```javascript
{
  id: "uuid",
  characterName: "亚瑟",
  gameName: "王者荣耀",
  title: "与亚瑟的对话",
  chatHistory: [...],
  userId: "user_xxx",
  isPublic: true/false,
  createdAt: timestamp,
  messageCount: 10,
  lastMessagePreview: "..."
}
```

### KV 存储键值

- `conversation:{id}` - 对话详情
- `user:{userId}:conversations` - 用户的对话ID列表（Set）
- `public:conversations` - 公开对话的有序集合（Sorted Set，按时间排序）
- `conversation:{id}:views` - 对话浏览次数
- `conversation:{id}:likes` - 对话点赞数
- `conversation:{id}:liked_by` - 点赞用户列表（Set）

## ✅ 验证配置

部署完成后，测试功能：

1. 在聊天界面发送几条消息
2. 点击"保存对话"按钮
3. 选择是否公开
4. 点击"历史记录"查看已保存的对话
5. 点击"广场"查看公开的对话

## 🎉 功能清单

- ✅ 对话保存
- ✅ 对话分享
- ✅ 历史记录查看
- ✅ 广场公开展示
- ✅ 点赞功能
- ✅ 浏览计数
- ✅ 用户ID自动生成

## 📝 注意事项

1. **免费配额**：Vercel KV 免费版有一定限制（每月请求数、存储空间）
2. **数据过期**：对话默认保存30天后自动删除
3. **用户ID**：自动生成并存储在浏览器 localStorage 中
4. **DeepSeek API**：如果不配置，和平精英角色会使用模拟回复

## 🔧 故障排查

如果保存功能不工作：

1. 检查 Vercel KV 是否正确创建
2. 检查环境变量是否已设置
3. 查看 Vercel 函数日志：项目 → Deployments → 最新部署 → Functions
4. 确认已重新部署项目

## 📞 获取帮助

遇到问题？查看：
- [Vercel KV 文档](https://vercel.com/docs/storage/vercel-kv)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
