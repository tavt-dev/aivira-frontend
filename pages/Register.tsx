import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { MockService } from '../services/mockService';
import { Button } from '../components/ui/Button';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const user = await MockService.register(name, email);
      login(user);
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Right Side - Image/Banner (Swapped for Register to look varied) */}
      <div className="hidden lg:block w-1/2 bg-slate-900 relative overflow-hidden order-2">
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-900/90 via-slate-900/90 to-primary-900/90 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
          alt="Future Technology" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 h-full flex flex-col justify-between p-16 text-white">
          <div className="flex justify-end">
             <div className="w-32 h-32 rounded-full bg-primary-500/20 blur-3xl"></div>
          </div>
          
          <div className="max-w-lg">
             <h2 className="text-4xl font-bold leading-tight mb-6">
              Bắt đầu hành trình thông minh của bạn.
            </h2>
            <div className="space-y-4">
              {[
                "Trợ lý mua sắm cá nhân AI 24/7",
                "Phân tích xu hướng thị trường thời gian thực",
                "Gợi ý sản phẩm chuẩn xác đến 99%"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-400" />
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-24 relative order-1">
        <div className="max-w-md mx-auto w-full">
           <Link to="/" className="absolute top-8 left-8 sm:left-12 flex items-center gap-2 group">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Aivira</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">Tạo tài khoản mới</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Miễn phí và chỉ mất 1 phút để hoàn tất.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="Tối thiểu 8 ký tự"
                    required
                    minLength={8}
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

              <div className="flex items-center gap-2">
                <input type="checkbox" id="terms" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" required />
                <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
                  Tôi đồng ý với <Link to="#" className="text-primary-600 hover:underline">Điều khoản</Link> và <Link to="#" className="text-primary-600 hover:underline">Chính sách bảo mật</Link>
                </label>
              </div>

              <Button className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary-500/20" disabled={loading}>
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'} 
                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};