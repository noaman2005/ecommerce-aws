"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  PackageSearch,
  RefreshCcw,
  ShoppingBag,
  Truck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";

interface OrderSummary {
  id: string;
  orderNumber: string;
  customerEmail: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const token = useAuthStore((state) => state.token);

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      const orderList = data.data || [];

      type RawOrder = {
        id?: string;
        userId?: string;
        status?: string;
        total?: number | string;
        createdAt?: string;
      };

      // Map backend Order to OrderSummary (safely narrow unknown shapes)
      const summaries: OrderSummary[] = (orderList as RawOrder[]).map((order) => {
        const id = order.id ?? '';
        const status = (['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).includes(
          (order.status as OrderSummary['status'])
        )
          ? (order.status as OrderSummary['status'])
          : 'pending';

        return {
          id,
          orderNumber: id,
          customerEmail: order.userId ?? 'Unknown',
          status,
          total: Number(order.total ?? 0) || 0,
          createdAt: order.createdAt ?? new Date().toISOString(),
        };
      });

      setOrders(summaries);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Unable to load orders');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
     
  }, [token]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((order) => order.status === "pending").length;
    const processing = orders.filter((order) => order.status === "processing").length;
    const shipped = orders.filter((order) => order.status === "shipped" || order.status === "delivered").length;
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);

    return {
      total,
      pending,
      processing,
      shipped,
      revenue,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Orders</h1>
          <p className="mt-2 text-sm text-slate-400">
            Track purchases and fulfilment. Orders are synced from DynamoDB in real-time.
          </p>
        </div>
        <Button type="button" onClick={fetchOrders} disabled={isLoading} className="inline-flex items-center gap-2">
          <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Total orders"
          value={isLoading ? "–" : stats.total.toString()}
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Pending"
          value={isLoading ? "–" : stats.pending.toString()}
        />
        <StatCard
          icon={<PackageSearch className="h-5 w-5" />}
          label="Processing"
          value={isLoading ? "–" : stats.processing.toString()}
        />
        <StatCard
          icon={<Truck className="h-5 w-5" />}
          label="Shipped / Delivered"
          value={isLoading ? "–" : stats.shipped.toString()}
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent orders</h2>
            <p className="text-sm text-slate-500">
              All customer orders from DynamoDB. Click refresh to sync latest data.
            </p>
          </div>
          <Link href="/admin/products" className="text-sm font-medium text-violet-300 hover:text-white">
            Configure catalogue →
          </Link>
        </header>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/70">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Total</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading orders…
                    </span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                    No orders yet. Once customers start purchasing, their orders will surface here.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-slate-900/60">
                    <td className="px-6 py-4 text-sm text-slate-300">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{order.customerEmail}</td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-300">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-300">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">
          <p className="font-medium text-slate-300">✅ Live Integration</p>
          <p className="mt-2">
            This view is now connected to the <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-200">ecommerce-orders</code> DynamoDB table via <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-200">GET /api/orders</code>. Orders sync automatically.
          </p>
        </footer>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-800/70 p-3 text-slate-100">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-600">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderSummary["status"] }) {
  const map = {
    pending: "bg-amber-500/20 text-amber-200",
    processing: "bg-blue-500/20 text-blue-200",
    shipped: "bg-sky-500/20 text-sky-200",
    delivered: "bg-emerald-500/20 text-emerald-200",
    cancelled: "bg-red-500/20 text-red-200",
  } as const;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${map[status] || map.pending}`}>
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span className="capitalize">{status}</span>
    </span>
  );
}
