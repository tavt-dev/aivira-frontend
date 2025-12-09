import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Liên hệ với chúng tôi</h1>
        <p className="text-slate-500 text-center mb-12">Chúng tôi luôn sẵn sàng lắng nghe ý kiến của bạn</p>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Thông tin liên lạc</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Địa chỉ</h3>
                  <p className="text-slate-600">Toà nhà TechHub, Số 123 Đường Công Nghệ<br />Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Điện thoại</h3>
                  <p className="text-slate-600">(028) 1234 5678</p>
                  <p className="text-slate-500 text-sm">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Email</h3>
                  <p className="text-slate-600">support@aivira.com</p>
                  <p className="text-slate-600">kinhdoanh@aivira.com</p>
                </div>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none mt-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Cần hỗ trợ ngay?</h3>
                <p className="text-slate-300 text-sm mb-4">Hãy thử trò chuyện với Trợ lý ảo AI của chúng tôi ở góc phải màn hình.</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-6">Gửi tin nhắn</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Họ tên</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Email</label>
                  <input type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="email@example.com" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Chủ đề</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                  <option>Hỗ trợ đơn hàng</option>
                  <option>Tư vấn sản phẩm</option>
                  <option>Hợp tác kinh doanh</option>
                  <option>Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Nội dung</label>
                <textarea rows={5} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="Nhập nội dung tin nhắn..."></textarea>
              </div>

              <Button className="w-full h-11 text-base">
                <Send className="w-4 h-4 mr-2" /> Gửi tin nhắn
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};