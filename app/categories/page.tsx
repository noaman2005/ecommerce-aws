'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category, Product } from '@/types';

const categoryIcons: { [key: string]: React.ReactNode } = {
  'notebooks': '📓',
  'pens': '✏️',
  'planners': '📅',
  'art-supplies': '🎨',
  'paper': '📄',
  'stickers': '✨',
};

const categoryColors: { [key: string]: string } = {
  'notebooks': 'from-blue-500 to-cyan-500',
  'pens': 'from-purple-500 to-pink-500',
  'planners': 'from-green-500 to-emerald-500',
  'art-supplies': 'from-yellow-500 to-orange-500',
  'paper': 'from-red-500 to-pink-500',
  'stickers': 'from-indigo-500 to-blue-500',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories from Next.js API route
        const categoriesRes = await fetch('/api/categories', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!categoriesRes.ok) {
          throw new Error('Failed to fetch categories');
        }

        const categoriesData = await categoriesRes.json();
        const categoryList = categoriesData.success ? (categoriesData.data || []) : (Array.isArray(categoriesData) ? categoriesData : []);
        setCategories(categoryList);

        // Fetch products to count by category
        const productsRes = await fetch('/api/products', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const products = productsData.success ? (productsData.data || []) : (Array.isArray(productsData) ? productsData : []);

          // Count products per category
          const counts: { [key: string]: number } = {};
          products.forEach((product: Product) => {
            if (product.categoryId) {
              counts[product.categoryId] = (counts[product.categoryId] || 0) + 1;
            }
          });
          setProductCounts(counts);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-300 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-500 hover:bg-blue-600">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Shop by Category
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Explore our collections of beautiful stationery and writing supplies organized by category.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No categories available yet.</p>
              <Link href="/products">
                <Button className="mt-4 bg-blue-500 hover:bg-blue-600">
                  Browse All Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => {
                const count = productCounts[category.id] || 0;
                const color = categoryColors[category.id] || 'from-blue-500 to-cyan-500';
                const icon = categoryIcons[category.id] || '📦';

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/products?categoryId=${category.id}`}>
                      <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 h-full cursor-pointer">
                        <div className={`inline-flex p-4 rounded-lg bg-gradient-to-r ${color} mb-6 group-hover:scale-110 transition-transform text-2xl`}>
                          {icon}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                        {category.description && (
                          <p className="text-slate-400 mb-4 line-clamp-2">{category.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">
                            {count} {count === 1 ? 'product' : 'products'}
                          </span>
                          <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                            <span>Explore</span>
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Browse all our products or contact us for custom requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                Browse All Products
              </Button>
            </Link>
            <a href="mailto:support@paperink.com">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
