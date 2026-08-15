'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Sparkles, MapPin } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Customer } from '@/types/fashion';
import { useToast } from '@/components/ui/Toast';
import { useApiAuth, apiFetch } from '@/contexts/AuthContext';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();
  const apiAuth = useApiAuth();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/customers', apiAuth);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filtered = customers.filter(c => {
    const fullName = `${c.first_name} ${c.last_name || ''}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Daftar Pelanggan & Member VIP
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {customers.length} Member
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Data riwayat transaksi, total belanja (*Lifetime Value*), dan tier loyalitas member.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('Data member diekspor ke CSV', 'success')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              Export Member CSV
            </button>
            <button
              onClick={fetchCustomers}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau email member..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            Menampilkan {filtered.length} pelanggan
          </span>
        </div>

        {/* Customers Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Nama Pelanggan</th>
                  <th className="px-6 py-4">Kontak / Email</th>
                  <th className="px-6 py-4">Tier Loyalitas</th>
                  <th className="px-6 py-4">Total Belanja (LTV)</th>
                  <th className="px-6 py-4">Jumlah Pesanan</th>
                  <th className="px-6 py-4">Terdaftar Sejak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length > 0 ? (
                  filtered.map(cust => {
                    let tierBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {cust.loyalty_tier}
                      </span>
                    );

                    if (cust.loyalty_tier === 'VIP Platinum') {
                      tierBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-400/30">
                          <Sparkles className="w-3 h-3 text-indigo-500" /> VIP Platinum
                        </span>
                      );
                    } else if (cust.loyalty_tier === 'VIP Gold') {
                      tierBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                          ⭐ VIP Gold
                        </span>
                      );
                    }

                    return (
                      <tr key={cust.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 flex-shrink-0">
                              {cust.first_name.slice(0, 1)}
                              {cust.last_name ? cust.last_name.slice(0, 1) : ''}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                                {cust.first_name} {cust.last_name || ''}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">{cust.phone || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                          {cust.email}
                        </td>
                        <td className="px-6 py-4">{tierBadge}</td>
                        <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                          {formatIDR(cust.total_spent)}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {cust.orders_count} pesanan
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(cust.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="text-3xl mb-2">👥</div>
                      <p className="font-semibold">Tidak ada pelanggan ditemukan</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
