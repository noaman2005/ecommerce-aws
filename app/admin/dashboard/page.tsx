"use client";

import React, { useMemo } from "react";
import { RefreshCcw, Package, DollarSign, Layers, AlertTriangle, TrendingUp, ImageOff, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { useProducts } from "@/lib/hooks/use-products";
import { formatCurrency } from "@/lib/utils/currency";

export default function AdminDashboard() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const { products, isLoading, isError, refresh } = useProducts({ token });

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalInventory = products.reduce((sum, product) => sum + (product.stock ?? 0), 0);
    const totalValue = products.reduce((sum, product) => sum + product.price * (product.stock ?? 0), 0);
    const lowStock = products.filter((product) => (product.stock ?? 0) < 10).length;
    const uniqueCategories = new Set(products.map((product) => product.categoryId)).size;
    const unassigned = products.filter((p) => !p.categoryId).length;
    const noImages = products.filter((p) => !p.images || p.images.length === 0).length;

    return {
      totalProducts,
      totalInventory,
      totalValue,
      lowStock,
      uniqueCategories,
      unassigned,
      noImages,
    };
  }, [products]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#5f4b3f]">Admin overview</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-[#1c1a17]">
            Welcome back, {user?.name ?? "Admin"}
          </h1>
          <p className="mt-2 text-sm text-[#5f4b3f] max-w-xl">
            Keep an eye on products, inventory health and orders from a calm, paper-inspired workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          className="inline-flex items-center gap-2 rounded-full border border-[#d9cfc2] bg-white/80 px-4 py-2 text-xs sm:text-sm font-medium text-[#5f4b3f] shadow-sm hover:bg-[#f4ebe3] transition-colors"
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh data
        </button>
      </header>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load products from the backend. Please try again shortly.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Package className="h-6 w-6" />}
          label="Total products"
          value={isLoading ? "–" : stats.totalProducts.toString()}
        />
        <StatCard
          icon={<Layers className="h-6 w-6" />}
          label="Active categories"
          value={isLoading ? "–" : stats.uniqueCategories.toString()}
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Units in inventory"
          value={isLoading ? "–" : stats.totalInventory.toString()}
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6" />}
          label="Inventory value"
          value={isLoading ? "–" : formatCurrency(stats.totalValue)}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <AttentionCard
          title="No images"
          helper="Products missing imagery"
          count={isLoading ? null : stats.noImages}
          icon={<ImageOff className="h-5 w-5 text-[#b7472f]" />}
          actionHref="/admin/products"
          actionLabel="Add images"
        />
        <AttentionCard
          title="Unassigned"
          helper="Products without a category"
          count={isLoading ? null : stats.unassigned}
          icon={<Tag className="h-5 w-5 text-[#b7472f]" />}
          actionHref="/admin/categories"
          actionLabel="Assign now"
        />
        <AttentionCard
          title="Low stock"
          helper="Under 10 units"
          count={isLoading ? null : stats.lowStock}
          icon={<AlertTriangle className="h-5 w-5 text-[#c3743a]" />}
          actionHref="/admin/products"
          actionLabel="Restock"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-5 sm:p-6 shadow-[0_16px_40px_rgba(28,26,23,0.08)] lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#1c1a17]">Latest products</h2>
              <p className="text-xs sm:text-sm text-[#5f4b3f]">Recently added or updated stationery pieces</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs sm:text-sm font-medium text-[#b7472f] hover:underline underline-offset-4"
            >
              Manage products →
            </Link>
          </div>

          <div className="mt-5 sm:mt-6 divide-y divide-[#f1e3d5] border border-[#f1e3d5] rounded-2xl overflow-hidden bg-white/90">
            {isLoading ? (
              <div className="p-6 text-center text-sm text-[#5f4b3f]">Loading products…</div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#5f4b3f]">
                No products found. Start by adding your first product.
              </div>
            ) : (
              products
                .slice()
                .sort((a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)))
                .slice(0, 5)
                .map((product) => (
                  <article
                    key={product.id}
                    className="flex items-center justify-between gap-4 bg-[#fffdf8] px-4 py-3 sm:px-5 sm:py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1c1a17] line-clamp-1">{product.name}</p>
                      <p className="text-xs text-[#5f4b3f] line-clamp-1">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#b7472f]">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-[#5f4b3f]">Stock: {product.stock ?? 0}</p>
                    </div>
                  </article>
                ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-5 sm:p-6 shadow-[0_16px_40px_rgba(28,26,23,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#1c1a17]">Low stock alert</h2>
              <p className="text-xs sm:text-sm text-[#5f4b3f]">Products with under 10 units available</p>
            </div>
            <span className="rounded-full bg-[#fff2e6] px-3 py-1 text-xs font-semibold text-[#b7472f] border border-[#f1c9a3]">
              {isLoading ? "–" : stats.lowStock}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <p className="text-sm text-[#5f4b3f]">Checking stock levels…</p>
            ) : stats.lowStock === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-6 text-center text-sm text-[#5f4b3f]">
                <AlertTriangle className="h-6 w-6 text-[#c3743a]" />
                All products look healthy.
              </div>
            ) : (
              products
                .filter((product) => (product.stock ?? 0) < 10)
                .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1c1a17] line-clamp-1">{product.name}</p>
                      <p className="text-xs text-[#5f4b3f]">{product.categoryId}</p>
                    </div>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 border border-red-200">
                      {product.stock ?? 0} left
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-5 sm:p-6 shadow-[0_16px_40px_rgba(28,26,23,0.08)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#1c1a17]">Owner checklist</h2>
            <p className="text-xs sm:text-sm text-[#5f4b3f]">Fast actions to keep the catalog healthy.</p>
          </div>
          <Link href="/admin/how-to" className="text-xs sm:text-sm font-medium text-[#b7472f] hover:underline underline-offset-4">
            Open how-to →
          </Link>
        </div>
        <div className="mt-5 sm:mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Bulk upload", helper: "Use CSV template, then backfill images", href: "/admin/products" },
            { title: "Assign categories", helper: "Filter unassigned and apply", href: "/admin/categories" },
            { title: "Feature products", helper: "Mark 4+ hero picks", href: "/admin/products" },
            { title: "Check low stock", helper: "Restock under 10 units", href: "/admin/products" },
            { title: "Add placeholders", helper: "Drop images into /public/placeholders", href: "/admin/how-to" },
            { title: "Review new arrivals", helper: "Update photos & categories", href: "/admin/products" },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 hover:border-[#d9cfc2] hover:shadow-[0_10px_24px_rgba(28,26,23,0.08)] transition"
            >
              <p className="text-sm font-semibold text-[#1c1a17]">{item.title}</p>
              <p className="text-xs text-[#5f4b3f] mt-1">{item.helper}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-5 sm:p-6 shadow-[0_16px_40px_rgba(28,26,23,0.08)]">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-[#fff4ea] border border-[#f1d3b5] p-3 text-[#b7472f]">{icon}</div>
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#b59b84]">Realtime</span>
      </div>
      <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-[#5f4b3f]">{label}</p>
      <p className="text-xl sm:text-2xl font-semibold text-[#1c1a17]">{value}</p>
    </div>
  );
}

function PlaceholderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4">
      <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#b59b84]">{label}</p>
      <p className="mt-2 sm:mt-3 text-lg sm:text-xl font-semibold text-[#1c1a17]">{value}</p>
    </div>
  );
}

function AttentionCard({
  title,
  helper,
  count,
  icon,
  actionHref,
  actionLabel,
}: {
  title: string;
  helper: string;
  count: number | null;
  icon: React.ReactNode;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-4 sm:p-5 shadow-[0_12px_30px_rgba(28,26,23,0.08)] space-y-3">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-[#fff4ea] border border-[#f1d3b5] p-3 text-[#b7472f]">{icon}</div>
        <span className="text-xs font-semibold text-[#1c1a17]">
          {count === null ? "–" : count}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1c1a17]">{title}</p>
        <p className="text-xs text-[#5f4b3f]">{helper}</p>
      </div>
      <Link href={actionHref} className="inline-flex items-center gap-2 text-sm font-semibold text-[#b7472f]">
        {actionLabel}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
