import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './pages/Home';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { AIChat } from './pages/AIChat';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductManagement } from './pages/admin/ProductManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { About } from './pages/About';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { Profile } from './pages/Profile';
import { Orders } from './pages/Orders';
import { Wishlist } from './pages/Wishlist';
import { useAuthStore } from './stores/useAuthStore';
import { useThemeStore } from './stores/useThemeStore';

// Simple protection wrapper
const RequireAdmin = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RequireAuth = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="ai-chat" element={<AIChat />} />
          <Route path="about" element={<About />} />
          <Route path="blog" element={<Blog />} />
          <Route path="contact" element={<Contact />} />
          
          {/* User Routes */}
          <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="orders" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<div className="p-8 dark:text-white">Tính năng cài đặt đang phát triển</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;