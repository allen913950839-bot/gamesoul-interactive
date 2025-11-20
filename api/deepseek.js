/**
 * DeepSeek API 代理
 * 用于和平精英角色对话
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { characterName, characterPersonality, chatHistory, userMessage } = req.body;

    // 获取 DeepSeek API Key
    const API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!API_KEY) {
      console.error('❌ DeepSeek API Key not configured');
      return res.status(200).json({ 
        error: 'DeepSeek API Key not configured',
        useMock: true,
        text: '哎呀呀~ 大叔的脑子今天有点短路呢(´；ω；`) 请稍后再试试吧，么么哒~',
        mood: 'neutral',
        source: 'mock'
      });
    }

    // 构建对话上下文
    const conversationContext = chatHistory
      .map(msg => `${msg.sender === 'user' ? '玩家' : characterName}: ${msg.text}`)
      .join('\n');

    // 构建提示词
    const systemPrompt = `你是${characterName}，${characterPersonality}

重要规则:
1. 严格保持${characterName}的萌系大叔人设
2. 大量使用可爱的颜文字，如：(｡・ω・｡)、(つ✧ω✧)つ、(๑´ㅂ\`๑)、(⁎⁍̴̛ᴗ⁍̴̛⁎)等
3. 使用"哎呀呀"、"小可爱"、"宝贝"等萌系称呼
4. 回复要温柔可爱，长度30-80字
5. 适当使用emoji：💕、✨、🌸、💖、🎀等
6. 偶尔会害羞："人家也不知道啦~"、"讨厌啦~"
7. 给出战术建议时要专业但表达方式要萌

之前的对话:
${conversationContext}

现在玩家说: ${userMessage}

请以${characterName}的萌系大叔口吻回复:`;

    console.log('📤 Calling DeepSeek API...');
    console.log('🔑 API Key exists:', !!API_KEY);
    console.log('🔑 API Key prefix:', API_KEY ? API_KEY.substring(0, 7) + '...' : 'N/A');

    // 调用 DeepSeek API
    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.9,
          max_tokens: 500
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek API Error:', response.status, errorText);
      
      return res.status(200).json({ 
        error: `DeepSeek API error: ${response.status}`,
        details: errorText,
        useMock: true,
        text: '哎呀呀~ 大叔今天有点累了呢(´；ω；`) 要不要稍后再来找我玩？',
        mood: 'neutral',
        source: 'mock'
      });
    }

    const data = await response.json();
    console.log('✅ DeepSeek API Success');

    const aiText = data.choices?.[0]?.message?.content || '哎呀呀~ 大叔一时语塞了呢~ (*/ω＼*)';

    // 简单的情绪分析
    const mood = analyzeMood(userMessage, aiText);

    return res.status(200).json({
      text: aiText,
      mood: mood,
      source: 'deepseek-api'
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    
    return res.status(200).json({
      text: '哎呀呀~ 大叔遇到点小问题了呢(´；ω；`) 不过没关系，咱们继续聊天吧！',
      mood: 'neutral',
      source: 'error-fallback'
    });
  }
}

// 情绪分析辅助函数
function analyzeMood(userMessage, aiResponse) {
  const positiveKeywords = ['好', '棒', '赞', '厉害', '喜欢', '爱', '开心', '哈哈'];
  const negativeKeywords = ['不', '差', '烂', '菜', '垃圾', '讨厌', '气'];
  const excitedKeywords = ['！', '!', '吗', '啊', '哇'];

  const text = userMessage + aiResponse;
  
  if (positiveKeywords.some(word => text.includes(word))) {
    return 'happy';
  }
  if (negativeKeywords.some(word => text.includes(word))) {
    return 'sad';
  }
  if (excitedKeywords.some(word => text.includes(word))) {
    return 'excited';
  }
  
  return 'neutral';
}
