# 📸 亚瑟图片上传指南

## 当前状态
项目已配置好亚瑟图片显示功能，但需要您手动上传图片文件。

## 上传步骤

### 方法一: 直接替换（推荐）
1. 将您上传的亚瑟图片重命名为 `arthur.png`
2. 复制到项目目录: 
   ```
   GameSoul-Interactive/public/arthur.png
   ```
3. 刷新浏览器即可看到效果

### 方法二: 使用命令行
```bash
# 进入项目目录
cd /Users/allenzqwei/Desktop/playtest/GameSoul-Interactive

# 复制图片（替换 /path/to/your/arthur-image.png 为实际路径）
cp /path/to/your/arthur-image.png public/arthur.png

# 重启开发服务器
npm run dev
```

## 图片要求
- **格式**: PNG / JPG / JPEG
- **建议尺寸**: 512x512 或更大（会自动缩放为 160x160）
- **推荐**: 圆形或方形构图，角色居中

## 显示效果
- 图片会以圆形显示
- 尺寸: 160x160 像素
- 带金色边框和阴影
- 支持情绪动画效果

## 故障排除

**Q: 图片不显示？**
1. 检查文件路径是否正确: `public/arthur.png`
2. 检查文件名是否完全一致（区分大小写）
3. 刷新浏览器（Ctrl/Cmd + Shift + R 强制刷新）
4. 检查浏览器控制台是否有 404 错误

**Q: 图片变形？**
- 使用正方形图片可以避免变形
- 圆形裁剪会自动适配

## 临时显示
如果暂时没有图片，系统会显示剑的 emoji ⚔️ 作为占位符。

---

配置完成后，亚瑟的真实形象将展现在游戏中！
