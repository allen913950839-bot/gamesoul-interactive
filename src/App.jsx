import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Sparkles, ChevronRight, Star, Share2, X, Mic, Zap, Save, History, Globe, Sword, Eye, Heart } from 'lucide-react';
import { getGeminiResponse } from './services/geminiService';
import { saveConversation, copyShareLink, generateShareText } from './services/conversationService';
import SaveDialog from './components/SaveDialog';
import HistoryView from './components/HistoryView';
import PlazaView from './components/PlazaView';

// --- MOCK DATA ---
const COMPANIES = [
  {
    id: 'tencent',
    name: '腾讯游戏',
    logo: '🐧',
    games: [
      {
        id: 'hok',
        name: '王者荣耀',
        coverColor: 'from-blue-600 to-cyan-800', // 亚瑟的蓝色主题
        character: {
          name: '亚瑟',
          role: '上路战士 / 毒舌王者',
          avatarColor: 'bg-blue-500',
          avatar: '⚔️',
          avatarImage: null, // 亚瑟不使用图片，用⚔️emoji
          greeting: '又是你？上次被我吐槽还敢来？行吧，说说你今天在峡谷又闹出什么笑话了。',
          personality: '性格傲慢毒舌，喜欢吐槽玩家，但偶尔会给出中肯的建议。说话直接不留情面，用词犀利讽刺，但内心其实关心玩家的游戏体验。',
          style: 'sarcastic'
        }
      },
      {
        id: 'pubg',
        name: '和平精英',
        coverColor: 'from-slate-700 to-slate-900',
        character: {
          name: '光子鸡',
          role: '萌系战术大叔 / 温柔向导',
          avatarColor: 'bg-pink-400',
          avatar: '🐥',
          avatarImage: null, // 光子鸡不使用图片，用emoji
          greeting: '哎呀呀~小可爱来啦！(｡・ω・｡) 大叔今天心情超好呢！要不要听听我的吃鸡秘籍？保证让你萌萌哒地吃到鸡哦~ ✨',
          personality: '萌系大叔，说话温柔可爱，经常使用颜文字和emoji。虽然外表威猛但内心柔软，喜欢用"哎呀呀"、"小可爱"等可爱的称呼。战术建议专业但表达方式超萌，偶尔会害羞地说"人家也不知道啦~"。热爱分享游戏心得，对玩家充满耐心和关爱。',
          style: 'cute-uncle',
          modelProvider: 'deepseek'  // 使用DeepSeek模型
        }
      }
    ]
  },
  {
    id: 'hoyo',
    name: '米哈游',
    logo: '🌌',
    games: [] // Placeholder
  }
];

// --- COMPONENTS ---

