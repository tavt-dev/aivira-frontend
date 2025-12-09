import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import { Bot, X } from 'lucide-react';
import { AIChatWidget } from '../components/AIChatWidget';

export const MainLayout = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname === '/ai-chat';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>

      {!isChatPage && (
        <>
          <AIChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-6 right-6 z-50 group transition-transform active:scale-95 outline-none"
            aria-label={isChatOpen ? "Đóng chat" : "Mở chat"}
          >
            <div className={`relative flex items-center justify-center w-14 h-14 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ${isChatOpen ? 'bg-slate-800 rotate-90 dark:bg-slate-700' : 'bg-gradient-to-r from-primary-600 to-indigo-600'}`}>
               {isChatOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
               
               {/* Online Status Dot (Only show when closed) */}
               {!isChatOpen && (
                 <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white dark:border-slate-800 bg-green-500"></span>
                 </span>
               )}
            </div>
            {/* Tooltip */}
            {!isChatOpen && (
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Chat với AI
              </div>
            )}
          </button>
        </>
      )}

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>© 2024 Aivira Inc. Đã đăng ký bản quyền.</p>
          <p className="mt-2">Được hỗ trợ bởi Mock AI & React</p>
        </div>
      </footer>
    </div>
  );
};