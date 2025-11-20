# DeepSeek API 配置指南

## 当前状态
⚠️ DeepSeek API Key **未配置**  
💡 当前使用**降级模拟回复**模式（萌系回复仍然可用）

## 为什么需要配置？

### 当前情况
- 光子鸡（和平精英）角色使用DeepSeek AI
- 未配置API Key时，会使用预设的萌系回复
- 虽然回复可爱，但**缺乏智能对话能力**

### 配置后的好处
✅ 真正的AI智能对话  
✅ 上下文理解更准确  
✅ 回复更加丰富多样  
✅ 战术建议更专业  

## 配置步骤

### 1. 获取 DeepSeek API Key

#### 方法一：注册DeepSeek账号
1. 访问：https://platform.deepseek.com/
2. 注册账号并登录
3. 进入 API Keys 页面
4. 创建新的 API Key
5. **复制并保存** API Key（只显示一次！）

#### 方法二：使用其他兼容API
DeepSeek使用OpenAI兼容接口，也可以使用：
- OpenAI API
- Azure OpenAI
- 其他兼容服务

### 2. 在Vercel中配置环境变量

1. 登录 Vercel Dashboard
2. 选择 `gamesoul-interactive` 项目
3. 进入 **Settings** → **Environment Variables**
4. 添加新变量：
   ```
   Name: DEEPSEEK_API_KEY
   Value: 你的API Key（例如：sk-xxxxxxxxxxxxx）
   Environment: Production, Preview, Development (全选)
   ```
5. 点击 **Save**

### 3. 重新部署

配置完环境变量后，需要触发重新部署：

#### 方法一：Vercel控制台
1. 进入项目的 **Deployments** 页面
2. 找到最新的部署
3. 点击右侧的 **...** → **Redeploy**

#### 方法二：推送代码（自动部署）
```bash
cd GameSoul-Interactive
git commit --allow-empty -m "chore: 触发部署以应用DeepSeek API Key"
git push origin main
```

### 4. 验证配置

部署完成后：
1. 访问你的网站
2. 选择 **和平精英** 进入对话
3. 发送一条消息
4. 检查光子鸡的回复是否更加智能

## 降级机制说明

即使未配置API Key，系统仍然可用：

### 降级回复示例
```
❌ API未配置 → 
"哎呀呀~ 大叔的脑子今天有点短路呢(´；ω；`) 不过没关系，小可爱有什么想聊的吗？💕"

❌ API调用失败 → 
"呜~ 大叔遇到点小问题了(｡•́︿•̀｡) 不过还是很想和你聊天呢！继续说吧~ ✨"
```

### 降级规则
1. **未配置API Key** → 返回萌系预设回复
2. **API调用失败** → 返回降级回复
3. **网络超时** → 使用本地增强回复系统

## 费用说明

### DeepSeek定价
- 非常便宜，性价比极高
- 约为OpenAI的1/10价格
- 免费额度足够测试使用

### 示例费用
- 1000条对话约 ¥0.1-0.5
- 日常使用几乎可忽略成本

## 安全注意事项

### ⚠️ 重要提醒
1. **不要将API Key提交到Git仓库**
2. 只在Vercel环境变量中配置
3. 定期更换API Key
4. 监控API使用量，防止滥用

### 环境变量安全
✅ Vercel环境变量是加密存储的  
✅ 只在服务器端可访问  
✅ 前端代码无法获取  

## 故障排查

### 问题1：配置后仍然使用降级回复
**解决方案**：
1. 检查环境变量名称是否正确：`DEEPSEEK_API_KEY`
2. 确认已重新部署
3. 查看Vercel部署日志中的错误信息

### 问题2：API调用失败
**检查清单**：
- [ ] API Key是否有效
- [ ] 账户余额是否充足
- [ ] DeepSeek服务是否正常
- [ ] 网络连接是否畅通

### 问题3：查看详细日志
在Vercel Dashboard中：
1. 进入项目 → **Deployments**
2. 点击最新部署
3. 查看 **Function Logs**
4. 搜索 `DeepSeek` 关键词

## 测试API Key

### 快速测试脚本
```bash
# 替换 YOUR_API_KEY 为你的密钥
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
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

## 常见问题

### Q: 必须配置吗？
A: 不必须。未配置时使用萌系降级回复，功能仍然可用。

### Q: 可以用OpenAI的API吗？
A: 理论上可以，但需要修改代码中的API端点。

### Q: 配置后多久生效？
A: 重新部署后立即生效（约1-2分钟）。

### Q: API Key会过期吗？
A: 除非手动删除，否则永久有效。

---

## 联系支持

如果遇到配置问题，请提供：
1. Vercel部署日志截图
2. 浏览器控制台错误信息
3. 环境变量配置截图（隐藏敏感信息）
