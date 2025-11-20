/**
 * 点赞对话
 */
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, userId = 'anonymous' } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // 检查是否已经点赞过
    const likeKey = `conversation:${conversationId}:liked_by`;
    const hasLiked = await kv.sismember(likeKey, userId);

    if (hasLiked) {
      // 取消点赞
      await kv.srem(likeKey, userId);
      await kv.decr(`conversation:${conversationId}:likes`);
      
      const likes = await kv.get(`conversation:${conversationId}:likes`) || 0;
      
      return res.status(200).json({
        success: true,
        liked: false,
        likes: Math.max(0, likes)
      });
    } else {
      // 点赞
      await kv.sadd(likeKey, userId);
      await kv.incr(`conversation:${conversationId}:likes`);
      
      const likes = await kv.get(`conversation:${conversationId}:likes`) || 1;
      
      return res.status(200).json({
        success: true,
        liked: true,
        likes
      });
    }

  } catch (error) {
    console.error('❌ 点赞操作失败:', error);
    return res.status(500).json({ 
      error: 'Failed to like conversation',
      message: error.message 
    });
  }
}
