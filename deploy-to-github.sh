#!/bin/bash

# GameSoul-Interactive 自动部署到 GitHub 脚本

echo "🚀 GameSoul-Interactive 自动部署开始..."
echo ""

# 检查是否配置了 Git
if ! git config user.name > /dev/null 2>&1; then
    echo "⚠️  请先配置 Git 用户信息："
    echo ""
    read -p "请输入你的 GitHub 用户名: " github_username
    read -p "请输入你的邮箱: " github_email
    
    git config --global user.name "$github_username"
    git config --global user.email "$github_email"
    echo "✅ Git 配置完成"
    echo ""
fi

# 询问 GitHub 仓库信息
echo "📝 请提供 GitHub 仓库信息："
read -p "请输入你的 GitHub 用户名: " GITHUB_USERNAME

REPO_NAME="gamesoul-interactive"

echo ""
echo "🔗 将创建/连接到仓库："
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

read -p "确认继续？(y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ 已取消"
    exit 1
fi

# 检查是否已有 remote
if git remote | grep -q "origin"; then
    echo "📌 检测到已有 origin，将删除旧的配置..."
    git remote remove origin
fi

# 添加 GitHub remote
echo "🔗 关联 GitHub 仓库..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# 推送代码
echo "📤 推送代码到 GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    echo ""
    echo "📋 下一步：连接 Vercel 实现自动部署"
    echo ""
    echo "1️⃣  访问 Vercel："
    echo "   https://vercel.com"
    echo ""
    echo "2️⃣  点击 'Add New...' → 'Project'"
    echo ""
    echo "3️⃣  导入你的 GitHub 仓库："
    echo "   $GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "4️⃣  配置环境变量（重要！）："
    echo "   Name:  VITE_GEMINI_API_KEY"
    echo "   Value: AIzaSyBrDHxvH9MfAXLW-Jwu5huJfrjA6XwX6Sk"
    echo ""
    echo "5️⃣  点击 'Deploy'"
    echo ""
    echo "🎉 完成后，每次 git push 都会自动部署！"
    echo ""
else
    echo ""
    echo "❌ 推送失败！"
    echo ""
    echo "可能的原因："
    echo "1. GitHub 仓库不存在 - 请先在 GitHub 创建仓库："
    echo "   https://github.com/new"
    echo "   仓库名: $REPO_NAME"
    echo ""
    echo "2. 需要认证 - 如果要求输入密码，请使用 Personal Access Token："
    echo "   创建 Token: https://github.com/settings/tokens"
    echo "   权限选择: repo (完整仓库访问)"
    echo ""
    echo "3. 重新运行此脚本或手动执行："
    echo "   git push https://YOUR_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git main"
    echo ""
fi
