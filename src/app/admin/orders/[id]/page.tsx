'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Save,
  RefreshCw,
  MessageCircle,
  ShieldCheck,
  Bell,
  Send,
  History,
} from 'lucide-react';
import { DbOrder, DbOrderItem, DbOrderNotification, DbOrderStatusHistory } from '@/lib/db/types';

interface OrderItemWithDetails extends DbOrderItem {
  product_image: string | null;
  product_slug: string | null;
}

interface OrderDetailData extends DbOrder {
  items: OrderItemWithDetails[];
  notifications?: DbOrderNotification[];
  statusHistory?: DbOrderStatusHistory[];
}

type AllowedOrderStatus = 'CONFIRMED' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';

const VALID_TRANSITIONS: Record<string, AllowedOrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY', 'CONFIRMED', 'CANCELLED'],
  READY: ['COMPLETED', 'PROCESSING', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable fields state
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [retryingNotifId, setRetryingNotifId] = useState<string | null>(null);

  const handleRetryNotification = async (notifId: string) => {
    setRetryingNotifId(notifId);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}/retry-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notifId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Retry failed');
      }
      setSaveSuccess(data.message || 'Notification retry dispatched.');
      fetchOrderDetail();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to retry notification');
    } finally {
      setRetryingNotifId(null);
    }
  };

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Order #${id} not found in Cloudflare D1.`);
        }
        throw new Error(`Failed to load order (${res.status})`);
      }
      const data = await res.json();
      if (data?.order) {
        setOrder(data.order);
        setSelectedStatus(data.order.status);
        setSelectedPaymentStatus(data.order.payment_status);
        setNotes(data.order.notes || '');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('admin-notifications-refresh'));
        }
      } else {
        throw new Error('Malformed response from order API');
      }
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      setError(err.message || 'Failed to connect to D1 database');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          paymentStatus: selectedPaymentStatus,
          notes: notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      // Build feedback message
      const messages: string[] = ['Order updated successfully.'];
      if (data.statusChanged) {
        messages[0] = 'Order status updated successfully.';
        if (data.notificationCreated) {
          messages.push('Customer notification created.');
        }
        if (data.notificationError) {
          messages.push(`Note: Notification issue — ${data.notificationError}`);
        }
      }
      setSaveSuccess(messages.join(' '));

      if (data.order) {
        setOrder((prev) => (prev ? { ...prev, ...data.order } : null));
        setSelectedStatus(data.order.status);
        setSelectedPaymentStatus(data.order.payment_status);
        setNotes(data.order.notes || '');
      }

      // Refresh layout notification badge
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-notifications-refresh'));
      }
    } catch (err: any) {
      console.error('Error updating order:', err);
      setSaveError(err.message || 'Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          label: 'Order Confirmed',
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

  const getPaymentBadge = (payStatus: string) => {
    switch (payStatus) {
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
          label: 'Payment Failed',
          classes: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'REFUNDED':
        return {
          label: 'Refunded',
          classes: 'bg-stone-50 text-stone-700 border-stone-200',
        };
      default:
        return {
          label: payStatus,
          classes: 'bg-stone-50 text-stone-700 border-stone-200',
        };
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-5xl mx-auto">
        <div className="w-9 h-9 border-2 border-[#2C221E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[13.5px] text-[#78716C]">Loading order #{id} from Cloudflare D1...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-2xl border border-[#EDE8DE] p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xs space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="font-serif text-[22px] text-[#1C1917] font-medium">Order Not Found</h2>
        <p className="text-[13px] text-[#78716C] leading-relaxed">
          {error || 'Unable to retrieve order details from the database.'}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5CDBF] text-[#1C1917] hover:border-[#1C1917] text-[12px] font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders Ledger</span>
          </Link>
          <button
            onClick={fetchOrderDetail}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C221E] text-white text-[12px] font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const currentStatusBadge = getStatusBadge(order.status);
  const currentPayBadge = getPaymentBadge(order.payment_status);

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = new Date(order.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const allowedNextTransitions = VALID_TRANSITIONS[order.status] || [];
  const isTerminal = allowedNextTransitions.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── Breadcrumb & Top Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[12px] text-[#78716C]">
          <Link href="/admin" className="hover:text-[#1C1917] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/admin/orders" className="hover:text-[#1C1917] transition-colors">
            Orders
          </Link>
          <span>/</span>
          <span className="font-mono text-[#1C1917] font-semibold">#{order.order_number}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrderDetail}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#D5CDBF] bg-white text-[#1C1917] text-[12px] font-medium hover:border-[#1C1917] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#8C827A]" />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#D5CDBF] bg-white text-[#1C1917] text-[12px] font-medium hover:border-[#1C1917] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Orders Ledger</span>
          </Link>
        </div>
      </div>

      {/* ─── Header Card ─── */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-[10.5px] uppercase font-bold tracking-[0.2em] text-[#9A7B56]">
              Order Reference
            </span>
            <h1 className="font-mono text-[22px] sm:text-[26px] font-bold text-[#1C1917]">
              #{order.order_number}
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium border ${currentStatusBadge.classes}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{currentStatusBadge.label}</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${currentPayBadge.classes}`}
            >
              <Banknote className="w-3 h-3" />
              <span>{currentPayBadge.label}</span>
            </span>
            {/* Order Source Badge */}
            {order.order_source === 'WHATSAPP' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Order</span>
              </span>
            ) : order.order_source === 'QUOTE' ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#9A7B56]/10 text-[#866945] border border-[#9A7B56]/20">
                <span>Quote</span>
              </span>
            ) : order.order_source === 'MEASUREMENT' ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <span>Measurement</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF7F2] text-[#78716C] border border-[#E7DFD5]">
                <span>WEB</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-[#78716C]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#9A7B56]" />
              <span>Placed {formattedDate} at {formattedTime}</span>
            </span>
            <span className="text-[#D8CFBF]">·</span>
            <span>Channel: <strong className="text-[#1C1917] font-medium">{order.order_source === 'WHATSAPP' ? 'WhatsApp Order' : (order.order_source || 'WEB')}</strong></span>
            <span className="text-[#D8CFBF]">·</span>
            <span>Internal ID: <code className="text-[#1C1917] font-mono text-[11.5px]">{order.id}</code></span>
            <span className="text-[#D8CFBF]">·</span>
            <span>Customer ID: <code className="text-[#1C1917] font-mono text-[11.5px]">{order.user_id}</code></span>
          </div>
        </div>

        {/* WhatsApp Quick Link */}
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
              `Hello ${order.customer_name}, this is Zaira Furnishing regarding your order #${order.order_number}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 text-[12.5px] font-semibold transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Customer</span>
          </a>
        </div>
      </div>

      {/* ─── Feedback Alerts ─── */}
      {saveSuccess && (
        <div className="bg-[#FBF8F3] border-[#E8DFC8] p-4 rounded-xl flex items-center gap-3 text-[#7A5832] text-[13px]">
          <CheckCircle2 className="w-5 h-5 text-[#9A7B56] shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 text-rose-800 text-[13px]">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ─── Main Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Items Table & Customization Specs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items Snapshot Card */}
          <div className="bg-white rounded-2xl border border-[#EDE8DE] shadow-2xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#EDE8DE] flex items-center justify-between">
              <div>
                <h2 className="font-serif text-[18px] text-[#1C1917] font-semibold">
                  Purchased Items ({order.items.length})
                </h2>
                <p className="text-[12px] text-[#78716C] mt-0.5">
                  Historical order snapshots locked at checkout. Unit prices are preserved permanently.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FAF7F2] text-[#866945] border border-[#EDE8DE]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B56]" />
                <span>Price-Locked Snapshot</span>
              </span>
            </div>

            <div className="divide-y divide-[#F2ECE1]">
              {order.items.map((item) => {
                let parsedCustom: any = null;
                if (item.customization_data) {
                  try {
                    parsedCustom =
                      typeof item.customization_data === 'string'
                        ? JSON.parse(item.customization_data)
                        : item.customization_data;
                  } catch {
                    parsedCustom = null;
                  }
                }

                return (
                  <div key={item.id} className="p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Thumbnail & Title */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-16 h-16 rounded-xl bg-[#FAF7F2] border border-[#EDE8DE] overflow-hidden shrink-0 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.product_image || '/images/hero/living_room.jpg'}
                            alt={item.product_name_snapshot}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[14.5px] font-semibold text-[#1C1917]">
                            {item.product_name_snapshot}
                          </h3>
                          {item.variant_name_snapshot && (
                            <p className="text-[12px] text-[#8C827A] mt-0.5">
                              Variant: <span className="text-[#1C1917] font-medium">{item.variant_name_snapshot}</span>
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono text-[#A8A29E]">
                              SKU: {item.product_id}
                            </span>
                            {item.product_type === 'custom_made' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAF0E6] text-[#866945] border border-[#E8DCCB]">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Bespoke Custom Made</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="text-right shrink-0">
                        <div className="font-serif text-[16px] font-bold text-[#1C1917]">
                          ₹{item.line_total.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[12px] text-[#78716C] mt-0.5">
                          ₹{item.unit_price_snapshot.toLocaleString('en-IN')} × {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                        </div>
                      </div>
                    </div>

                    {/* Bespoke Customization Data Card if present */}
                    {parsedCustom && (
                      <div className="bg-[#FAF9F5] border border-[#EDE8DE] rounded-xl p-3.5 space-y-2 text-[12px]">
                        <div className="flex items-center gap-1.5 font-semibold text-[#866945]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Customization Specifications Recorded:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#78716C] pt-1">
                          {parsedCustom.sizeLabel && (
                            <div>
                              <span className="font-medium text-[#1C1917]">Standard Dimension:</span> {parsedCustom.sizeLabel}
                            </div>
                          )}
                          {parsedCustom.headingStyle && (
                            <div>
                              <span className="font-medium text-[#1C1917]">Heading / Pleat Style:</span> {parsedCustom.headingStyle}
                            </div>
                          )}
                          {parsedCustom.customDimensions && (
                            <div className="sm:col-span-2">
                              <span className="font-medium text-[#1C1917]">Tailored Dimensions:</span> {parsedCustom.customDimensions}
                            </div>
                          )}
                          {parsedCustom.customMeasurements && (
                            <div className="sm:col-span-2">
                              <span className="font-medium text-[#1C1917]">Measurements:</span>{' '}
                              Width {parsedCustom.customMeasurements.width || '—'} in. × Height {parsedCustom.customMeasurements.height || '—'} in.
                            </div>
                          )}
                          {parsedCustom.notes && (
                            <div className="sm:col-span-2 text-stone-600 italic">
                              &ldquo;{parsedCustom.notes}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Financial Totals Footer */}
            <div className="p-5 sm:p-6 bg-[#FAF7F2] border-t border-[#EDE8DE] space-y-2 text-[13px]">
              <div className="flex justify-between text-[#78716C]">
                <span>Items Subtotal</span>
                <span className="font-mono text-[#1C1917]">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#9A7B56]">
                  <span>Discount Applied</span>
                  <span className="font-mono">-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-[#78716C]">
                <span>Delivery & Atelier Service Charge</span>
                <span className="font-mono text-[#1C1917]">
                  {order.delivery_charge === 0 ? 'Complimentary' : `₹${order.delivery_charge.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-[16px] font-bold text-[#1C1917] pt-2 border-t border-[#EAE4D8]">
                <span className="font-serif">Total Order Value (COD)</span>
                <span className="font-serif text-[18px] text-[#2C221E]">
                  ₹{order.total_amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Site-Visit Specifications */}
          <div className="bg-white rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
              <h2 className="font-serif text-[17px] text-[#1C1917] font-semibold">
                Delivery & Site Inspection Details
              </h2>
              <span className="text-[11.5px] uppercase font-bold text-[#9A7B56] tracking-wider">
                {order.delivery_option === 'service_visit' ? 'Atelier Sizing Visit' : 'Standard Delivery'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div className="space-y-1">
                <span className="text-[11.5px] uppercase tracking-wider font-semibold text-[#8C827A] block">
                  Delivery Address
                </span>
                <p className="font-medium text-[#1C1917]">{order.delivery_address}</p>
                {order.landmark && (
                  <p className="text-[12px] text-[#78716C]">Landmark: {order.landmark}</p>
                )}
                <p className="text-[12px] text-[#78716C]">
                  {order.city}, {order.state} – {order.pincode}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11.5px] uppercase tracking-wider font-semibold text-[#8C827A] block">
                  Service Request
                </span>
                {order.site_visit_required === 1 || order.delivery_option === 'service_visit' ? (
                  <div className="bg-[#2C221E]/5 border border-[#2C221E]/15 rounded-xl p-3 text-[12.5px] space-y-1">
                    <div className="font-semibold text-[#2C221E] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Complimentary Master Measurement Visit</span>
                    </div>
                    <p className="text-[#78716C]">
                      Preferred Window:{' '}
                      <strong className="text-[#1C1917]">
                        {order.site_visit_time || 'Standard Slot (10:00 AM – 1:00 PM)'}
                      </strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-[#78716C]">Standard doorstep delivery. No preliminary site visit requested.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Order Management, Status Workflow, Customer Profile */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status & Fulfillment Management Card */}
          <div className="bg-white rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-2xs space-y-5">
            <div>
              <span className="text-[10.5px] uppercase font-bold tracking-[0.2em] text-[#9A7B56] block mb-1">
                Fulfillment Management
              </span>
              <h2 className="font-serif text-[18px] text-[#1C1917] font-semibold">
                Update Order Status
              </h2>
              <p className="text-[12px] text-[#78716C] mt-0.5">
                Validated server-side. D1 updates instantly sync to the customer&apos;s portal.
              </p>
            </div>

            <form onSubmit={handleSaveChanges} className="space-y-4">
              {/* Order Status Select */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1C1917] block">
                  Fulfillment Stage
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={saving || isTerminal}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56] focus:bg-white disabled:opacity-60 cursor-pointer"
                >
                  <option value={order.status}>
                    Current: {getStatusBadge(order.status).label}
                  </option>
                  {allowedNextTransitions.map((st) => (
                    <option key={st} value={st}>
                      → Transition to: {getStatusBadge(st).label}
                    </option>
                  ))}
                </select>
                {isTerminal && (
                  <p className="text-[11px] text-[#8C827A] italic">
                    Order is in terminal status ({order.status}) and cannot be transitioned further.
                  </p>
                )}
              </div>

              {/* Payment Status Select */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1C1917] block">
                  Payment Status (COD)
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  disabled={saving}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56] focus:bg-white disabled:opacity-60 cursor-pointer"
                >
                  <option value="PENDING">COD Pending (Doorstep Collection)</option>
                  <option value="PAID">Paid on Delivery</option>
                  <option value="FAILED">Payment Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
                <p className="text-[11px] text-[#8C827A]">
                  Payment method remains fixed to <strong className="text-[#1C1917]">COD</strong>. Mark as Paid once collected by the atelier delivery executive.
                </p>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1C1917] block">
                  Order & Atelier Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={saving}
                  rows={3}
                  placeholder="Internal notes, special delivery requests, measurement observations..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] text-[12.5px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56] focus:bg-white resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving || (selectedStatus === order.status && selectedPaymentStatus === order.payment_status && notes === (order.notes || ''))}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12.5px] font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating D1 Ledger...' : 'Save Order Changes'}</span>
              </button>
            </form>
          </div>

          {/* Customer Profile Card */}
          <div className="bg-white rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-[17px] text-[#1C1917] font-semibold pb-3 border-b border-[#F2ECE1]">
              Customer Information
            </h3>

            <div className="space-y-3 text-[13px]">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C827A] block">
                  Full Name
                </span>
                <span className="font-semibold text-[#1C1917] text-[14px]">
                  {order.customer_name}
                </span>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C827A] block">
                  Phone Number
                </span>
                <a
                  href={`tel:${order.customer_phone}`}
                  className="inline-flex items-center gap-1.5 text-[#2C221E] hover:text-[#9A7B56] font-medium"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{order.customer_phone}</span>
                </a>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C827A] block">
                  Email Address
                </span>
                <a
                  href={`mailto:${order.customer_email}`}
                  className="inline-flex items-center gap-1.5 text-[#2C221E] hover:text-[#9A7B56] font-medium truncate max-w-full"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{order.customer_email}</span>
                </a>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C827A] block">
                  Payment Method
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#EDE8DE] font-semibold text-[#1C1917] text-[12px] mt-0.5">
                  <Banknote className="w-3.5 h-3.5 text-[#2C221E]" />
                  <span>{order.payment_method} (Cash on Delivery)</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C827A] block">
                  Order Source / Channel
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#EDE8DE] font-semibold text-[#1C1917] text-[12px] mt-0.5">
                  {order.order_source === 'WHATSAPP' ? (
                    <>
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp Order</span>
                    </>
                  ) : (
                    <span>{order.order_source || 'WEB'}</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Notification Delivery Ledger Card */}
          <div className="bg-white rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#9A7B56]" />
                <h3 className="font-serif text-[17px] text-[#1C1917] font-semibold">
                  Notification Ledger
                </h3>
              </div>
              <span className="text-[11px] text-[#8C827A] font-mono">
                {order.notifications?.length || 0} recorded
              </span>
            </div>

            {(!order.notifications || order.notifications.length === 0) ? (
              <p className="text-[12px] text-[#78716C] italic py-2">
                No notification events recorded for this order yet.
              </p>
            ) : (
              <div className="space-y-3">
                {order.notifications.map((notif) => {
                  const isSent = notif.status === 'SENT';
                  const isFailed = notif.status === 'FAILED';

                  const badgeClass = isSent
                    ? 'bg-[#FBF8F3] text-[#7A5832] border-[#E8DFC8]'
                    : isFailed
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-stone-50 text-stone-700 border-stone-200';

                  const eventLabel =
                    notif.event_type === 'NEW_ORDER_CUSTOMER'
                      ? 'Customer Confirmation'
                      : notif.event_type === 'NEW_ORDER_ADMIN'
                      ? 'Admin Order Alert'
                      : 'Customer Status Update';

                  return (
                    <div
                      key={notif.id}
                      className="p-3 rounded-xl border border-[#EDE8DE] bg-[#FAF9F5] text-[12px] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#1C1917]">{eventLabel}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeClass}`}>
                          <span>{notif.status}</span>
                        </span>
                      </div>
                      <div className="text-[#78716C] flex items-center justify-between">
                        <span className="truncate max-w-[180px]">{notif.recipient_email}</span>
                        <span className="text-[10px] text-[#A8A29E]">
                          {notif.sent_at
                            ? new Date(notif.sent_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : new Date(notif.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {notif.error_message && (
                        <div className="text-[11px] text-rose-700 bg-rose-50/50 p-1.5 rounded border border-rose-100">
                          {notif.error_message}
                        </div>
                      )}
                      {isFailed && (
                        <button
                          type="button"
                          onClick={() => handleRetryNotification(notif.id)}
                          disabled={retryingNotifId === notif.id}
                          className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#D5CDBF] hover:border-[#2C221E] text-[11px] font-medium text-[#1C1917] hover:text-[#9A7B56] transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Send className={`w-3 h-3 ${retryingNotifId === notif.id ? 'animate-spin' : ''}`} />
                          <span>{retryingNotifId === notif.id ? 'Retrying Delivery...' : 'Retry Delivery'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status History Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#9A7B56]" />
                  <h3 className="font-serif text-[17px] text-[#1C1917] font-semibold">
                    Status History
                  </h3>
                </div>
                <span className="text-[11px] text-[#8C827A] font-mono">
                  {order.statusHistory.length} change{order.statusHistory.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#EDE8DE]" />

                <div className="space-y-3">
                  {order.statusHistory.map((entry, idx) => {
                    const isLast = idx === order.statusHistory!.length - 1;
                    return (
                      <div key={entry.id} className="flex items-start gap-3 relative">
                        {/* Timeline dot */}
                        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isLast
                            ? 'border-[#2C221E] bg-[#2C221E]'
                            : 'border-[#D5CDBF] bg-white'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isLast ? 'bg-white' : 'bg-[#D5CDBF]'}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-1">
                          <div className="flex items-center gap-2 text-[12px]">
                            <span className="font-mono text-[11px] text-[#A8A29E] line-through">{entry.old_status}</span>
                            <span className="text-[#8C827A]">→</span>
                            <span className={`font-semibold text-[12px] ${
                              entry.new_status === 'CANCELLED' ? 'text-rose-700' :
                              entry.new_status === 'COMPLETED' ? 'text-[#9A7B56]' :
                              'text-[#1C1917]'
                            }`}>{entry.new_status}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#A8A29E] mt-0.5">
                            <span>{entry.changed_by}</span>
                            <span>·</span>
                            <span>{new Date(entry.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
