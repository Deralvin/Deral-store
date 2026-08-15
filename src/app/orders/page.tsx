'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  XCircle,
  CreditCard,
  Plus,
  Ban,
  Filter
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Order } from '@/types/fashion';
import { useToast } from '@/components/ui/Toast';
import CreateOrderModal from '@/components/orders/CreateOrderModal';
import { useApiAuth } from '@/contexts/AuthContext';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { showToast } = useToast();
  const apiAuth = useApiAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders', apiAuth);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        ...apiAuth,
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Status pesanan berhasil diupdate', 'success');
        fetchOrders();
      } else {
        showToast(`Gagal: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleMarkAsPaid = async (orderId: string, orderNumber: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PUT',
        ...apiAuth,
        body: JSON.stringify({ payment_status: 'paid' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Pesanan ${orderNumber} berhasil ditandai LUNAS!`, 'success');
        fetchOrders();
      } else {
        showToast(`Gagal: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Batalkan pesanan ${orderNumber}? Stok produk akan otomatis dikembalikan ke gudang.`)) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        ...apiAuth,
        body: JSON.stringify({ reason: 'Dibatalkan oleh Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Pesanan ${orderNumber} telah dibatalkan`, 'warning');
        fetchOrders();
      } else {
        showToast(`Gagal: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const formatIDR = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      (o.items_summary && o.items_summary.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchPayment = paymentFilter === 'ALL' || o.payment_status === paymentFilter;

    return matchSearch && matchStatus && matchPayment;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Manajemen Pesanan
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {orders.length} Transaksi
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola status order, terima pembayaran, buat pesanan manual, atau batalkan pesanan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pesanan Baru</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari no invoice, pelanggan..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">Semua Status Order</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled (Batal)</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">Semua Pembayaran</option>
              <option value="paid">Lunas (Paid)</option>
              <option value="unpaid">Belum Lunas (Unpaid)</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">No. Pesanan</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Item Busana</th>
                  <th className="px-6 py-4">Total Belanja</th>
                  <th className="px-6 py-4">Status Pembayaran</th>
                  <th className="px-6 py-4">Status Pengiriman</th>
                  <th className="px-6 py-4 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => {
                    const isPaid = order.payment_status === 'paid';
                    const isCancelled = order.status === 'cancelled';

                    return (
                      <tr
                        key={order.id}
                        className={`transition-colors ${
                          isCancelled
                            ? 'bg-rose-50/20 dark:bg-rose-950/10 opacity-75'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {order.order_number}
                          <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {order.customer_name || 'Guest Customer'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {order.customer_email || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                            {order.items_summary || '1x Item Fashion'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                          {formatIDR(order.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>{order.payment_status.toUpperCase()}</span>
                            </span>

                            {!isPaid && !isCancelled && (
                              <button
                                onClick={() => handleMarkAsPaid(order.id, order.order_number)}
                                className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
                                title="Tandai pesanan lunas"
                              >
                                Bayar Lunas
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isCancelled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <XCircle className="w-3.5 h-3.5" /> Dibatalkan
                            </span>
                          ) : (
                            <select
                              value={order.status}
                              onChange={e => handleUpdateStatus(order.id, e.target.value)}
                              className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="confirmed">✅ Confirmed</option>
                              <option value="processing">⚙️ Processing</option>
                              <option value="shipped">🚚 Shipped</option>
                              <option value="delivered">🎉 Delivered</option>
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isCancelled ? (
                            <button
                              onClick={() => handleCancelOrder(order.id, order.order_number)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 transition-colors"
                              title="Batalkan pesanan & kembalikan stok"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Batalkan</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Pesanan Batal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <div className="text-3xl mb-2">🛍️</div>
                      <p className="font-semibold">Tidak ada data pesanan</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Create Order */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchOrders}
      />
    </AdminLayout>
  );
}
