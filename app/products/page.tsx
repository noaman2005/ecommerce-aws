"use client";

import React, { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/lib/hooks/use-products';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { products: allProducts, isLoading, isError, error } = useProducts();
  const searchParamsString = searchParams.toString();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize category filter from URL (?categoryId=...) when arriving from categories/home
  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    const fromCategory = params.get('categoryId');
    if (fromCategory) {
      setSelectedCategory(fromCategory);
    }
    const fromPage = Number(params.get('page') || '1');
    if (!Number.isNaN(fromPage) && fromPage > 0) {
      setPage(fromPage);
    }
  }, [searchParamsString]);

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, inStockOnly]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 250);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    if (currentPage > 1) {
      params.set('page', String(currentPage));
    } else {
      params.delete('page');
    }
    const nextQuery = params.toString();
    if (nextQuery === searchParamsString) {
      return;
    }
    router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ''}`, { scroll: false });
  }, [currentPage, pathname, router, searchParamsString]);

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

        <section
          className={`sticky top-4 z-30 rounded-3xl border border-[#d9cfc2] bg-white/80 p-4 sm:p-6 shadow-[0_12px_30px_rgba(28,26,23,0.12)] space-y-4 backdrop-blur-md transition-all duration-300 ${
            isScrolling ? 'opacity-40 scale-[0.99]' : 'opacity-100'
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f] flex items-center gap-2">
              <Search className="w-4 h-4" /> Search
            </label>
            <div className="flex w-full gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#b59b84]" />
                <input
                  type="text"
                  placeholder="Search for pens, journals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-[#d9cfc2] bg-[#fffaf6] py-2 pl-9 pr-4 text-sm text-[#1c1a17] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/50"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className={`shrink-0 border-2 ${selectedCategory !== 'all' || minPrice !== 0 || maxPrice !== 10000 || inStockOnly ? 'border-[#b7472f] text-[#b7472f]' : 'border-[#d9cfc2] text-[#5f4b3f]'}`}
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
              </Button>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
        )}

        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-[#5f4b3f]">
            <p>
              Showing
              <span className="font-semibold">
                {filteredProducts.length === 0
                  ? ' 0 '
                  : ` ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredProducts.length)} `}
              </span>
              of <span className="font-semibold">{filteredProducts.length}</span> curated picks
            </p>
            <p className="uppercase tracking-[0.4em] text-[#b7472f] text-xs">Sorted by {sortBy.replace('-', ' ')}</p>
          </div>
          {loading ? (
            <div className="rounded-2xl border border-[#d9cfc2] bg-white/80 p-12 text-center text-[#5f4b3f]">Loading...</div>
          ) : (
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {paginatedProducts.map((product) => (
                <motion.div key={product.id} whileHover={{ y: -4 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {filteredProducts.length > pageSize && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] px-4 py-3 text-sm text-[#5f4b3f]">
              <p>
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPage(num)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        num === currentPage ? 'bg-[#b7472f] text-white' : 'bg-transparent text-[#5f4b3f] hover:bg-[#f1e3d5]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl bg-[#fffdf8] border border-[#f1e3d5] p-5 sm:p-6 space-y-5"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-[#b59b84]">Filters</p>
                  <h3 className="text-xl font-semibold text-[#1c1a17]">Refine your ritual</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="text-sm text-[#b7472f] font-semibold"
                >
                  Close
                </button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-2xl text-sm transition ${selectedCategory === category.id ? 'bg-[#b7472f] text-white' : 'bg-[#fff9f4] text-[#5f4b3f] border border-transparent hover:border-[#d9cfc2]'}`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">Price range</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-2xl border border-[#d9cfc2] bg-[#fffaf6] px-3 py-2 text-sm focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/60"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.max(minPrice, parseInt(e.target.value) || 10000))}
                      className="w-full rounded-2xl border border-[#d9cfc2] bg-[#fffaf6] px-3 py-2 text-sm focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/60"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[#f1e3d5] bg-white px-4 py-3 text-sm text-[#5f4b3f]">
                  <span>In stock only</span>
                  <button
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`inline-flex items-center justify-center w-12 h-6 rounded-full transition ${inStockOnly ? 'bg-[#b7472f]' : 'bg-[#d9cfc2]'}`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-white shadow transition ${inStockOnly ? 'translate-x-3' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setMinPrice(0);
                    setMaxPrice(10000);
                    setInStockOnly(false);
                    setSortBy('newest');
                  }}
                >
                  Reset filters
                </Button>
                <Button className="flex-1 bg-[#b7472f] text-white" onClick={() => setFiltersOpen(false)}>
                  Apply
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
