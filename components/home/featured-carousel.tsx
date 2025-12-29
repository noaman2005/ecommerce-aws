'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { Product } from '@/types';

interface FeaturedCarouselProps {
  products: Product[];
}

const SLIDE_INTERVAL = 5000;
const SLIDE_SIZE = 4;

export default function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const slides = useMemo(() => {
    if (!products || products.length === 0) return [];
    const chunks: Product[][] = [];
    for (let i = 0; i < products.length; i += SLIDE_SIZE) {
      chunks.push(products.slice(i, i + SLIDE_SIZE));
    }
    return chunks;
  }, [products]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  const currentSlide = slides[Math.min(index, slides.length - 1)];

  const goPrev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((prev) => (prev + 1) % slides.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">Studio picks</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full border border-[#d9cfc2] bg-white p-2 text-[#5f4b3f] hover:text-[#b7472f] hover:border-[#b7472f] transition"
            aria-label="Previous featured slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full border border-[#d9cfc2] bg-white p-2 text-[#5f4b3f] hover:text-[#b7472f] hover:border-[#b7472f] transition"
            aria-label="Next featured slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {currentSlide.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group flex h-full flex-col rounded-3xl border border-[#d9cfc2] bg-white p-3 sm:p-4 shadow-[0_12px_30px_rgba(28,26,23,0.08)] hover:shadow-[0_16px_38px_rgba(28,26,23,0.12)] transition"
          >
            <div className="aspect-[4/3] w-full rounded-2xl bg-[#f6eee5] border border-[#efe3d5] overflow-hidden mb-2 sm:mb-3">
              {product.images && product.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#b59b84] px-3 text-center">
                  {product.name}
                </div>
              )}
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">
                {product.categoryName || product.categoryId || 'Stationery'}
              </p>
              <h3 className="text-base sm:text-lg font-semibold text-[#1c1a17] line-clamp-2">{product.name}</h3>
              <p className="text-xs sm:text-sm text-[#5f4b3f] line-clamp-2">
                {product.description || 'Curated for everyday desk rituals.'}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg sm:text-xl font-bold text-[#b7472f]">{formatCurrency(product.price)}</span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#b7472f] group-hover:translate-x-0.5 transition">
                View
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition ${
                i === index ? 'bg-[#b7472f]' : 'bg-[#e5d8c8]'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
