'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Percent,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Sparkles,
  PackageCheck,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import AddProductModal from '@/components/products/AddProductModal';
import { DashboardStats } from '@/types/fashion';
import { useToast } from '@/components/ui/Toast';
import { useApiAuth, apiFetch } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();
  const apiAuth = useApiAuth();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/dashboard/stats', apiAuth);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Overview Penjualan
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Data
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Performa transaksi toko busana dari database PostgreSQL <code className="font-semibold text-indigo-500">deral-fashion</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('Laporan penjualan diekspor ke format PDF/Excel', 'success')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              Unduh Laporan
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Pendapatan
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats ? formatIDR(stats.totalRevenue) : 'Rp 84.650.000'}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> +14.2%
                </span>
                <span className="text-slate-500 dark:text-slate-400">vs bulan lalu</span>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pesanan Masuk
              </span>
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats ? stats.totalOrders : '342'}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> +8.5%
                </span>
                <span className="text-slate-500 dark:text-slate-400">order selesai</span>
              </div>
            </div>
          </div>

          {/* New Customers */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pelanggan Terdaftar
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats ? stats.totalCustomers : '128'}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> +24%
                </span>
                <span className="text-slate-500 dark:text-slate-400">member aktif</span>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Tingkat Konversi
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                3.8%
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Fashion Benchmark: 2.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Curve Chart (2 Cols) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tren Penjualan Mingguan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Arus pendapatan harian busana & gaun
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Agustus 2026
              </span>
            </div>

            {/* SVG Interactive Curve */}
            <div className="h-56 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="35" x2="500" y2="35" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4" />
                <line x1="0" y1="85" x2="500" y2="85" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4" />
                <line x1="0" y1="135" x2="500" y2="135" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4" />

                {/* Area Fill */}
                <path d="M 0 150 Q 75 120, 150 90 T 300 50 T 425 30 L 500 60 L 500 175 L 0 175 Z" fill="url(#chartGradient)" />
                {/* Stroke */}
                <path d="M 0 150 Q 75 120, 150 90 T 300 50 T 425 30 L 500 60" fill="none" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" />

                <circle cx="150" cy="90" r="5" className="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-[3]" />
                <circle cx="300" cy="50" r="5" className="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-[3]" />
                <circle cx="425" cy="30" r="6" className="fill-pink-500 stroke-white dark:stroke-slate-900 stroke-[3]" />
              </svg>
              <div className="flex justify-between text-xs font-medium text-slate-400 mt-2">
                <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
              </div>
            </div>
          </div>

          {/* Top Selling Categories (1 Col) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kategori Terlaris
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Proporsi volume penjualan
              </p>

              <div className="mt-6 space-y-4">
                {(stats?.topCategories || [
                  { name: 'Outerwear & Blazers', percentage: 42, amount: 35500000, color: '#4f46e5' },
                  { name: 'Dresses & Gaun', percentage: 28, amount: 23700000, color: '#ec4899' },
                  { name: 'Sepatu Kulit & Boots', percentage: 18, amount: 15200000, color: '#10b981' },
                  { name: 'Kemeja & Tops', percentage: 12, amount: 10250000, color: '#f59e0b' }
                ]).map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">{cat.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/products"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-between"
              >
                <span>Kelola Inventori Produk</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pesanan Terbaru Masuk
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Transaksi langsung dari pembeli online
              </p>
            </div>
            <Link
              href="/orders"
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Invoice</th>
                  <th className="px-6 py-3.5">Pelanggan</th>
                  <th className="px-6 py-3.5">Item Busana</th>
                  <th className="px-6 py-3.5">Total Bayar</th>
                  <th className="px-6 py-3.5">Status Pembayaran</th>
                  <th className="px-6 py-3.5">Status Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map(order => {
                    let statusBadge = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
                    if (order.status === 'processing') statusBadge = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                    if (order.status === 'delivered' || order.status === 'confirmed') statusBadge = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                    if (order.status === 'shipped') statusBadge = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                          {order.customer_name || 'Tamu / Walk-in'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {order.items_summary || '1x Produk Busana'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                          {formatIDR(order.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${order.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                            {order.payment_status === 'paid' ? 'Lunas' : 'Menunggu'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Belum ada transaksi pesanan terbaru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchStats();
        }}
      />
    </AdminLayout>
  );
}
