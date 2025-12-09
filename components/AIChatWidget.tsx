import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MockService } from '../services/mockService';
import { ChatMessage } from '../types';

interface AIChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "👋 Chào bạn! Tôi là Aivira. Bạn đang tìm kiếm gì hôm nay?", timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [isOpen]);

  // Auto scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await MockService.generateAIResponse(userMsg.text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-6 w-[350px] h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-[60] overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="bg-primary-600 p-3 flex items-center justify-between text-white shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm leading-tight">Trợ lý Aivira</h3>
                <span className="text-[10px] text-primary-100 opacity-90">Thường phản hồi ngay lập tức</span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              aria-label="Đóng chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 text-sm rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-sm' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                 <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                   <Bot className="w-3 h-3 text-white" />
                 </div>
                 <div className="bg-white px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100">
                   <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                 </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-slate-100 text-sm rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all border border-transparent focus:border-primary-200"
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-1 p-1.5 text-primary-600 hover:text-primary-700 disabled:text-slate-400 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-center mt-1">
               <span className="text-[10px] text-slate-400">Hỗ trợ bởi AI Gemini giả lập</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};