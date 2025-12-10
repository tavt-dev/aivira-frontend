import { Product, User, Order } from '../../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tai nghe chống ồn Neural',
    price: 299.99,
    category: 'Điện tử',
    image: 'https://picsum.photos/400/400?random=1',
    rating: 4.8,
    reviews: 124,
    description: 'Trải nghiệm sự yên tĩnh chưa từng có với công nghệ chống ồn chủ động điều khiển bởi AI của chúng tôi.',
    stock: 45,
    isTrending: true,
    aiTags: ['Sống động', 'Pin trâu', 'Thoải mái']
  },
  {
    id: '2',
    name: 'Đồng hồ thông minh Quantum',
    price: 199.50,
    category: 'Thiết bị đeo',
    image: 'https://picsum.photos/400/400?random=2',
    rating: 4.5,
    reviews: 89,
    description: 'Theo dõi các chỉ số sức khỏe của bạn với các cảm biến chính xác.',
    stock: 120,
    isNew: true,
    aiTags: ['Thể thao', 'Sức khỏe', 'Chống nước']
  },
  {
    id: '3',
    name: 'Ghế công thái học ErgoLift',
    price: 450.00,
    category: 'Nội thất',
    image: 'https://picsum.photos/400/400?random=3',
    rating: 4.9,
    reviews: 210,
    description: 'Được thiết kế cho sự thoải mái trong hơn 12 giờ với hỗ trợ thắt lưng thích ứng.',
    stock: 15,
    isTrending: true
  },
  {
    id: '4',
    name: 'Kính thực tế ảo HoloLens AR',
    price: 899.00,
    category: 'Điện tử',
    image: 'https://picsum.photos/400/400?random=4',
    rating: 4.2,
    reviews: 34,
    description: 'Kính thực tế tăng cường cho năng suất làm việc và chơi game.',
    stock: 8,
    isNew: true
  },
  {
    id: '5',
    name: 'Hệ thống vườn thông minh',
    price: 129.99,
    category: 'Nhà cửa',
    image: 'https://picsum.photos/400/400?random=5',
    rating: 4.6,
    reviews: 56,
    description: 'Trồng thảo mộc tươi trong nhà với ánh sáng và nước tự động.',
    stock: 60
  },
  {
    id: '6',
    name: 'Áo khoác Neon Cyberpunk',
    price: 180.00,
    category: 'Thời trang',
    image: 'https://picsum.photos/400/400?random=6',
    rating: 4.7,
    reviews: 42,
    description: 'Áo khoác bomber chống nước với đường viền LED tích hợp.',
    stock: 25,
    isTrending: true
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    role: 'admin',
    avatar: 'https://picsum.photos/100/100?random=10'
  },
  {
    id: 'u2',
    name: 'Jamie Doe',
    email: 'jamie@example.com',
    role: 'user',
    avatar: 'https://picsum.photos/100/100?random=11'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    userId: 'u2',
    items: [
      { ...MOCK_PRODUCTS[0]!, quantity: 1 }
    ],
    total: 299.99,
    status: 'delivered',
    date: '2023-10-15'
  },
  {
    id: 'ord-1002',
    userId: 'u2',
    items: [
      { ...MOCK_PRODUCTS[1]!, quantity: 2 }
    ],
    total: 399.00,
    status: 'processing',
    date: '2023-10-25'
  }
];