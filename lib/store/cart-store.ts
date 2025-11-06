import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, Product } from '@/types';

interface CartStore extends Cart {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (product: Product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.productId === product.id);

        let newItems: CartItem[];
        if (existingItem) {
          newItems = items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...items, { productId: product.id, product, quantity }];
        }

        const total = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        set({ items: newItems, total });
      },

      removeItem: (productId: string) => {
        const items = get().items.filter((item) => item.productId !== productId);
        const total = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        set({ items, total });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const items = get().items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );

        const total = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        set({ items, total });
      },

      clearCart: () => {
        set({ items: [], total: 0 });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
