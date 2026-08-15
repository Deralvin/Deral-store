'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ShoppingBag,
  User,
  CreditCard,
  Truck,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Product, Customer } from '@/types/fashion';
import { useToast } from '@/components/ui/Toast';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderItemRow {
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_title: string;
  sku: string;
  unit_price: number;
  quantity: number;
  available_stock: number;
  thumbnail_url?: string;
}

export default function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [customerType, setCustomerType] = useState<'existing' | 'manual'>('manual');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('Pemesanan Kasir / Offline Butik');

  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [shippingFee, setShippingFee] = useState<string>('0');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('paid');
  const [customerNotes, setCustomerNotes] = useState('');

  // Load products and customers on mount
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const [prodRes, custRes] = await Promise.all([
          fetch('/api/products').then(r => r.json()),
          fetch('/api/customers').then(r => r.json()),
        ]);

        if (prodRes.success) setProducts(prodRes.data);
        if (custRes.success) setCustomers(custRes.data);

        // Prepopulate with 1 empty item
        if (prodRes.data && prodRes.data.length > 0 && orderItems.length === 0) {
          const first = prodRes.data[0];
          setOrderItems([
            {
              product_id: first.id,
              product_name: first.name,
              variant_title: 'Standard',
              sku: first.slug.toUpperCase().slice(0, 10),
              unit_price: Number(first.base_price) || 0,
              quantity: 1,
              available_stock: first.total_stock || 10,
              thumbnail_url: first.image_url,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load modal data:', err);
      }
    };

    loadData();
  }, [isOpen]);

  const handleAddProductRow = () => {
    if (products.length === 0) return;
    const prod = products[0];
    setOrderItems([
      ...orderItems,
      {
        product_id: prod.id,
        product_name: prod.name,
        variant_title: 'Standard',
        sku: prod.slug.toUpperCase().slice(0, 10),
        unit_price: Number(prod.base_price) || 0,
        quantity: 1,
        available_stock: prod.total_stock || 10,
        thumbnail_url: prod.image_url,
      },
    ]);
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const updated = [...orderItems];
    updated[index] = {
      ...updated[index],
      product_id: prod.id,
      product_name: prod.name,
      unit_price: Number(prod.base_price) || 0,
      sku: prod.slug.toUpperCase().slice(0, 10),
      available_stock: prod.total_stock || 10,
      thumbnail_url: prod.image_url,
    };
    setOrderItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...orderItems];
    updated[index].quantity = Math.max(1, qty);
    setOrderItems(updated);
  };

  const handleRemoveRow = (index: number) => {
    if (orderItems.length === 1) {
      showToast('Pesanan harus memiliki minimal 1 item', 'warning');
      return;
    }
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const c = customers.find(item => item.id === custId);
    if (c) {
      setCustomerName(`${c.first_name} ${c.last_name || ''}`.trim());
      setCustomerEmail(c.email);
      setCustomerPhone(c.phone || '');
    }
  };

  // Calculations
  const subtotal = orderItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const discountVal = parseFloat(discountAmount) || 0;
  const shippingVal = parseFloat(shippingFee) || 0;
  const totalAmount = Math.max(0, subtotal - discountVal + shippingVal);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      showToast('Silakan tambahkan minimal 1 item produk', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerType === 'existing' ? selectedCustomerId : null,
          customer_name: customerName || 'Walk-in Customer',
          customer_email: customerEmail || `guest-${Date.now()}@fashionstore.id`,
          customer_phone: customerPhone,
          shipping_address: {
            recipient: customerName || 'Pelanggan Butik',
            phone: customerPhone || '-',
            address: shippingAddress,
          },
          items: orderItems,
          discount_code: discountCode || null,
          discount_amount: discountVal,
          shipping_fee: shippingVal,
          payment_status: paymentStatus,
          status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
          customer_notes: customerNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Pesanan berhasil dibuat!', 'success');
        onSuccess();
        onClose();
      } else {
        showToast(`Gagal: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Buat Pesanan Baru (Admin / POS)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan manual pesanan butik offline atau pesanan via WhatsApp/Chat.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm">
          {/* Customer Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" /> Informasi Pelanggan
              </span>
              <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-slate-700/60 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCustomerType('manual')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    customerType === 'manual'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Pelanggan Baru / Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType('existing')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    customerType === 'existing'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Pilih Member Terdaftar
                </button>
              </div>
            </div>

            {customerType === 'existing' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Pilih Pelanggan Terdaftar
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={e => handleSelectCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name || ''} ({c.email}) - {c.loyalty_tier}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Nama Pembeli *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Contoh: Rina Melati"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="rina@gmail.com"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    WhatsApp / Telepon
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-indigo-500" /> Daftar Busana yang Dipesan
              </span>
              <button
                type="button"
                onClick={handleAddProductRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Item Lain
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {orderItems.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Pilih Produk Fashion
                    </label>
                    <select
                      value={item.product_id}
                      onChange={e => handleProductChange(idx, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatIDR(Number(p.base_price))} (Stok: {p.total_stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Jumlah
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-bold text-center"
                      />
                    </div>

                    <div className="text-right sm:w-32">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Subtotal Item
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatIDR(item.unit_price * item.quantity)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 self-end sm:self-center"
                      title="Hapus baris item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Shipping Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-indigo-500" /> Ongkos Kirim (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={shippingFee}
                onChange={e => setShippingFee(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-500" /> Potongan Diskon (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={e => setDiscountAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Status Pembayaran *
              </label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as 'paid' | 'unpaid')}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-bold"
              >
                <option value="paid">✅ LUNAS (Paid)</option>
                <option value="unpaid">⏳ MENUNGGU (Unpaid / Pending)</option>
              </select>
            </div>
          </div>

          {/* Grand Total Summary Box */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <div>Subtotal Busana: <span className="font-bold text-slate-900 dark:text-white">{formatIDR(subtotal)}</span></div>
              {discountVal > 0 && (
                <div className="text-rose-500">Diskon Promo: -{formatIDR(discountVal)}</div>
              )}
              {shippingVal > 0 && (
                <div>Ongkos Kirim: +{formatIDR(shippingVal)}</div>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                Total Tagihan
              </span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {formatIDR(totalAmount)}
              </span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Memproses...' : 'Simpan & Terbitkan Pesanan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
