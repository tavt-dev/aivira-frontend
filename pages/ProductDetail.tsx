import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MockService } from '../services/mockService';
import { Product } from '../types';
import { useCartStore } from '../stores/useCartStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/ui/Motion';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    if (id) {
      MockService.getProductById(id).then(product => setProduct(product ?? null));
      setAiInsight(''); // Reset
    }
  }, [id]);

  const handleAiAnalyze = async () => {
    if (!product) return;
    setAnalyzing(true);
    try {
      const insight = await MockService.generateProductInsight(product.id);
      setAiInsight(insight);
    } catch (error) {
      setAiInsight('Xin lỗi, không thể phân tích sản phẩm lúc này. Vui lòng thử lại sau.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!product) return <div className="p-20 text-center dark:text-slate-300">Đang tải sản phẩm...</div>;

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <motion.img 
                key={product.image}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-2 hover:ring-primary-500 transition-all"
                >
                  <img src={`https://picsum.photos/200/200?random=${i + 10}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div 
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 text-xs font-semibold">
                  {product.category}
                </span>
                {product.isNew && <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold">Hàng mới về</span>}
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center text-amber-400">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.rating) ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                  ))}
                  <span className="text-slate-700 dark:text-slate-300 font-medium ml-2">{product.rating}</span>
                </div>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 dark:text-slate-400">{product.reviews} đánh giá</span>
              </div>
            </div>

            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">${product.price}</div>

            <div className="prose dark:prose-invert text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{product.description}</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button size="lg" className="flex-1 text-lg shadow-lg shadow-primary-500/20" onClick={() => addToCart(product)}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ
              </Button>
              <Button size="lg" variant="secondary" className="px-6">
                ♡
              </Button>
            </div>

            {/* AI Analysis Box */}
            <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-700 p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-indigo-500" />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-slate-700">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">Phân tích sản phẩm Aivira</h3>
                  {!aiInsight && !analyzing && (
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">Xem phân tích thị trường thời gian thực và tóm tắt cảm xúc cho sản phẩm này.</p>
                  )}
                  
                  {analyzing && (
                    <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                      <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" />
                      Đang phân tích đánh giá và xu hướng...
                    </div>
                  )}

                  {aiInsight && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">{aiInsight}</p>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {product.aiTags?.map((tag, idx) => (
                          <motion.span 
                            key={tag} 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="px-2 py-1 bg-white/60 dark:bg-slate-700/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded border border-indigo-200 dark:border-slate-600"
                          >
                            #{tag}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {!aiInsight && !analyzing && (
                    <Button size="sm" variant="outline" onClick={handleAiAnalyze} className="bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-slate-600 shadow-sm">
                      Tạo phân tích
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};