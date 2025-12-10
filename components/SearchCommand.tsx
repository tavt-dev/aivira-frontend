import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, Image as ImageIcon, X, Loader2, ArrowRight, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MockService } from '../services/mockService';
import { Product } from '../types';

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchCommand: React.FC<SearchCommandProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice' | 'image'>('text');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setMode('text');
    }
  }, [isOpen]);

  // Handle Search
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await MockService.searchProducts(query);
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Mock Voice Search
  const startVoiceSearch = () => {
    setMode('voice');
    setIsListening(true);
    // Simulate listening delay
    setTimeout(() => {
      setIsListening(false);
      setQuery('Tai nghe'); // Mock result
      setMode('text');
    }, 2000);
  };

  // Mock Image Search
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMode('image');
      setIsAnalyzingImage(true);
      // Simulate analysis delay
      setTimeout(() => {
        setIsAnalyzingImage(false);
        setQuery('Đồng hồ'); // Mock result based on image
        setMode('text');
      }, 2500);
    }
  };

  const handleNavigate = (productId: string) => {
    navigate(`/products/${productId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-start justify-center pt-[10vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] border border-slate-200 dark:border-slate-800"
        >
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm, danh mục..."
              className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            
            <div className="flex items-center gap-2">
               {/* Voice Button */}
              <button 
                onClick={startVoiceSearch}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors tooltip-trigger relative group"
              >
                <Mic className="w-5 h-5" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">Tìm bằng giọng nói</span>
              </button>

              {/* Image Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors relative group"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">Tìm bằng hình ảnh</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              
              <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400">
                <div className="text-xs border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 font-medium">ESC</div>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="overflow-y-auto p-2">
            
            {/* Mode: Voice Listening */}
            {mode === 'voice' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center relative z-10 text-white">
                    <Mic className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-medium dark:text-white">Đang nghe...</h3>
                <p className="text-slate-500 text-sm mt-2">Hãy nói tên sản phẩm bạn muốn tìm</p>
              </div>
            )}

            {/* Mode: Image Analyzing */}
            {mode === 'image' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6 animate-bounce">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium dark:text-white">Đang phân tích hình ảnh...</h3>
                <p className="text-slate-500 text-sm mt-2">AI đang tìm kiếm các sản phẩm tương tự</p>
              </div>
            )}

            {/* Mode: Text / Results */}
            {mode === 'text' && (
              <>
                {loading && (
                   <div className="py-8 text-center text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Đang tìm kiếm...
                   </div>
                )}

                {!query && !loading && (
                  <div className="p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Từ khóa phổ biến</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Tai nghe', 'Đồng hồ', 'Ghế', 'Smart home', 'Áo khoác'].map(tag => (
                        <button 
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="space-y-1">
                    {results.map(product => (
                      <button
                        key={product.id}
                        onClick={() => handleNavigate(product.id)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group"
                      >
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-slate-200" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{product.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                             <span>{product.category}</span>
                             <span>•</span>
                             <span className="font-medium text-slate-700 dark:text-slate-400">${product.price}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                {query && !loading && results.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-slate-500">Không tìm thấy sản phẩm nào cho "{query}"</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-slate-50 dark:bg-slate-950/50 p-3 text-xs text-slate-400 flex justify-between border-t border-slate-100 dark:border-slate-800">
             <span>Tìm kiếm thông minh với AI</span>
             <div className="flex gap-4">
                <span>↑↓ để điều hướng</span>
                <span>↵ để chọn</span>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};