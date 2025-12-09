import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Github } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { MockService } from '../services/mockService';
import { Button } from '../components/ui/Button';

export const Login = () => {
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('password'); // Demo purpose
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await MockService.login(email);
      login(user);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError('Thông tin đăng nhập không đúng (Gợi ý: alex@example.com)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-24 relative">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="absolute top-8 left-8 sm:left-12 flex items-center gap-2 group">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Aivira</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Chào mừng trở lại</h1>
            <p className="text-slate-500 mb-8">Nhập thông tin của bạn để truy cập tài khoản.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
                  <Link to="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              <Button className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary-500/20" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng nhập'} 
                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Hoặc tiếp tục với</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700">Google</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <Github className="w-5 h-5 text-slate-900" />
                  <span className="text-sm font-medium text-slate-700">Github</span>
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-slate-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                Đăng ký miễn phí
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Image/Banner */}
      <div className="hidden lg:block w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-slate-900/90 to-purple-900/90 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop" 
          alt="AI Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 h-full flex flex-col justify-between p-16 text-white">
          <div className="flex justify-end">
             {/* Decor element */}
             <div className="w-20 h-20 rounded-full bg-white/10 blur-2xl"></div>
          </div>
          
          <div className="max-w-lg">
            <div className="mb-6 inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="w-6 h-6 text-primary-300" />
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-6">
              "Trí tuệ nhân tạo không thay thế con người, nó nâng tầm khả năng của chúng ta."
            </h2>
            <p className="text-lg text-slate-300">
              Tham gia Aivira ngay hôm nay để trải nghiệm kỷ nguyên mới của thương mại điện tử thông minh.
            </p>
            
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://picsum.photos/100/100?random=${i+20}`} className="w-10 h-10 rounded-full border-2 border-slate-900" alt="User" />
                ))}
              </div>
              <div className="text-sm font-medium text-white">
                <span className="text-primary-300">50k+</span> người dùng tin cậy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};