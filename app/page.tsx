import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, Brush, Palette, Package } from 'lucide-react';
import HomeCategoriesStrip from '@/components/home/home-categories-strip';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/storage';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

const COLLECTIONS = [
  {
    title: 'Signature Notebooks',
    copy: 'Fine grain covers, soft tactile paper, and artisan stitching for journaling rituals.',
  },
  {
    title: 'Ink & Pens',
    copy: 'Balanced fountain pens, archival inks, and restorative brush sets.',
  },
  {
    title: 'Desk Accessories',
    copy: 'Drawer organizers, wax seals, and travel pouches curated for creative routines.',
  },
];

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = (products || []).filter((product) => product.featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] text-[#1c1a17]">
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(215,118,86,0.25),_transparent_45%)]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(90deg,_rgba(183,71,47,0.15),_transparent)]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#f4ebe3] border border-[#d9cfc2] rounded-full text-xs sm:text-sm text-[#342c24]">
              <Sparkles className="w-5 h-5 text-[#c3743a]" />
              Artisan-crafted stationery
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-[#1c1a17]">
              {APP_NAME}
              <span className="block text-xl sm:text-2xl font-light text-[#5f4b3f] mt-3 sm:mt-4">{APP_TAGLINE}</span>
            </h1>
            <p className="text-base sm:text-lg text-[#3c2f24] max-w-xl leading-relaxed">
              Discover premium notebooks, tactile papers, and writing essentials captured in a calm, collectible storefront. Nisha Stationery helps you dress your desk in intention, one beautiful tool at a time.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-[#b7472f] to-[#c3743a] text-white border-0">
                  Shop Bespoke Sets
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-[#342c24] text-[#342c24] hover:border-[#b7472f]">
                  Meet the Curators
                </Button>
              </Link>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-4 text-sm text-[#5b4c44]">
              <li className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#c3743a]" />
                Limited-edition colour stories
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#c3743a]" />
                Handmade long-stitch journals
              </li>
              <li className="flex items-center gap-2">
                <Brush className="w-4 h-4 text-[#c3743a]" />
                Pens and brushes with poised balance
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#c3743a]" />
                Sustainable packaging, mindful deliveries
              </li>
            </ul>
          </div>
          <div className="relative hidden md:block">
            <div className="relative w-full aspect-[4/5] rounded-[40px] bg-white shadow-[0_20px_70px_rgba(28,26,23,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(183,71,47,0.2),_transparent_55%)]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 text-xs text-[#5f4b3f] pt-8">
                <div className="bg-[#f4ebe3] border border-[#d9cfc2] px-4 py-2 rounded-full">Handmade Papers</div>
                <div className="bg-[#fffdf8] border border-[#d9cfc2] px-4 py-2 rounded-full">Calming Tones</div>
                <div className="bg-[#1c1a17] text-white px-6 py-3 rounded-full">Nisha Picks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeCategoriesStrip />

      <section className="py-14 sm:py-18 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:items-center justify-between mb-8 lg:mb-10">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-[#5f4b3f]">Curated Collections</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1c1a17] mt-2">Elevate your workspace quietly</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#b7472f] flex items-center gap-2">
              See entire catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {COLLECTIONS.map((collection) => (
              <div key={collection.title} className="rounded-3xl border border-[#d9cfc2] bg-white p-8 shadow-[0_10px_30px_rgba(28,26,23,0.08)]">
                <div className="h-48 rounded-2xl bg-[radial-gradient(circle_at_center,_rgba(183,71,47,0.3),_transparent_65%)] mb-6" />
                <h3 className="text-xl font-semibold text-[#1c1a17]">{collection.title}</h3>
                <p className="text-[#5f4b3f] mt-3">{collection.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-18 lg:py-20 bg-[#fff8f1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="flex items-center justify-between mb-8 lg:mb-10">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-[#5f4b3f]">Studio Picks</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#1c1a17]">Currently on the desk</h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-[#b7472f]">View all products</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="block rounded-3xl border border-[#d9cfc2] bg-white p-6 shadow-[0_15px_40px_rgba(28,26,23,0.09)] hover:shadow-[0_20px_50px_rgba(28,26,23,0.15)] transition-shadow duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.5em] text-[#5f4b3f]">{product.categoryName || 'Stationery'}</p>
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#1c1a17] mt-2">{product.name}</h3>
                    <p className="text-[#5f4b3f] mt-2 text-sm line-clamp-2">
                      {product.description || 'A Nisha Studio favorite carefully selected for its balance of craft and comfort.'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-semibold text-[#b7472f]">${product.price.toFixed(2)}</p>
                    <p className="text-xs text-[#5f4b3f]">+ shipping</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 text-center space-y-5 sm:space-y-6">
          <p className="text-xs sm:text-sm uppercase tracking-[0.6em] text-[#5f4b3f]">Carefully Crafted</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1c1a17]">A slow, beautiful stationery mood</h2>
          <p className="text-[#5f4b3f] leading-relaxed">
            At Nisha Stationery we source aromatic papers, archival inks, and expressive writing tools from artisan workshops. Each item is chosen for texture, balance, and the serene feeling it brings to your creative rituals.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {['Hand-finished', 'Ethically sourced', 'Community inspired'].map((tag) => (
              <div key={tag} className="rounded-2xl border border-[#d9cfc2] bg-white px-6 py-5 text-sm font-semibold text-[#5f4b3f]">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
