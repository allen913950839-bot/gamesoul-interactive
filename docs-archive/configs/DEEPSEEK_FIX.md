# DeepSeek API 修复指南

## 问题

光子鸡的回复不够萌（缺少颜文字），DeepSeek API 未正常工作。

## 原因

Vercel 环境变量 `DEEPSEEK_API_KEY` 未配置或配置错误。

## 解决方案

### 方法 1：Vercel 网页端配置（推荐）

1. **访问环境变量设置**
   ```
   https://vercel.com/allen913950839-5794s-projects/game-soul-interactive/settings/environment-variables
   ```

2. **添加环境变量**
   - 点击 "Add New"
   - Name: `DEEPSEEK_API_KEY`
   - Value: `sk-d214ca84244b4272a682ad79cbab5778`
   - Environments: 勾选 `Production`, `Preview`, `Development`
   - 点击 "Save"

3. **重新部署**
   - 保存后会自动触发重新部署
   - 或者手动推送代码触发部署：
     ```bash
     cd /Users/allenzqwei/Desktop/playtest/GameSoul-Interactive
     git commit --allow-empty -m "Trigger redeploy after adding DEEPSEEK_API_KEY"
     git push origin main
     ```

### 方法 2：使用 Vercel CLI

```bash
cd /Users/allenzqwei/Desktop/playtest/GameSoul-Interactive
npx vercel env add DEEPSEEK_API_KEY production
# 输入: sk-d214ca84244b4272a682ad79cbab5778

npx vercel env add DEEPSEEK_API_KEY preview
# 输入: sk-d214ca84244b4272a682ad79cbab5778
```

## 验证步骤

### 1. 检查部署日志

1. 访问：https://vercel.com/allen913950839-5794s-projects/game-soul-interactive/deployments
2. 点击最新的部署
3. 点击 "Functions" 标签
4. 找到 `/api/deepseek` 的日志
5. 查找以下信息：
   ```
   🔍 DeepSeek API 检查:
     - API Key 存在: true
     - API Key 前缀: sk-d214ca8...
     - API Key 长度: 41
   ```

### 2. 测试光子鸡对话

1. 打开应用并选择"和平精英"
2. 与光子鸡对话几次
3. **正常回复应该包含**：
   - 颜文字：`(｡・ω・｡)`, `(つ✧ω✧)つ`, `(๑´ㅂ\`๑)` 等
   - 萌系称呼："哎呀呀"、"小可爱"、"宝贝"
   - Emoji：💕、✨、🌸、💖
   - 可爱表达："人家也不知道啦~"、"讨厌啦~"

4. **如果不正常**（只有简单回复，无颜文字）：
   - 说明仍在使用模拟回复
   - 检查 API Key 是否正确配置
   - 查看部署日志确认错误

## 常见问题

### Q1: API Key 已配置但仍不工作

**可能原因**：
- API Key 已过期
- API Key 额度用尽
- DeepSeek 服务暂时不可用

**解决方法**：
1. 登录 DeepSeek 平台检查 API Key 状态
2. 查看 API 调用额度
3. 如需要，重新生成 API Key

### Q2: 如何查看实时日志

```bash
cd /Users/allenzqwei/Desktop/playtest/GameSoul-Interactive
npx vercel logs --follow
```

### Q3: 降级方案

如果 DeepSeek API 确实无法使用，代码已内置降级方案：
- 自动使用萌系模拟回复
- 虽然不如真实 AI 智能，但也会带颜文字和萌系表达
- 源码位置：`src/services/geminiService.js` 的 `getCuteUncleResponse()` 函数

## 预期效果

配置成功后，光子鸡的回复示例：

```
用户：今天玩得怎么样？
光子鸡：哎呀呀~ 小可爱今天表现不错呢！(｡・ω・｡) 大叔看到你吃鸡了，超级替你开心的说~ 要不要继续来一局呀？人家可以陪你哦~ 💕✨
```

---

**配置完成后，请测试并确认效果！** 🚀
