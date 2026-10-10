'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Calendar,
  Phone,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  AlertCircle,
  Banknote,
  Eye,
  MessageCircle,
} from 'lucide-react';

interface AdminOrderSummary {
  id: string;
  order_number: string;
  user_id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  payment_method: 'COD';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  state: string;
  pincode: string;
  delivery_option: string;
  site_visit_required: number;
  site_visit_time?: string | null;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total_amount: number;
  item_count: number;
  first_product_name: string | null;
  has_custom_items: number;
  order_source?: string;
  has_unread_notification?: number;
  created_at: string;
  updated_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (paymentFilter !== 'ALL') params.set('payment_status', paymentFilter);
      params.set('page', String(page));
      params.set('limit', '15');

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load orders (${res.status})`);
      }
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotalOrders(data.total || 0);
    } catch (err: any) {
      console.error('Error fetching admin orders:', err);
      setError(err.message || 'Failed to connect to D1 order ledger.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          label: 'Confirmed',
          classes: 'bg-[#FBF8F3] text-[#7A5832] border-[#E8DFC8]',
        };
      case 'PROCESSING':
        return {
          label: 'Processing / Atelier',
          classes: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'READY':
        return {
          label: 'Ready for Dispatch',
          classes: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'COMPLETED':
        return {
          label: 'Completed & Installed',
          classes: 'bg-[#2C221E]/10 text-[#2C221E] border-[#2C221E]/20',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          classes: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      default:
        return {
          label: status,
          classes: 'bg-stone-50 text-stone-700 border-stone-200',
        };
    }
  };

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PENDING':
        return {
          label: 'COD Pending',
          classes: 'bg-amber-50 text-amber-900 border-amber-200',
        };
      case 'PAID':
        return {
          label: 'Paid on Delivery',
          classes: 'bg-[#FBF8F3] text-[#7A5832] border-[#E8DFC8]',
        };
      case 'FAILED':
        return {
          label: 'Failed',
          classes: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      default:
        return {
          label: paymentStatus,
          classes: 'bg-stone-50 text-stone-700 border-stone-200',
        };
    }
  };

  const getOrderSourceBadge = (source?: string) => {
    const s = (source || 'WEB').toUpperCase();
    switch (s) {
      case 'WHATSAPP':
        return {
          label: 'WhatsApp Order',
          classes: 'bg-[#25D366]/10 text-[#128C7E] border-[#25D366]/30 font-semibold',
          isWhatsApp: true,
        };
      case 'QUOTE':
        return {
          label: 'Quote',
          classes: 'bg-[#9A7B56]/10 text-[#866945] border-[#9A7B56]/20 font-medium',
          isWhatsApp: false,
        };
      case 'MEASUREMENT':
        return {
          label: 'Measurement',
          classes: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
          isWhatsApp: false,
        };
      case 'WEB':
      default:
        return {
          label: 'WEB',
          classes: 'bg-[#FAF7F2] text-[#78716C] border-[#E7DFD5] font-medium',
          isWhatsApp: false,
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Page Title Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE8DE] shadow-2xs">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block mb-1">
            Cloudflare D1 Production Ledger
          </span>
          <h1 className="font-serif text-[24px] sm:text-[30px] text-[#1C1917] font-medium tracking-tight">
            Customer Orders & Bespoke Commissions
          </h1>
          <p className="text-[13px] sm:text-[13.5px] text-[#78716C] mt-1">
            Manage live orders, verify measurements, record on-site COD inspections, and update fulfillment stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPage(1);
              fetchOrders();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#D5CDBF] bg-white text-[#1C1917] text-[12.5px] font-medium hover:border-[#1C1917] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Customer Name, Phone, or Email..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] text-[13px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#9A7B56] focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-[11px] text-[#8C827A] hover:text-[#1C1917]"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] text-[13px] font-sans font-medium text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2378716C%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_14px_center] bg-no-repeat pr-9"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing / Atelier</option>
              <option value="READY">Ready for Dispatch</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="md:col-span-3">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] text-[13px] font-sans font-medium text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2378716C%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_14px_center] bg-no-repeat pr-9"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PENDING">COD Pending</option>
              <option value="PAID">Paid on Delivery</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Ledger Summary Bar */}
        <div className="flex items-center justify-between text-[12px] text-[#78716C] pt-2 border-t border-[#F2ECE1]">
          <div>
            Showing <strong className="text-[#1C1917]">{orders.length}</strong> of{' '}
            <strong className="text-[#1C1917]">{totalOrders}</strong> recorded orders in D1
          </div>
          {(statusFilter !== 'ALL' || paymentFilter !== 'ALL' || search) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPaymentFilter('ALL');
                setPage(1);
              }}
              className="text-[#9A7B56] hover:text-[#866945] font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ─── Orders Table / Ledger View ─── */}
      <div className="bg-white rounded-2xl border border-[#EDE8DE] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#2C221E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[13px] text-[#78716C]">Loading orders from Cloudflare D1...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="font-serif text-[18px] text-[#1C1917] font-semibold">Ledger Connection Issue</h3>
            <p className="text-[13px] text-[#78716C] max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 rounded-xl bg-[#2C221E] text-white text-[12px] font-semibold"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#EDE8DE] flex items-center justify-center mx-auto text-[#9A7B56]">
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-[18px] text-[#1C1917] font-medium">No Orders Found</h3>
            <p className="text-[13px] text-[#78716C] max-w-sm mx-auto">
              {search || statusFilter !== 'ALL' || paymentFilter !== 'ALL'
                ? 'No orders match your filter criteria. Try adjusting your search term or status filters.'
                : 'No customer orders have been placed in the store yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EDE8DE] text-[11px] uppercase tracking-wider font-semibold text-[#8C827A]">
                  <th className="py-3.5 px-4 sm:px-6">Order Reference & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Delivery & Service</th>
                  <th className="py-3.5 px-4">Items / Details</th>
                  <th className="py-3.5 px-4">Amount & Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1] text-[13px]">
                {orders.map((o) => {
                  const statusBadge = getStatusBadge(o.status);
                  const payBadge = getPaymentBadge(o.payment_status);
                  const sourceBadge = getOrderSourceBadge(o.order_source);
                  const formattedDate = new Date(o.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = new Date(o.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={o.id} className="hover:bg-[#FAF9F5] transition-colors">
                      {/* Order Reference & Date */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/admin/orders/${o.order_number || o.id}`}
                            className="font-mono text-[14px] font-bold text-[#1C1917] hover:text-[#9A7B56] transition-colors"
                          >
                            #{o.order_number || o.id}
                          </Link>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] border ${sourceBadge.classes}`}
                          >
                            {sourceBadge.isWhatsApp && <MessageCircle className="w-2.5 h-2.5 text-[#25D366]" />}
                            <span>{sourceBadge.label}</span>
                          </span>
                          {o.order_source === 'WHATSAPP' && o.has_unread_notification === 1 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#9A7B56] text-white tracking-wider">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#78716C] flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3 h-3 text-[#A8A29E]" />
                          <span>{formattedDate}</span>
                          <span className="text-[#D8CFBF]">·</span>
                          <span>{formattedTime}</span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-[#1C1917]">{o.customer_name}</div>
                        <div className="text-[11.5px] text-[#78716C] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#A8A29E]" />
                          <span>{o.customer_phone}</span>
                        </div>
                        <div className="text-[11px] text-[#A8A29E] truncate max-w-[170px]">
                          {o.customer_email}
                        </div>
                      </td>

                      {/* Delivery & Service */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-1.5 font-medium text-[#1C1917] text-[12.5px]">
                          <MapPin className="w-3.5 h-3.5 text-[#9A7B56] shrink-0" />
                          <span className="truncate max-w-[160px]">{o.city}, {o.state}</span>
                        </div>
                        <div className="mt-1">
                          {o.site_visit_required === 1 || o.delivery_option === 'service_visit' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-medium bg-[#2C221E]/10 text-[#2C221E]">
                              <Clock className="w-3 h-3" />
                              <span>Sizing Visit ({o.site_visit_time || 'Standard'})</span>
                            </span>
                          ) : (
                            <span className="inline-block text-[11px] text-[#78716C]">
                              Standard Doorstep
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Items / Bespoke */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-[#1C1917]">
                          {o.item_count} {o.item_count === 1 ? 'item' : 'items'}
                        </div>
                        {o.first_product_name && (
                          <div className="text-[11px] text-[#78716C] truncate max-w-[150px]">
                            {o.first_product_name}
                          </div>
                        )}
                        {o.has_custom_items === 1 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAF0E6] text-[#866945] border border-[#E8DCCB] mt-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Bespoke Custom</span>
                          </span>
                        )}
                      </td>

                      {/* Total & Payment */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-sans text-[15px] font-bold text-[#1C1917]">
                          ₹{o.total_amount.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-medium text-[#2C221E] mt-0.5">
                          <Banknote className="w-3 h-3" />
                          <span>{o.payment_method}</span>
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border mt-1 ${payBadge.classes}`}
                        >
                          {payBadge.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-medium border ${statusBadge.classes}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{statusBadge.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 align-top text-right">
                        <Link
                          href={`/admin/orders/${o.order_number || o.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5CDBF] hover:bg-[#1C1714] hover:border-[#2C221E] text-[#1C1917] hover:text-white text-[11.5px] font-semibold transition-all shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Pagination Footer ─── */}
        {!loading && orders.length > 0 && totalPages > 1 && (
          <div className="p-4 sm:p-5 border-t border-[#EDE8DE] bg-[#FAF7F2] flex items-center justify-between text-[12.5px]">
            <div className="text-[#78716C]">
              Page <strong className="text-[#1C1917]">{page}</strong> of{' '}
              <strong className="text-[#1C1917]">{totalPages}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D5CDBF] bg-white text-[#1C1917] hover:border-[#1C1917] disabled:opacity-40 disabled:hover:border-[#D5CDBF] transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D5CDBF] bg-white text-[#1C1917] hover:border-[#1C1917] disabled:opacity-40 disabled:hover:border-[#D5CDBF] transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
