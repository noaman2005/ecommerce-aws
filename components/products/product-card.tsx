'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart-store';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/currency';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card hover className="h-full">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images[0] || '/file.svg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
          />
          {product.featured && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 flex flex-col gap-2">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          
          {product.categoryName && (
            <p className="text-xs text-gray-500">{product.categoryName}</p>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-xl sm:text-2xl font-semibold text-gray-900">
              {formatCurrency(product.price)}
            </span>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="px-3 sm:px-4"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add
              </Button>
            </motion.div>
          </div>

          {product.stock === 0 && (
            <p className="text-red-600 text-sm mt-2 font-medium">Out of Stock</p>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <p className="text-orange-600 text-sm mt-2">
              Only {product.stock} left!
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
};
