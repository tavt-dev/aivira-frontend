import React, { useEffect, useState } from 'react';
import { MockService } from '../services/mockService';
import { useAuthStore } from '../stores/useAuthStore';
import { Order } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Package, Truck, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Orders = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      MockService.getOrdersByUserId(user.id).then((data) => {
        setOrders(data);
        setLoading(false);
      });
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Giao thành công';
      case 'shipped': return 'Đang giao hàng';
      case 'processing': return 'Đang xử lý';
      default: return 'Chờ xác nhận';
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải lịch sử đơn hàng...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>
      
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Bạn chưa có đơn hàng nào.</p>
            <Link to="/products" className="text-primary-600 font-medium hover:underline mt-2 inline-block">Mua sắm ngay</Link>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-lg">#{order.id.toUpperCase()}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">Đặt ngày: {order.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Tổng tiền</div>
                    <div className="font-bold text-xl text-primary-600">${order.total.toFixed(2)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover bg-slate-100" />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{item.name}</h4>
                        <p className="text-sm text-slate-500">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="text-right font-medium text-slate-700">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
                   <Button variant="outline" size="sm">Liên hệ hỗ trợ</Button>
                   <Button size="sm">Mua lại</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};