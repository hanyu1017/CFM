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
      console.log('📤 [Webhook] 開始 Webhook 流程');
      const userId = getUserId();
      const username = getUsername();

      const webhookData = {
        query,
        user_id: userId,
        username,
        chat_id: chatId,
        timestamp: timestamp.toISOString(),
      };

      console.log('📦 [Webhook] 準備發送數據:', JSON.stringify(webhookData, null, 2));

      const webhookResponse = await fetch('/api/webhook/carbon-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });

      console.log('📥 [Webhook] 收到響應，狀態:', webhookResponse.status);

      const responseData = await webhookResponse.json();
      console.log('✅ [Webhook] 響應數據:', JSON.stringify(responseData, null, 2));
    } catch (error) {
      console.error('⚠️ [Webhook] 發送失敗（不影響主流程）');
      console.error('📝 [Webhook] 錯誤:', error);
      // 不影響主流程，靜默失敗
    }
  };

  // 發送消息
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    console.log('='.repeat(60));
    console.log('🚀 [FloatingAI] 開始發送消息');
    console.log('📝 [FloatingAI] 用戶輸入:', userMessage.content);
    console.log('⏰ [FloatingAI] 時間戳:', userMessage.timestamp.toISOString());

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input; // 保存當前輸入
    setInput('');
    setLoading(true);

    // 並行發送到 webhook（不等待結果）
    console.log('🔀 [FloatingAI] 並行觸發 Webhook 發送');
    sendToWebhook(currentInput, userMessage.timestamp);

    try {
      const requestBody = {
        messages: [...messages, userMessage],
      };

      console.log('📡 [FloatingAI] 準備發送 POST 請求到 /api/ai/chat');
      console.log('📦 [FloatingAI] 請求體:', JSON.stringify(requestBody, null, 2));
      console.log('🔢 [FloatingAI] 消息總數:', requestBody.messages.length);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 [FloatingAI] 收到 HTTP 響應');
      console.log('📊 [FloatingAI] 響應狀態碼:', response.status);
      console.log('📋 [FloatingAI] 響應狀態文本:', response.statusText);
      console.log('✅ [FloatingAI] 響應是否成功 (ok):', response.ok);

      if (!response.ok) {
        console.error('❌ [FloatingAI] HTTP 響應不成功，status:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('🔄 [FloatingAI] 開始解析 JSON 響應...');
      const data = await response.json();
      console.log('✅ [FloatingAI] JSON 解析成功');
      console.log('📦 [FloatingAI] 完整響應數據:', JSON.stringify(data, null, 2));
      console.log('🔍 [FloatingAI] 響應成功標記:', data.success);
      console.log('💬 [FloatingAI] AI 回應內容長度:', data.response?.length || 0);
      console.log('📝 [FloatingAI] AI 回應前 100 字:', data.response?.substring(0, 100));

      if (!data.response) {
        console.error('❌ [FloatingAI] 警告：響應中沒有 response 字段');
        console.error('📦 [FloatingAI] 完整數據:', data);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || '抱歉，我沒有收到有效的回應。',
        timestamp: new Date(),
      };

      console.log('💡 [FloatingAI] 創建助手消息對象');
      console.log('📝 [FloatingAI] 助手消息內容:', assistantMessage.content);
      console.log('⏰ [FloatingAI] 助手消息時間:', assistantMessage.timestamp.toISOString());

      console.log('➕ [FloatingAI] 將助手消息添加到消息列表');
      setMessages(prev => [...prev, assistantMessage]);
      console.log('✅ [FloatingAI] 消息列表更新完成');

    } catch (error) {
      console.error('='.repeat(60));
      console.error('❌ [FloatingAI] 發生錯誤！');
      console.error('🔍 [FloatingAI] 錯誤類型:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('📝 [FloatingAI] 錯誤消息:', error instanceof Error ? error.message : String(error));
      console.error('📚 [FloatingAI] 錯誤堆棧:', error instanceof Error ? error.stack : '無堆棧信息');
      console.error('📦 [FloatingAI] 完整錯誤對象:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，我暫時無法回應。請稍後再試。',
        timestamp: new Date(),
      };

      console.log('⚠️ [FloatingAI] 創建錯誤消息');
      setMessages(prev => [...prev, errorMessage]);
      console.log('✅ [FloatingAI] 錯誤消息已添加');

    } finally {
      setLoading(false);
      console.log('🏁 [FloatingAI] 消息處理流程結束');
      console.log('🔄 [FloatingAI] Loading 狀態設為 false');
      console.log('='.repeat(60));
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
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
          aria-label="打開AI助手"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl transition-all z-50 ${
            isMinimized
              ? 'w-80 h-16'
              : 'w-96 h-[600px]'
          }`}
        >
          {/* 標題欄 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold">AI永續助手</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={isMinimized ? '展開' : '最小化'}
              >
                {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="關閉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 聊天內容 */}
          {!isMinimized && (
            <>
              <div className="h-[440px] overflow-y-auto p-4 space-y-4">
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
                <div className="px-4 pb-2">
                  <p className="text-xs text-gray-500 mb-2">快速問題：</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(question);
                          inputRef.current?.focus();
                        }}
                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 輸入區域 */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="輸入訊息..."
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    aria-label="發送"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
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
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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
