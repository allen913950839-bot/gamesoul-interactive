# DeepSeek API 余额不足解决方案

## 🔍 问题诊断

从Network面板可以看到：
```json
{
  "error": "API 402",
  "debug": "Insufficient Balance"
}
```

**确诊**：DeepSeek API Key 余额不足！

---

## 💡 解决方案

### 方案1：获取新的免费API Key（推荐）

DeepSeek为新用户提供免费额度，你可以：

#### 步骤1：访问DeepSeek平台
```
https://platform.deepseek.com/
```

#### 步骤2：创建新API Key
1. 登录账号
2. 进入 **API Keys** 页面
3. **删除旧的API Key**（如果有）
4. 点击 **Create API Key**
5. **复制新的API Key**（格式：sk-xxxxxxxxxxxx）

#### 步骤3：查看免费额度
- 在Dashboard中查看 **Balance** 或 **Credits**
- 新用户通常有免费额度可用

#### 步骤4：更新Vercel环境变量
1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择项目 `gamesoul-interactive`
3. 进入 **Settings** → **Environment Variables**
4. 找到 `DEEPSEEK_API_KEY`
5. 点击 **Edit** 按钮
6. 粘贴新的API Key
7. 选择所有环境（Production, Preview, Development）
8. 点击 **Save**

#### 步骤5：重新部署
```bash
cd /Users/allenzqwei/Desktop/playtest/GameSoul-Interactive
git commit --allow-empty -m "chore: 更新DeepSeek API Key"
git push origin main
```

等待1-2分钟部署完成后测试。

---

### 方案2：充值现有账户

如果你想继续使用当前API Key：

#### 充值金额建议
- **最低充值**：¥10（够用很久）
- **推荐充值**：¥50（长期使用）

#### 费用参考
DeepSeek非常便宜：
- 1000条对话 ≈ ¥0.1-0.5
- 比OpenAI便宜约10倍
- 日常使用几乎可忽略成本

#### 充值步骤
1. 访问 https://platform.deepseek.com/
2. 进入 **Billing** 或 **充值** 页面
3. 选择充值金额
4. 完成支付
5. 等待到账（通常1-2分钟）
6. 无需重新部署，立即生效

---

### 方案3：使用智能降级系统（临时）

如果暂时不想充值，系统已经优化了降级回复：

#### 当前优化
✅ 不再是固定模板  
✅ 基于关键词的智能匹配  
✅ 保持光子鸡萌系人设  
✅ 支持上下文理解  

#### 降级模式特点
- 问候、游戏输赢、技巧咨询等都有对应回复
- 每个场景有多个随机变体
- 虽然不如真AI，但体验好很多

#### 启用降级模式
无需操作，API失败时自动启用。

---

## 🧪 测试验证

### 1. 快速测试API Key

在终端运行（替换YOUR_API_KEY）：
```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好"}],
    "max_tokens": 50
  }'
```

#### 成功响应示例
```json
{
  "choices": [{
    "message": {
      "content": "你好！有什么可以帮助你的吗？"
    }
  }],
  "usage": {
    "total_tokens": 15
  }
}
```

#### 余额不足响应
```json
{
  "error": {
    "message": "Insufficient Balance",
    "type": "insufficient_quota"
  }
}
```

### 2. 检查网站效果

更新API Key并重新部署后：

1. 访问你的网站
2. 选择 **和平精英**
3. 发送消息
4. 打开浏览器控制台（F12）
5. 查看Network → `/api/deepseek`
6. 检查响应：
   - ✅ Status 200 + 有智能回复 = 成功
   - ❌ Status 402 = 余额仍不足
   - ❌ Status 401 = API Key无效

---

## 📊 费用透明度

### DeepSeek定价（2024年）

| 服务 | 价格 | 说明 |
|------|------|------|
| deepseek-chat | ~¥0.001/1K tokens | 对话模型 |
| 新用户免费额度 | 通常有 | 够测试使用 |

### 实际消费示例

假设每条对话平均150 tokens：
- 100条对话 ≈ 15K tokens ≈ ¥0.015
- 1000条对话 ≈ 150K tokens ≈ ¥0.15
- 10000条对话 ≈ 1.5M tokens ≈ ¥1.5

**结论**：¥10可以支撑几千条对话。

---

## 🔧 故障排查

### 问题1：更新API Key后还是报错402

**可能原因**：
1. Vercel环境变量未保存
2. 未重新部署
3. 新API Key也余额不足

**解决方案**：
1. 检查Vercel环境变量是否正确
2. 确认已重新部署
3. 用curl测试新API Key
4. 查看DeepSeek平台的余额

### 问题2：创建API Key失败

**可能原因**：
1. 账号未验证
2. 达到API Key数量限制

**解决方案**：
1. 完成账号验证（邮箱/手机）
2. 删除旧的API Key后再创建

### 问题3：免费额度在哪里查看

**查看位置**：
1. 登录 DeepSeek 平台
2. Dashboard 或 Billing 页面
3. 查看 **Balance**、**Credits** 或 **配额**

---

## 📝 重要提醒

### ⚠️ API Key安全
1. ✅ 只在Vercel环境变量中配置
2. ❌ 不要提交到Git仓库
3. ❌ 不要在前端代码中使用
4. ✅ 定期更换API Key
5. ✅ 监控使用量，防止滥用

### 💰 费用控制
建议在DeepSeek平台设置：
- 每日消费上限
- 余额预警通知
- 定期查看使用统计

---

## 🆘 需要帮助？

如果尝试上述方案后仍有问题，请提供：

1. **Vercel部署日志**（Function Logs）
2. **浏览器控制台截图**（Network面板）
3. **DeepSeek平台余额截图**（隐藏敏感信息）
4. **curl测试结果**

---

## ✅ 推荐操作流程

**最快解决方案**（5分钟）：

```bash
# 1. 获取新API Key
访问 https://platform.deepseek.com/
创建新的API Key并复制

# 2. 测试API Key
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer sk-你的新密钥" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"测试"}]}'

# 3. 更新Vercel环境变量
登录 Vercel → 项目 → Settings → Environment Variables
编辑 DEEPSEEK_API_KEY，粘贴新密钥

# 4. 重新部署
cd /Users/allenzqwei/Desktop/playtest/GameSoul-Interactive
git commit --allow-empty -m "chore: 更新DeepSeek API Key"
git push origin main

# 5. 等待部署完成（1-2分钟）后测试
```

---

**最后更新**：2025-11-20  
**问题状态**：已诊断，待解决（需更新API Key或充值）
