'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Percent,
  DollarSign,
  Truck,
  X
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Discount } from '@/types/fashion';
import { useToast } from '@/components/ui/Toast';
import { useApiAuth, apiFetch } from '@/contexts/AuthContext';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();
  const apiAuth = useApiAuth();

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    value: '15',
    min_order_amount: '500000',
    max_discount_amount: '150000',
    usage_limit: '100',
  });

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/discounts', apiAuth);
      const data = await res.json();
      if (data.success) {
        setDiscounts(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      showToast('Kode voucher dan nilai diskon wajib diisi', 'warning');
      return;
    }

    try {
      const res = await apiFetch('/api/discounts', {
        method: 'POST',
        ...apiAuth,
        body: JSON.stringify({
          code: formData.code,
          description: formData.description,
          discount_type: formData.discount_type,
          value: parseFloat(formData.value),
          min_order_amount: parseFloat(formData.min_order_amount) || 0,
          max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
          usage_limit: formData.usage_limit ? parseInt(formData.usage_limit, 10) : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Voucher ${formData.code.toUpperCase()} berhasil dibuat!`, 'success');
        setIsModalOpen(false);
        setFormData({
          code: '',
          description: '',
          discount_type: 'percentage',
          value: '15',
          min_order_amount: '500000',
          max_discount_amount: '150000',
          usage_limit: '100',
        });
        fetchDiscounts();
      } else {
        showToast(`Gagal: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleToggleActive = async (discount: Discount) => {
    try {
      const res = await apiFetch(`/api/discounts/${discount.id}`, {
        method: 'PUT',
        ...apiAuth,
        body: JSON.stringify({ is_active: !discount.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status voucher ${discount.code} diubah`, 'info');
        fetchDiscounts();
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Hapus voucher "${code}"?`)) return;

    try {
      const res = await apiFetch(`/api/discounts/${id}`, { method: 'DELETE', ...apiAuth });
      const data = await res.json();
      if (data.success) {
        showToast(`Voucher "${code}" berhasil dihapus`, 'success');
        fetchDiscounts();
      } else {
        showToast(`Gagal: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filtered = discounts.filter(d =>
    d.code.toLowerCase().includes(search.toLowerCase()) || (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Kupon & Diskon Promosi
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {discounts.length} Kupon
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Atur kode voucher diskon belanja, gratis ongkir, dan batas kuota pemakaian.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDiscounts}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Voucher Baru</span>
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
              placeholder="Cari kode kupon..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            Menampilkan {filtered.length} voucher
          </span>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Kode Voucher</th>
                  <th className="px-6 py-4">Tipe Diskon</th>
                  <th className="px-6 py-4">Nilai Diskon</th>
                  <th className="px-6 py-4">Min. Belanja</th>
                  <th className="px-6 py-4">Pemakaian</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length > 0 ? (
                  filtered.map(d => {
                    let typeBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        <Percent className="w-3 h-3" /> {d.value}% Off
                      </span>
                    );

                    if (d.discount_type === 'fixed_amount') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <DollarSign className="w-3 h-3" /> Potongan {formatIDR(d.value)}
                        </span>
                      );
                    } else if (d.discount_type === 'free_shipping') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <Truck className="w-3 h-3" /> Gratis Ongkir
                        </span>
                      );
                    }

                    return (
                      <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <Tag className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            <div>
                              <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 tracking-wider">
                                {d.code}
                              </span>
                              {d.description && (
                                <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{typeBadge}</td>
                        <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                          {d.discount_type === 'percentage' ? `${d.value}%` : formatIDR(d.value)}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {d.min_order_amount ? formatIDR(d.min_order_amount) : 'Tanpa Min.'}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">{d.usage_count}</span>
                          <span className="text-slate-400"> / {d.usage_limit ? `${d.usage_limit}x` : 'Unlimited'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(d)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                              d.is_active
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {d.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{d.is_active ? 'Aktif' : 'Nonaktif'}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(d.id, d.code)}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Hapus Voucher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <div className="text-3xl mb-2">🏷️</div>
                      <p className="font-semibold">Belum ada kupon diskon aktif</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Discount */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Buat Kode Voucher Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Kode Kupon *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Contoh: FLASH20 / HARBOLNAS"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipe Diskon *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed_amount">Nominal Tetap (Rp)</option>
                    <option value="free_shipping">Gratis Ongkir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Nilai Diskon *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Min. Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Batas Kuota Pemakaian
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Keterangan Promo
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Diskon khusus gajian akhir bulan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                >
                  Simpan Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
