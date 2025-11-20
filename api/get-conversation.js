/**
 * 获取单个对话记录
 */
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // 从 KV 获取对话
    const conversation = await kv.get(`conversation:${id}`);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // 增加浏览次数
    const viewKey = `conversation:${id}:views`;
    await kv.incr(viewKey);
    const views = await kv.get(viewKey) || 1;

    return res.status(200).json({
      success: true,
      conversation: {
        ...conversation,
        views
      }
    });

  } catch (error) {
    console.error('❌ 获取对话失败:', error);
    return res.status(500).json({ 
      error: 'Failed to get conversation',
      message: error.message 
    });
  }
}
