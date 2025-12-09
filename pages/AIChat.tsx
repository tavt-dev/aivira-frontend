import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { MockService } from '../services/mockService';
import { ChatMessage } from '../types';

export const AIChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "Xin chào! Tôi là Aivira, trợ lý mua sắm cá nhân của bạn. Tôi có thể giúp bạn tìm sản phẩm gì hôm nay?", timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
    <div className="container mx-auto max-w-4xl px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="text-primary-600" /> Trợ lý mua sắm
        </h1>
        <p className="text-slate-500 text-sm">Hỗ trợ bởi AI Gemini giả lập</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4 mb-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'model' ? 'bg-gradient-to-br from-primary-500 to-indigo-600' : 'bg-slate-200'
            }`}>
              {msg.role === 'model' ? <Bot className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-slate-600" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-primary-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
               <Bot className="w-5 h-5 text-white" />
             </div>
             <div className="bg-slate-50 rounded-2xl px-4 py-3">
               <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
             </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="relative">
        <div className="absolute left-3 top-3 flex gap-2">
           <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-400">
             <ImageIcon className="w-5 h-5" />
           </button>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi về sản phẩm, xu hướng hoặc hỗ trợ..."
          className="w-full pl-12 pr-14 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={!input.trim() || loading}
          className="absolute right-2 top-2 h-9 w-9 p-0 rounded-lg flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};