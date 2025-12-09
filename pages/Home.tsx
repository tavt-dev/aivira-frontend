import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Truck } from 'lucide-react';
import { MockService } from '../services/mockService';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export const Home = () => {
  const [trending, setTrending] = useState<Product[]>([]);

  useEffect(() => {
    MockService.getProducts().then(products => {
      setTrending(products.filter(p => p.isTrending).slice(0, 3));
    });
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-slate-900 to-slate-900 opacity-90" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl font-extrabold tracking-tight mb-6">
              Mua sắm đột phá cùng <span className="text-primary-400">Trí tuệ nhân tạo</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Trải nghiệm thế hệ thương mại điện tử tiếp theo. Đề xuất dựa trên AI, hỗ trợ tức thì và phân tích sản phẩm thông minh.
            </p>
            <div className="flex gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-primary-900 hover:bg-slate-100">
                  Mua ngay <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/ai-chat">
                <Button variant="outline" size="lg" className="border-slate-500 text-white hover:bg-slate-800">
                  Thử trợ lý AI
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'Giao hàng tức thì', desc: 'Logistics tối ưu hóa bởi AI để vận chuyển nhanh hơn.' },
            { icon: ShieldCheck, title: 'An toàn & Xác thực', desc: 'Phát hiện gian lận thông minh để thanh toán an toàn.' },
            { icon: Truck, title: 'Theo dõi thông minh', desc: 'Cập nhật thời gian thực về vị trí đơn hàng của bạn.' },
          ].map((item, idx) => (
            <Card key={idx} className="border-none shadow-md bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
              <CardContent className="flex flex-col items-center text-center p-8">
                <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2 dark:text-white">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold dark:text-white">Xu hướng hiện nay</h2>
          <Link to="/products" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Xem tất cả</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trending.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className="group">
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800">
                <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  {product.isTrending && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Hot
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg truncate dark:text-white">{product.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-600 dark:text-primary-400">${product.price}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">★ {product.rating}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};