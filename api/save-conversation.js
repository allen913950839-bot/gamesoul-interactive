/**
 * 保存对话记录到 Vercel KV
 */
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      characterName, 
      gameName, 
      chatHistory, 
      title,
      userId = 'anonymous',
      isPublic = false 
    } = req.body;

    if (!characterName || !chatHistory || chatHistory.length === 0) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // 生成唯一ID
    const conversationId = uuidv4();
    const timestamp = Date.now();

    // 构建对话数据
    const conversationData = {
      id: conversationId,
      characterName,
      gameName,
      title: title || `与${characterName}的对话`,
      chatHistory,
      userId,
      isPublic,
      createdAt: timestamp,
      messageCount: chatHistory.length,
      lastMessagePreview: chatHistory[chatHistory.length - 1]?.text?.substring(0, 50) || ''
    };

    // 保存到 KV
    // 1. 保存对话详情
    await kv.set(`conversation:${conversationId}`, conversationData);

    // 2. 添加到用户的对话列表
    await kv.sadd(`user:${userId}:conversations`, conversationId);

    // 3. 如果是公开的，添加到广场列表
    if (isPublic) {
      await kv.zadd('public:conversations', {
        score: timestamp,
        member: conversationId
      });
    }

    // 4. 设置过期时间（30天）
    await kv.expire(`conversation:${conversationId}`, 30 * 24 * 60 * 60);

    console.log('✅ 对话已保存:', conversationId);

    return res.status(200).json({
      success: true,
      conversationId,
      shareUrl: `/share/${conversationId}`
    });

  } catch (error) {
    console.error('❌ 保存对话失败:', error);
    return res.status(500).json({ 
      error: 'Failed to save conversation',
      message: error.message 
    });
  }
}
