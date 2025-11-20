#!/usr/bin/env python3
"""
应用鞭子按钮补丁
"""

import re

# 读取文件
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 删除"抽"的检测代码块
old_whip_detection = r"""    // 检测"抽"彩蛋
    if \(currentInput\.includes\('抽'\)\) \{[\s\S]*?\}\s*\}"""

content = re.sub(old_whip_detection, '    // 移除了"抽"的文本检测', content)

# 2. 添加鞭子按钮处理函数（在 generateCard 函数之前）
whip_handler = """
  // 鞭子按钮点击处理
  const handleWhipClick = () => {
    if (isExploding) return;
    
    const newWhipCount = whipCount + 1;
    setWhipCount(newWhipCount);
    setShowWhip(true);
    setTimeout(() => setShowWhip(false), 500);

    // 3次后爆炸
    if (newWhipCount >= 3) {
      setIsExploding(true);
      setTimeout(() => {
        setChatHistory(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: '💥💥💥 我炸了！！！你满意了吧！！！我要去修理厂了，再见！！！💥💥💥',
          mood: 'exploded'
        }]);
        
        // 3秒后重置
        setTimeout(() => {
          setIsExploding(false);
          setWhipCount(0);
          setChatHistory(prev => [...prev, {
            id: Date.now() + 2,
            sender: 'ai',
            text: '修好了...你这个混蛋，我记住你了！😤',
            mood: 'angry'
          }]);
          setCharacterMood('angry');
        }, 3000);
      }, 1000);
    }
  };

"""

# 在 generateCard 之前插入
content = content.replace('  const generateCard = () => {', whip_handler + '  const generateCard = () => {')

# 3. 更改彩蛋提示文本
old_hint = r'<p className="text-cyan-400">💡 彩蛋提示: 试试输入"抽"\.\.\.</p>'
new_hint = """{selectedGame.id === 'hok' && (
                    <p className="text-cyan-400">💡 彩蛋提示: 点击右下角的鞭子按钮...</p>
                  )}"""

content = re.sub(old_hint, new_hint, content)

# 4. 添加悬浮鞭子按钮（在 Input Area 之前）
whip_button = """
              {/* 悬浮鞭子按钮 - 王者荣耀专属 */}
              {selectedGame.id === 'hok' && !isExploding && (
                <motion.button
                  onClick={handleWhipClick}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    rotate: showWhip ? [0, -20, 20, -20, 0] : 0,
                  }}
                  className="fixed right-6 bottom-24 w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-orange-600 shadow-lg shadow-red-600/50 flex items-center justify-center text-3xl hover:shadow-2xl hover:shadow-red-600/80 transition-shadow z-50 border-2 border-red-400/30"
                >
                  🞭
                </motion.button>
              )}

"""

# 在 Input Area 之前插入
content = content.replace('              {/* Input Area */', whip_button + '              {/* Input Area */')

# 写入文件
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 鞭子按钮补丁已应用！")
print("修改内容：")
print("  1. 移除了'抽'的文本检测")
print("  2. 添加了鞭子按钮点击处理函数")
print("  3. 添加了悬浮鞭子按钮UI")
print("  4. 更新了彩蛋提示文本")
print("  5. 爆炸次数已改为3次")
