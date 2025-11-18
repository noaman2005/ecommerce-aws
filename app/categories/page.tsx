'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, CheckSquare, Palette, Bookmark, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  {
    id: 'notebooks',
    name: 'Notebooks',
    icon: BookOpen,
    description: 'Beautiful journals, notepads, and writing books for every purpose.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'pens',
    name: 'Pens & Writing',
    icon: PenTool,
    description: 'Premium pens, fountain pens, and writing instruments.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'planners',
    name: 'Planners',
    icon: CheckSquare,
    description: 'Organize your life with our collection of planners and calendars.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'art-supplies',
    name: 'Art Supplies',
    icon: Palette,
    description: 'Markers, colored pencils, and creative art materials.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'paper',
    name: 'Paper & Card',
    icon: Package,
    description: 'Quality cardstock, specialty paper, and craft paper.',
    color: 'from-red-500 to-pink-500',
  },
  {
    id: 'stickers',
    name: 'Stickers & Labels',
    icon: Bookmark,
    description: 'Decorative stickers to personalize your projects.',
    color: 'from-indigo-500 to-blue-500',
  },
];

export default function CategoriesPage() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/products?category=${category.id}`}>
                    <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 h-full cursor-pointer">
                      <div className={`inline-flex p-4 rounded-lg bg-gradient-to-r ${category.color} mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                      <p className="text-slate-400 mb-6">{category.description}</p>
                      <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                        <span>Explore</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
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
