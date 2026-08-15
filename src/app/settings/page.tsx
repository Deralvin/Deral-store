'use client';

import React, { useState } from 'react';
import { Store, CreditCard, Truck, ShieldCheck, Database, Check } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Pengaturan toko berhasil disimpan ke sistem!', 'success');
    }, 600);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pengaturan Toko & Profil
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Konfigurasi identitas brand, mata uang, dan koneksi database PostgreSQL.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Settings Tabs */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1 h-fit">
            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Store className="w-4 h-4" />
              <span>Profil Brand</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Database className="w-4 h-4" />
              <span>Koneksi PostgreSQL</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
              <CreditCard className="w-4 h-4" />
              <span>Pembayaran & Bank</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Truck className="w-4 h-4" />
              <span>Kurir & Logistik</span>
            </button>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
              Informasi Umum Butik Fashion
            </h3>

            <form onSubmit={handleSave} className="space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Nama Brand / Label
                  </label>
                  <input
                    type="text"
                    defaultValue="AURA Fashion Studio"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    defaultValue="hello@aurafashion.co.id"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    WhatsApp Customer Care
                  </label>
                  <input
                    type="text"
                    defaultValue="+62 812 3456 7890"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Mata Uang Default
                  </label>
                  <select className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <option value="IDR">IDR (Rupiah Indonesia)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="SGD">SGD (Singapore Dollar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Alamat Butik & Flagship Store
                </label>
                <textarea
                  rows={3}
                  defaultValue="Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12190"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Database Status Callout */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      PostgreSQL Connection: <span className="font-mono text-indigo-600 dark:text-indigo-400">deral-fashion</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Host: localhost:5432 | User: admin | Status: Terhubung & Aktif
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Online
                </span>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
