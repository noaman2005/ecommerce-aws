"use client";

import React, { useMemo } from "react";
import { RefreshCcw, Package, DollarSign, Layers, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { useProducts } from "@/lib/hooks/use-products";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

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

    return {
      totalProducts,
      totalInventory,
      totalValue,
      lowStock,
      uniqueCategories,
    };
  }, [products]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Overview</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Welcome back, {user?.name ?? "Admin"}</h1>
          <p className="mt-2 text-sm text-slate-400">
            Track store performance, monitor stock levels, and manage your catalogue in real time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh data
        </button>
      </header>

      {isError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
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
          value={isLoading ? "–" : currency.format(stats.totalValue)}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Latest products</h2>
              <p className="text-sm text-slate-500">Recently added or updated items</p>
            </div>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-slate-300 hover:text-white"
            >
              Manage products →
            </Link>
          </div>

          <div className="mt-6 divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-center text-sm text-slate-500">Loading products…</div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No products found. Start by adding your first product.
              </div>
            ) : (
              products
                .slice()
                .sort((a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)))
                .slice(0, 5)
                .map((product) => (
                  <article key={product.id} className="flex items-center justify-between gap-4 bg-slate-900/40 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-200">{currency.format(product.price)}</p>
                      <p className="text-xs text-slate-500">Stock: {product.stock ?? 0}</p>
                    </div>
                  </article>
                ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Low stock alert</h2>
              <p className="text-sm text-slate-500">Products with under 10 units available</p>
            </div>
            <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-300">
              {isLoading ? "–" : stats.lowStock}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Checking stock levels…</p>
            ) : stats.lowStock === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
                <AlertTriangle className="h-6 w-6 text-slate-500" />
                All products look healthy.
              </div>
            ) : (
              products
                .filter((product) => (product.stock ?? 0) < 10)
                .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.categoryId}</p>
                    </div>
                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
                      {product.stock ?? 0} left
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Orders snapshot</h2>
            <p className="text-sm text-slate-500">
              Order analytics will populate automatically once order backend endpoints are available.
            </p>
          </div>
          <Link href="/admin/orders" className="text-sm font-medium text-slate-300 hover:text-white">
            View orders →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PlaceholderStat label="Total orders" value="0" />
          <PlaceholderStat label="Pending" value="0" />
          <PlaceholderStat label="Completed" value="0" />
          <PlaceholderStat label="Revenue" value="–" />
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-slate-800/70 p-3 text-slate-100">{icon}</div>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-600">Realtime</span>
      </div>
      <p className="mt-6 text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function PlaceholderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-600">{label}</p>
      <p className="mt-3 text-xl font-semibold text-slate-200">{value}</p>
    </div>
  );
}
