import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useCartStore } from '../stores/useCartStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';

export const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlistStore();
  const addToCart = useCartStore(state => state.addToCart);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Heart className="fill-red-500 text-red-500" /> Sản phẩm yêu thích ({items.length})
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl">
          <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">Danh sách trống</h2>
          <p className="text-slate-500 mb-6">Hãy lưu lại những sản phẩm bạn yêu thích để mua sau.</p>
          <Link to="/products">
            <Button>Khám phá sản phẩm</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <Card key={product.id} className="group overflow-hidden">
               <div className="aspect-square relative bg-slate-100 overflow-hidden">
                   <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                   <button 
                     onClick={() => removeFromWishlist(product.id)}
                     className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                     title="Xóa khỏi yêu thích"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
               </div>
               <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 truncate mb-1">{product.name}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-lg text-primary-600">${product.price}</span>
                    <span className="text-xs text-slate-400">★ {product.rating}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => {
                       addToCart(product);
                       removeFromWishlist(product.id);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Thêm vào giỏ
                  </Button>
               </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};