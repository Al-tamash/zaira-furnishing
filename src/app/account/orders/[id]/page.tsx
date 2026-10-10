'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Compass,
  CheckCircle2,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  Truck,
  Copy,
  Check,
  MessageCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useStore, Order } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = (params?.id as string) || '';
  const { getOrderById } = useStore();
  const [mounted, setMounted] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [remoteOrder, setRemoteOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrderDetails = useCallback(async (showRefreshing = false) => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }
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
        const mappedItems = (o.items || []).map((it: any) => {
          let customData: any = undefined;
          if (it.customization_data) {
            try {
              customData = typeof it.customization_data === 'string' ? JSON.parse(it.customization_data) : it.customization_data;
            } catch {
              customData = undefined;
            }
          }
          return {
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
            customizationData: customData,
            customDimensions: customData?.customDimensions,
            sizeLabel: customData?.sizeLabel,
            headingStyle: customData?.headingStyle,
          };
        });

        setRemoteOrder({
          id: o.order_number || o.id,
          rawStatus: (o.status || 'CONFIRMED').toUpperCase(),
          orderSource: o.order_source || 'WEB',
          landmark: o.landmark || null,
          paymentStatus: o.payment_status || 'PENDING',
          statusHistory: o.statusHistory || [],
          createdAt: o.created_at,
          items: mappedItems,
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
          hasCustomProducts: mappedItems.some(
            (it: any) => it.customDimensions || it.customizationData
          ),
        });
      }
    } catch (err) {
      console.error('Error loading order from D1:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    setMounted(true);
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const local = getOrderById(orderId);
    if (local && local.items && local.items.length > 0) {
      setRemoteOrder(local);
    }

    fetchOrderDetails();
  }, [orderId, getOrderById, fetchOrderDetails]);

  const order = remoteOrder || getOrderById(orderId);

  const copyRef = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(`#${orderId}`);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  if (!mounted || isLoading) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-12 pb-24 text-[#1C1917]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-[#2C221E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-[#78716C]">Loading order details...</p>
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
            We could not find an order record for reference <strong className="text-[#1C1917]">#{orderId}</strong>. Please ensure you are logged into the customer account associated with this order.
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

  const formattedDateTime = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

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

  const ORDER_LIFECYCLE_STEPS = [
    {
      key: 'CONFIRMED',
      label: 'Confirmed',
      description: 'Order confirmed & specifications recorded',
    },
    {
      key: 'PROCESSING',
      label: 'Processing',
      description: order.hasCustomProducts
        ? 'Custom fabric cutting & hand-tailoring in atelier'
        : 'Inspection, fabric steaming & batch preparation',
    },
    {
      key: 'READY',
      label: 'Ready',
      description: order.deliveryOption === 'service_visit'
        ? 'Ready for delivery & white-glove fitting visit'
        : 'Packed & ready for white-glove dispatch',
    },
    {
      key: 'COMPLETED',
      label: 'Completed',
      description: 'Delivered and fitted to complete satisfaction',
    },
  ] as const;

  const stepIndices: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 1,
    READY: 2,
    COMPLETED: 3,
  };

  const currentStepIdx = stepIndices[currentStatus] ?? 0;

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

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return {
          label: 'Processing',
          classes: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-600',
        };
      case 'READY':
        return {
          label: 'Ready',
          classes: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-600',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          classes: 'bg-[#2C221E]/10 text-[#2C221E] border-[#2C221E]/20',
          dot: 'bg-[#2C221E]',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          classes: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-600',
        };
      case 'CONFIRMED':
      default:
        return {
          label: 'Confirmed',
          classes: 'bg-[#FBF8F3] text-[#7A5832] border-[#E8DFC8]',
          dot: 'bg-[#9A7B56]',
        };
    }
  };

  const statusBadge = getStatusBadgeConfig(currentStatus);

  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-6 sm:pt-10 pb-16 sm:pb-24 text-[#1C1917]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
          <span className="text-[#1C1917] font-medium truncate max-w-[150px] sm:max-w-none">
            Order #{order.id}
          </span>
        </nav>

        {/* ─── TOP HEADER BAR ─── */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)] mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Order Identifiers */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#866945]">
                  Order Reference
                </span>
                <span className="font-mono text-[20px] sm:text-[22px] font-bold text-[#1C1917]">
                  #{order.id}
                </span>
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

              <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#78716C]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#9A7B56]" />
                  <span>Placed on {formattedDateTime}</span>
                </span>
                <span className="text-[#D8CFBF]">·</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.classes}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                  <span>{statusBadge.label}</span>
                </span>
                {order.orderSource === 'WHATSAPP' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/25">
                    <MessageCircle className="w-3 h-3 text-[#25D366]" />
                    <span>WhatsApp Order</span>
                  </span>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchOrderDetails(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#D8CFBF] hover:border-[#2C221E] text-[#1C1917] hover:text-[#9A7B56] text-[11.5px] uppercase tracking-wider font-semibold transition-all cursor-pointer disabled:opacity-50"
                title="Refresh order status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Checking...' : 'Refresh Status'}</span>
              </button>

              <a
                href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hello Zaira Furnishing, I have a question about my order ${order.id}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11.5px] uppercase tracking-wider font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat with Zaira on WhatsApp</span>
              </a>
            </div>

          </div>
        </div>

        {/* ─── CANCELLED ORDER ALERT BANNER (IF CANCELLED) ─── */}
        {isCancelled ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 sm:p-6 mb-6 sm:mb-8 text-left shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0 text-rose-700 mt-0.5">
                <AlertCircle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-serif text-[17px] font-semibold text-rose-900">
                    Order Cancelled
                  </h3>
                  {getStatusTimestamp('CANCELLED') && (
                    <span className="text-[11.5px] text-rose-700 font-mono">
                      · Cancelled on {getStatusTimestamp('CANCELLED')}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-rose-800 leading-relaxed font-light">
                  This order has been cancelled and will not proceed through further fulfillment stages. If you have questions regarding this cancellation or would like to explore alternative fabrics and bespoke furnishings, our concierge is available to assist you.
                </p>
                <div className="mt-3.5">
                  <a
                    href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                      `Hello Zaira Furnishing, I have a question regarding my cancelled order ${order.id}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-rose-200 text-rose-900 hover:bg-rose-100 text-[11.5px] font-semibold transition-colors shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── LIVE ORDER STATUS TRACKER (FOR ACTIVE ORDERS) ─── */
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)] mb-6 sm:mb-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[#F2ECE1]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#866945] block">
                  Order Status Lifecycle
                </span>
                <h2 className="font-serif text-[18px] sm:text-[20px] font-semibold text-[#1C1917]">
                  Fulfillment Progress
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] text-[#78716C]">
                  Current Status: <strong className="text-[#2C221E] uppercase">{currentStatus}</strong>
                </span>
              </div>
            </div>

            {/* Pipeline Tracker */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative">
              {ORDER_LIFECYCLE_STEPS.map((step, idx) => {
                const isPast = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const timestamp = getStatusTimestamp(step.key);

                return (
                  <div key={step.key} className="flex sm:flex-col items-start gap-3 sm:gap-2 relative">
                    {/* Connector line for desktop */}
                    {idx < ORDER_LIFECYCLE_STEPS.length - 1 && (
                      <div
                        className={`hidden sm:block absolute top-[14px] left-[28px] right-[-14px] h-0.5 z-0 ${
                          idx < currentStepIdx ? 'bg-[#2C221E]' : 'bg-[#EDE8DE]'
                        }`}
                      />
                    )}

                    {/* Node icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                        isPast
                          ? 'bg-[#2C221E] text-white'
                          : isCurrent
                          ? 'bg-[#2C221E] text-white ring-4 ring-[#2C221E]/20'
                          : 'bg-white border-2 border-[#D8CFBF] text-[#A8A29E]'
                      }`}
                    >
                      {isPast ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D8CFBF]" />
                      )}
                    </div>

                    {/* Step Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`font-serif text-[14px] sm:text-[15px] font-semibold ${
                            isCurrent ? 'text-[#2C221E]' : isPast ? 'text-[#1C1917]' : 'text-[#8C827A]'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold tracking-wider bg-[#2C221E] text-white">
                            Current
                          </span>
                        )}
                        {isPast && (
                          <span className="text-[10px] text-[#9A7B56] font-medium">
                            ✓ Done
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#78716C] leading-snug mt-0.5">
                        {step.description}
                      </p>

                      {timestamp && (
                        <span className="inline-block text-[10.5px] font-mono text-[#9A7B56] mt-1 font-medium">
                          {timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── BESPOKE ORDER NOTICE (IF APPLICABLE) ─── */}
        {order.hasCustomProducts && (
          <div className="bg-[#FAF0E6] rounded-xl border border-[#E8DCCB] p-4 sm:p-5 mb-6 sm:mb-8 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#9A7B56]" />
              <span className="font-serif text-[13.5px] uppercase font-bold tracking-wider text-[#866945]">
                BESPOKE ORDER
              </span>
            </div>
            <p className="text-[12.5px] text-[#866945] font-medium leading-relaxed mb-0.5">
              Your customization details have been recorded.
            </p>
            <p className="text-[12px] text-[#78716C] leading-relaxed">
              Final measurements and customization will be confirmed before production.
            </p>
          </div>
        )}

        {/* ─── TWO-COLUMN GRID: ITEMS + CUSTOMIZATION VS ORDER INFO ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT: ORDER ITEMS & CUSTOMIZATION DETAILS (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                <h2 className="font-serif text-[17px] sm:text-[19px] font-semibold text-[#1C1917]">
                  Order Items ({order.items.length})
                </h2>
                <span className="text-[11px] text-[#8C827A] uppercase tracking-wider">
                  Handcrafted Furnishings
                </span>
              </div>

              <div className="divide-y divide-[#F2ECE1]">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex gap-3.5 sm:gap-4 items-start">
                      <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#EDE8DE] shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-[14.5px] sm:text-[16px] font-semibold text-[#1C1917]">
                          {item.name}
                        </h3>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-[#78716C] mt-1">
                          {item.variantName && (
                            <span>Color/Pattern: <strong className="text-[#1C1917]">{item.variantName}</strong></span>
                          )}
                          {item.headingStyle && (
                            <span>Heading: <strong className="text-[#1C1917]">{item.headingStyle}</strong></span>
                          )}
                          {item.sizeLabel && !item.customDimensions && (
                            <span>Size: <strong className="text-[#1C1917]">{item.sizeLabel}</strong></span>
                          )}
                          <span>Qty: <strong className="text-[#1C1917]">{item.quantity}</strong></span>
                        </div>

                        <div className="mt-2 text-[12.5px] font-serif text-[#1C1917]">
                          <span className="text-[#8C827A] font-sans text-[11.5px] mr-1">Unit:</span>
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-serif text-[15px] sm:text-[17px] font-bold text-[#1C1917]">
                          ₹{item.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Dedicated Bespoke Customization Box */}
                    {item.customDimensions && (
                      <div className="bg-[#FAF7F2] rounded-lg p-3 border border-[#EDE8DE] text-[11.5px] space-y-1">
                        <div className="flex items-center gap-1.5 text-[#866945] font-semibold uppercase tracking-wider text-[10.5px]">
                          <Sparkles className="w-3 h-3" />
                          <span>Recorded Customization Details:</span>
                        </div>
                        <p className="text-[#1C1917] font-medium">
                          {item.customDimensions}
                        </p>
                        {item.headingStyle && (
                          <p className="text-[#78716C]">
                            Pleat Configuration: <span className="text-[#1C1917]">{item.headingStyle}</span>
                          </p>
                        )}
                        <p className="text-[10px] text-[#8C827A] pt-0.5">
                          * Master tailors confirm exact drapery drop and rod clearances prior to stitching.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CUSTOMER, DELIVERY & BILLING SUMMARY (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Customer & Address Tile */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-4">
              <h2 className="font-serif text-[16px] sm:text-[17px] font-semibold text-[#1C1917] pb-2.5 border-b border-[#F2ECE1]">
                Customer & Destination
              </h2>

              <div className="space-y-3 text-[12.5px]">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-[#9A7B56] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#1C1917] block">{order.customer.fullName}</span>
                    <span className="text-[#78716C]">{order.customer.phone}</span>
                    {order.customer.email && (
                      <span className="text-[#78716C] block">{order.customer.email}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-[#F8F5EE]">
                  <MapPin className="w-4 h-4 text-[#9A7B56] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#1C1917] block">Delivery Address</span>
                    <p className="text-[#78716C] leading-relaxed">
                      {order.deliveryAddress.addressLine1}
                      {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
                      <br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} – {order.deliveryAddress.pincode}
                    </p>
                    {order.landmark && (
                      <p className="text-[11.5px] text-[#78716C] mt-1 pt-1 border-t border-[#F8F5EE]">
                        <span className="text-[#8C827A] font-medium">Landmark:</span>{' '}
                        <strong className="text-[#1C1917]">{order.landmark}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-[#F8F5EE]">
                  <Truck className="w-4 h-4 text-[#9A7B56] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#1C1917] block">Service Method</span>
                    <span className="text-[#2C221E] font-medium block">
                      {order.deliveryOption === 'service_visit'
                        ? `In-Home Sizing & Installation (${getSlotLabel(order.timeSlot)})`
                        : 'Standard White-Glove Doorstep Delivery'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-[#F8F5EE]">
                  <Banknote className="w-4 h-4 text-[#9A7B56] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#1C1917] block">Payment Details</span>
                    <span className="text-[#78716C] block">
                      {order.paymentMethod === 'cod'
                        ? 'Cash on Delivery (COD)'
                        : 'Online Payment (Frontend Demo)'}
                    </span>
                    <span className="text-[11.5px] text-[#8C827A] block mt-0.5">
                      Status:{' '}
                      <strong className="text-[#1C1917] uppercase">
                        {order.paymentStatus || 'PENDING'}
                      </strong>
                    </span>
                  </div>
                </div>

                {order.orderSource && (
                  <div className="flex items-start gap-2.5 pt-2 border-t border-[#F8F5EE]">
                    <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#1C1917] block">Order Channel</span>
                      <span className="text-[#2C221E] font-medium text-[12px] block">
                        {order.orderSource === 'WHATSAPP'
                          ? 'Order placed via WhatsApp'
                          : order.orderSource}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary Tile */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-3 text-[12.5px] sm:text-[13px]">
              <h2 className="font-serif text-[16px] sm:text-[17px] font-semibold text-[#1C1917] pb-2.5 border-b border-[#F2ECE1]">
                Payment Summary
              </h2>

              <div className="flex justify-between text-[#78716C]">
                <span>Items Subtotal</span>
                <span className="font-medium text-[#1C1917]">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-[#78716C]">
                <span>White-Glove Delivery</span>
                <span className="font-semibold text-[#2C221E]">Complimentary</span>
              </div>

              <div className="flex justify-between text-[#78716C]">
                <span>GST (Included)</span>
                <span className="font-medium text-[#1C1917]">Included in Price</span>
              </div>

              <div className="pt-3 border-t border-[#F2ECE1] flex justify-between items-baseline font-serif">
                <span className="text-[16px] font-semibold text-[#1C1917]">Total Paid / Payable</span>
                <span className="text-[20px] font-bold text-[#1C1917]">
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Navigation & Help Links */}
            <div className="space-y-2 pt-2">
              <Link
                href={`/account/orders/${order.id}/track`}
                className="w-full py-3.5 rounded-xl font-semibold text-[12px] uppercase tracking-widest bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Track Order Progress</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Link
                  href="/account/orders"
                  className="text-[11.5px] uppercase tracking-wider font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors"
                >
                  ← Back to My Orders
                </Link>

                <Link
                  href="/categories"
                  className="text-[11.5px] uppercase tracking-wider font-semibold text-[#9A7B56] hover:text-[#866945] transition-colors"
                >
                  Continue Shopping →
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
