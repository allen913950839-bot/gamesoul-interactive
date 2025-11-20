# Vercel 配置检查清单

## 🔍 请立即检查以下配置

### 1. 环境变量配置（最重要！）

访问：https://vercel.com/dashboard → 选择 `game-soul-interactive` 项目 → Settings → Environment Variables

**必须添加的环境变量：**

```
名称: DEEPSEEK_API_KEY
值: sk-d214ca84244b4272a682ad79cbab5778
环境: ✅ Production ✅ Preview ✅ Development（全部勾选）
```

**已有的环境变量（确认存在）：**
- `GEMINI_API_KEY` 
- `KV_URL` （Vercel KV自动添加）
- `KV_REST_API_URL` （Vercel KV自动添加）
- `KV_REST_API_TOKEN` （Vercel KV自动添加）

### 2. 强制重新部署

如果刚添加了环境变量，必须重新部署：

1. 进入 Vercel Dashboard → Deployments
2. 找到最新的部署
3. 点击右侧 "..." 菜单
4. 选择 **Redeploy**
5. 勾选 **Use existing Build Cache** = OFF（不使用缓存）
6. 点击 **Redeploy** 确认

### 3. 清除浏览器缓存

部署完成后：
1. 打开网站
2. 按 `Cmd + Shift + R`（Mac）或 `Ctrl + Shift + R`（Windows）硬刷新
3. 或者使用无痕模式打开

## 🧪 验证方法

### 测试 DeepSeek 是否工作：

1. 访问 https://game-soul-interactive.vercel.app
2. 点击 **和平精英** 卡片
3. 发送消息："你好"
4. 打开浏览器控制台（F12）→ Console
5. 查看日志中的 **数据来源**：
   - ✅ 应该显示：`数据来源: deepseek-api`
   - ❌ 如果显示：`数据来源: gemini-api` 或 `mock` - 说明配置未生效

### 测试图片是否更新：

1. 进入和平精英对话
2. 查看角色头像
3. 应该显示您上传的自定义图片（pubg-character.png）

### 测试按钮是否显示：

在对话界面，角色头像下方应该有三个彩色按钮：
- 💾 保存对话（青色）
- 📜 历史记录（紫色）
- 🌍 广场（粉色）

## ⚠️ 常见问题

**Q: 为什么按钮看不到？**  
A: 按钮在角色头像区域的下方，需要向下滚动一点，或者屏幕太小被遮挡了。

**Q: DeepSeek 还是不工作？**  
A: 
1. 确认环境变量名称完全正确：`DEEPSEEK_API_KEY`（大写）
2. 确认已勾选 Production 环境
3. 确认已重新部署（不使用缓存）
4. 等待部署完成（1-3分钟）

**Q: 图片还是旧的？**  
A: 
1. 清除浏览器缓存（硬刷新）
2. 使用无痕模式测试
3. 检查 public/pubg-character.png 是否存在

## 📊 当前部署状态

最新提交：`chore: 强制重新部署 - 更新图片和DeepSeek配置`

等待 Vercel 自动部署完成后，按照上述步骤验证。
