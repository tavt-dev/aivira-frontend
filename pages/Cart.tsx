import React from 'react';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const Cart = () => {
  const { items, removeFromCart, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <p className="text-slate-500 mb-8">Có vẻ như bạn chưa thêm sản phẩm nào.</p>
        <Link to="/products">
          <Button>Bắt đầu mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Giỏ hàng</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md bg-slate-100" />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                <p className="text-slate-500 text-sm">{item.category}</p>
                <div className="text-primary-600 font-bold mt-1">${item.price}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-slate-50 text-slate-600">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-slate-50 text-slate-600">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span>${total().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg text-slate-900">
                <span>Tổng cộng</span>
                <span>${total().toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full" size="lg">
              Thanh toán <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};