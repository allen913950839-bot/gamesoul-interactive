/**
 * API: 添加评论
 * 为对话添加用户评论
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, content, userId } = req.body;

    // 验证参数
    if (!conversationId || !content || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['conversationId', 'content', 'userId']
      });
    }

    // 生成评论ID
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建评论对象
    const comment = {
      id: commentId,
      conversationId,
      userId,
      content: content.trim(),
      createdAt: Date.now()
    };

    // 检查 KV 是否可用
    if (!kv) {
      console.log('⚠️ Vercel KV 未配置，评论功能暂不可用');
      return res.status(503).json({
        error: 'Comment service unavailable',
        message: 'KV存储未配置，评论功能暂时不可用'
      });
    }

    try {
      // 保存评论到 KV
      await kv.set(`comment:${commentId}`, comment);

      // 将评论ID添加到对话的评论列表
      const commentsKey = `conversation:${conversationId}:comments`;
      await kv.lpush(commentsKey, commentId);

      // 更新对话的评论计数
      const conversation = await kv.get(`conversation:${conversationId}`);
      if (conversation) {
        conversation.commentCount = (conversation.commentCount || 0) + 1;
        await kv.set(`conversation:${conversationId}`, conversation);
      }

      return res.status(200).json({
        success: true,
        comment,
        message: '评论添加成功'
      });
    } catch (kvError) {
      console.error('❌ KV操作失败:', kvError);
      return res.status(503).json({
        error: 'KV operation failed',
        message: '评论保存失败，请稍后重试'
      });
    }
  } catch (error) {
    console.error('❌ 添加评论失败:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
