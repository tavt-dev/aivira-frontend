import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import { MockService } from '../../services/mockService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { DashboardStats } from '../../types';

const data = [
  { name: 'T2', sales: 4000 },
  { name: 'T3', sales: 3000 },
  { name: 'T4', sales: 2000 },
  { name: 'T5', sales: 2780 },
  { name: 'T6', sales: 1890 },
  { name: 'T7', sales: 2390 },
  { name: 'CN', sales: 3490 },
];

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    MockService.getDashboardStats().then(setStats);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-6 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tổng doanh thu" value={`$${stats?.totalSales.toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
        <StatCard title="Đơn hàng mới" value={stats?.activeOrders} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard title="Tổng người dùng" value={stats?.totalUsers} icon={Users} color="bg-indigo-500" />
        <StatCard title="Sắp hết hàng" value={stats?.inventoryWarnings} icon={AlertTriangle} color="bg-orange-500" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tổng quan doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} prefix="$" />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
           <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Đơn hàng #{1000 + i}</p>
                    <p className="text-sm text-slate-500">vừa xong</p>
                  </div>
                  <div className="ml-auto font-medium">+$299.00</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};