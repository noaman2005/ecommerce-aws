import Link from 'next/link';
import { ArrowRight, ShoppingBag, Shield, Truck, Star, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/storage';

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = (products || []).filter((p) => p.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full">
                  <Zap className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="text-sm text-blue-300 font-medium">Handpicked Stationery</span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  Paper & Ink
                  <span className="block text-2xl font-semibold text-slate-300 mt-2">Beautiful stationery for everyday creativity</span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-lg">
                  Browse our curated catalogue of notebooks, pens, planners and art supplies. For now this site
                  is a product showcase — delivery starts soon.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                    Start Shopping
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                {/* Seller signup moved to footer */}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <p className="text-2xl font-bold text-white">50K+</p>
                  <p className="text-sm text-slate-400">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">10K+</p>
                  <p className="text-sm text-slate-400">Sellers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">100K+</p>
                  <p className="text-sm text-slate-400">Happy Customers</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-3xl rounded-2xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <ShoppingBag className="w-48 h-48 text-white opacity-20 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Choose Paper & Ink?</h2>
            <p className="text-slate-400 text-lg">Quality stationery, carefully selected for creativity and durability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                title: 'Lightning Fast Delivery',
                description: 'Get your orders delivered quickly with real-time tracking on all shipments.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Shield,
                title: 'Secure & Protected',
                description: 'Enterprise‑grade security with encrypted payments and buyer protection guarantee.',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Globe,
                title: 'Global Selection',
                description: 'Browse thousands of premium products from verified sellers worldwide.',
                color: 'from-purple-500 to-pink-500',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Trending Now</h2>
              <p className="text-slate-400">Discover what is hot this season</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <Link key={product.id} href={`/products/${product.id}`} className="block">
                <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 h-full flex flex-col">
                  <div className="relative aspect-square bg-slate-900 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center">
                      <ShoppingBag className="w-20 h-20 text-slate-700 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    {index === 0 && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-white text-xs font-bold">Featured</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">{product.categoryName || product.categoryId || ''}</p>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">{product.name}</h3>
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-slate-700">
                      <div>
                        <p className="text-2xl font-bold text-white">${product.price.toFixed(2)}</p>
                      </div>
                      {((product as any).rating || (product as any).rating === 0) ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-slate-300">{(product as any).rating}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Notice */}
      <section className="relative py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-full mb-4">
            <Truck className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-sm text-slate-300">Delivery starting soon — this site is currently a product catalogue for viewing only.</span>
          </div>
          <div>
            <Link href="/products">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                Browse Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
