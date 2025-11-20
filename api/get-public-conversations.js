/**
 * 获取广场公开对话列表
 */
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 20, offset = 0, sort = 'recent' } = req.query;

    // 从有序集合中获取公开对话ID（按时间倒序）
    const conversationIds = await kv.zrange(
      'public:conversations',
      parseInt(offset),
      parseInt(offset) + parseInt(limit) - 1,
      { rev: true } // 倒序（最新的在前）
    );

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
        if (conversation && conversation.isPublic) {
          const views = await kv.get(`conversation:${id}:views`) || 0;
          const likes = await kv.get(`conversation:${id}:likes`) || 0;
          return { ...conversation, views, likes };
        }
        return null;
      })
    );

    // 过滤掉null值
    const validConversations = conversations.filter(c => c !== null);

    // 根据排序方式排序
    if (sort === 'popular') {
      validConversations.sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10));
    } else if (sort === 'likes') {
      validConversations.sort((a, b) => b.likes - a.likes);
    }
    // 默认已经按时间排序

    // 获取总数
    const total = await kv.zcard('public:conversations') || 0;

    return res.status(200).json({
      success: true,
      conversations: validConversations,
      total
    });

  } catch (error) {
    console.error('❌ 获取公开对话列表失败:', error);
    return res.status(500).json({ 
      error: 'Failed to get public conversations',
      message: error.message 
    });
  }
}
