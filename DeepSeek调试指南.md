# DeepSeek调试指南

## 📋 修改完成清单

✅ **彩蛋系统优化**
- 战锤🔨替换了原来的鞭子
- 6个彩蛋各有独特的触发效果和恢复消息
- 不同的情绪反馈：angry/proud/happy/sad等

✅ **UI调整**
- 隐藏了评价卡片的点赞功能

✅ **DeepSeek增强**
- 详细的调试日志
- API Key有效性验证
- 15秒超时控制
- 更好的错误处理

---

## 🔍 DeepSeek不工作的原因分析

### 可能的原因

1. **API Key未配置** ✅ 已优化
   - 新增检查：空值、默认值、类型验证
   - 日志输出API Key状态

2. **API Key配置错误** ✅ 已优化
   - 增加详细日志：前缀、长度、类型
   - 列出所有DEEPSEEK相关环境变量

3. **API调用超时** ✅ 已修复
   - 实现15秒超时控制
   - 超时时返回友好提示

4. **API返回错误** ✅ 已优化
   - 详细错误日志
   - 降级萌系回复

---

## 🧪 如何测试DeepSeek

### 1. 查看Vercel部署日志

部署完成后（约1-2分钟），进入Vercel：

```
项目 → Deployments → 最新部署 → Function Logs
```

### 2. 测试光子鸡对话

1. 访问你的网站
2. 选择 **和平精英**
3. 发送消息：`你好`
4. 查看光子鸡回复

### 3. 检查浏览器控制台

打开浏览器开发者工具（F12），查看Console：

```javascript
// 应该看到类似这样的日志
{
  text: "...",
  mood: "...",
  source: "deepseek-api"  // 这个很重要！
}
```

### 4. 判断DeepSeek状态

根据 `source` 字段判断：

| source | 含义 | 解决方案 |
|--------|------|----------|
| `deepseek-api` | ✅ 正常工作 | 无需操作 |
| `mock-no-key` | ❌ API Key未配置 | 配置环境变量 |
| `fallback-api-error` | ❌ API调用失败 | 检查API Key有效性 |
| `timeout-error` | ⚠️ 请求超时 | 检查网络/API服务 |
| `error-fallback` | ❌ 服务器错误 | 查看部署日志 |

---

## 🔧 配置DeepSeek API Key

### 方法一：Vercel控制台（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择项目 `gamesoul-interactive`
3. 进入 **Settings** → **Environment Variables**
4. 添加变量：
   ```
   Name: DEEPSEEK_API_KEY
   Value: sk-xxxxxxxxxxxxxxxxxxxxxxxx
   Environment: Production, Preview, Development (全选)
   ```
5. **Save** 后重新部署

### 方法二：Vercel CLI

```bash
# 添加环境变量
npx vercel env add DEEPSEEK_API_KEY production

# 输入你的API Key
sk-xxxxxxxxxxxxxxxxxxxxxxxx

# 触发部署
cd /Users/allenzqwei/Desktop/playtest/GameSoul-Interactive
git commit --allow-empty -m "chore: 触发部署应用DeepSeek配置"
git push origin main
```

---

## 📊 查看详细日志

### Vercel部署日志

部署后，在Function Logs中搜索这些关键词：

#### ✅ 成功日志示例
```
🔍 DeepSeek API 检查:
  - 时间: 2025-11-20T09:30:00.000Z
  - API Key 存在: true
  - API Key 前缀: sk-d214ca84...
  - API Key 长度: 40
  - API Key 类型: string
  - 环境变量列表: ["DEEPSEEK_API_KEY"]

📤 准备调用 DeepSeek API...
  - 端点: https://api.deepseek.com/v1/chat/completions
  - 模型: deepseek-chat
  - 用户消息: 你好

📥 DeepSeek API Response Status: 200
✅ DeepSeek API Success
  - 响应长度: 156
  - Choices: 1
  - AI回复: 哎呀呀~ 小可爱来啦！...
```

#### ❌ 失败日志示例
```
🔍 DeepSeek API 检查:
  - API Key 存在: false
  - API Key 前缀: N/A
  - API Key 长度: 0
❌ DeepSeek API Key 未正确配置
💡 请在Vercel环境变量中配置 DEEPSEEK_API_KEY
💡 当前返回萌系降级回复
```

---

## 🎯 验证清单

- [ ] 代码已推送到GitHub
- [ ] Vercel已自动触发部署
- [ ] 部署状态为 **Ready**
- [ ] 访问网站能正常加载
- [ ] 选择和平精英能进入对话
- [ ] 查看Vercel日志中的DeepSeek检查结果
- [ ] 发送测试消息
- [ ] 查看浏览器控制台的`source`字段
- [ ] 根据结果判断是否需要配置API Key

---

## 💡 常见问题

### Q1: 配置了API Key但还是不工作？

检查清单：
1. 环境变量名称是否完全正确：`DEEPSEEK_API_KEY`（大写）
2. 是否选择了所有环境（Production, Preview, Development）
3. 配置后是否重新部署了
4. API Key是否有效（可以用curl测试）

### Q2: 如何测试API Key是否有效？

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-你的密钥" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

成功返回示例：
```json
{
  "choices": [{
    "message": {
      "content": "你好！有什么可以帮助你的吗？"
    }
  }]
}
```

### Q3: 降级模式下能用吗？

可以！即使没有配置API Key，光子鸡仍然会用萌系回复，只是：
- ❌ 没有智能对话能力
- ❌ 无法理解上下文
- ✅ 回复依然可爱
- ✅ 功能正常使用

### Q4: DeepSeek API费用如何？

- 非常便宜：约为OpenAI的1/10
- 1000条对话约 ¥0.1-0.5
- 新用户有免费额度
- 日常使用几乎可忽略

---

## 🚀 下一步

1. **查看Vercel部署状态**
   - 访问：https://vercel.com/你的项目
   - 等待部署完成（约1-2分钟）

2. **测试网站**
   - 访问你的域名
   - 选择和平精英
   - 发送消息测试

3. **查看日志**
   - 根据日志判断DeepSeek状态
   - 如果是`mock-no-key`，则需要配置API Key

4. **配置API Key**（可选）
   - 访问 https://platform.deepseek.com/
   - 获取API Key
   - 在Vercel中配置
   - 重新部署

---

## 📞 需要帮助？

如果遇到问题，请提供：
1. Vercel部署日志截图（搜索"DeepSeek"）
2. 浏览器控制台的`source`字段值
3. 环境变量配置截图（隐藏敏感信息）

---

**最后提交**: commit 0004da3  
**部署时间**: 约1-2分钟后生效  
**测试地址**: 你的Vercel域名
