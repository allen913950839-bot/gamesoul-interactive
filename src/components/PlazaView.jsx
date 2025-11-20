/**
 * 广场页面组件 - 展示公开的对话
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Eye, Heart, Calendar, Loader, TrendingUp, Clock, ThumbsUp } from 'lucide-react';
import { getPublicConversations, toggleLike } from '../services/conversationService';

export default function PlazaView({ onBack, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('recent'); // recent | popular | likes
  const [likedConversations, setLikedConversations] = useState(new Set());

  useEffect(() => {
    loadConversations();
  }, [sortBy]);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicConversations(50, 0, sortBy);
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('加载广场失败:', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (e, conversationId) => {
    e.stopPropagation(); // 阻止点击事件冒泡
    
    try {
      const result = await toggleLike(conversationId);
      
      // 更新本地状态
      setLikedConversations(prev => {
        const newSet = new Set(prev);
        if (result.liked) {
          newSet.add(conversationId);
        } else {
          newSet.delete(conversationId);
        }
        return newSet;
      });

      // 更新列表中的点赞数
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, likes: result.likes }
            : conv
        )
      );
    } catch (err) {
      console.error('点赞失败:', err);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    
    const days = Math.floor(hours / 24);
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
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold">对话广场</h2>
            <p className="text-xs text-slate-400">发现其他玩家的精彩对话</p>
          </div>
        </div>

        {/* 排序选项 */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              sortBy === 'recent'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Clock size={14} />
            最新
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              sortBy === 'popular'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <TrendingUp size={14} />
            热门
          </button>
          <button
            onClick={() => setSortBy('likes')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              sortBy === 'likes'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <ThumbsUp size={14} />
            点赞
          </button>
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
            <p>暂无公开对话</p>
            <p className="text-sm mt-2">成为第一个分享对话的人吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const isLiked = likedConversations.has(conv.id);
              
              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-pink-600/50 transition-all cursor-pointer"
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{conv.title}</h3>
                      <p className="text-xs text-slate-400 mb-2">
                        {conv.gameName} · {conv.characterName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {conv.messageCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {conv.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(conv.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* 点赞按钮 */}
                    <button
                      onClick={(e) => handleLike(e, conv.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
                        isLiked
                          ? 'bg-pink-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      <Heart
                        size={14}
                        className={isLiked ? 'fill-current' : ''}
                      />
                      <span className="text-xs font-medium">{conv.likes || 0}</span>
                    </button>
                  </div>
                  
                  {conv.lastMessagePreview && (
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {conv.lastMessagePreview}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