export default function GameSoulDemo() {
  const [view, setView] = useState('landing'); // landing | chat | card | history | plaza
  const [selectedGame, setSelectedGame] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [characterMood, setCharacterMood] = useState('neutral');
  const [whipCount, setWhipCount] = useState(0);
  const [showWhip, setShowWhip] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [activeEasterEgg, setActiveEasterEgg] = useState(null); // 当前触发的彩蛋类型
  const [easterEggCounts, setEasterEggCounts] = useState({
    whip: 0,    // 🔨 战锤
    sword: 0,   // ⚔️ 圣剑
    shield: 0,  // 🛡️ 盾牌
    potion: 0,  // 🧪 药水
    gem: 0,     // 💎 宝石
    crown: 0    // 👑 皇冠
  });
  const [showCardButton, setShowCardButton] = useState(false); // 隐藏卡片按钮
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // 录音状态
  const [recognition, setRecognition] = useState(null); // 语音识别对象
  const [featuredConversations, setFeaturedConversations] = useState([]); // 精选对话
  const messagesEndRef = useRef(null);

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setView('chat');
    setWhipCount(0);
    setIsExploding(false);
    setShowCardButton(false);
    // Initial AI Message
    setChatHistory([{
      id: 1,
      sender: 'ai',
      text: game.character.greeting,
      mood: 'neutral'
    }]);
    setCharacterMood('neutral');
  };

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'zh-CN'; // 中文识别
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 识别结果:', transcript);
        setInputText(transcript);
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('❌ 语音识别错误:', event.error);
        setIsRecording(false);
        if (event.error === 'no-speech') {
          alert('没有检测到语音，请重试');
        } else if (event.error === 'not-allowed') {
          alert('请允许使用麦克风权限');
        } else {
          alert('语音识别失败: ' + event.error);
        }
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.warn('⚠️ 浏览器不支持语音识别');
    }
  }, []);

  // 加载首页精选对话
  useEffect(() => {
    const loadFeaturedConversations = async () => {
      try {
        const response = await fetch('/api/get-public-conversations?limit=6&offset=0&sort=popular');
        if (response.ok) {
          const data = await response.json();
          setFeaturedConversations(data.conversations || []);
        } else {
          // API失败时使用空数组，不影响主流程
          console.warn('精选对话加载失败，使用空状态');
          setFeaturedConversations([]);
        }
      } catch (err) {
        // 网络错误时也使用空数组
        console.warn('加载精选对话出错:', err.message);
        setFeaturedConversations([]);
      }
    };
    
    if (view === 'landing') {
      loadFeaturedConversations();
    }
  }, [view]);

  // 开始/停止录音
  const toggleRecording = () => {
    if (!recognition) {
      alert('您的浏览器不支持语音识别功能，建议使用Chrome浏览器');
      return;
    }
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
        console.log('🎤 开始录音...');
      } catch (error) {
        console.error('启动语音识别失败:', error);
        setIsRecording(false);
      }
    }
  };

  // AI Logic with Gemini Integration
  const handleSendMessage = async () => {
    if (!inputText.trim() || isExploding) return;

    const currentInput = inputText;
    const newMsg = { id: Date.now(), sender: 'user', text: currentInput };
    setChatHistory(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // 移除了"抽"的文本检测

    try {
      // 调用 AI API（根据角色选择不同的模型）
      const modelProvider = selectedGame.character.modelProvider || 'gemini';
      const { text: aiResponseText, mood } = await getGeminiResponse(
        selectedGame.character.name,
        selectedGame.character.personality,
        chatHistory,
        currentInput,
        modelProvider
      );

      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        mood: mood
      }]);
      setCharacterMood(mood);
      setIsTyping(false);

    } catch (error) {
      console.error('Error getting AI response:', error);
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: '我现在有点卡顿，稍后再说...',
        mood: 'neutral'
      }]);
      setIsTyping(false);
    }
  };


  // 彩蛋图标点击处理 - 每次点击都有动效，第三次最强烈
  const handleEasterEggClick = (eggType) => {
    if (isExploding) return;
    
    setEasterEggCounts(prev => {
      const newCount = prev[eggType] + 1;
      const newCounts = { ...prev, [eggType]: newCount };
      
      // 每次点击都触发动效
      if (newCount >= 3) {
        // 第三次：最强烈效果
        triggerEasterEgg(eggType, 'strong');
        return { ...prev, [eggType]: 0 };
      } else if (newCount === 2) {
        // 第二次：中等效果
        triggerEasterEgg(eggType, 'medium');
      } else {
        // 第一次：轻微效果
        triggerEasterEgg(eggType, 'weak');
      }
      
      return newCounts;
    });
  };
  
  // 触发彩蛋效果 - 支持不同强度
  const triggerEasterEgg = (eggType, intensity = 'weak') => {
    const eggEffects = {
      whip: {
        weak: { message: '💢 哎！轻点！', mood: 'neutral' },
        medium: { message: '💥 喂喂！别乱敲啊！', mood: 'angry' },
        strong: { 
          message: '💥啪！！！你个混蛋！我的护甲裂了！！！现在我要去铁匠铺修理了，都怪你！💢',
          recovery: '呼...修好了，下次别这么用力好吗？我还要上场打团呢！😤',
          mood: 'angry'
        }
      },
      sword: {
        weak: { message: '⚔️ 嗯？想比剑？', mood: 'neutral' },
        medium: { message: '⚔️ 哈！来切磋切磋！', mood: 'proud' },
        strong: { 
          message: '⚔️ 竟敢向我拔剑？！哈哈哈，来战个痛快！看我圣剑裁决！✨',
          recovery: '不错的剑术，但还是差了点。要多练啊小子！😏',
          mood: 'proud'
        }
      },
      shield: {
        weak: { message: '🛡️ 防御准备...', mood: 'neutral' },
        medium: { message: '🛡️ 盾牌举起！', mood: 'neutral' },
        strong: { 
          message: '🛡️ 哟？想用盾牌防我？我亚瑟才是峡谷第一坦克！给你看看什么叫真正的防御！',
          recovery: '盾牌碰撞的感觉还不错，算你有点本事。继续加油！💪',
          mood: 'neutral'
        }
      },
      potion: {
        weak: { message: '🧪 这是什么药？', mood: 'neutral' },
        medium: { message: '🧪 咕噜...味道怪怪的！', mood: 'sad' },
        strong: { 
          message: '🧪 咕噜咕噜~这药水...什么味道？！呸呸呸！是毒药吧？！你想害死我？！😵',
          recovery: '好了好了，我没事...不过你这破药水真难喝，下次带点好的来！🤢',
          mood: 'sad'
        }
      },
      gem: {
        weak: { message: '💎 嗯？宝石？', mood: 'neutral' },
        medium: { message: '💎 哦哦！闪闪发光！', mood: 'happy' },
        strong: { 
          message: '💎 闪闪发光的宝石？！哼，你以为我会为了这点小钱出卖原则吗？...咳咳，我先收着！😎',
          recovery: '好吧，宝石确实挺漂亮的，我就勉为其难收下了。你还挺有眼光嘛！✨',
          mood: 'happy'
        }
      },
      crown: {
        weak: { message: '👑 这是...皇冠？', mood: 'neutral' },
        medium: { message: '👑 王者之证！我配得上！', mood: 'happy' },
        strong: { 
          message: '👑 皇冠？！这是...王者之证？！我亚瑟配得上这份荣耀！感谢你的认可！🌟',
          recovery: '戴着皇冠的感觉真不错！看来你也认可我的实力了，哈哈哈！😄',
          mood: 'happy'
        }
      }
    };
    
    const effect = eggEffects[eggType]?.[intensity] || eggEffects.whip.weak;
    
    // 根据强度设置不同的动画时长
    const isStrongEffect = intensity === 'strong';
    
    setActiveEasterEgg(eggType + '_' + intensity); // 设置当前彩蛋类型+强度
    
    if (isStrongEffect) {
      // 强效果：完整流程
      setIsExploding(true);
      
      setTimeout(() => {
        setChatHistory(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: effect.message,
          mood: effect.mood
        }]);
        
        // 3秒后恢复
        setTimeout(() => {
          setIsExploding(false);
          setActiveEasterEgg(null);
          setChatHistory(prev => [...prev, {
            id: Date.now() + 2,
            sender: 'ai',
            text: effect.recovery,
            mood: effect.mood
          }]);
          setCharacterMood(effect.mood);
        }, 3000);
      }, 1000);
    } else {
      // 轻/中效果：快速反馈
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: effect.message,
        mood: effect.mood
      }]);
      setCharacterMood(effect.mood);
      
      // 0.5秒后清除动画
      setTimeout(() => {
        setActiveEasterEgg(null);
      }, 500);
    }
  };

  // 鞭子按钮点击处理
  const handleWhipClick = () => {
    handleEasterEggClick('whip');
  };

  const generateCard = () => {
    // Analyze the conversation to create a summary (Mocked)
    const userMessages = chatHistory.filter(m => m.sender === 'user').map(m => m.text).join(' ');
    const isPositive = userMessages.includes("好") || userMessages.includes("赢") || userMessages.includes("棒");
    
    setReviewSummary({
      rating: isPositive ? 5 : 2,
      tags: isPositive ? ['操作丝滑', '皮肤好看'] : ['匹配机制迷', '队友太坑'],
      quote: userMessages.substring(0, 40) + (userMessages.length > 40 ? '...' : ''),
      mood: isPositive ? 'Happy' : 'Angry'
    });
    setView('card');
  };

  // 保存对话
  const handleSaveConversation = async (isPublic = false) => {
    if (chatHistory.length === 0) {
      alert('对话为空，无法保存！');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const result = await saveConversation({
        characterName: selectedGame.character.name,
        gameName: selectedGame.name,
        chatHistory,
        title: `与${selectedGame.character.name}的对话`,
        isPublic
      });

      setShareUrl(result.shareUrl);
      setSaveSuccess(true);
      setShowSaveDialog(false);

      // 3秒后隐藏成功提示
      setTimeout(() => setSaveSuccess(false), 3000);

      console.log('✅ 对话已保存:', result.conversationId);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请稍后重试！');
    } finally {
      setIsSaving(false);
    }
  };

  // 分享对话
  const handleShareConversation = async () => {
    try {
      const url = await copyShareLink(shareUrl.split('/').pop());
      alert('分享链接已复制到剪贴板！\n' + url);
    } catch (error) {
      console.error('分享失败:', error);
      alert('分享失败，请稍后重试！');
    }
  };

  // Remix对话 - 基于已有对话继续聊天
  const handleRemixConversation = (remixData) => {
    const { gameName, characterName, chatHistory: existingHistory } = remixData;
    
    // 找到对应的游戏
    const game = COMPANIES.flatMap(c => c.games).find(g => g.name === gameName);
    if (!game) {
      alert('未找到对应的游戏');
      return;
    }
    
    // 设置游戏和对话历史
    setSelectedGame(game);
    setChatHistory(existingHistory || []);
    setView('chat');
    setCharacterMood('neutral');
    
    // 添加提示消息
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        text: `欢迎回来！我们继续之前的对话吧~ 😊`,
        mood: 'happy'
      }]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 text-slate-100 font-sans selection:bg-pink-500 selection:text-white overflow-hidden relative">
      {/* 背景装饰 - 动态光效 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      
      <div className="max-w-md mx-auto min-h-screen bg-slate-900/80 backdrop-blur-sm shadow-2xl relative border-x border-slate-800">
        
        {/* Header */}
        <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">GS</div>
            <span className="font-bold tracking-wider">GAMESOUL</span>
          </div>
          {view !== 'landing' && (
            <button onClick={() => setView('landing')} className="text-xs text-slate-400 hover:text-white">
              退出
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          
          {/* --- VIEW 1: LANDING PAGE --- */}
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="relative"
            >
              {/* Hero区域 - 添加角色背景 */}
              <div className="relative h-64 overflow-hidden">
                {/* 渐变背景 */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-slate-900/60 to-slate-900"></div>
                
                {/* 角色剪影背景 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="relative w-full h-full">
                    {/* 亚瑟剪影 - 左侧 */}
                    <div className="absolute left-0 bottom-0 w-40 h-48 bg-gradient-to-t from-blue-600/40 to-transparent transform -skew-x-6">
                      <Sword className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-16 text-blue-400/60" />
                    </div>
                    {/* 光子鸡剪影 - 右侧 */}
                    <div className="absolute right-0 bottom-0 w-40 h-48 bg-gradient-to-t from-pink-600/40 to-transparent transform skew-x-6">
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-5xl">🐥</div>
                    </div>
                  </div>
                </div>
                
                {/* 标题区域 */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-cyan-300 to-pink-400 bg-clip-text text-transparent">
                      选择你的战场
                    </h1>
                    <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
                      <Sparkles size={14} className="text-cyan-400" />
                      与游戏角色开启沉浸式对话
                      <Sparkles size={14} className="text-pink-400" />
                    </p>
                  </motion.div>
                </div>
                
                {/* 底部渐变遮罩 */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900 to-transparent"></div>
              </div>

              {/* 游戏选择区域 */}
              <div className="p-6 space-y-8 -mt-8">
                {COMPANIES.filter(company => company.games.length > 0).map(company => (
                  <div key={company.id} className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <span className="text-2xl">{company.logo}</span>
                    <span>{company.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {company.games.map(game => (
                      <motion.div
                        key={game.id}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectGame(game)}
                        className={`cursor-pointer h-44 rounded-2xl bg-gradient-to-br ${game.coverColor} p-4 flex flex-col justify-end relative overflow-hidden group shadow-lg hover:shadow-2xl transition-all`}
                      >
                         {/* 背景纹理 */}
                         <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                         
                         {/* 角色图标/剪影 */}
                         {game.character.avatarImage ? (
                           <div className="absolute right-2 top-2 w-24 h-24 opacity-30 group-hover:opacity-50 transition-opacity">
                             <img 
                               src={game.character.avatarImage} 
                               alt={game.character.name}
                               className="w-full h-full object-contain drop-shadow-2xl"
                             />
                           </div>
                         ) : (
                           <div className="absolute right-2 top-2 text-6xl opacity-30 group-hover:opacity-50 transition-opacity filter drop-shadow-lg">
                             {game.character.avatar}
                           </div>
                         )}
                         
                         {/* 装饰元素 */}
                         <div className="absolute -right-2 -top-2 text-4xl opacity-20 rotate-12 group-hover:rotate-0 transition-transform">
                           <Sparkles className="text-yellow-300" />
                         </div>
                         
                         {/* 游戏信息 */}
                         <div className="relative z-10 space-y-1">
                           <h3 className="font-bold text-lg drop-shadow-lg">{game.name}</h3>
                           <div className="flex items-center gap-1.5 text-xs text-white/90 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 w-fit">
                              <MessageCircle size={12} />
                              <span>召唤{game.character.name}</span>
                           </div>
                         </div>
                         
                         {/* 悬停光效 */}
                         <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}

              {/* 精选广场模块 */}
              <div className="space-y-4 pt-4 border-t border-slate-700/50 bg-gradient-to-b from-slate-900/50 to-slate-900 rounded-2xl p-4 -mx-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <Globe size={20} className="text-cyan-400 animate-pulse" />
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">精选广场</span>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">发现优秀作品</span>
                  </div>
                  <button
                    onClick={() => setView('plaza')}
                    className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1 hover:gap-2 transition-all group"
                  >
                    查看全部
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* 精选对话列表 */}
                {featuredConversations && featuredConversations.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {featuredConversations.slice(0, 3).map((conv, idx) => (
                      <motion.div
                        key={conv?.id || `featured-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        onClick={() => {
                          setView('plaza');
                        }}
                        className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur rounded-xl p-4 border border-slate-700/50 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-lg hover:shadow-cyan-500/10"
                      >
                        <div className="flex items-start gap-3">
                          {/* 游戏图标 */}
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center flex-shrink-0 text-2xl shadow-lg group-hover:scale-110 transition-transform">
                            🎮
                          </div>
                          
                          {/* 对话信息 */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1 group-hover:text-cyan-400 transition-colors">
                              {conv?.title || '精彩对话'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {conv?.gameName || '游戏'} · {conv?.characterName || '角色'}
                            </p>
                            
                            {/* 数据指标 */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                                <Eye size={12} />
                                {conv?.views || 0}
                              </span>
                              <span className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                                <Heart size={12} className="text-pink-500" />
                                {conv?.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle size={12} />
                                {conv?.messageCount || 0}条
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 悬停提示 */}
                        <div className="mt-3 pt-3 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-cyan-400 flex items-center gap-1">
                            <Sparkles size={12} />
                            点击查看完整对话并Remix
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Globe size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">暂无精选对话</p>
                    <p className="text-xs mt-1">快去创作第一个精彩对话吧！</p>
                  </div>
                )}
              </div>
            </div>
            </motion.div>
          )}

          {/* --- VIEW 2: CHAT INTERFACE --- */}
          {view === 'chat' && selectedGame && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col h-[calc(100vh-64px)]"
            >
              {/* Character Avatar Background - 虚拟形象 */}
              <div className="relative h-64 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden border-b border-slate-700">
                {/* 背景装饰 */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-cyan-500 rounded-full blur-3xl"></div>
                </div>

                {/* 角色形象 */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center">
                  <motion.div
                    animate={(() => {
                      const eggType = activeEasterEgg?.split('_')[0];
                      const intensity = activeEasterEgg?.split('_')[1] || 'weak';
                      
                      // 根据强度调整动画幅度
                      const getScale = (weak, medium, strong) => {
                        if (intensity === 'weak') return weak;
                        if (intensity === 'medium') return medium;
                        return strong;
                      };
                      
                      return {
                        // 战锤：震动效果
                        scale: eggType === 'whip' ? 
                               (intensity === 'weak' ? [1, 1.05, 1] :
                                intensity === 'medium' ? [1, 1.1, 0.95, 1.05, 1] :
                                [1, 1.2, 0.9, 1.1, 0]) :
                               characterMood === 'angry' ? [1, 1.1, 1] : 1,
                        
                        // 圣剑：战斗动作
                        x: eggType === 'sword' ? 
                           (intensity === 'weak' ? [-5, 5, 0] :
                            intensity === 'medium' ? [-10, 10, -5, 5, 0] :
                            [-20, 20, -15, 15, -10, 10, 0]) : 0,
                        y: eggType === 'sword' ? 
                           (intensity === 'weak' ? [-5, 0] :
                            intensity === 'medium' ? [-15, -10, 0] :
                            [-30, -40, -30, -20, 0]) :
                           characterMood === 'happy' ? [0, -10, 0] : 0,
                        
                        // 盾牌/药水/宝石/皇冠的旋转
                        rotate: eggType === 'shield' ? 0 :
                                eggType === 'potion' ? 
                                (intensity === 'weak' ? [0, -3, 3, 0] :
                                 intensity === 'medium' ? [0, -7, 7, -5, 5, 0] :
                                 [0, -10, 10, -15, 15, 0]) :
                                eggType === 'gem' ? 
                                (intensity === 'weak' ? [0, 90] :
                                 intensity === 'medium' ? [0, 180] :
                                 [0, 360]) :
                                eggType === 'crown' ? 0 :
                                characterMood === 'sarcastic' ? [0, -5, 5, 0] : 0,
                        
                        // 盾牌：闪烁防御
                        opacity: eggType === 'shield' ? 
                                 (intensity === 'weak' ? [1, 0.7, 1] :
                                  intensity === 'medium' ? [1, 0.5, 1] :
                                  [1, 0.3, 1]) : 1
                      };
                    })()}
                    transition={(() => {
                      const eggType = activeEasterEgg?.split('_')[0];
                      const intensity = activeEasterEgg?.split('_')[1] || 'weak';
                      
                      return {
                        duration: intensity === 'weak' ? 0.3 :
                                 intensity === 'medium' ? 0.6 :
                                 eggType === 'whip' ? 1.0 :
                                 eggType === 'sword' ? 1.2 :
                                 eggType === 'shield' ? 0.8 :
                                 eggType === 'potion' ? 1.5 :
                                 eggType === 'gem' ? 1.0 :
                                 eggType === 'crown' ? 1.0 : 0.5,
                        repeat: !isExploding && (characterMood === 'angry' || characterMood === 'happy') ? Infinity : 0,
                        repeatDelay: 2,
                        ease: eggType === 'whip' ? [0.6, 0.01, 0.05, 0.95] :
                              eggType === 'sword' ? 'easeInOut' :
                              eggType === 'potion' ? [0.68, -0.55, 0.27, 1.55] :
                              'easeOut'
                      };
                    })()}
                    className={`mb-4`}
                  >
                    {selectedGame.character.avatarImage ? (
                      <img 
                        src={selectedGame.character.avatarImage} 
                        alt={selectedGame.character.name}
                        className={`w-40 h-40 rounded-full object-cover border-4 shadow-2xl ${
                          activeEasterEgg === 'crown' ? 'border-yellow-400 shadow-yellow-500/50' :
                          activeEasterEgg === 'gem' ? 'border-pink-400 shadow-pink-500/50' :
                          activeEasterEgg === 'shield' ? 'border-blue-500 shadow-blue-500/50' :
                          'border-yellow-500/30'
                        }`}
                      />
                    ) : (
                      <span className="text-8xl">{selectedGame.character.avatar || '⚔️'}</span>
                    )}
                  </motion.div>

                  {/* 各种彩蛋特效 */}
                  <AnimatePresence>
                    {/* 战锤：护甲碎片飞溅 */}
                    {activeEasterEgg?.startsWith('whip') && (
                      <>
                        <motion.div
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{ scale: 3, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute text-8xl"
                        >
                          💥
                        </motion.div>
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
                            animate={{ 
                              scale: [1, 0.5, 0],
                              x: [0, (Math.cos(i * 60 * Math.PI / 180) * 100)],
                              y: [0, (Math.sin(i * 60 * Math.PI / 180) * 100)],
                              opacity: [1, 0.5, 0],
                              rotate: [0, 360]
                            }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="absolute text-3xl"
                          >
                            💢
                          </motion.div>
                        ))}
                      </>
                    )}
                    
                    {/* 圣剑：剑气特效 */}
                    {activeEasterEgg?.startsWith('sword') && (
                      <>
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: -100, opacity: 0, scale: 0.5 }}
                            animate={{ x: 100, opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                            transition={{ duration: 0.6, delay }}
                            className="absolute text-6xl"
                          >
                            ⚔️
                          </motion.div>
                        ))}
                      </>
                    )}
                    
                    {/* 盾牌：防御光环 */}
                    {activeEasterEgg?.startsWith('shield') && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: [0.8, 1.5, 1.8],
                          opacity: [0, 0.8, 0]
                        }}
                        transition={{ duration: 0.8, repeat: 3 }}
                        className="absolute w-60 h-60 rounded-full border-4 border-blue-400"
                      />
                    )}
                    
                    {/* 药水：中毒气泡 */}
                    {activeEasterEgg?.startsWith('potion') && (
                      <>
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ y: 50, x: (i - 4) * 15, opacity: 0.8, scale: 0.5 }}
                            animate={{ 
                              y: [-50, -100, -150],
                              opacity: [0.8, 0.6, 0],
                              scale: [0.5, 1, 1.5]
                            }}
                            transition={{ 
                              duration: 1.5, 
                              delay: i * 0.1,
                              repeat: 1
                            }}
                            className="absolute text-4xl"
                          >
                            🟢
                          </motion.div>
                        ))}
                      </>
                    )}
                    
                    {/* 宝石：金币飞舞 */}
                    {activeEasterEgg?.startsWith('gem') && (
                      <>
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ 
                              scale: 0, 
                              x: 0, 
                              y: 0, 
                              opacity: 1,
                              rotate: 0
                            }}
                            animate={{ 
                              scale: [0, 1.5, 0],
                              x: [(i % 3 - 1) * 60],
                              y: [0, -40 - Math.floor(i / 3) * 30, -80],
                              opacity: [0, 1, 0],
                              rotate: [0, 360 * (i % 2 ? 1 : -1)]
                            }}
                            transition={{ 
                              duration: 1, 
                              delay: i * 0.08,
                              ease: 'easeOut'
                            }}
                            className="absolute text-4xl"
                          >
                            💎
                          </motion.div>
                        ))}
                      </>
                    )}
                    
                    {/* 皇冠：光芒四射 */}
                    {activeEasterEgg?.startsWith('crown') && (
                      <>
                        <motion.div
                          initial={{ scale: 0, opacity: 0, y: -100 }}
                          animate={{ 
                            scale: [0, 1.2, 1],
                            opacity: [0, 1, 1],
                            y: [-100, -200, -180]
                          }}
                          transition={{ duration: 1 }}
                          className="absolute text-8xl"
                        >
                          👑
                        </motion.div>
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ 
                              scale: [0, 2, 0],
                              opacity: [1, 0.6, 0],
                              x: [0, Math.cos(i * 45 * Math.PI / 180) * 150],
                              y: [0, Math.sin(i * 45 * Math.PI / 180) * 150]
                            }}
                            transition={{ duration: 1, delay: i * 0.05 }}
                            className="absolute text-4xl"
                          >
                            ✨
                          </motion.div>
                        ))}
                      </>
                    )}
                  </AnimatePresence>

                  {/* 原有的爆炸效果（通用） */}
                  {isExploding && !activeEasterEgg && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 3, opacity: 0 }}
                      className="absolute text-8xl"
                    >
                      💥
                    </motion.div>
                  )}

                  {/* 鞭痕效果 */}
                  <AnimatePresence>
                    {showWhip && (
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-20 top-1/2 text-6xl"
                      >
                        💢
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 角色状态栏 */}
                  <div className="text-center">
                    <h2 className="font-bold text-xl text-white mb-1">{selectedGame.character.name}</h2>
                    <p className="text-xs text-cyan-400 flex items-center justify-center gap-1">
                      <Sparkles size={10} />
                      {characterMood === 'angry' && '😤 有点生气'}
                      {characterMood === 'happy' && '😊 心情不错'}
                      {characterMood === 'sad' && '😔 感到失望'}
                      {characterMood === 'sarcastic' && '😏 讽刺模式'}
                      {characterMood === 'proud' && '😎 略有赞许'}
                      {characterMood === 'neutral' && '😐 ' + selectedGame.character.role}
                      {characterMood === 'exploded' && '💥 已爆炸'}
                    </p>
                    {whipCount > 0 && whipCount < 3 && (
                      <p className="text-xs text-red-400 mt-1">
                        ⚠️ 被抽了 {whipCount} 次 ({3 - whipCount} 次后爆炸)
                      </p>
                    )}
                    
                    {/* 功能按钮 */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        disabled={chatHistory.length === 0}
                        className="px-3 py-1.5 rounded-full bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Save size={12} /> 保存对话
                      </button>
                      <button
                        onClick={() => setView('history')}
                        className="px-3 py-1.5 rounded-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <History size={12} /> 历史记录
                      </button>
                      <button
                        onClick={() => setView('plaza')}
                        className="px-3 py-1.5 rounded-full bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Globe size={12} /> 广场
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {chatHistory.map(msg => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                      msg.sender === 'user' 
                        ? 'bg-pink-600 text-white rounded-tr-sm' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>


              {/* Input Area */}
              <div className="p-4 bg-slate-800 border-t border-slate-700 space-y-3">
                {/* 王者荣耀彩蛋图标栏 */}
                {selectedGame.id === 'hok' && !isExploding && (
                  <div className="flex justify-center gap-3 pb-2 border-b border-slate-700/50">
                    {[
                      { 
                        type: 'whip', 
                        icon: '🔨', 
                        label: '战锤',
                        animation: {
                          whileHover: { scale: 1.15, rotate: [0, -20, 20, 0], transition: { duration: 0.5 } },
                          whileTap: { scale: 0.9, rotate: 360 }
                        }
                      },
                      { 
                        type: 'sword', 
                        icon: '⚔️', 
                        label: '圣剑',
                        animation: {
                          whileHover: { scale: 1.2, y: -8, rotate: [0, 10, -10, 0], transition: { duration: 0.4 } },
                          whileTap: { scale: 0.85, rotate: 180 }
                        }
                      },
                      { 
                        type: 'shield', 
                        icon: '🛡️', 
                        label: '盾牌',
                        animation: {
                          whileHover: { scale: [1, 1.15, 1.1], transition: { duration: 0.3, repeat: Infinity, repeatType: 'reverse' } },
                          whileTap: { scale: 0.9, x: [-5, 5, -5, 0] }
                        }
                      },
                      { 
                        type: 'potion', 
                        icon: '🧪', 
                        label: '药水',
                        animation: {
                          whileHover: { scale: 1.15, y: [-2, -6, -2], rotate: [0, -15, 15, 0], transition: { duration: 0.6, repeat: Infinity } },
                          whileTap: { scale: 0.9, rotate: [0, 20, -20, 0] }
                        }
                      },
                      { 
                        type: 'gem', 
                        icon: '💎', 
                        label: '宝石',
                        animation: {
                          whileHover: { scale: 1.2, rotate: 360, transition: { duration: 0.8, repeat: Infinity, ease: "linear" } },
                          whileTap: { scale: 0.85 }
                        }
                      },
                      { 
                        type: 'crown', 
                        icon: '👑', 
                        label: '皇冠',
                        animation: {
                          whileHover: { scale: 1.15, y: [-4, -8, -4], rotate: [-5, 5, -5, 0], transition: { duration: 0.5, repeat: Infinity } },
                          whileTap: { scale: 0.9, y: 5 }
                        }
                      }
                    ].map(egg => (
                      <motion.button
                        key={egg.type}
                        onClick={() => handleEasterEggClick(egg.type)}
                        whileHover={egg.animation.whileHover}
                        whileTap={egg.animation.whileTap}
                        className="relative w-12 h-12 rounded-lg bg-slate-700/50 hover:bg-slate-600/70 flex items-center justify-center text-2xl transition-all border border-slate-600/30 hover:border-yellow-500/50"
                        title={egg.label}
                      >
                        <span>{egg.icon}</span>
                        {easterEggCounts[egg.type] > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                          >
                            {easterEggCounts[egg.type]}
                          </motion.span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 items-center">
                  <motion.button 
                    onClick={toggleRecording}
                    disabled={isExploding}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-full transition-all ${
                      isRecording 
                        ? 'bg-red-600 text-white animate-pulse' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isRecording ? '点击停止录音' : '点击开始语音输入'}
                  >
                    <Mic size={20} />
                  </motion.button>
                  <div className="flex-1 bg-slate-700 rounded-full flex items-center px-4 py-1">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey && chatHistory.filter(m => m.sender === 'user').length >= 8) {
                          // Shift + Enter 隐藏快捷键生成卡片
                          generateCard();
                        } else if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      placeholder={`和${selectedGame.character.name}聊聊你的游戏体验...`}
                      className="flex-1 bg-transparent border-none outline-none text-sm h-8 placeholder:text-slate-400"
                      disabled={isExploding}
                    />
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isExploding}
                    className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
                
                {/* 隐藏提示 */}
                <div className="text-center text-[10px] text-slate-500 mt-2 space-y-1">
                  {isRecording && (
                    <p className="text-red-400 animate-pulse">🎤 正在录音中...请说话</p>
                  )}
                  {!isExploding && selectedGame.id === 'hok' && !isRecording && (
                    <p className="text-cyan-400">💡 彩蛋提示: 点击上方任意图标3次试试...</p>
                  )}
                  {chatHistory.filter(m => m.sender === 'user').length >= 8 && !isRecording && (
                    <p className="text-purple-400 animate-pulse">✨ 按 Shift+Enter 生成评价卡片</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* --- VIEW 3: REVIEW CARD (RESULT) --- */}
          {view === 'card' && reviewSummary && selectedGame && (
             <motion.div
             key="card"
             initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
             animate={{ opacity: 1, scale: 1, rotateY: 0 }}
             transition={{ type: 'spring', damping: 20 }}
             className="flex flex-col items-center justify-center h-full p-6"
           >
             <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur border border-slate-600 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(236,72,153,0.3)] relative">
                {/* Card Header */}
                <div className={`h-32 bg-gradient-to-br ${selectedGame.coverColor} relative p-6 flex flex-col justify-end`}>
                  <div className={`absolute top-4 right-4 w-16 h-16 rounded-full ${selectedGame.character.avatarColor} border-4 border-slate-800 flex items-center justify-center text-3xl shadow-lg`}>
                    🦊
                  </div>
                  <h2 className="text-2xl font-bold text-white relative z-10">{selectedGame.name}</h2>
                  <p className="text-white/80 text-xs font-mono tracking-widest relative z-10">SOUL CONTRACT</p>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-6">
                  
                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={24} 
                        className={i < reviewSummary.rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-700 text-slate-700"} 
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 text-4xl text-slate-600 font-serif">"</div>
                    <p className="text-slate-300 italic relative z-10 pl-4">
                      {reviewSummary.quote}
                    </p>
                    <div className="absolute -bottom-4 -right-0 text-4xl text-slate-600 font-serif rotate-180">"</div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {reviewSummary.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-slate-700 text-xs text-pink-300 border border-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* AI Stamp */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                    <div className="text-xs text-slate-500">
                      认证角色<br/>
                      <span className="text-slate-300 font-bold">{selectedGame.character.name}</span>
                    </div>
                    <div className="ml-auto border-2 border-pink-500 text-pink-500 px-2 py-1 text-xs font-bold uppercase -rotate-12 opacity-80">
                       {reviewSummary.mood === 'Happy' ? 'Highly Rec' : 'Needs Fix'}
                    </div>
                  </div>

                  {/* 隐藏点赞功能 */}

                </div>
             </div>

             <div className="mt-8 flex gap-4">
               <button 
                onClick={() => { setView('landing'); setChatHistory([]); }}
                className="px-6 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
               >
                 返回大厅
               </button>
               <button className="px-6 py-2 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium shadow-lg shadow-pink-600/30 flex items-center gap-2">
                 <Share2 size={16} /> 分享契约
               </button>
             </div>

           </motion.div>
          )}

          {/* 历史记录视图 */}
          {view === 'history' && (
            <HistoryView
              key="history"
              onBack={() => setView('chat')}
              onSelectConversation={(id) => {
                // TODO: 加载并显示对话详情
                console.log('查看对话:', id);
              }}
            />
          )}

          {/* 广场视图 */}
          {view === 'plaza' && (
            <PlazaView
              key="plaza"
              onBack={() => setView('chat')}
              onSelectConversation={(id) => {
                console.log('查看对话:', id);
              }}
              onRemix={handleRemixConversation}
            />
          )}

        </AnimatePresence>

        {/* 保存对话弹窗 */}
        <SaveDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          onSave={handleSaveConversation}
          isSaving={isSaving}
        />

        {/* 保存成功提示 */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
            >
              <Save size={16} />
              <span>保存成功！</span>
              {shareUrl && (
                <button
                  onClick={handleShareConversation}
                  className="ml-2 underline hover:no-underline"
                >
                  复制分享链接
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
// Force rebuild 2025年11月20日 星期四 17时04分45秒 CST
