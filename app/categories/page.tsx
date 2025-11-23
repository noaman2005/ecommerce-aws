"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category, Product } from '@/types';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

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
      <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#b7472f] animate-spin mx-auto mb-4" />
          <p className="text-[#5f4b3f]">Gathering gentle categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#c3743a] mx-auto mb-4" />
          <p className="text-[#5f4b3f] mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-[#b7472f] to-[#c3743a]">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf7ef] text-[#1c1a17]">
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">{APP_NAME}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4">Category Lab</h1>
          <p className="mt-4 text-[#5f4b3f] max-w-2xl mx-auto">{APP_TAGLINE} — explore the world of curated notebooks, pens, planners, and art supplies by mood.</p>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 grid gap-5 md:gap-6 grid-cols-2 md:grid-cols-3">
          {categories.map((category) => {
            const count = productCounts[category.id] || 0;
            const colorClass = categoryColors[category.id] || 'from-[#b7472f] to-[#c3743a]';
            const icon = categoryIcons[category.id] || '📦';
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link href={`/products?categoryId=${category.id}`}>
                  <div className="relative rounded-3xl border border-[#d9cfc2] bg-white/60 p-6 sm:p-8 shadow-[0_25px_60px_rgba(28,26,23,0.08)] backdrop-blur">
                    {category.imageUrl ? (
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border border-[#d9cfc2] bg-[#f4ebe3] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${colorClass} text-2xl mb-6`}>{icon}</div>
                    )}
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#1c1a17] mb-2">{category.name}</h3>
                    <p className="text-sm text-[#5f4b3f] line-clamp-2 mb-4">{category.description || 'Discover our signature pieces curated for focusing, planning, and creating.'}</p>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#b7472f]">
                      <span>{count} {count === 1 ? 'piece' : 'pieces'}</span>
                      <span>Explore →</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3 sm:space-y-4">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">Need help?</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1c1a17]">Let us guide your desk ritual</h2>
          <p className="text-[#5f4b3f]">
            If you need a bespoke selection, message the studio and we’ll walk you through the perfect supplies.
          </p>
          <Link href="/contact">
            <Button className="bg-gradient-to-r from-[#b7472f] to-[#c3743a]">Contact the Studio</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
