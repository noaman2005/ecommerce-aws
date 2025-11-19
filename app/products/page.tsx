'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { useProducts } from '@/lib/hooks/use-products';

export default function ProductsPage() {
  const { products: allProducts, isLoading, isError, error } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Initialize category from URL query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, []);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, string>();
    
    // Build map of categoryId -> categoryName from products
    allProducts.forEach((p) => {
      if (p.categoryId && !categoryMap.has(p.categoryId)) {
        categoryMap.set(p.categoryId, p.categoryName || p.categoryId);
      }
    });
    
    // Convert map to array for display
    const categoryList = Array.from(categoryMap).map(([id, name]) => ({ id, name }));
    
    return [{ id: 'all', name: 'All Products' }, ...categoryList];
  }, [allProducts]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
  ];

  const filteredProducts = useMemo(() => {
    const productsCopy = [...allProducts];

    let filtered = productsCopy.filter((product) => {
      // Search filter
      if (searchQuery) {
        const normalized = searchQuery.toLowerCase();
        const matchesSearch = (
          product.name.toLowerCase().includes(normalized) ||
          product.description.toLowerCase().includes(normalized)
        );
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
        return false;
      }

      // Price range filter
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }

      // Stock filter
      if (inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    });

    // Sorting
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Discover our collection of quality products</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 space-y-4"
            >
              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 block mb-1">Min Price</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 block mb-1">Max Price</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Math.max(minPrice, parseInt(e.target.value) || 10000))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    ${minPrice} - ${maxPrice}
                  </div>
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">In Stock Only</span>
                </label>
              </div>

              {/* Reset Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('all');
                  setMinPrice(0);
                  setMaxPrice(10000);
                  setInStockOnly(false);
                  setSearchQuery('');
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredProducts.length}</span> products
          </p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-16 text-gray-600">Loading products...</div>
        )}
        {errorMessage && !loading && (
          <div className="text-center py-16 text-red-600">{errorMessage}</div>
        )}

        {/* Products Grid */}
        {!loading && !errorMessage && filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
