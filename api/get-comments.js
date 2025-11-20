/**
 * API: 获取评论列表
 * 获取指定对话的所有评论
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, limit = 50, offset = 0 } = req.query;

    // 验证参数
    if (!conversationId) {
      return res.status(400).json({ 
        error: 'Missing conversationId'
      });
    }

    // 检查 KV 是否可用
    if (!kv) {
      console.log('⚠️ Vercel KV 未配置，返回空评论列表');
      return res.status(200).json({
        comments: [],
        total: 0,
        storage: 'none'
      });
    }

    try {
      // 获取对话的评论ID列表
      const commentsKey = `conversation:${conversationId}:comments`;
      const commentIds = await kv.lrange(commentsKey, offset, offset + parseInt(limit) - 1);

      if (!commentIds || commentIds.length === 0) {
        return res.status(200).json({
          comments: [],
          total: 0,
          storage: 'kv'
        });
      }

      // 批量获取评论详情
      const comments = [];
      for (const commentId of commentIds) {
        const comment = await kv.get(`comment:${commentId}`);
        if (comment) {
          comments.push(comment);
        }
      }

      // 获取总数
      const total = await kv.llen(commentsKey);

      return res.status(200).json({
        comments,
        total,
        storage: 'kv'
      });
    } catch (kvError) {
      console.error('❌ KV操作失败:', kvError);
      return res.status(200).json({
        comments: [],
        total: 0,
        storage: 'error',
        error: kvError.message
      });
    }
  } catch (error) {
    console.error('❌ 获取评论失败:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
