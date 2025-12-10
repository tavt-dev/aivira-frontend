import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Sparkles, LogOut, LayoutDashboard, Heart, Package, Settings, ChevronDown, Sun, Moon, Command } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useThemeStore } from '../stores/useThemeStore';
import { Button } from '../components/ui/Button';
import { SearchCommand } from '../components/SearchCommand';

export const Navbar = () => {
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-500 hidden sm:block">
                Aivira
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link to="/products" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sản phẩm</Link>
              <Link to="/ai-chat" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> AI Chat
              </Link>
            </div>
          </div>

          {/* Search Bar Trigger */}
          <div className="flex-1 max-w-xl hidden md:block">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
              <span className="flex-1 text-left">Tìm kiếm sản phẩm...</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Mobile Search Icon */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-300"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block">
              <Heart className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors mr-2">
              <ShoppingCart className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                >
                  <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 hidden lg:block" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                    
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400">
                      <User className="w-4 h-4" /> Hồ sơ cá nhân
                    </Link>
                    <Link to="/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400">
                      <Package className="w-4 h-4" /> Đơn hàng của tôi
                    </Link>
                    <Link to="/wishlist" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400">
                      <Heart className="w-4 h-4" /> Sản phẩm yêu thích
                    </Link>
                    
                    {user?.role === 'admin' && (
                      <>
                          <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                          <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400">
                            <LayoutDashboard className="w-4 h-4" /> Trang quản trị
                          </Link>
                      </>
                    )}
                    
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                    <button 
                      onClick={() => { logout(); setIsDropdownOpen(false); navigate('/'); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">Đăng nhập</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Global Search Modal */}
      <SearchCommand isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};