import Link from 'next/link';
import { ArrowRight, Package, PenLine, Book, Brush, School, Star } from 'lucide-react';
import HomeCategoriesStrip from '@/components/home/home-categories-strip';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/storage';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils/currency';

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
      {/* HERO */}
      <section className="pt-16 pb-20 bg-gradient-to-br from-[#fff3eb] via-[#fde7d9] to-[#f8d7c4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <p className="text-[#b7472f] font-semibold tracking-[0.4em] uppercase text-xs sm:text-sm">
              Local stationery store in Kurla
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-[#1c1a17]">
              {APP_NAME}
              <span className="block text-xl sm:text-2xl font-light text-[#5f4b3f] mt-3">{APP_TAGLINE}</span>
            </h1>
            <p className="text-base sm:text-lg text-[#4a3b33] max-w-xl">
              All school, office, and art supplies available under one warm roof. SSC textbooks, FYJC/SYJC guides, geometry boxes, curated pens, journals, and more—all sourced with the same intentional calm you expect from Nisha Stationery.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-[#b7472f] to-[#c3743a] text-white">
                  Browse Products <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-[#b7472f] text-[#b7472f]">
                  Contact Store
                </Button>
              </Link>
            </div>

            <ul className="grid grid-cols-2 gap-3 text-sm font-medium text-[#5f4b3f]">
              <li className="flex items-center gap-2"><PenLine className="w-4 h-4 text-[#b7472f]" />Pens & pencils</li>
              <li className="flex items-center gap-2"><Book className="w-4 h-4 text-[#b7472f]" />Notebooks & registers</li>
              <li className="flex items-center gap-2"><School className="w-4 h-4 text-[#b7472f]" />SSC / FYJC guides</li>
              <li className="flex items-center gap-2"><Brush className="w-4 h-4 text-[#b7472f]" />Art & craft kits</li>
            </ul>
          </div>

          <div className="hidden lg:flex justify-center">
            <img
              src="/hero-stationery.jpg"
              alt="Nisha Stationery"
              className="object-cover w-[90%] rounded-[32px] shadow-[0_30px_70px_rgba(28,26,23,0.12)]"
            />
          </div>
        </div>
      </section>

      <HomeCategoriesStrip />

      {/* FEATURED */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">Studio picks</p>
                <h2 className="text-3xl font-semibold text-[#1c1a17]">Featured products</h2>
              </div>
              <Link href="/products" className="text-sm font-semibold text-[#b7472f] flex items-center gap-2">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="block rounded-3xl border border-[#d9cfc2] bg-white p-6 shadow-[0_15px_40px_rgba(28,26,23,0.09)] hover:shadow-[0_20px_50px_rgba(28,26,23,0.15)] transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">{product.categoryName || 'Stationery'}</p>
                      <h3 className="text-xl font-semibold text-[#1c1a17] mt-2">{product.name}</h3>
                      <p className="text-[#5f4b3f] mt-2 text-sm line-clamp-2">
                        {product.description || 'A calm, well-made essential chosen for daily desk rituals.'}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-[#b7472f]">{formatCurrency(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STORE BENEFITS */}
      <section className="py-16 bg-[#fff8f1]">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-[#5f4b3f]">Why shop with us</p>
            <h3 className="text-2xl font-semibold text-[#1c1a17] mt-2">Nisha Stationery advantages</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {["Best local pricing", "Trusted Indian brands", "School essentials always in stock", "Friendly, fast service"].map((benefit) => (
              <div key={benefit} className="p-5 bg-white rounded-2xl border border-[#f1d9ca] shadow-[0_12px_30px_rgba(28,26,23,0.08)]">
                <Star className="w-6 h-6 text-[#b7472f] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#4c3d34]">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEASONAL CTA */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-[#b7472f]">Seasonal spotlight</p>
          <h3 className="text-3xl font-semibold text-[#1c1a17]">Back-to-school essentials are here</h3>
          <p className="text-[#5f4b3f]">
            School books, bottles, lunch boxes, geometry kits, and workbook bundles—fresh designs from beloved Indian brands, ready for quick pickup.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-gradient-to-r from-[#b7472f] to-[#c3743a] text-white">
              See school supplies
            </Button>
          </Link>
        </div>
      </section>

      {/* COLLECTION HIGHLIGHTS */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLLECTIONS.map((collection) => (
            <div key={collection.title} className="rounded-3xl border border-[#d9cfc2] bg-white/90 p-8 shadow-[0_15px_40px_rgba(28,26,23,0.08)]">
              <div className="h-44 rounded-2xl bg-[radial-gradient(circle,_rgba(183,71,47,0.18),_transparent_70%)] mb-6" />
              <h4 className="text-xl font-semibold text-[#1c1a17]">{collection.title}</h4>
              <p className="text-[#5f4b3f] mt-3">{collection.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-5">
          <p className="text-xs uppercase tracking-[0.6em] text-[#5f4b3f]">Carefully crafted</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1c1a17]">A slow, beautiful stationery mood</h2>
          <p className="text-[#5f4b3f] leading-relaxed">
            We partner with Indian workshops, school distributors, and boutique pen houses to keep shelves stocked with mindful essentials. Each product is chosen for feel, function, and the calm it brings to your creative rituals.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {["Hand-finished", "Ethically sourced", "Community inspired"].map((tag) => (
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
