import { create } from 'zustand';
import { Product } from '../types';

interface WishlistState {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addToWishlist: (product) => set((state) => {
    if (state.items.some(i => i.id === product.id)) return state;
    return { items: [...state.items, product] };
  }),
  removeFromWishlist: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  isInWishlist: (id) => {
    return get().items.some(i => i.id === id);
  }
}));