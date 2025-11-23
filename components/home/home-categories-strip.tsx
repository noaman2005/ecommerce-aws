'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/types';

export default function HomeCategoriesStrip() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const json = await res.json();
        const list = json.success ? json.data || [] : Array.isArray(json) ? json : [];
        setCategories(list);
      } catch (err) {
        console.error('Failed to load categories for home strip', err);
      }
    };
    load();
  }, []);

  if (!categories.length) return null;

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#5f4b3f]">Shop by category</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#1c1a17] mt-2">Start with what you need most</h2>
          </div>
          <Link href="/categories" className="text-sm font-medium text-[#b7472f] flex items-center gap-2">
            Browse all categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-20 h-20 rounded-full bg-[#f6eee5] border border-[#d9cfc2] flex items-center justify-center overflow-hidden group-hover:border-[#b7472f] transition-colors">
                {category.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-[#5f4b3f] text-center px-2 line-clamp-2">
                    {category.name}
                  </span>
                )}
              </div>
              <span className="text-xs text-center text-[#5f4b3f] uppercase tracking-[0.15em] line-clamp-2">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
