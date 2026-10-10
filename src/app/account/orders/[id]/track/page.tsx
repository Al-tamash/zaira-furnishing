'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  MessageCircle,
  HelpCircle,
  Check,
  Copy,
  Info,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useStore, Order } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = (params?.id as string) || '';
  const { getOrderById } = useStore();
  const [mounted, setMounted] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [remoteOrder, setRemoteOrder] = useState<Order | null>(null);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrderTracking = useCallback(async (showRefreshing = false) => {
    if (!orderId) return;
    if (showRefreshing) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        if (res.status === 404 || res.status === 401) {
          setRemoteOrder(null);
        }
        return;
      }
      const data = await res.json();
      if (data?.order) {
        const o = data.order;
        setRemoteOrder({
          id: o.order_number || o.id,
          rawStatus: (o.status || 'CONFIRMED').toUpperCase(),
          orderSource: o.order_source || 'WEB',
          landmark: o.landmark || null,
          paymentStatus: o.payment_status || 'PENDING',
          statusHistory: o.statusHistory || [],
          createdAt: o.created_at,
          items: (o.items || []).map((it: any) => ({
            id: it.id,
            productId: it.product_id,
            name: it.product_name_snapshot,
            slug: it.product_slug || '',
            image: it.product_image || '/images/products/curtains/blackout-curtains/main.jpg',
            variantName: it.variant_name_snapshot || undefined,
            sku: it.product_id,
            quantity: it.quantity,
            unitPrice: it.unit_price_snapshot,
            totalPrice: it.line_total,
          })),
          subtotal: o.subtotal,
          shippingCost: o.delivery_charge || 0,
          total: o.total_amount,
          customer: {
            fullName: o.customer_name,
            phone: o.customer_phone,
            email: o.customer_email,
          },
          deliveryAddress: {
            addressLine1: o.delivery_address,
            addressLine2: '',
            city: o.city,
            state: o.state,
            pincode: o.pincode,
            country: 'India',
          },
          deliveryOption: (o.delivery_option as any) || 'standard',
          timeSlot: o.site_visit_time || undefined,
          paymentMethod: o.payment_method === 'COD' ? 'cod' : 'online_demo',
          status: (() => {
            const s = (o.status || '').toUpperCase();
            if (s === 'PENDING') return 'order_received';
            if (s === 'CONFIRMED') return 'details_confirmed';
            if (s === 'PROCESSING') return 'tailoring_preparation';
            if (s === 'READY') return 'ready_for_dispatch';
            if (s === 'COMPLETED') return 'delivered_installed';
            if (s === 'CANCELLED') return 'cancelled';
            return 'details_confirmed';
          })(),
          hasCustomProducts: (o.items || []).some(
            (it: any) => it.customization_data || it.product_type === 'custom_made'
          ),
        });
      }
    } catch (err) {
      console.error('Error loading order tracking:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    setMounted(true);
    if (!orderId) return;

    const local = getOrderById(orderId);
    if (local && local.items && local.items.length > 0) {
      setRemoteOrder(local);
    }

    fetchOrderTracking();
  }, [orderId, getOrderById, fetchOrderTracking]);

  const order = remoteOrder || getOrderById(orderId);

  const copyRef = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(`#${orderId}`);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-12 pb-24 text-[#1C1917]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-[#2C221E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-[#78716C]">Loading tracking progress...</p>
        </div>
      </div>
    );
  }

  // Fallback if order not found
  if (!order) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-10 pb-24 text-[#1C1917]">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-14 h-14 rounded-full bg-white border border-[#EDE8DE] flex items-center justify-center mx-auto mb-4 text-[#8C827A]">
            <HelpCircle className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h1 className="font-serif text-[24px] text-[#1C1917] font-semibold mb-2">
            Order Reference Not Found
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#78716C] leading-relaxed mb-6 font-light">
            We could not locate tracking records for reference <strong className="text-[#1C1917]">#{orderId}</strong> on this browser session.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11.5px] uppercase tracking-wider font-semibold transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Orders</span>
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#D8CFBF] text-[#1C1917] hover:border-[#2C221E] text-[11.5px] uppercase tracking-wider font-semibold transition-all"
            >
              <span>Explore Categories</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = (order.rawStatus || '').toUpperCase() || (() => {
    switch (order.status) {
      case 'order_received': return 'CONFIRMED';
      case 'details_confirmed': return 'CONFIRMED';
      case 'tailoring_preparation': return 'PROCESSING';
      case 'ready_for_dispatch': return 'READY';
      case 'delivered_installed': return 'COMPLETED';
      case 'cancelled': return 'CANCELLED';
      default: return 'CONFIRMED';
    }
  })();

  const isCancelled = currentStatus === 'CANCELLED';

  const stageIndices: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 1,
    READY: 2,
    COMPLETED: 3,
  };

  const currentStageIndex = stageIndices[currentStatus] ?? 0;

  const getSlotLabel = (slot?: 'morning' | 'afternoon' | 'evening') => {
    switch (slot) {
      case 'morning':
        return 'Morning (10:00 AM – 1:00 PM)';
      case 'afternoon':
        return 'Afternoon (2:00 PM – 5:00 PM)';
      case 'evening':
        return 'Evening (5:00 PM – 8:00 PM)';
      default:
        return 'Standard Timing';
    }
  };

  const getStatusTimestamp = (statusKey: string): string | null => {
    if (statusKey === 'CONFIRMED') {
      const entry = order.statusHistory?.find((h) => h.status === 'CONFIRMED');
      const ts = entry?.timestamp || order.createdAt;
      return new Date(ts).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    const entry = order.statusHistory?.find((h) => h.status === statusKey);
    if (!entry) return null;
    return new Date(entry.timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Timeline stage definitions customized to canonical lifecycle
  const timelineStages = [
    {
      key: 'CONFIRMED',
      name: 'Order Confirmed',
      shortExplanation: 'Your order has been recorded with specifications and delivery details.',
      note: `Reference #${order.id} registered in atelier records.`,
    },
    {
      key: 'PROCESSING',
      name: order.hasCustomProducts ? 'Custom Tailoring & Atelier Processing' : 'Preparation & Quality Check',
      shortExplanation: order.hasCustomProducts
        ? 'Fabrics cut and hand-stitched by master tailors to your exact measurements.'
        : 'Furnishings carefully inspected, pressed, steamed, and packaged.',
      note: order.hasCustomProducts
        ? 'Handcrafted to exact dimensions in our atelier.'
        : 'Protected in dust covers for transit.',
    },
    {
      key: 'READY',
      name: order.deliveryOption === 'service_visit' ? 'Ready for Delivery & Fitting Visit' : 'Ready for Doorstep Delivery',
      shortExplanation: order.deliveryOption === 'service_visit'
        ? 'Furnishings ready. Sizing & installation specialists coordinate arrival.'
        : 'Order packaged and ready for safe white-glove courier dispatch.',
      note: order.deliveryOption === 'service_visit'
        ? `Scheduled service slot: ${getSlotLabel(order.timeSlot)}`
        : 'Doorstep dispatch.',
    },
    {
      key: 'COMPLETED',
      name: order.deliveryOption === 'service_visit' ? 'Delivered & Installed' : 'Delivered Successfully',
      shortExplanation: order.deliveryOption === 'service_visit'
        ? 'Furnishings delivered and fitted on site to your complete satisfaction.'
        : 'Package delivered safely to your verified address.',
      note: 'Fulfillment completed.',
    },
  ];

  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-6 sm:pt-10 pb-16 sm:pb-24 text-[#1C1917]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── BREADCRUMB ─── */}
        <nav className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] text-[#78716C] mb-5 sm:mb-6 font-normal">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <Link href="/account/orders" className="hover:text-[#1C1917] transition-colors">
            My Orders
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <Link href={`/account/orders/${order.id}`} className="hover:text-[#1C1917] transition-colors">
            Order #{order.id}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span className="text-[#1C1917] font-medium">Order Progress</span>
        </nav>

        {/* ─── HEADER SUMMARY CARD ─── */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)] mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F2ECE1]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#866945] block mb-1">
                Order Progress & Status
              </span>
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-[22px] sm:text-[26px] font-semibold text-[#1C1917]">
                  Order #{order.id}
                </h1>
                <button
                  type="button"
                  onClick={copyRef}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#D8CFBF] hover:bg-white text-[10.5px] font-semibold text-[#2C221E] transition-colors cursor-pointer"
                  title="Copy Reference"
                >
                  {copiedRef ? (
                    <>
                      <Check className="w-3 h-3 text-[#9A7B56]" />
                      <span className="text-[#9A7B56]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fetchOrderTracking(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#D8CFBF] hover:border-[#2C221E] text-[#1C1917] hover:text-[#9A7B56] text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh order status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Checking...' : 'Refresh'}</span>
              </button>

              <Link
                href={`/account/orders/${order.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#D8CFBF] hover:border-[#2C221E] text-[#1C1917] hover:text-[#9A7B56] text-[11px] uppercase tracking-wider font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Details</span>
              </Link>

              <a
                href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hello Zaira Furnishing, I would like to check the progress of order reference #${order.id}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] uppercase tracking-wider font-bold transition-colors shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-[12px] text-[#78716C]">
            <div>
              <span className="text-[#8C827A] block text-[10.5px] uppercase font-semibold">Recipient</span>
              <span className="text-[#1C1917] font-medium">{order.customer.fullName}</span>
            </div>
            <div>
              <span className="text-[#8C827A] block text-[10.5px] uppercase font-semibold">Destination City</span>
              <span className="text-[#1C1917] font-medium">{order.deliveryAddress.city}, {order.deliveryAddress.state}</span>
            </div>
            <div>
              <span className="text-[#8C827A] block text-[10.5px] uppercase font-semibold">Service Type</span>
              <span className="text-[#2C221E] font-medium">
                {order.deliveryOption === 'service_visit' ? 'In-Home Sizing & Installation' : 'White-Glove Delivery'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── BESPOKE ORDER NOTICE (IF BESPOKE) ─── */}
        {order.hasCustomProducts && (
          <div className="bg-[#FAF0E6] rounded-xl border border-[#E8DCCB] p-4 sm:p-5 mb-6 sm:mb-8 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#9A7B56]" />
              <span className="font-serif text-[13.5px] uppercase font-bold tracking-wider text-[#866945]">
                BESPOKE ORDER PROGRESSION
              </span>
            </div>
            <p className="text-[12.5px] text-[#866945] font-medium leading-relaxed mb-0.5">
              Your customization details have been recorded.
            </p>
            <p className="text-[12px] text-[#78716C] leading-relaxed">
              Final measurements and customization will be confirmed before production. Furnishings transition into hand-tailoring once fabric widths and rod clearances are verified.
            </p>
          </div>
        )}

        {/* ─── CANCELLED STATE OR VERTICAL TRACKING TIMELINE ─── */}
        {isCancelled ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(28,25,23,0.03)] mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0 text-rose-700 mt-0.5">
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h2 className="font-serif text-[20px] font-semibold text-rose-900">
                    Order Cancelled
                  </h2>
                  {getStatusTimestamp('CANCELLED') && (
                    <span className="text-[12px] text-rose-700 font-mono">
                      ({getStatusTimestamp('CANCELLED')})
                    </span>
                  )}
                </div>
                <p className="text-[13.5px] text-rose-800 leading-relaxed font-light mb-4">
                  This order was cancelled and will not progress to preparation, dispatch, or installation.
                </p>
                <a
                  href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `Hello Zaira Furnishing, I have a question regarding my cancelled order #${order.id}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-900 hover:bg-rose-100 text-[12px] font-semibold transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Chat with Us on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-6 sm:p-8 shadow-[0_2px_12px_rgba(28,25,23,0.03)] mb-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#F2ECE1]">
              <div>
                <h2 className="font-serif text-[18px] sm:text-[20px] font-semibold text-[#1C1917]">
                  Order Progress Timeline
                </h2>
                <p className="text-[12px] text-[#78716C] mt-0.5">
                  Current State: <strong className="text-[#2C221E]">{timelineStages[currentStageIndex]?.name}</strong>
                </p>
              </div>
              <span className="text-[11px] text-[#8C827A] bg-[#FAF7F2] px-2.5 py-1 rounded-md border border-[#EDE8DE]">
                Stage {currentStageIndex + 1} of 4
              </span>
            </div>

            {/* Vertical Step Sequence */}
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EDE8DE]">
              {timelineStages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const timestamp = getStatusTimestamp(stage.key);

                return (
                  <div key={stage.key} className="relative flex items-start gap-4">
                    {/* Timeline Node Symbol */}
                    <div
                      className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors z-10 ${
                        isCompleted
                          ? 'bg-[#2C221E] text-white shadow-xs ring-4 ring-white'
                          : 'bg-white border-2 border-[#D8CFBF] text-[#A8A29E]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#D8CFBF]" />
                      )}
                    </div>

                    {/* Stage Text Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3
                          className={`font-serif text-[15px] sm:text-[16px] font-semibold ${
                            isCompleted ? 'text-[#1C1917]' : 'text-[#8C827A]'
                          }`}
                        >
                          {stage.name}
                        </h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-wider bg-[#2C221E] text-white">
                            Current Stage
                          </span>
                        )}
                        {isCompleted && !isCurrent && (
                          <span className="text-[11px] text-[#9A7B56] font-medium">
                            ✓ Done
                          </span>
                        )}
                        {!isCompleted && (
                          <span className="text-[11px] text-[#A8A29E] font-medium">
                            ○ Upcoming
                          </span>
                        )}
                      </div>

                      <p className="text-[12.5px] sm:text-[13px] text-[#78716C] leading-relaxed">
                        {stage.shortExplanation}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        {stage.note && (
                          <span className="text-[11px] text-[#8C827A] italic">
                            {stage.note}
                          </span>
                        )}
                        {timestamp && (
                          <span className="text-[11px] font-mono text-[#9A7B56] font-medium">
                            · {timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Honest Status Language Note */}
            <div className="mt-8 pt-4 border-t border-[#F2ECE1] flex items-start gap-2.5 text-[11.5px] text-[#78716C]">
              <Info className="w-4 h-4 text-[#9A7B56] shrink-0 mt-0.5" />
              <p>
                <strong>Notice:</strong> This progress timeline directly reflects your order&apos;s real-time atelier status. Sizing visits and deliveries are confirmed directly via WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* ─── BOTTOM NAVIGATION ACTIONS ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            href={`/account/orders/${order.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#D8CFBF] text-[#1C1917] hover:border-[#2C221E] text-[11.5px] uppercase tracking-wider font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Order Details</span>
          </Link>

          <Link
            href="/account/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#EDE8DE] text-[#78716C] hover:text-[#1C1917] text-[11.5px] uppercase tracking-wider font-semibold transition-all"
          >
            <span>My Orders List</span>
          </Link>

          <Link
            href="/categories"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11.5px] uppercase tracking-wider font-semibold transition-all shadow-xs"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
