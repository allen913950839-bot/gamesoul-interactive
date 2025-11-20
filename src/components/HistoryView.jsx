/**
 * 历史记录页面组件
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Eye, Calendar, Loader, Trash2, ExternalLink } from 'lucide-react';
import { getUserConversations } from '../services/conversationService';

export default function HistoryView({ onBack, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserConversations(50, 0);
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('加载历史失败:', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-[calc(100vh-64px)] bg-slate-900"
    >
      {/* 头部 */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold">历史记录</h2>
            <p className="text-xs text-slate-400">
              {conversations.length > 0 ? `共${conversations.length}条对话` : '暂无记录'}
            </p>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader className="animate-spin mb-4" size={32} />
            <p>加载中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400">
            <p>{error}</p>
            <button
              onClick={loadConversations}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              重试
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageCircle size={48} className="mb-4 opacity-30" />
            <p>还没有保存的对话</p>
            <p className="text-sm mt-2">开始与AI角色聊天并保存吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-cyan-600/50 transition-all cursor-pointer"
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{conv.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} />
                        {conv.messageCount || 0}条消息
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(conv.createdAt)}
                      </span>
                      {conv.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {conv.views}次查看
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-slate-500" />
                </div>
                
                {conv.lastMessagePreview && (
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {conv.lastMessagePreview}
                  </p>
                )}

                {conv.isPublic && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-pink-600/20 text-pink-400 text-xs rounded-full">
                    已公开
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
