import { Product, User, Order } from '../types';
import { MOCK_PRODUCTS, MOCK_USERS, MOCK_ORDERS } from './mock/data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockService = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    await delay(600);
    return [...MOCK_PRODUCTS];
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    await delay(400);
    return MOCK_PRODUCTS.find(p => p.id === id);
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    await delay(300); // Fast search
    const lowerQuery = query.toLowerCase();
    return MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.category.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    await delay(800);
    const newProduct = { ...product, id: Date.now().toString() };
    MOCK_PRODUCTS.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    await delay(800);
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");
    const product = MOCK_PRODUCTS[index];
    if (!product) throw new Error("Product not found");
    MOCK_PRODUCTS[index] = { ...product, ...updates };
    return MOCK_PRODUCTS[index]!;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await delay(800);
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index !== -1) MOCK_PRODUCTS.splice(index, 1);
  },

  // Auth & Users
  login: async (email: string): Promise<User> => {
    await delay(800);
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) throw new Error('Không tìm thấy người dùng');
    return user;
  },

  register: async (name: string, email: string): Promise<User> => {
    await delay(1000);
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
    MOCK_USERS.push(newUser);
    return newUser;
  },

  getUsers: async (): Promise<User[]> => {
    await delay(600);
    return [...MOCK_USERS];
  },

  deleteUser: async (id: string): Promise<void> => {
     await delay(600);
     const index = MOCK_USERS.findIndex(u => u.id === id);
     if (index !== -1) MOCK_USERS.splice(index, 1);
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    await delay(600);
    return [...MOCK_ORDERS];
  },

  getOrdersByUserId: async (userId: string): Promise<Order[]> => {
    await delay(600);
    return MOCK_ORDERS.filter(o => o.userId === userId);
  },

  // Mock AI
  generateAIResponse: async (_prompt: string): Promise<string> => {
    await delay(1500); 
    const responses = [
      "Tôi chắc chắn có thể giúp bạn! Dựa trên sở thích của bạn về đồ điện tử, tôi khuyên bạn nên xem qua Tai nghe Neural.",
      "Đó là một câu hỏi tuyệt vời. Thời lượng pin được tối ưu hóa bằng AI để kéo dài đến 40 giờ chỉ với một lần sạc.",
      "So sánh cả hai, Đồng hồ Quantum có khả năng theo dõi sức khỏe tốt hơn, trong khi mẫu tiêu chuẩn tập trung nhiều hơn vào thông báo.",
      "Tôi đã phân tích các đánh giá và 95% người dùng khen ngợi sự thoải mái của sản phẩm này, đặc biệt là khi sử dụng lâu dài."
    ];
    return responses[Math.floor(Math.random() * responses.length)] ?? responses[0]!;
  },

  generateProductInsight: async (_productId: string): Promise<string> => {
    await delay(1000);
    return "Phân tích AI: Sản phẩm này đã tăng 20% lượng quan tâm trong tuần này. Người dùng thường xuyên nhắc đến 'độ bền' và 'thiết kế đẹp' là những điểm tích cực chính. Chỉ số cảm xúc đạt 92% tích cực.";
  },

  // Admin / Dashboard
  getDashboardStats: async () => {
    await delay(600);
    return {
      totalSales: 124500,
      activeOrders: 45,
      totalUsers: 1205,
      inventoryWarnings: 3
    };
  }
};