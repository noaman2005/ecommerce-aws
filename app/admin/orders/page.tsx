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
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#5f4b3f]">Operations</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-[#1c1a17]">Orders</h1>
          <p className="mt-2 text-sm text-[#5f4b3f] max-w-xl">
            Track purchases and fulfilment. Orders sync from DynamoDB into this calm overview.
          </p>
        </div>
        <Button
          type="button"
          onClick={fetchOrders}
          disabled={isLoading}
          className="inline-flex items-center gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

      <section className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-5 sm:p-6 shadow-[0_16px_40px_rgba(28,26,23,0.08)]">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#1c1a17]">Recent orders</h2>
            <p className="text-xs sm:text-sm text-[#5f4b3f]">
              All customer orders from DynamoDB. Click refresh to sync the latest data.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs sm:text-sm font-medium text-[#b7472f] hover:underline underline-offset-4"
          >
            Configure catalogue →
          </Link>
        </header>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[#f1e3d5] bg-white/90">
          <table className="min-w-full divide-y divide-[#f1e3d5]">
            <thead className="bg-[#fff8f1]">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Order</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Customer</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Status</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Total</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1e3d5] bg-[#fffdf8]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#5f4b3f]">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading orders…
                    </span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#5f4b3f]">
                    No orders yet. Once customers start purchasing, their orders will surface here.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-[#fff8f1]">
                    <td className="px-6 py-4 text-sm text-[#1c1a17]">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-[#5f4b3f]">{order.customerEmail}</td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[#1c1a17]">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-xs sm:text-sm text-[#5f4b3f]">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="mt-6 rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-5 text-xs sm:text-sm text-[#5f4b3f]">
          <p className="font-medium text-[#1c1a17]">✅ Live integration</p>
          <p className="mt-2">
            This view is connected to the
            {' '}
            <code className="rounded bg-[#f4ebe3] px-1.5 py-0.5 text-[11px] text-[#1c1a17]">ecommerce-orders</code>
            {' '}
            DynamoDB table via
            {' '}
            <code className="rounded bg-[#f4ebe3] px-1.5 py-0.5 text-[11px] text-[#1c1a17]">GET /api/orders</code>.
            {' '}
            Orders sync automatically.
          </p>
        </footer>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-5 sm:p-6 shadow-[0_16px_40px_rgba(28,26,23,0.08)]">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[#fff4ea] border border-[#f1d3b5] p-3 text-[#b7472f]">{icon}</div>
        <div>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#b59b84]">{label}</p>
          <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-semibold text-[#1c1a17]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderSummary["status"] }) {
  const map = {
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    processing: "bg-[#fff2e6] text-[#b7472f] border border-[#f1c9a3]",
    shipped: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        map[status] || map.pending
      }`}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span className="capitalize">{status}</span>
    </span>
  );
}
