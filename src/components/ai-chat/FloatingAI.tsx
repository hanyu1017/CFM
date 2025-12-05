// src/components/ai-chat/FloatingAI.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 生成唯一 ID
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 獲取或創建用戶 ID
function getUserId() {
  let userId = localStorage.getItem('carbon_user_id');
  if (!userId) {
    userId = generateId();
    localStorage.setItem('carbon_user_id', userId);
  }
  return userId;
}

// 獲取或創建用戶名
function getUsername() {
  let username = localStorage.getItem('carbon_username');
  if (!username) {
    username = `User_${Math.random().toString(36).substr(2, 6)}`;
    localStorage.setItem('carbon_username', username);
  }
  return username;
}

export default function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '您好！我是您的永續管理AI助手。我可以幫您查詢碳排放數據、分析趨勢、提供減排建議，或回答任何關於永續發展的問題。有什麼我可以幫您的嗎？',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId] = useState(() => generateId()); // 每個聊天會話的唯一 ID
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自動滾動到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 當聊天窗口打開時，聚焦輸入框
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // 發送消息到 n8n webhook（不阻塞主流程）
  const sendToWebhook = async (query: string, timestamp: Date) => {
    try {
      const userId = getUserId();
      const username = getUsername();

      console.log('📤 準備發送 Webhook:', {
        query,
        user_id: userId,
        username,
        chat_id: chatId,
        timestamp: timestamp.toISOString(),
      });

      const webhookResponse = await fetch('/api/webhook/carbon-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          user_id: userId,
          username,
          chat_id: chatId,
          timestamp: timestamp.toISOString(),
        }),
      });

      const webhookData = await webhookResponse.json();
      console.log('✅ Webhook 發送成功，響應:', webhookData);
    } catch (error) {
      console.error('⚠️ Webhook 發送失敗:', error);
      // 不影響主流程，靜默失敗
    }
  };

  // 發送消息
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    console.log('🚀 [FloatingAI] 開始發送訊息');
    console.log('📝 [FloatingAI] 使用者輸入:', input);

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 準備發送的 payload
      const requestPayload = {
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };

      console.log('📤 [FloatingAI] 準備發送 POST 請求到 /api/ai/chat');
      console.log('📦 [FloatingAI] 請求 payload:', JSON.stringify(requestPayload, null, 2));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      console.log('📨 [FloatingAI] 收到回應狀態:', response.status, response.statusText);

      if (!response.ok) {
        console.error('❌ [FloatingAI] HTTP 錯誤! 狀態:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 [FloatingAI] 完整回應資料:', JSON.stringify(data, null, 2));
      console.log('✅ [FloatingAI] 成功標記:', data.success);
      console.log('💬 [FloatingAI] AI 回應內容:', data.response);
      console.log('📊 [FloatingAI] 額外資料 (data):', data.data);

      // 如果有 debug 信息，也顯示出來
      if (data.debug) {
        console.log('🐛 [FloatingAI] Debug 信息:', data.debug);
      }

      // 按照 Telegram bot 邏輯處理回應
      if (data.success) {
        // 確保有回應內容
        const responseContent = data.response || data.error || '已收到回應，但內容為空';

        console.log('✨ [FloatingAI] 最終回應內容:', responseContent);

        const assistantMessage: Message = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
        };

        console.log('✨ [FloatingAI] 建立 AI 訊息物件:', assistantMessage);
        setMessages(prev => [...prev, assistantMessage]);
        console.log('✅ [FloatingAI] AI 訊息已加入對話');
      } else {
        // 處理失敗情況
        const errorContent = data.error || data.response || '查詢失敗，請稍後再試';
        console.error('❌ [FloatingAI] 收到失敗回應:', errorContent);

        const errorMessage: Message = {
          role: 'assistant',
          content: `❌ ${errorContent}`,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
        console.log('⚠️ [FloatingAI] 已顯示錯誤訊息給使用者');
      }
    } catch (error) {
      console.error('❌ [FloatingAI] AI 聊天錯誤 - 詳細資訊:');
      console.error('錯誤類型:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('錯誤訊息:', error instanceof Error ? error.message : error);
      console.error('完整錯誤:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，我暫時無法回應。請稍後再試。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      console.log('⚠️ [FloatingAI] 已顯示錯誤訊息給使用者');
    } finally {
      setLoading(false);
      console.log('🏁 [FloatingAI] 請求處理完成，loading 狀態已重置');
    }
  };

  // 處理鍵盤事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 快速問題建議
  const quickQuestions = [
    '本月碳排放量是多少？',
    '如何降低能源消耗？',
    '生成上月永續報告',
    '查看減排目標進度',
  ];

  return (
    <>
      {/* 浮動按鈕 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
          aria-label="打開AI助手"
        >
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div
          className={`fixed bg-white rounded-2xl shadow-2xl transition-all z-50 flex flex-col
            ${isMinimized
              ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-72 sm:w-80 h-16'
              : 'inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:max-h-[90vh] max-h-[calc(100vh-2rem)]'
            }`}
        >
          {/* 標題欄 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-sm sm:text-base">AI永續助手</h3>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                aria-label={isMinimized ? '展開' : '最小化'}
              >
                {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                aria-label="關閉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 聊天內容 */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">AI思考中...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 快速問題（僅在對話開始時顯示） */}
              {messages.length === 1 && (
                <div className="px-3 sm:px-4 pb-2 flex-shrink-0">
                  <p className="text-xs text-gray-500 mb-2">快速問題：</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(question);
                          inputRef.current?.focus();
                        }}
                        className="text-xs px-2.5 sm:px-3 py-2 sm:py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors min-h-[44px] sm:min-h-0 flex items-center"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 輸入區域 */}
              <div className="border-t border-gray-200 p-3 sm:p-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="輸入訊息..."
                    disabled={loading}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[44px]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                    className="p-2.5 sm:p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="發送"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center hidden sm:block">
                  按 Enter 發送 • Shift + Enter 換行
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

// 聊天消息組件
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}
