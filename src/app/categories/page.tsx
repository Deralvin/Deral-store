'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Edit3,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Category } from '@/types/fashion';
import { useToast } from '@/components/ui/Toast';
import { useApiAuth } from '@/contexts/AuthContext';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { showToast } = useToast();
  const apiAuth = useApiAuth();

  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    description: '',
    sort_order: '1',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories', apiAuth);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', parent_id: '', description: '', sort_order: '1' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      parent_id: cat.parent_id || '',
      description: cat.description || '',
      sort_order: cat.sort_order.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Nama kategori wajib diisi', 'warning');
      return;
    }

    try {
      let res;
      if (editingCategory) {
        res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          ...apiAuth,
          body: JSON.stringify({
            name: formData.name,
            parent_id: formData.parent_id || null,
            description: formData.description,
            sort_order: parseInt(formData.sort_order, 10) || 0,
          }),
        });
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          ...apiAuth,
          body: JSON.stringify({
            name: formData.name,
            parent_id: formData.parent_id || null,
            description: formData.description,
            sort_order: parseInt(formData.sort_order, 10) || 0,
          }),
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(
          editingCategory ? `Kategori "${formData.name}" berhasil diupdate` : `Kategori "${formData.name}" berhasil dibuat`,
          'success'
        );
        setIsModalOpen(false);
        fetchCategories();
      } else {
        showToast(`Gagal: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE', ...apiAuth });
      const data = await res.json();
      if (data.success) {
        showToast(`Kategori "${name}" berhasil dihapus`, 'success');
        fetchCategories();
      } else {
        showToast(`Gagal: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const rootCategories = categories.filter(c => !c.parent_id);
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || (c.parent_name && c.parent_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Kategori Busana
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {categories.length} Kategori
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Struktur hierarki taksonomi pakaian dan departemen fashion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCategories}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori</span>
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
              placeholder="Cari kategori atau subkategori..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            Menampilkan {filtered.length} kategori
          </span>
        </div>

        {/* Categories Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Nama Kategori</th>
                  <th className="px-6 py-4">Induk (Parent)</th>
                  <th className="px-6 py-4">Slug URL</th>
                  <th className="px-6 py-4">Urutan</th>
                  <th className="px-6 py-4">Jumlah Produk</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length > 0 ? (
                  filtered.map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cat.parent_name ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {cat.parent_name}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">Root Category</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {cat.slug}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold">
                        {cat.sort_order}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          {cat.products_count || 0} Produk
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Kategori"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="text-3xl mb-2">📁</div>
                      <p className="font-semibold">Tidak ada kategori ditemukan</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Outerwear / Gaun Pesta"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Kategori Induk (Parent)
                </label>
                <select
                  value={formData.parent_id}
                  onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">-- Kategori Utama (Root) --</option>
                  {rootCategories
                    .filter(c => !editingCategory || c.id !== editingCategory.id)
                    .map(rc => (
                      <option key={rc.id} value={rc.id}>
                        {rc.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nomor Urutan Tampilan
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
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
                  {editingCategory ? 'Update Kategori' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
