import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Users, Target, Globe } from 'lucide-react';

export const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Về Aivira</h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Chúng tôi đang định hình lại tương lai của thương mại điện tử bằng sức mạnh của Trí tuệ Nhân tạo, mang đến trải nghiệm mua sắm thông minh và cá nhân hóa.
          </p>
        </div>

        <img 
          src="https://picsum.photos/1200/600?grayscale" 
          alt="Office" 
          className="w-full h-[400px] object-cover rounded-2xl shadow-lg" 
        />

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6">
           <Card className="text-center border-none shadow-md bg-slate-50">
             <CardContent className="p-8 pt-10">
               <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Target className="w-6 h-6" />
               </div>
               <h3 className="font-bold text-xl mb-2 text-slate-900">Sứ mệnh</h3>
               <p className="text-slate-600 text-sm">Đơn giản hóa hành trình mua sắm thông qua các giải pháp công nghệ tiên tiến nhất.</p>
             </CardContent>
           </Card>
           <Card className="text-center border-none shadow-md bg-slate-50">
             <CardContent className="p-8 pt-10">
               <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Globe className="w-6 h-6" />
               </div>
               <h3 className="font-bold text-xl mb-2 text-slate-900">Tầm nhìn</h3>
               <p className="text-slate-600 text-sm">Kết nối hàng triệu người mua và người bán trên toàn cầu trong một hệ sinh thái AI.</p>
             </CardContent>
           </Card>
           <Card className="text-center border-none shadow-md bg-slate-50">
             <CardContent className="p-8 pt-10">
               <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Users className="w-6 h-6" />
               </div>
               <h3 className="font-bold text-xl mb-2 text-slate-900">Con người</h3>
               <p className="text-slate-600 text-sm">Xây dựng đội ngũ đam mê công nghệ và tận tâm với khách hàng.</p>
             </CardContent>
           </Card>
        </div>

        {/* Stats */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-400 mb-1">2+ Năm</div>
              <div className="text-slate-400 text-sm">Phát triển</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-400 mb-1">10k+</div>
              <div className="text-slate-400 text-sm">Sản phẩm</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-400 mb-1">50k+</div>
              <div className="text-slate-400 text-sm">Khách hàng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-400 mb-1">24/7</div>
              <div className="text-slate-400 text-sm">Hỗ trợ AI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};