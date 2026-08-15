'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import AddProductModal from '@/components/products/AddProductModal';
import { Product, Category } from '@/types/fashion';
import { useToast } from '@/components/ui/Toast';
import { useApiAuth } from '@/contexts/AuthContext';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();
  const apiAuth = useApiAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/api/products?';
      if (categoryFilter !== 'all') url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url, apiAuth);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', apiAuth);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}" dari katalog?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', ...apiAuth });
      const data = await res.json();
      if (data.success) {
        showToast(`Produk "${name}" berhasil dihapus`, 'error');
        fetchProducts();
      } else {
        showToast(`Gagal menghapus: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleQuickEditStock = async (product: Product) => {
    const currentStock = product.total_stock || 0;
    const newStockStr = prompt(`Update stok untuk "${product.name}":`, currentStock.toString());
    if (newStockStr === null) return;

    const newStock = parseInt(newStockStr, 10);
    if (isNaN(newStock) || newStock < 0) {
      showToast('Nilai stok tidak valid', 'warning');
      return;
    }

    try {
      const res = await fetch(`/api/products/${product.id}/stock`, {
        method: 'PUT',
        ...apiAuth,
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Stok "${product.name}" diperbarui menjadi ${newStock} pcs`, 'success');
        fetchProducts();
      } else {
        showToast(`Gagal update stok: ${data.error}`, 'error');
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Katalog Produk Fashion
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {products.length} Items
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola master busana, harga, varian SKU, dan ketersediaan stok inventori.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProducts}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama busana atau SKU..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Category Dropdown */}
            <div className="w-full sm:w-60">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-end sm:self-center">
            Menampilkan {products.length} produk
          </div>
        </div>

        {/* Products Table Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Produk Busana</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga Dasar</th>
                  <th className="px-6 py-4">Varian SKU</th>
                  <th className="px-6 py-4">Total Stok</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.length > 0 ? (
                  products.map(product => {
                    const totalStock = product.total_stock || 0;
                    let stockBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Tersedia ({totalStock})
                      </span>
                    );

                    if (totalStock === 0) {
                      stockBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Habis
                        </span>
                      );
                    } else if (totalStock < 10) {
                      stockBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Menipis ({totalStock})
                        </span>
                      );
                    }

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow-xs flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                👗
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                                {product.name}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {product.category_name || 'Fashion'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                          {formatIDR(product.base_price)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>{product.variants_count || 1} Varian</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{stockBadge}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Published
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickEditStock(product)}
                              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Update Stok Cepat"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <div className="text-3xl mb-2">👗</div>
                      <p className="font-semibold">Tidak ada produk ditemukan</p>
                      <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau tambah produk baru.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchProducts();
        }}
      />
    </AdminLayout>
  );
}
