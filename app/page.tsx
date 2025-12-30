import Link from 'next/link';
import { ArrowRight, Package, PenLine, Book, Brush, School, Star } from 'lucide-react';
import HomeCategoriesStrip from '@/components/home/home-categories-strip';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/storage';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils/currency';
import FeaturedCarousel from '@/components/home/featured-carousel';

export default async function Home() {
  const products = await getProducts();
  const featuredCandidates = (products || []).filter((product) => product.featured);
  const newArrivals = [...(products || [])]
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);

  const featuredProducts = (() => {
    const target = 4;
    const picked: any[] = [];
    featuredCandidates.forEach((p) => picked.length < target && picked.push(p));
    if (picked.length < target) {
      for (const p of newArrivals) {
        if (picked.find((x) => x.id === p.id)) continue;
        picked.push(p);
        if (picked.length >= target) break;
      }
    }
    return picked;
  })();

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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">Studio picks</p>
                <h2 className="text-3xl font-semibold text-[#1c1a17]">Featured products</h2>
              </div>
              <Link href="/products" className="text-sm font-semibold text-[#b7472f] flex items-center gap-2">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <FeaturedCarousel products={featuredProducts} />
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="py-16 bg-[#fff8f1]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">New arrivals</p>
                <h3 className="text-2xl sm:text-3xl font-semibold text-[#1c1a17]">Fresh on the shelves</h3>
              </div>
              <Link href="/products" className="text-sm font-semibold text-[#b7472f] flex items-center gap-2">
                Browse all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {newArrivals.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-[#e5d8c8] bg-white p-3 shadow-[0_12px_30px_rgba(28,26,23,0.06)] hover:shadow-[0_16px_38px_rgba(28,26,23,0.1)] transition"
                >
                  <div className="aspect-[4/3] w-full rounded-xl bg-[#f6eee5] border border-[#efe3d5] overflow-hidden mb-2">
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
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#b59b84]">
                      {product.categoryName || product.categoryId || 'Stationery'}
                    </p>
                    <h4 className="text-sm sm:text-base font-semibold text-[#1c1a17] line-clamp-2">{product.name}</h4>
                    <p className="text-xs text-[#5f4b3f] line-clamp-2">
                      {product.description || 'Selected for everyday study and work.'}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm sm:text-base font-bold text-[#b7472f]">{formatCurrency(product.price)}</span>
                    <span className="text-[11px] font-semibold text-[#b7472f] group-hover:translate-x-0.5 transition">
                      View
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TOP PICKS BY CATEGORY */}
      <section className="pb-20 pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">Top picks by category</p>
              <h3 className="text-2xl sm:text-3xl font-semibold text-[#1c1a17]">Jump to what you need</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'School essentials', copy: 'Bags, bottles, lunch boxes, geometry kits, textbooks.', query: 'school' },
              { title: 'Art & craft', copy: 'Brushes, sketchbooks, acrylics, origami, hobby kits.', query: 'art' },
              { title: 'Notebooks & registers', copy: 'Soft-touch journals, long books, practical notebooks.', query: 'notebook' },
              { title: 'Pens & writing', copy: 'Gel, ballpoint, fineliners, and refill packs.', query: 'pen' },
            ].map((card) => (
              <Link
                key={card.title}
                href={`/products?search=${encodeURIComponent(card.query)}`}
                className="rounded-3xl border border-[#d9cfc2] bg-white/90 p-6 shadow-[0_12px_30px_rgba(28,26,23,0.08)] hover:shadow-[0_16px_38px_rgba(28,26,23,0.12)] transition flex flex-col gap-3"
              >
                <div className="h-28 rounded-2xl bg-[radial-gradient(circle,_rgba(183,71,47,0.18),_transparent_70%)]" />
                <div className="space-y-2">
                  <h4 className="text-xl font-semibold text-[#1c1a17]">{card.title}</h4>
                  <p className="text-sm text-[#5f4b3f]">{card.copy}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#b7472f]">
                  Browse picks
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
