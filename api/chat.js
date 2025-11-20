/**
 * Vercel Serverless Function - Gemini API 代理
 * 解决浏览器 CORS 跨域问题
 */

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { characterName, characterPersonality, chatHistory, userMessage } = req.body;

    // 获取 API Key（从环境变量）
    const API_KEY = process.env.GEMINI_API_KEY;
    
    // 详细诊断日志
    console.log('=== API Key 诊断 ===');
    console.log('API_KEY exists:', !!API_KEY);
    console.log('API_KEY length:', API_KEY ? API_KEY.length : 0);
    console.log('API_KEY preview:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'undefined');
    console.log('所有环境变量:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')));
    
    if (!API_KEY) {
      console.error('❌ Gemini API Key not configured');
      return res.status(200).json({ 
        error: 'API Key not configured',
        debug: 'Environment variable GEMINI_API_KEY is missing',
        availableEnvKeys: Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')),
        useMock: true 
      });
    }

    // 构建对话上下文
    const conversationContext = chatHistory
      .filter(msg => msg.sender === 'user')
      .map(msg => `用户: ${msg.text}`)
      .join('\n');

    // 构建提示词
    const systemPrompt = `你是${characterName}，${characterPersonality}

重要规则:
1. 严格保持${characterName}的人设和说话风格
2. 回复要生动有趣，长度在30-100字之间，不要太短也不要太长
3. 可以适当使用emoji表情增加趣味性
4. 根据用户的情绪做出相应反应，展现角色个性
5. 如果用户提到游戏体验，要记录并评价
6. 回复要有细节和情感，不要只是简单的一句话
7. 适当加入角色的动作、表情或心理活动描写

之前的对话:
${conversationContext}

现在用户说: ${userMessage}

请以${characterName}的口吻回复(只返回回复内容，不要加"${characterName}:"等前缀):`;

    console.log('📤 Calling Gemini API...');
    console.log('API URL:', `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY.substring(0, 10)}...`);

    // 调用 Gemini API（使用 gemini-2.0-flash 稳定模型）
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
            candidateCount: 1,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', response.status, errorText);
      
      return res.status(200).json({ 
        error: `Gemini API error: ${response.status}`,
        details: errorText,
        apiKeyConfigured: true,
        responseStatus: response.status,
        useMock: true 
      });
    }

    const data = await response.json();
    console.log('✅ Gemini API Success');
    console.log('Response data:', JSON.stringify(data, null, 2));
    console.log('candidates:', data.candidates);
    console.log('First candidate:', data.candidates?.[0]);
    console.log('Content:', data.candidates?.[0]?.content);
    console.log('Parts:', data.candidates?.[0]?.content?.parts);
    console.log('Text:', data.candidates?.[0]?.content?.parts?.[0]?.text);

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '我现在有点累了，待会再聊...';

    // 简单的情绪分析
    const mood = analyzeMood(userMessage, aiText);

    return res.status(200).json({
      text: aiText,
      mood: mood,
      source: 'gemini-api'
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(200).json({ 
      error: error.message,
      errorType: error.name,
      stack: error.stack,
      useMock: true 
    });
  }
}

/**
 * 简单的情绪分析
 */
function analyzeMood(userMessage, aiResponse) {
  const happyKeywords = ['好', '棒', '赢', '爽', '厉害', '强', '牛'];
  const sadKeywords = ['坑', '垃圾', '输', '烂', '差', '菜', '难'];
  const angryKeywords = ['气', '怒', '骂', '烦', '讨厌'];
  const excitedKeywords = ['哈哈', '笑', '有趣', '好玩'];

  const text = userMessage + aiResponse;

  if (sadKeywords.some(kw => text.includes(kw))) return 'sad';
  if (angryKeywords.some(kw => text.includes(kw))) return 'angry';
  if (excitedKeywords.some(kw => text.includes(kw))) return 'excited';
  if (happyKeywords.some(kw => text.includes(kw))) return 'happy';

  return 'neutral';
}
