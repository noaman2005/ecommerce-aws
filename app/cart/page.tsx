'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/currency';

const SHOP_WHATSAPP = '919892911665';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId);
    toast.success(`${productName} removed from cart`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] flex items-center justify-center">
        <div className="text-center space-y-3">
          <ShoppingBag className="w-24 h-24 text-[#d9cfc2] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[#1c1a17]">Your cart is calm</h2>
          <p className="text-[#5f4b3f]">Add a few tactile pieces to begin your ritual.</p>
          <Link href="/products">
            <Button size="lg" className="bg-[#b7472f] hover:bg-[#c3743a] text-white">
              Browse products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">In your tray</p>
          <h1 className="text-4xl font-semibold text-[#1c1a17]">Shopping cart</h1>
          <p className="text-[#5f4b3f]">{items.length} objects waiting for checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 border border-[#d9cfc2] rounded-3xl p-6 shadow-[0_15px_40px_rgba(28,26,23,0.08)]"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-[#f4ebe3] rounded-2xl overflow-hidden">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-[#d9cfc2] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-semibold text-lg text-[#1c1a17] hover:text-[#b7472f] transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[#5f4b3f] text-sm mt-1 line-clamp-2">
                      {item.product.description}
                    </p>
                    <p className="text-[#b7472f] font-bold text-xl mt-2">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={() => handleRemoveItem(item.productId, item.product.name)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 bg-white border border-[#f1e3d5] rounded-full px-3 py-1 text-[#1c1a17]">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 text-[#b7472f] hover:bg-[#fef3eb] rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-semibold tracking-wide">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1.5 text-[#b7472f] hover:bg-[#fef3eb] rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[#1c1a17] font-bold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Clear Cart */}
            <Button
              variant="outline"
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              className="w-full"
            >
              Clear Cart
            </Button>
          </div>

          {/* Coming Soon */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/85 border border-[#f1e3d5] rounded-3xl p-6 sticky top-24 shadow-[0_15px_40px_rgba(28,26,23,0.06)]"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-[#b7472f]">Next phase</p>
              <h2 className="text-2xl font-semibold text-[#1c1a17] mt-2">Checkout coming soon</h2>
              <p className="text-[#5f4b3f] mt-3">
                We&rsquo;re polishing the payment flow. For now, save your cart and reach us on WhatsApp or visit the
                Kurla store to complete your purchase.
              </p>

              <div className="mt-6 space-y-3">
                <a
                  href={`https://wa.me/${SHOP_WHATSAPP}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-[#25D366] text-white hover:bg-[#1ebe5a] transition-colors"
                >
                  Message us on WhatsApp
                </a>
                <Link href="/products" className="inline-flex w-full">
                  <Button variant="outline" className="w-full">
                    Continue shopping
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
