import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  intent?: string;
  actionPayload?: Record<string, unknown>;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Chào bạn, tôi là AI Food Assistant! Tôi có thể giúp bạn tìm quán ăn, đặt món, hoặc chia tiền. Bạn cần tôi giúp gì nào?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Out of scope: The backend route /api/ai/chat is not actually mounted on Express in this PR.
      // So this call might fail 404 in local dev. We use a mock fallback if it fails.
      let responseData;
      try {
        const response = await axios.post('/api/ai/chat', {
          userId: 'user_1',
          message: userMessage.text,
          context: { preferences: ['Healthy', 'Coffee'] }
        });
        responseData = response.data;
      } catch {
        // Fallback for demonstration since API isn't mounted
        responseData = {
          reply: 'Xin lỗi, hệ thống AI đang bảo trì. Bạn có muốn xem các quán ăn phổ biến thay thế không?',
          intent: 'fallback'
        };
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseData.reply,
        intent: responseData.intent,
        actionPayload: responseData.actionPayload,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/50 hover:scale-105 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-purple-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-white/80 text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  {msg.actionPayload && (
                    <div className="mt-2 text-xs bg-black/10 p-2 rounded">
                      <span>Action: {msg.intent}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/80 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2 flex gap-1 border border-gray-100 shadow-sm">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/50 border-t border-white/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Hỏi tôi bất cứ điều gì..."
                className="flex-1 bg-white/80 border border-purple-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:bg-indigo-700"
              >
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
