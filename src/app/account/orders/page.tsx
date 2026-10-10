'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  ChevronRight,
  ArrowRight,
  Sparkles,
  PackageCheck,
  Compass,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { useStore, Order } from '@/lib/context/StoreContext';

export default function MyOrdersPage() {
  const { orders, refreshOrders } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshOrders();
  }, [refreshOrders]);

  const getStatusBadge = (order: Order) => {
    const raw = (order.rawStatus || '').toUpperCase();
    if (raw === 'PROCESSING') {
      return {
        label: 'Processing',
        classes: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-600',
      };
    }
    if (raw === 'READY') {
      return {
        label: 'Ready',
        classes: 'bg-blue-50 text-blue-800 border-blue-200',
        dot: 'bg-blue-600',
      };
    }
    if (raw === 'COMPLETED') {
      return {
        label: 'Completed',
        classes: 'bg-[#2C221E]/10 text-[#2C221E] border-[#2C221E]/20',
        dot: 'bg-[#2C221E]',
      };
    }
    if (raw === 'CANCELLED') {
      return {
        label: 'Cancelled',
        classes: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-600',
      };
    }
    if (raw === 'CONFIRMED') {
      return {
        label: 'Confirmed',
        classes: 'bg-[#FBF8F3] text-[#7A5832] border-[#E8DFC8]',
        dot: 'bg-[#9A7B56]',
      };
    }
    if (raw === 'PENDING') {
      return {
        label: 'Pending',
        classes: 'bg-stone-50 text-stone-700 border-stone-200',
        dot: 'bg-stone-500',
      };
    }

    // Fallback to legacy status if rawStatus isn't set
    switch (order.status) {
      case 'order_received':
        return { label: 'Order Received', classes: 'bg-[#FAF7F2] text-[#866945] border-[#E8DCCB]', dot: 'bg-[#866945]' };
      case 'details_confirmed':
        return { label: 'Confirmed', classes: 'bg-[#FBF8F3] text-[#7A5832] border-[#E8DFC8]', dot: 'bg-[#9A7B56]' };
      case 'tailoring_preparation':
        return { label: 'Processing', classes: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-600' };
      case 'ready_for_dispatch':
        return { label: 'Ready', classes: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-600' };
      case 'delivered_installed':
        return { label: 'Completed', classes: 'bg-[#2C221E]/10 text-[#2C221E] border-[#2C221E]/20', dot: 'bg-[#2C221E]' };
      case 'cancelled':
        return { label: 'Cancelled', classes: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-600' };
      default:
        return { label: 'Processing', classes: 'bg-[#FAF7F2] text-[#78716C] border-[#EDE8DE]', dot: 'bg-[#78716C]' };
    }
  };

  if (!mounted) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-10 sm:pt-16 pb-24 text-[#1C1917]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-[#2C221E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-[#78716C]">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-6 sm:pt-10 pb-16 sm:pb-24 text-[#1C1917]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── BREADCRUMB ─── */}
        <nav className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] text-[#78716C] mb-5 sm:mb-6 font-normal">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span className="text-[#1C1917] font-medium">My Orders</span>
        </nav>

        {/* ─── PAGE HEADER ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-[#EDE8DE]">
          <div>
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block mb-1">
              Customer Account
            </span>
            <h1 className="font-serif text-[26px] sm:text-[32px] text-[#1C1917] font-semibold">
              My Orders & Furnishings
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#78716C] font-light mt-1">
              Track status, review bespoke tailoring specifications, and view recent orders.
            </p>
          </div>

          {orders.length > 0 && (
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-wider font-semibold text-[#2C221E] hover:text-[#9A7B56] transition-colors"
            >
              <span>Explore Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* ─── ORDERS LIST OR EMPTY STATE ─── */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EDE8DE] p-8 sm:p-14 text-center max-w-xl mx-auto shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EDE8DE] flex items-center justify-center mx-auto mb-4 text-[#9A7B56]">
              <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
            </div>

            <h2 className="font-serif text-[22px] sm:text-[24px] text-[#1C1917] font-medium mb-2">
              No orders yet
            </h2>

            <p className="text-[13px] sm:text-[14px] text-[#78716C] leading-relaxed mb-6 font-light max-w-md mx-auto">
              You have not placed any orders with Zaira Furnishing yet. Explore our handcrafted curtains, made-to-measure blinds, and premium upholstery fabrics.
            </p>

            <Link
              href="/categories"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11.5px] uppercase tracking-wider font-semibold transition-all shadow-xs"
            >
              <span>Explore Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order);
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-[0_2px_10px_rgba(28,25,23,0.02)] hover:border-[#D8CFBF] transition-all space-y-4"
                >
                  {/* Card Top: Order Reference, Date & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-[#F2ECE1]">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#866945] block">
                          Order Reference
                        </span>
                        <span className="font-mono text-[16px] sm:text-[17px] font-bold text-[#1C1917]">
                          #{order.id}
                        </span>
                      </div>
                      <span className="text-[#D8CFBF] hidden sm:inline">|</span>
                      <div className="text-[12px] text-[#78716C] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#9A7B56]" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.orderSource === 'WHATSAPP' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/25">
                          <MessageCircle className="w-3 h-3 text-[#25D366]" />
                          <span>WhatsApp Order</span>
                        </span>
                      )}
                      {order.hasCustomProducts && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold bg-[#FAF0E6] text-[#866945] border border-[#E8DCCB]">
                          <Sparkles className="w-3 h-3" />
                          <span>Bespoke Order</span>
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${statusInfo.classes}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot || 'bg-current'}`} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Middle: Product Item Thumbnails & Names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C827A] block">
                        Items Purchased ({order.items.reduce((acc, it) => acc + it.quantity, 0)})
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 pr-3 rounded-lg border border-[#EDE8DE] max-w-full"
                          >
                            <div className="relative w-8 h-10 rounded overflow-hidden bg-white border border-[#EDE8DE] shrink-0">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="text-[11.5px] truncate">
                              <span className="font-serif font-semibold text-[#1C1917] block truncate max-w-[140px] sm:max-w-[180px]">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-[#78716C]">
                                Qty: {item.quantity} · {item.variantName || 'Standard'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center px-3 py-1 bg-[#FAF7F2] rounded-lg border border-[#EDE8DE] text-[11px] font-semibold text-[#78716C]">
                            +{order.items.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between sm:items-end bg-[#FAF7F2] p-3 rounded-xl border border-[#EDE8DE] md:bg-transparent md:border-0 md:p-0">
                      <div className="sm:text-right">
                        <span className="text-[11px] uppercase tracking-wider text-[#8C827A] block">
                          Total Amount
                        </span>
                        <span className="font-serif text-[18px] sm:text-[20px] font-bold text-[#1C1917]">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10.5px] text-[#78716C] block">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Demo Payment'}
                        </span>
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-2 pt-2 sm:pt-0">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#D8CFBF] hover:border-[#2C221E] text-[#1C1917] hover:text-[#9A7B56] text-[11px] uppercase tracking-wider font-semibold transition-all shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Order</span>
                        </Link>

                        <Link
                          href={`/account/orders/${order.id}/track`}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11px] uppercase tracking-wider font-semibold transition-all shadow-xs"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Track Order</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
