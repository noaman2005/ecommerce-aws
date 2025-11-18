'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Target, Users, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Quality First',
      description: 'We curate only the finest stationery and writing supplies for our customers.',
    },
    {
      icon: Heart,
      title: 'Passion for Stationery',
      description: 'We believe in the joy of writing and the beauty of well-crafted paper goods.',
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'We serve a community of creatives, writers, and stationery enthusiasts.',
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'We prioritize eco-friendly products and responsible sourcing.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              About Paper & Ink
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Your destination for beautiful, high-quality stationery that inspires creativity and brings joy to everyday writing.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                Paper & Ink was founded with a simple belief: that beautiful stationery can transform the everyday experience of writing. In a world increasingly digital, we celebrate the tactile joy of pen on paper and the creativity it inspires.
              </p>
              <p>
                We carefully curate every product in our collection, selecting notebooks, pens, planners, and art supplies from the best craftspeople and manufacturers around the world. Whether you&apos;re a student, artist, professional, or enthusiast, we have something to inspire your next project.
              </p>
              <p>
                Our mission is simple: to provide the stationery community with access to quality products that make writing and creating a pleasure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-slate-400 text-lg">What we stand for</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-slate-400 text-sm">{value.description}</p>
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
            Ready to explore?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Start browsing our collection of beautiful stationery today.
          </p>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
