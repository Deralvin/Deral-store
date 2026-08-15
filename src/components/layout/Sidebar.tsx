'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  Sparkles,
  Crown,
  Tag,
  ShoppingBag,
  Users,
  BarChart3,
  Sliders,
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const catalogItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Katalog Produk', href: '/products', icon: Shirt },
    { name: 'Kategori Busana', href: '/categories', icon: FolderTree },
    { name: 'Koleksi & Drops', href: '/collections', icon: Sparkles },
    { name: 'Brand & Desainer', href: '/brands', icon: Crown },
  ];

  const salesItems = [
    { name: 'Kupon & Diskon', href: '/discounts', icon: Tag },
    { name: 'Pesanan', href: '/orders', icon: ShoppingBag, badge: 'Live' },
    { name: 'Pelanggan & VIP', href: '/customers', icon: Users },
  ];

  const systemItems = [
    { name: 'Analitik & Laba', href: '/analytics', icon: BarChart3 },
    { name: 'Manajemen Admin', href: '/admin-users', icon: ShieldCheck },
    { name: 'Pengaturan Toko', href: '/settings', icon: Sliders },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                AURA FASHION
              </h1>
              <span className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Studio Admin
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Katalog & Produk */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Katalog & Mode
            </p>
            <nav className="space-y-1">
              {catalogItems.map(item => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Penjualan & Pelanggan */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Transaksi & Promosi
            </p>
            <nav className="space-y-1">
              {salesItems.map(item => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Laporan & Pengaturan */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Laporan & Sistem
            </p>
            <nav className="space-y-1">
              {systemItems.map(item => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* PostgreSQL Connection Status */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-white truncate">PostgreSQL Connected</h4>
              <p className="text-[10px] text-slate-400 truncate">deral-fashion @ localhost</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
