import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    title: "Tương lai của AI trong thương mại điện tử năm 2024",
    excerpt: "Khám phá cách trí tuệ nhân tạo đang thay đổi cách chúng ta mua sắm trực tuyến, từ gợi ý sản phẩm đến trải nghiệm thực tế ảo.",
    date: "20/10/2023",
    author: "Minh Anh",
    category: "Công nghệ",
    image: "https://picsum.photos/600/400?random=100"
  },
  {
    id: 2,
    title: "Top 5 thiết bị thông minh đáng mua nhất tháng này",
    excerpt: "Đánh giá chi tiết về các sản phẩm công nghệ mới ra mắt, giúp bạn đưa ra quyết định mua sắm thông minh hơn.",
    date: "15/10/2023",
    author: "Hoàng Nam",
    category: "Review",
    image: "https://picsum.photos/600/400?random=101"
  },
  {
    id: 3,
    title: "Bảo mật thông tin khi mua sắm online: Những điều cần biết",
    excerpt: "Các mẹo quan trọng để bảo vệ dữ liệu cá nhân và tài chính của bạn trên không gian mạng ngày càng phức tạp.",
    date: "10/10/2023",
    author: "Thu Hà",
    category: "Bảo mật",
    image: "https://picsum.photos/600/400?random=102"
  },
  {
    id: 4,
    title: "Xu hướng nhà thông minh Smart Home",
    excerpt: "Cách xây dựng một ngôi nhà thông minh với chi phí hợp lý và hiệu quả cao nhất cho gia đình Việt.",
    date: "05/10/2023",
    author: "Tuấn Kiệt",
    category: "Đời sống",
    image: "https://picsum.photos/600/400?random=103"
  }
];

export const Blog = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold mb-4">Tin tức & Bài viết</h1>
        <p className="text-slate-500">Cập nhật những xu hướng công nghệ mới nhất và mẹo mua sắm thông minh từ đội ngũ Aivira.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BLOG_POSTS.map(post => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-slate-200">
            <div className="relative overflow-hidden h-48">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-primary-700">
                {post.category}
              </span>
            </div>
            <CardContent className="p-5 flex flex-col h-[calc(100%-12rem)]">
              <div className="flex items-center text-xs text-slate-400 mb-3 gap-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {post.date}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {post.author}
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-2 text-slate-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
                {post.title}
              </h3>
              
              <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">
                {post.excerpt}
              </p>
              
              <Link to="#" className="inline-flex items-center text-primary-600 font-medium text-sm hover:underline mt-auto">
                Đọc tiếp <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};