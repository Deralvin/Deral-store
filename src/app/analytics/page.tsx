'use client';

import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Analitik & Performa Penjualan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Laporan finansial komprehensif, metrik AOV, retensi pembeli, dan margin laba.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Order Value (AOV)</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">Rp 845.000</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12% dibanding bulan lalu
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repeat Purchase Rate</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">34.6%</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
              Sangat Tinggi (Fashion Benchmark: 28%)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Return / Retur Barang</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">1.2%</h3>
            <p className="text-xs text-slate-400 mt-2">
              Minim retur berkat panduan *Fit Rating* akurat
            </p>
          </div>
        </div>

        {/* 6 Month Growth Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pertumbuhan Penjualan 6 Bulan Terakhir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Volume omzet kotor (Gross Merchandise Value)
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
              Q1 - Q3 2026
            </span>
          </div>

          <div className="flex items-end gap-6 sm:gap-10 h-64 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
            {[
              { month: 'Mar', height: 'h-24', amount: 'Rp 42jt' },
              { month: 'Apr', height: 'h-32', amount: 'Rp 56jt' },
              { month: 'Mei', height: 'h-28', amount: 'Rp 48jt' },
              { month: 'Jun', height: 'h-44', amount: 'Rp 69jt' },
              { month: 'Jul', height: 'h-52', amount: 'Rp 78jt' },
              { month: 'Agu (Kini)', height: 'h-60', amount: 'Rp 84jt', active: true },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                  {bar.amount}
                </span>
                <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-end">
                  <div
                    className={`w-full ${bar.height} rounded-xl transition-all duration-500 ${
                      bar.active
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/30'
                        : 'bg-indigo-200 dark:bg-indigo-950/80 group-hover:bg-indigo-400'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-bold ${
                    bar.active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                  }`}
                >
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
