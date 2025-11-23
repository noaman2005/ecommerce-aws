"use client";

import React, { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/lib/hooks/use-products';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { products: allProducts, isLoading, isError, error } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Initialize category filter from URL (?categoryId=...) when arriving from categories/home
  useEffect(() => {
    const fromUrl = searchParams.get("categoryId");
    if (fromUrl) {
      setSelectedCategory(fromUrl);
    }
  }, [searchParams]);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, string>();
    allProducts.forEach((product) => {
      if (product.categoryId && !categoryMap.has(product.categoryId)) {
        categoryMap.set(product.categoryId, product.categoryName || product.categoryId);
      }
    });
    return [{ id: 'all', name: 'All Products' }, ...Array.from(categoryMap).map(([id, name]) => ({ id, name }))];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (searchQuery) {
      const normalized = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.categoryId === selectedCategory);
    }

    filtered = filtered.filter((product) => product.price >= minPrice && product.price <= maxPrice);

    if (inStockOnly) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [allProducts, searchQuery, selectedCategory, sortBy, minPrice, maxPrice, inStockOnly]);

  const loading = isLoading;
  const errorMessage = isError
    ? (typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: string }).message)
        : 'Failed to load products')
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] text-[#1c1a17]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-0 py-10 sm:py-12 space-y-8 sm:space-y-10">
        <section className="rounded-3xl border border-[#d9cfc2] bg-white/70 p-5 sm:p-7 lg:p-8 shadow-[0_20px_40px_rgba(28,26,23,0.08)]">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.5em] text-[#5f4b3f]">{APP_NAME}</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1c1a17] leading-tight mt-2">
                Curated stationery for mindful storytelling
              </h1>
              <p className="text-[#5f4b3f] mt-3 max-w-2xl">
                {APP_TAGLINE} — explore paper-backed rituals, artfully crafted pens, and collecting-worthy desk accoutrements.
              </p>
            </div>
            <div className="flex-1 lg:flex lg:justify-end lg:items-center">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#d9cfc2] bg-[#fff0e7] text-[#c3743a]">
                <Sparkles className="w-4 h-4" /> Latest arrivals
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-6">
          <aside className="lg:col-span-1 bg-white rounded-3xl border border-[#d9cfc2] p-5 sm:p-6 space-y-5 sm:space-y-6 shadow-[0_10px_30px_rgba(28,26,23,0.08)]">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-[#5f4b3f]">
              <Search className="w-4 h-4" /> Search
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase text-[#5f4b3f] tracking-[0.4em]">Keyword</label>
              <input
                type="text"
                placeholder="Search for pens, journals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-[#d9cfc2] rounded-xl bg-[#fffaf6] focus:outline-none focus:ring-2 focus:ring-[#b7472f]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">Category</label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-sm transition ${selectedCategory === category.id ? 'bg-[#b7472f] text-white' : 'bg-[#fff9f4] text-[#5f4b3f] border border-transparent hover:border-[#d9cfc2]'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">Range</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-[#d9cfc2] rounded-xl bg-[#fffaf6] focus:outline-none focus:ring-2 focus:ring-[#b7472f]"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.max(minPrice, parseInt(e.target.value) || 10000))}
                  className="w-full px-3 py-2 border border-[#d9cfc2] rounded-xl bg-[#fffaf6] focus:outline-none focus:ring-2 focus:ring-[#b7472f]"
                  placeholder="Max"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-[#5f4b3f]">
              <span>In stock only</span>
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`inline-flex items-center justify-center w-10 h-6 rounded-full transition ${inStockOnly ? 'bg-[#b7472f]' : 'bg-[#d9cfc2]'}`}
              >
                <span className={`w-4 h-4 rounded-full bg-white transition ${inStockOnly ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setMinPrice(0);
                setMaxPrice(10000);
                setInStockOnly(false);
                setSortBy('newest');
              }}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Clear filters
            </Button>
          </aside>

          <div className="lg:col-span-3 space-y-6">
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
            )}
            <div className="flex items-center justify-between text-sm text-[#5f4b3f]">
              <p>
                Showing <span className="font-semibold">{filteredProducts.length}</span> curated picks
              </p>
              <p className="uppercase tracking-[0.4em] text-[#b7472f] text-xs">Sorted by {sortBy.replace('-', ' ')}</p>
            </div>
            {loading ? (
              <div className="rounded-2xl border border-[#d9cfc2] bg-white/80 p-12 text-center text-[#5f4b3f]">Loading...</div>
            ) : (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ staggerChildren: 0.05 }}
              >
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} whileHover={{ y: -4 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] flex items-center justify-center text-[#5f4b3f]">
          Loading products...
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
