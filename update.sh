#!/bin/bash

# GameSoul-Interactive 快速更新部署脚本
# 使用方法: ./update.sh

echo "🚀 GameSoul-Interactive 快速更新"
echo ""

# 检查是否有修改
if [[ -z $(git status -s) ]]; then
    echo "✨ 没有检测到代码修改"
    echo ""
    exit 0
fi

# 显示修改的文件
echo "📝 检测到以下修改："
git status -s
echo ""

# 询问提交说明
read -p "💬 请输入提交说明: " commit_message

if [[ -z "$commit_message" ]]; then
    commit_message="Update: 更新项目内容"
fi

echo ""
echo "🔄 正在提交并推送..."

# 提交并推送
git add .
git commit -m "$commit_message"
git push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    echo ""
    echo "⏳ Vercel 正在自动部署..."
    echo "📊 查看部署状态: https://vercel.com/dashboard"
    echo "🔗 在线链接: https://gamesoul-interactive.vercel.app"
    echo ""
    echo "💡 提示: 部署通常需要 1-2 分钟"
else
    echo ""
    echo "❌ 推送失败！"
    echo "请检查网络连接和 GitHub 认证"
    echo ""
fi
