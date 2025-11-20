/**
 * 获取用户的对话历史列表
 */
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId = 'anonymous', limit = 20, offset = 0 } = req.query;

    // 获取用户的对话ID列表
    const conversationIds = await kv.smembers(`user:${userId}:conversations`);

    if (!conversationIds || conversationIds.length === 0) {
      return res.status(200).json({
        success: true,
        conversations: [],
        total: 0
      });
    }

    // 获取对话详情
    const conversations = await Promise.all(
      conversationIds.map(async (id) => {
        const conversation = await kv.get(`conversation:${id}`);
        if (conversation) {
          const views = await kv.get(`conversation:${id}:views`) || 0;
          return { ...conversation, views };
        }
        return null;
      })
    );

    // 过滤掉null值并按时间排序
    const validConversations = conversations
      .filter(c => c !== null)
      .sort((a, b) => b.createdAt - a.createdAt);

    // 分页
    const paginatedConversations = validConversations.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      conversations: paginatedConversations,
      total: validConversations.length
    });

  } catch (error) {
    console.error('❌ 获取用户对话列表失败:', error);
    return res.status(500).json({ 
      error: 'Failed to get user conversations',
      message: error.message 
    });
  }
}
