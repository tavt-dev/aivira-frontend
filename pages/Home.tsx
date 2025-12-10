import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Truck, TrendingUp, Sparkles, Star, Smartphone, Shirt, Armchair, Watch } from 'lucide-react';
import { MockService } from '../services/mockService';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PageTransition, FadeInView, StaggerContainer, StaggerItem } from '../components/ui/Motion';

export const Home = () => {
  const [trending, setTrending] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    MockService.getProducts().then(products => {
      // Mock filtering
      setTrending(products.filter(p => p.isTrending || p.rating > 4.7).slice(0, 4));
      setNewArrivals(products.filter(p => p.isNew || p.id > '3').slice(0, 4));
    });
  }, []);

  const categories = [
    { name: 'Điện tử', icon: Smartphone, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', slug: 'electronics' },
    { name: 'Thời trang', icon: Shirt, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400', slug: 'fashion' },
    { name: 'Nội thất', icon: Armchair, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', slug: 'furniture' },
    { name: 'Thiết bị đeo', icon: Watch, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', slug: 'wearables' },
  ];

  interface ProductGridProps {
    products: Product[];
    title: string;
    subtitle: string;
    icon?: React.ComponentType<{ className?: string }>;
  }

  const ProductGrid = ({ products, title, subtitle, icon: Icon }: ProductGridProps) => (
    <section className="container mx-auto px-4">
      <FadeInView className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
           <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold tracking-wider text-sm uppercase mb-2">
             {Icon && <Icon className="w-4 h-4" />}
             <span>{subtitle}</span>
           </div>
           <h2 className="text-3xl font-bold dark:text-white">{title}</h2>
        </div>
        <Link to="/products" className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary-600 dark:hover:text-primary-400 flex items-center group transition-colors">
          Xem tất cả <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </FadeInView>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product: Product) => (
          <StaggerItem key={product.id}>
            <Link to={`/products/${product.id}`} className="group block h-full">
              <Card className="h-full overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 dark:bg-slate-900">
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <motion.img 
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.5 }}
                    src={product.image} 
                    alt={product.name} 
                    className="object-cover w-full h-full" 
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNew && (
                      <span className="bg-green-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        MỚI
                      </span>
                    )}
                    {product.isTrending && (
                      <span className="bg-amber-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 w-fit">
                        <TrendingUp className="w-3 h-3" /> HOT
                      </span>
                    )}
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-slate-900/80 to-transparent flex justify-center">
                      <span className="text-white text-sm font-medium flex items-center gap-2">
                        Xem chi tiết <ArrowRight className="w-4 h-4" />
                      </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{product.category}</p>
                  <h3 className="font-bold text-base truncate dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-slate-900 dark:text-white">${product.price}</span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-current" /> {product.rating}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );

  return (
    <PageTransition className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 opacity-90" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0] }} 
             transition={{ duration: 15, repeat: Infinity }}
             className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-600/20 blur-[120px] rounded-full"
          />
          <motion.div 
             animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2], x: [0, -30, 0] }} 
             transition={{ duration: 10, repeat: Infinity, delay: 2 }}
             className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-medium mb-6 backdrop-blur-sm text-primary-200"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" /> 
                <span>Trí tuệ nhân tạo (AI) trong tầm tay</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
                Mua sắm <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-indigo-400">
                  Thông Minh Hơn
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-300 mb-8 leading-relaxed max-w-lg">
                Aivira sử dụng AI để cá nhân hóa trải nghiệm của bạn. Từ gợi ý sản phẩm đến trợ lý ảo thông minh.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5 border-0">
                    Khám phá ngay <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/ai-chat">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-600 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm">
                    <Sparkles className="mr-2 h-5 w-5" /> Chat với AI
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="hidden lg:block relative"
            >
               <div className="relative z-10 bg-gradient-to-tr from-slate-800 to-slate-900 p-6 rounded-3xl border border-slate-700 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800 relative group">
                     <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop" alt="Hero Product" className="object-cover w-full h-full" />
                     {/* AI Tag Overlay */}
                     <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex items-start gap-3">
                           <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                              <Zap className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-xs text-slate-500 font-bold uppercase">Gợi ý bởi AI</p>
                              <p className="text-sm font-medium text-slate-900">Phù hợp 98% với phong cách của bạn</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               {/* Decorative floating elements */}
               <motion.div 
                 animate={{ y: [0, -20, 0] }} 
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute -top-10 -right-10 bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl z-0"
               >
                  <ShieldCheck className="w-8 h-8 text-green-400" />
               </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Giao hàng hỏa tốc', desc: 'Nhận hàng trong 2h tại nội thành.' },
            { icon: ShieldCheck, title: 'Bảo hành chính hãng', desc: 'Cam kết 100% hàng chính hãng.' },
            { icon: Truck, title: 'Miễn phí vận chuyển', desc: 'Cho đơn hàng từ 500k trở lên.' },
          ].map((item, idx) => (
            <StaggerItem key={idx}>
              <Card className="border-none shadow-xl bg-white dark:bg-slate-800 h-full">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <FadeInView className="mb-8 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold dark:text-white mb-3">Danh mục mua sắm</h2>
            <p className="text-slate-500 dark:text-slate-400">Dễ dàng tìm kiếm sản phẩm yêu thích thông qua các danh mục được phân loại thông minh.</p>
        </FadeInView>
        
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
             <StaggerItem key={idx}>
                <Link to="/products" className="group block">
                   <div className={`rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg border border-transparent hover:border-slate-100 dark:hover:border-slate-700 ${cat.color} bg-opacity-50 dark:bg-opacity-20 hover:bg-opacity-100`}>
                      <div className="w-16 h-16 mx-auto bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                         <cat.icon className="w-8 h-8" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{cat.name}</h3>
                   </div>
                </Link>
             </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Trending Products */}
      <ProductGrid products={trending} title="Xu hướng tuần này" subtitle="Sản phẩm nổi bật" icon={TrendingUp} />

      {/* Promo Section */}
      <section className="container mx-auto px-4">
        <FadeInView>
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl">
             <div className="absolute inset-0">
                <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-40 mix-blend-overlay" alt="Promo" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
             </div>
             
             <div className="relative z-10 p-8 md:p-16 max-w-2xl">
                <span className="inline-block px-3 py-1 bg-amber-400 text-slate-900 text-xs font-bold rounded-full mb-6">KHUYẾN MÃI CÓ HẠN</span>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Nâng cấp không gian sống với Aivira Smart Home</h2>
                <p className="text-lg text-slate-300 mb-8">Giảm giá đến 30% cho các thiết bị nhà thông minh. Tích hợp AI giúp cuộc sống của bạn tiện nghi hơn bao giờ hết.</p>
                <div className="flex gap-4">
                   <Link to="/products">
                      <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 border-0">Mua ngay</Button>
                   </Link>
                   <Link to="/products">
                      <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">Xem chi tiết</Button>
                   </Link>
                </div>
             </div>
          </div>
        </FadeInView>
      </section>

       {/* New Arrivals */}
       <ProductGrid products={newArrivals} title="Hàng mới về" subtitle="Khám phá mới nhất" icon={Sparkles} />

       {/* Newsletter */}
       <section className="container mx-auto px-4 pb-12">
          <div className="bg-primary-50 dark:bg-slate-800/50 rounded-2xl p-8 md:p-12 text-center border border-primary-100 dark:border-slate-700">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Đăng ký nhận tin</h2>
             <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto">Nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và các bài viết về công nghệ AI sớm nhất.</p>
             <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
                <Button className="px-6">Đăng ký</Button>
             </form>
          </div>
       </section>
    </PageTransition>
  );
};