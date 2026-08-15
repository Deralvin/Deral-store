'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Search,
  UserPlus,
  X,
  Loader2,
  Crown,
  User,
  Eye
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { useApiAuth } from '@/contexts/AuthContext';

interface AdminUser {
  id: number;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const apiAuth = useApiAuth();

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'admin',
    is_active: true,
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', apiAuth);
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch admin users:', err);
      showToast('Gagal memuat data admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingAdmin ? `/api/admin/users/${editingAdmin.id}` : '/api/admin/users';
      const method = editingAdmin ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        ...apiAuth,
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Gagal menyimpan', 'error');
        return;
      }

      showToast(editingAdmin ? 'Admin berhasil diperbarui' : 'Admin berhasil ditambahkan', 'success');
      setIsModalOpen(false);
      setEditingAdmin(null);
      setFormData({ email: '', full_name: '', password: '', role: 'admin', is_active: true });
      fetchAdmins();
    } catch {
      showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      email: admin.email,
      full_name: admin.full_name || '',
      password: '',
      role: admin.role,
      is_active: admin.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus admin ini?')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', ...apiAuth });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Gagal menghapus', 'error');
        return;
      }

      showToast('Admin berhasil dihapus', 'success');
      fetchAdmins();
    } catch {
      showToast('Terjadi kesalahan jaringan', 'error');
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(search.toLowerCase()) ||
    admin.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    admin.role.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    if (role === 'super_admin') {
      return { label: 'Super Admin', class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    }
    return { label: 'Admin', class: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Manajemen Admin
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Panel Only
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola akun administrator yang dapat mengakses panel admin
            </p>
          </div>

          <button
            onClick={() => {
              setEditingAdmin(null);
              setFormData({ email: '', full_name: '', password: '', role: 'admin', is_active: true });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Admin</span>
          </button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari email, nama, atau role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Admin</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Terakhir Login</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      {search ? 'Tidak ada admin yang ditemukan' : 'Belum ada admin'}
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map(admin => {
                    const roleBadge = getRoleBadge(admin.role);
                    return (
                      <tr key={admin.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center">
                              {admin.full_name?.charAt(0).toUpperCase() || admin.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {admin.full_name || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {admin.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadge.class}`}>
                            {admin.role === 'super_admin' ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${admin.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'}`}>
                            {admin.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                          {admin.last_login_at ? new Date(admin.last_login_at).toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(admin)}
                              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(admin.id)}
                              className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAdmin ? 'Edit Admin' : 'Tambah Admin Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  placeholder="admin@aura-fashion.id"
                  required
                  disabled={!!editingAdmin}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  placeholder="Nama admin"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Kata Sandi {!editingAdmin && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  placeholder={editingAdmin ? 'Kosongkan jika tidak ingin mengubah' : 'Minimal 6 karakter'}
                  required={!editingAdmin}
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700 dark:text-slate-300">
                  Akun aktif
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
