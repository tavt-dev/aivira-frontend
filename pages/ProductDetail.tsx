import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MockService } from '../services/mockService';
import { Product } from '../types';
import { useCartStore } from '../stores/useCartStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    if (id) {
      MockService.getProductById(id).then(setProduct);
      setAiInsight(''); // Reset
    }
  }, [id]);

  const handleAiAnalyze = async () => {
    if (!product) return;
    setAnalyzing(true);
    const insight = await MockService.generateProductInsight(product.id);
    setAiInsight(insight);
    setAnalyzing(false);
  };

  if (!product) return <div className="p-20 text-center">Đang tải sản phẩm...</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-lg cursor-pointer hover:ring-2 ring-primary-500 transition-all">
                <img src={`https://picsum.photos/200/200?random=${i + 10}`} className="w-full h-full object-cover rounded-lg opacity-80 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold">
                {product.category}
              </span>
              {product.isNew && <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Hàng mới về</span>}
            </div>
            <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center text-amber-400">
                <Star className="fill-current w-5 h-5" />
                <span className="text-slate-700 font-medium ml-1">{product.rating}</span>
              </div>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">{product.reviews} đánh giá</span>
            </div>
          </div>

          <div className="text-3xl font-bold text-slate-900">${product.price}</div>

          <div className="prose text-slate-600">
            <p>{product.description}</p>
          </div>

          <div className="flex gap-4">
            <Button size="lg" className="w-full" onClick={() => addToCart(product)}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ
            </Button>
            <Button size="lg" variant="secondary" className="px-4">
              ♡
            </Button>
          </div>

          {/* AI Analysis Box */}
          <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-indigo-100 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-900 mb-1">Phân tích sản phẩm Aivira</h3>
                {!aiInsight && !analyzing && (
                  <p className="text-sm text-indigo-700 mb-3">Xem phân tích thị trường thời gian thực và tóm tắt cảm xúc cho sản phẩm này.</p>
                )}
                
                {analyzing && (
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                    Đang phân tích đánh giá và xu hướng...
                  </div>
                )}

                {aiInsight && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-sm text-indigo-800 leading-relaxed">{aiInsight}</p>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {product.aiTags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white/60 text-indigo-700 text-xs rounded border border-indigo-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {!aiInsight && !analyzing && (
                  <Button size="sm" variant="outline" onClick={handleAiAnalyze} className="bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200">
                    Tạo phân tích
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};