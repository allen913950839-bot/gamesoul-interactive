/**
 * 对话管理服务
 * 处理对话的保存、获取、分享等功能
 */

// 生成或获取用户ID
function getUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
}

/**
 * 保存对话
 */
export async function saveConversation(conversationData) {
  const { characterName, gameName, chatHistory, title, isPublic = false } = conversationData;

  try {
    const response = await fetch('/api/save-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterName,
        gameName,
        chatHistory,
        title,
        userId: getUserId(),
        isPublic
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save conversation');
    }

    const data = await response.json();
    console.log('✅ 对话已保存:', data.conversationId);
    
    return data;
  } catch (error) {
    console.error('❌ 保存对话失败:', error);
    throw error;
  }
}

/**
 * 获取单个对话
 */
export async function getConversation(conversationId) {
  try {
    const response = await fetch(`/api/get-conversation?id=${conversationId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get conversation');
    }

    const data = await response.json();
    return data.conversation;
  } catch (error) {
    console.error('❌ 获取对话失败:', error);
    throw error;
  }
}

/**
 * 获取用户的对话历史
 */
export async function getUserConversations(limit = 20, offset = 0) {
  try {
    const userId = getUserId();
    const response = await fetch(
      `/api/get-user-conversations?userId=${userId}&limit=${limit}&offset=${offset}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get user conversations');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ 获取用户对话历史失败:', error);
    throw error;
  }
}

/**
 * 获取广场公开对话
 */
export async function getPublicConversations(limit = 20, offset = 0, sort = 'recent') {
  try {
    const response = await fetch(
      `/api/get-public-conversations?limit=${limit}&offset=${offset}&sort=${sort}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get public conversations');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ 获取公开对话失败:', error);
    throw error;
  }
}

/**
 * 点赞/取消点赞对话
 */
export async function toggleLike(conversationId) {
  try {
    const userId = getUserId();
    const response = await fetch('/api/like-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to like conversation');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ 点赞操作失败:', error);
    throw error;
  }
}

/**
 * 生成分享文本
 */
export function generateShareText(conversation) {
  const { characterName, gameName, messageCount } = conversation;
  return `我与《${gameName}》中的${characterName}进行了${messageCount}条对话，快来看看吧！`;
}

/**
 * 复制分享链接
 */
export async function copyShareLink(conversationId) {
  const shareUrl = `${window.location.origin}/share/${conversationId}`;
  
  try {
    await navigator.clipboard.writeText(shareUrl);
    return shareUrl;
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return shareUrl;
  }
}
