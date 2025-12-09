import React, { useEffect, useState } from 'react';
import { MockService } from '../../services/mockService';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Plus, Edit2, Trash2, Search, MoreHorizontal } from 'lucide-react';

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    MockService.getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      await MockService.deleteProduct(id);
      loadProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Sản phẩm</th>
                  <th className="px-6 py-3">Danh mục</th>
                  <th className="px-6 py-3">Giá</th>
                  <th className="px-6 py-3">Kho</th>
                  <th className="px-6 py-3">Đánh giá</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   <tr><td colSpan={6} className="p-8 text-center">Đang tải...</td></tr>
                ) : filteredProducts.length === 0 ? (
                   <tr><td colSpan={6} className="p-8 text-center text-slate-500">Không tìm thấy sản phẩm nào.</td></tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="bg-white hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt="" className="w-10 h-10 rounded object-cover bg-slate-100" />
                          <span className="truncate max-w-[200px]" title={product.name}>{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{product.category}</td>
                      <td className="px-6 py-4 font-medium">${product.price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">★ {product.rating} ({product.reviews})</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Hiển thị {filteredProducts.length} sản phẩm</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Trước</Button>
              <Button variant="outline" size="sm" disabled>Sau</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};