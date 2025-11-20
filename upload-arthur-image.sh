#!/bin/bash

# 亚瑟图片上传脚本

echo "🎮 GameSoul - 亚瑟图片上传工具"
echo "================================"
echo ""

# 检查是否提供了图片路径
if [ -z "$1" ]; then
    echo "使用方法:"
    echo "  ./upload-arthur-image.sh /path/to/your/arthur-image.png"
    echo ""
    echo "或者将图片拖到终端窗口，然后回车"
    echo ""
    
    # 尝试在常见位置查找图片
    echo "正在查找可能的亚瑟图片..."
    find ~/Desktop ~/Downloads -maxdepth 1 -type f \( -iname "*arthur*" -o -iname "*亚瑟*" \) \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) 2>/dev/null
    
    exit 1
fi

# 源文件路径
SOURCE="$1"

# 目标路径
TARGET="$(dirname "$0")/public/arthur.png"

# 检查源文件是否存在
if [ ! -f "$SOURCE" ]; then
    echo "❌ 错误: 文件不存在: $SOURCE"
    exit 1
fi

# 检查是否是图片文件
if [[ ! "$SOURCE" =~ \.(png|jpg|jpeg|PNG|JPG|JPEG)$ ]]; then
    echo "❌ 错误: 不是有效的图片文件（支持 PNG, JPG, JPEG）"
    exit 1
fi

# 复制文件
echo "📋 正在复制图片..."
cp "$SOURCE" "$TARGET"

if [ $? -eq 0 ]; then
    echo "✅ 成功! 亚瑟图片已上传到: $TARGET"
    echo ""
    echo "下一步:"
    echo "1. 刷新浏览器 (Ctrl/Cmd + Shift + R)"
    echo "2. 如果开发服务器未运行，执行: npm run dev"
    echo ""
    echo "亚瑟的真实形象即将展现! ⚔️"
else
    echo "❌ 上传失败"
    exit 1
fi
