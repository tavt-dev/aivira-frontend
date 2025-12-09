import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { User, Mail, Shield, Camera } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return <div className="p-8 text-center">Vui lòng đăng nhập</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary-500 to-purple-600"></div>
            <div className="-mt-12 relative inline-block">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                alt={user.name} 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white"
              />
              <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border border-slate-200 text-slate-600 hover:text-primary-600">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <CardContent className="pt-2 pb-6">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 text-sm mb-4">{user.email}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                <Shield className="w-3 h-3 mr-1" /> {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-semibold text-sm text-slate-900 mb-3 uppercase tracking-wider">Thống kê</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Đơn hàng</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Đánh giá</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ngày tham gia</span>
                <span className="font-medium">20/10/2023</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Thông tin cá nhân</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Hủy bỏ' : 'Chỉnh sửa'}
              </Button>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        defaultValue={user.name} 
                        disabled={!isEditing}
                        className="w-full pl-10 px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                      <input 
                        type="email" 
                        defaultValue={user.email} 
                        disabled
                        className="w-full pl-10 px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <input 
                      type="tel" 
                      defaultValue="+84 90 123 4567" 
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày sinh</label>
                    <input 
                      type="date" 
                      defaultValue="1995-05-15" 
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none" 
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 flex justify-end">
                    <Button>Lưu thay đổi</Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Địa chỉ giao hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-slate-200 rounded-lg flex justify-between items-center bg-slate-50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">Nhà riêng</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Mặc định</span>
                  </div>
                  <p className="text-sm text-slate-600">123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                  <p className="text-sm text-slate-600 mt-1">(+84) 90 123 4567</p>
                </div>
                <Button variant="ghost" size="sm">Sửa</Button>
              </div>
              <Button variant="outline" className="w-full mt-4 border-dashed">
                + Thêm địa chỉ mới
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};