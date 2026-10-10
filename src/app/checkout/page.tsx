'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Banknote,
  Calendar,
  Check,
  MapPin,
  User,
  Clock,
  Printer,
  Copy,
  FileText,
  Compass,
} from 'lucide-react';
import { useStore, Order, CartItem } from '@/lib/context/StoreContext';
import {
  ZAIRA_WHATSAPP_NUMBER,
  ZAIRA_WHATSAPP_DISPLAY,
  buildOrderWhatsAppUrl,
} from '@/lib/whatsapp';

export default function CheckoutPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    clearCart,
    saveOrder,
    customer,
    isAuthenticated,
    refreshSession,
    refreshOrders,
    setAuthModalOpen,
  } = useStore();

  // ─── CHECKOUT STEPS: 1: Details, 2: Delivery, 3: Payment, 4: Review, 5: Success ───
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // ─── BUY NOW STATE (Independent Single-Product Path) ───
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('buyNow') === '1') {
        try {
          const stored = sessionStorage.getItem('zaira_buy_now_item');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.productId || parsed.id)) {
              setIsBuyNow(true);
              setBuyNowItem(parsed);
              return;
            }
          }
        } catch (e) {
          console.error('Error reading Buy Now payload:', e);
        }
      }
      setIsBuyNow(false);
      setBuyNowItem(null);
    }
  }, []);

  // ─── FORM STATE ───
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'service_visit'>('standard');
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [whatsappOpened, setWhatsappOpened] = useState<boolean>(false);

  // Auto-populate customer info when logged in
  useEffect(() => {
    if (customer) {
      if (customer.name && !fullName) setFullName(customer.name);
      if (customer.phone && !phone) setPhone(customer.phone);
      if (customer.email && !email) setEmail(customer.email);
    }
  }, [customer, fullName, phone, email]);

  // Refresh cart session on mount to ensure fresh D1 prices and availability
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Ensure unique idempotency key
  useEffect(() => {
    if (!idempotencyKey) {
      setIdempotencyKey(`idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    }
  }, [idempotencyKey]);

  // ─── ACTIVE CHECKOUT ITEMS: BUY NOW OR CART ───
  const activeItems = isBuyNow && buyNowItem ? [buyNowItem] : cart;
  const activeCount = isBuyNow && buyNowItem ? buyNowItem.quantity : cartCount;
  const activeTotal = isBuyNow && buyNowItem ? buyNowItem.totalPrice : cartTotal;

  // Detect custom-made products in the active items
  const hasCustomProducts = activeItems.some((item) => {
    if (item.customDimensions || (item.sizeLabel && item.sizeLabel.toLowerCase().includes('custom'))) {
      return true;
    }
    return item.productType === 'custom_made' || item.customizationData?.productType === 'custom_made';
  });

  const hasUnavailableItems = isBuyNow ? false : cart.some((item) => item.isAvailable === false);

  const shippingCost = 0; // Complimentary white-glove delivery
  const totalPayable = activeTotal + shippingCost;

  // ─── STEP VALIDATION HANDLERS ───
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Please enter your full name';
    if (!phone.trim()) {
      errs.phone = 'Please enter your mobile number';
    } else if (!/^[0-9+ -]{10,14}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!addressLine1.trim()) errs.addressLine1 = 'House, Flat or Villa number is required';
    if (!addressLine2.trim()) errs.addressLine2 = 'Street or locality area is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!pincode.trim()) {
      errs.pincode = 'PIN Code is required';
    } else if (!/^[0-9]{6}$/.test(pincode.trim())) {
      errs.pincode = 'Please enter a valid 6-digit PIN code';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextStep3 = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setSubmitError(null);

    if (hasUnavailableItems) {
      setSubmitError('One or more items in your cart are currently unavailable. Please modify your bag before placing your order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullDeliveryAddress = addressLine2.trim()
        ? `${addressLine1.trim()}, ${addressLine2.trim()}`
        : addressLine1.trim();

      const itemsPayload = isBuyNow && buyNowItem
        ? [
            {
              productId: buyNowItem.productId,
              variantId: buyNowItem.variantId,
              quantity: buyNowItem.quantity,
              customizationData: buyNowItem.customizationData,
            },
          ]
        : cart.map((it) => ({
            productId: it.productId,
            variantId: it.variantId,
            quantity: it.quantity,
            customizationData: it.customizationData,
          }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim() || (customer ? customer.email : undefined),
          deliveryAddress: fullDeliveryAddress,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          landmark: specialInstructions.trim() || undefined,
          deliveryOption,
          siteVisitTime: deliveryOption === 'service_visit' ? timeSlot : undefined,
          notes: specialInstructions.trim() || undefined,
          paymentMethod: 'COD',
          idempotencyKey,
          order_source: 'WHATSAPP',
          isBuyNow,
          items: itemsPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error || 'Failed to place order. Please review your details and try again.');
        setIsSubmitting(false);
        return;
      }

      const realOrder = data.order;
      const orderRef = realOrder.orderNumber || realOrder.id;

      // ─── Generate Standardized WhatsApp Confirmation URL from actual DB Order ───
      const generatedWaUrl = buildOrderWhatsAppUrl(realOrder);
      setWhatsappUrl(generatedWaUrl);

      // Attempt to open WhatsApp automatically in a new tab
      let opened = false;
      try {
        const newWin = window.open(generatedWaUrl, '_blank');
        if (newWin && !newWin.closed && typeof newWin.closed !== 'undefined') {
          opened = true;
        }
      } catch (openErr) {
        console.warn('Automatic WhatsApp popup blocked or prevented:', openErr);
        opened = false;
      }
      setWhatsappOpened(opened);

      const orderForDisplay: Order = {
        id: orderRef,
        createdAt: realOrder.createdAt || new Date().toISOString(),
        items: [...activeItems],
        subtotal: realOrder.subtotal,
        shippingCost: realOrder.deliveryCharge || 0,
        total: realOrder.totalAmount,
        customer: {
          fullName: realOrder.customerName,
          phone: realOrder.customerPhone,
          email: realOrder.customerEmail,
        },
        deliveryAddress: {
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: 'India',
        },
        deliveryOption,
        timeSlot: deliveryOption === 'service_visit' ? timeSlot : undefined,
        paymentMethod: 'cod',
        paymentStatus: 'PENDING',
        status: 'order_received',
        rawStatus: (realOrder.status || 'CONFIRMED').toUpperCase(),
        orderSource: realOrder.orderSource || 'WHATSAPP',
        landmark: specialInstructions.trim() || undefined,
        hasCustomProducts,
      };

      saveOrder(orderForDisplay);
      setPlacedOrder(orderForDisplay);
      setOrderId(orderRef);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (isBuyNow) {
        try {
          sessionStorage.removeItem('zaira_buy_now_item');
        } catch {
          // ignore
        }
      }

      // Refresh remote cart and orders from D1
      await Promise.all([refreshSession(), refreshOrders()]);
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitError('A network error occurred while placing your order. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderReference = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(`#${orderId}`);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

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

  // ─── STEP 5: SUCCESS CONFIRMATION ───
  if (currentStep === 5) {
    const displayOrder = placedOrder;
    const formattedDateTime = displayOrder?.createdAt
      ? new Date(displayOrder.createdAt).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-8 sm:pt-12 pb-16 sm:pb-24 text-[#1C1917]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-[#EDE8DE] p-6 sm:p-10 shadow-[0_4px_24px_rgba(28,25,23,0.04)] space-y-8">
            
            {/* 1. TOP SECTION: Status, Order Reference & WhatsApp Confirmation CTA */}
            <div className="text-center pb-6 border-b border-[#F2ECE1]">
              <div className="w-16 h-16 rounded-full bg-[#25D366]/10 text-[#128C7E] flex items-center justify-center mx-auto mb-4 border border-[#25D366]/30 shadow-2xs">
                <MessageCircle className="w-8 h-8 text-[#25D366]" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11.5px] uppercase tracking-wider font-semibold bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/25 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                Order Placed Successfully
              </span>

              <h1 className="font-serif text-[26px] sm:text-[34px] text-[#1C1917] font-semibold mb-2 leading-tight">
                Your Order Has Been Recorded
              </h1>

              <p className="text-[13.5px] sm:text-[14px] text-[#78716C] max-w-lg mx-auto leading-relaxed mb-6 font-light">
                Please confirm your order with Zaira on WhatsApp to verify measurements, fabric specifications, and schedule tailoring.
              </p>

              {/* Prominent Order Reference Card */}
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-[#FAF7F2] border border-[#E8DCCB] px-5 py-3.5 rounded-xl shadow-xs mb-6">
                <div className="text-left sm:border-r sm:border-[#EDE8DE] sm:pr-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#866945] block">
                    Order ID Reference
                  </span>
                  <span className="font-mono text-[18px] sm:text-[20px] font-bold text-[#1C1917] tracking-wide">
                    #{orderId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyOrderReference}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#2C221E] bg-white border border-[#D8CFBF] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    title="Copy Order Reference"
                  >
                    {copiedRef ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#9A7B56]" />
                        <span className="text-[#9A7B56]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Ref</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Primary WhatsApp Action Box */}
              <div className="bg-[#25D366]/5 border border-[#25D366]/30 rounded-2xl p-5 sm:p-6 max-w-lg mx-auto text-center space-y-3">
                <div className="text-[13px] text-[#1C1917] font-medium leading-relaxed">
                  {whatsappOpened ? (
                    <span>
                      WhatsApp opened in a new tab. If you closed it or need to resend, click below to confirm:
                    </span>
                  ) : (
                    <span>
                      Your order has been recorded. Please click the button below to confirm your order with our atelier on WhatsApp:
                    </span>
                  )}
                </div>

                <div>
                  <a
                    href={
                      whatsappUrl ||
                      `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hello Zaira Furnishing, I just placed order #${orderId}. Please confirm my order.`
                      )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[13px] uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Continue on WhatsApp</span>
                  </a>
                </div>

                <p className="text-[11.5px] text-[#78716C] pt-1">
                  Connects directly to our official atelier line: <strong>{ZAIRA_WHATSAPP_DISPLAY}</strong>
                </p>
              </div>
            </div>

            {/* 2. CONFIRMATION INFORMATION */}
            <div className="bg-[#FAF7F2] rounded-xl p-5 sm:p-6 border border-[#EDE8DE] space-y-3.5 text-[12.5px] sm:text-[13px]">
              <h2 className="font-serif text-[16px] sm:text-[17px] font-semibold text-[#1C1917] pb-2 border-b border-[#EDE8DE]">
                Confirmation Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <span className="text-[#8C827A] block text-[11px] uppercase tracking-wider font-medium">Customer Name</span>
                  <span className="font-medium text-[#1C1917]">{fullName}</span>
                </div>

                <div>
                  <span className="text-[#8C827A] block text-[11px] uppercase tracking-wider font-medium">Phone Number</span>
                  <span className="font-medium text-[#1C1917]">{phone}</span>
                </div>

                <div>
                  <span className="text-[#8C827A] block text-[11px] uppercase tracking-wider font-medium">Order Date & Time</span>
                  <span className="font-medium text-[#1C1917]">{formattedDateTime}</span>
                </div>

                <div>
                  <span className="text-[#8C827A] block text-[11px] uppercase tracking-wider font-medium">Payment Selection</span>
                  <span className="font-medium text-[#1C1917]">
                    {paymentMethod === 'cod'
                      ? 'Cash on Delivery (COD) / On-Site Inspection'
                      : 'Online Payment (Frontend Demo)'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[#8C827A] block text-[11px] uppercase tracking-wider font-medium">Delivery & Service Selection</span>
                  <span className="font-medium text-[#2C221E]">
                    {deliveryOption === 'service_visit'
                      ? `In-Home Sizing & Installation (${getSlotLabel(timeSlot)})`
                      : 'Standard White-Glove Doorstep Delivery'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[#8C827A] block text-[11px] uppercase tracking-wider font-medium">Delivery Address</span>
                  <span className="text-[#1C1917]">
                    {addressLine1}, {addressLine2}, {city}, {state} – {pincode}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[#EDE8DE] pt-3 font-serif text-[15px] sm:text-[16px]">
                <span className="font-semibold text-[#1C1917]">Order Total:</span>
                <span className="font-bold text-[#1C1917] text-[18px]">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* 3. ORDER ITEMS */}
            {displayOrder && displayOrder.items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE1]">
                  <h2 className="font-serif text-[16px] sm:text-[17px] font-semibold text-[#1C1917]">
                    Order Items ({displayOrder.items.length})
                  </h2>
                </div>

                <div className="divide-y divide-[#F2ECE1] border border-[#EDE8DE] rounded-xl overflow-hidden bg-white">
                  {displayOrder.items.map((item) => (
                    <div key={item.id} className="p-3.5 sm:p-4 flex gap-3.5 sm:gap-4 items-center">
                      <div className="relative w-14 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden bg-[#F7F4EE] border border-[#EDE8DE] shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover object-center" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-[14px] sm:text-[15px] font-semibold text-[#1C1917] truncate">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] sm:text-[11.5px] text-[#78716C] mt-1">
                          {item.variantName && <span>Color: <strong className="text-[#1C1917]">{item.variantName}</strong></span>}
                          {item.headingStyle && <span>Style: <strong className="text-[#1C1917]">{item.headingStyle}</strong></span>}
                          {item.sizeLabel && !item.customDimensions && <span>Size: <strong className="text-[#1C1917]">{item.sizeLabel}</strong></span>}
                          <span>Qty: <strong className="text-[#1C1917]">{item.quantity}</strong></span>
                        </div>
                        {item.customDimensions && (
                          <div className="mt-1.5">
                            <span className="inline-block text-[10.5px] font-medium bg-[#2C221E]/5 text-[#2C221E] border border-[#2C221E]/15 px-2 py-0.5 rounded">
                              Bespoke Specification: {item.customDimensions}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-serif text-[14px] sm:text-[15px] font-bold text-[#1C1917]">
                          ₹{item.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. BESPOKE ORDER NOTICE (If custom items present) */}
            {hasCustomProducts && (
              <div className="p-5 rounded-xl bg-[#FAF0E6] border border-[#E8DCCB] text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#9A7B56]" />
                  <span className="font-serif text-[13.5px] uppercase font-bold tracking-wider text-[#866945]">
                    BESPOKE ORDER
                  </span>
                </div>
                <p className="text-[12.5px] text-[#866945] font-medium leading-relaxed mb-1">
                  Your customization details have been recorded.
                </p>
                <p className="text-[12px] text-[#78716C] leading-relaxed">
                  Final measurements and customization will be confirmed before production.
                </p>
              </div>
            )}

            {/* 5. NEXT STEPS (WHAT HAPPENS NEXT) */}
            <div className="bg-white rounded-xl border border-[#EDE8DE] p-5 sm:p-6 text-left space-y-4">
              <h2 className="font-serif text-[16px] sm:text-[17px] font-semibold text-[#1C1917] pb-2 border-b border-[#F2ECE1]">
                What Happens Next
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12.5px]">
                <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#EDE8DE]">
                  <span className="font-serif text-[13px] font-semibold text-[#2C221E] block mb-1">
                    1. Order / Enquiry Received
                  </span>
                  <p className="text-[#78716C] leading-relaxed text-[11.5px]">
                    Your request is logged into our store system with reference #{orderId}.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#EDE8DE]">
                  <span className="font-serif text-[13px] font-semibold text-[#2C221E] block mb-1">
                    2. Measurement & Customization Confirmation
                  </span>
                  <p className="text-[#78716C] leading-relaxed text-[11.5px]">
                    {hasCustomProducts
                      ? 'Fabric dimensions, pleats, and window drops are verified prior to cutting.'
                      : 'Delivery details and availability are reviewed prior to dispatch.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#EDE8DE]">
                  <span className="font-serif text-[13px] font-semibold text-[#2C221E] block mb-1">
                    3. Tailoring / Preparation
                  </span>
                  <p className="text-[#78716C] leading-relaxed text-[11.5px]">
                    {hasCustomProducts
                      ? 'Furnishings move to tailoring only after customization confirmation.'
                      : 'Standard catalog pieces are carefully inspected, steamed, and packed.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#EDE8DE]">
                  <span className="font-serif text-[13px] font-semibold text-[#2C221E] block mb-1">
                    4. Delivery & Installation
                  </span>
                  <p className="text-[#78716C] leading-relaxed text-[11.5px]">
                    {deliveryOption === 'service_visit'
                      ? 'White-glove arrival with complimentary steam drape fitting and hardware alignment.'
                      : 'Direct doorstep delivery with full package inspection upon arrival.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 6. CUSTOMER ACTIONS */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <Link
                href={`/account/orders/${orderId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11.5px] uppercase tracking-wider font-semibold transition-all shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>View Order Details</span>
              </Link>

              <Link
                href={`/account/orders/${orderId}/track`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#9A7B56] hover:bg-[#866945] text-white text-[11.5px] uppercase tracking-wider font-semibold transition-all shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>Track Order Progress</span>
              </Link>

              <a
                href={
                  whatsappUrl ||
                  `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `Hello Zaira Furnishing, I just placed order #${orderId} (${fullName}). Please provide status on my order.`
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11.5px] uppercase tracking-wider font-semibold transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Continue on WhatsApp</span>
              </a>

              <Link
                href="/categories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#EDE8DE] text-[#78716C] hover:text-[#1C1917] text-[11.5px] uppercase tracking-wider font-semibold transition-all"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ─── EMPTY STATE FALLBACK ───
  if (!isBuyNow && cart.length === 0) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-12 pb-24 text-[#1C1917]">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white border border-[#EDE8DE] flex items-center justify-center mx-auto mb-4 text-[#9A7B56]">
            <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h1 className="font-serif text-[24px] text-[#1C1917] font-medium mb-2">
            No Items in Checkout
          </h1>
          <p className="text-[13.5px] text-[#78716C] leading-relaxed mb-6 font-light">
            Your shopping bag is currently empty. Please add your desired bespoke drapes, shades, or furnishings to continue.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11.5px] uppercase tracking-wider font-semibold transition-all shadow-sm"
          >
            <span>Explore Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (isBuyNow && !buyNowItem) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-12 pb-24 text-[#1C1917]">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white border border-[#EDE8DE] flex items-center justify-center mx-auto mb-4 text-[#9A7B56]">
            <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h1 className="font-serif text-[24px] text-[#1C1917] font-medium mb-2">
            No Item Selected for Buy Now
          </h1>
          <p className="text-[13.5px] text-[#78716C] leading-relaxed mb-6 font-light">
            Please select a product from our catalog to proceed with Buy Now checkout.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11.5px] uppercase tracking-wider font-semibold transition-all shadow-sm"
          >
            <span>Explore Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-6 sm:pt-8 lg:pt-10 pb-16 sm:pb-24 text-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── BREADCRUMB NAVIGATION ─── */}
        <nav className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] text-[#78716C] mb-5 sm:mb-6 font-normal">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          {isBuyNow && buyNowItem ? (
            <>
              <Link href={`/products/${buyNowItem.slug}`} className="hover:text-[#1C1917] transition-colors truncate max-w-[200px]">
                {buyNowItem.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
              <span className="text-[#1C1917] font-semibold">Buy Now</span>
            </>
          ) : (
            <>
              <Link href="/cart" className="hover:text-[#1C1917] transition-colors">
                Shopping Bag
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
              <span className="text-[#1C1917] font-semibold">Checkout</span>
            </>
          )}
        </nav>

        {/* ─── PAGE TITLE & STEP INDICATOR ─── */}
        <div className="mb-6 sm:mb-8 pb-4 sm:pb-5 border-b border-[#EAE4D8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9A7B56]" />
                <span className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold">
                  {isBuyNow ? 'Instant Showroom Checkout' : 'Secure Showroom Checkout'}
                </span>
              </div>
              <h1 className="font-serif text-[26px] sm:text-[34px] text-[#1C1917] font-medium tracking-tight">
                {isBuyNow ? 'Buy Now — Order & Delivery Details' : 'Order & Delivery Details'}
              </h1>
            </div>

            <Link
              href={isBuyNow && buyNowItem ? `/products/${buyNowItem.slug}` : '/cart'}
              className="inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12px] uppercase tracking-wider font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBuyNow ? 'Back to Product' : 'Back to Bag'}</span>
            </Link>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 scrollbar-none">
            {[
              { num: 1, label: 'Details' },
              { num: 2, label: 'Delivery' },
              { num: 3, label: 'Payment' },
              { num: 4, label: 'Review' },
            ].map((step, idx) => {
              const isCompleted = currentStep > step.num;
              const isActive = currentStep === step.num;
              return (
                <div key={step.num} className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (step.num < currentStep) setCurrentStep(step.num as 1 | 2 | 3 | 4);
                    }}
                    disabled={step.num > currentStep}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : isCompleted
                        ? 'bg-[#2C221E]/10 text-[#2C221E] hover:bg-[#1C1714]/20 cursor-pointer'
                        : 'bg-[#EDE8DE] text-[#A8A29E] cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isActive
                          ? 'bg-[#9A7B56] text-white'
                          : isCompleted
                          ? 'bg-[#2C221E] text-white'
                          : 'bg-[#D6CFC3] text-[#78716C]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : step.num}
                    </span>
                    <span>{step.label}</span>
                  </button>
                  {idx < 3 && <ChevronRight className="w-3.5 h-3.5 text-[#C4B9A1] hidden sm:inline" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── MAIN 2-COLUMN CHECKOUT COMPOSITION ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          
          {/* ─── LEFT COLUMN: FORM SECTIONS ─── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* ═══ STEP 1: CUSTOMER DETAILS ═══ */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F2ECE1]">
                  <User className="w-4 h-4 text-[#9A7B56]" />
                  <h2 className="font-serif text-[18px] sm:text-[20px] text-[#1C1917] font-semibold">
                    1. Contact Information
                  </h2>
                </div>

                <form onSubmit={handleNextStep1} className="space-y-4">
                  <div>
                    <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      placeholder="e.g. Radhika Sharma"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] sm:text-[13.5px] text-[#1C1917] transition-all outline-none ${
                        errors.fullName
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                          : 'border-[#D8CFBF] bg-[#FAF7F2] focus:bg-white focus:border-[#9A7B56] focus:ring-2 focus:ring-[#2C221E]/15'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                        }}
                        placeholder="e.g. 98765 43210"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] sm:text-[13.5px] text-[#1C1917] transition-all outline-none ${
                          errors.phone
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                            : 'border-[#D8CFBF] bg-[#FAF7F2] focus:bg-white focus:border-[#9A7B56] focus:ring-2 focus:ring-[#2C221E]/15'
                        }`}
                      />
                      {errors.phone ? (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.phone}</p>
                      ) : (
                        <p className="text-[10.5px] text-[#8C827A] mt-1">Used for order tracking & measurement dispatch</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        placeholder="e.g. radhika@example.com"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] sm:text-[13.5px] text-[#1C1917] transition-all outline-none ${
                          errors.email
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                            : 'border-[#D8CFBF] bg-[#FAF7F2] focus:bg-white focus:border-[#9A7B56] focus:ring-2 focus:ring-[#2C221E]/15'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3.5 rounded-xl font-semibold text-[12px] uppercase tracking-widest bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Continue to Delivery & Service</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* ═══ STEP 2: DELIVERY ADDRESS & SERVICE SELECTION ═══ */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F2ECE1]">
                  <MapPin className="w-4 h-4 text-[#9A7B56]" />
                  <h2 className="font-serif text-[18px] sm:text-[20px] text-[#1C1917] font-semibold">
                    2. Delivery & Fitting Address
                  </h2>
                </div>

                <form onSubmit={handleNextStep2} className="space-y-4">
                  <div>
                    <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                      House / Flat / Villa / Floor *
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => {
                        setAddressLine1(e.target.value);
                        if (errors.addressLine1) setErrors((prev) => ({ ...prev, addressLine1: '' }));
                      }}
                      placeholder="e.g. Villa 14, Rainbow Meadows"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] sm:text-[13.5px] text-[#1C1917] transition-all outline-none ${
                        errors.addressLine1
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                          : 'border-[#D8CFBF] bg-[#FAF7F2] focus:bg-white focus:border-[#9A7B56] focus:ring-2 focus:ring-[#2C221E]/15'
                      }`}
                    />
                    {errors.addressLine1 && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.addressLine1}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                      Street / Locality / Landmark *
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => {
                        setAddressLine2(e.target.value);
                        if (errors.addressLine2) setErrors((prev) => ({ ...prev, addressLine2: '' }));
                      }}
                      placeholder="e.g. Near Narsingi Junction, Puppalguda"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] sm:text-[13.5px] text-[#1C1917] transition-all outline-none ${
                        errors.addressLine2
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                          : 'border-[#D8CFBF] bg-[#FAF7F2] focus:bg-white focus:border-[#9A7B56] focus:ring-2 focus:ring-[#2C221E]/15'
                      }`}
                    />
                    {errors.addressLine2 && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.addressLine2}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CFBF] bg-[#FAF7F2] text-[13px] text-[#1C1917] focus:bg-white focus:border-[#9A7B56] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CFBF] bg-[#FAF7F2] text-[13px] text-[#1C1917] focus:bg-white focus:border-[#9A7B56] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => {
                          setPincode(e.target.value);
                          if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: '' }));
                        }}
                        placeholder="500089"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-[#1C1917] transition-all outline-none ${
                          errors.pincode
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                            : 'border-[#D8CFBF] bg-[#FAF7F2] focus:bg-white focus:border-[#9A7B56]'
                        }`}
                      />
                      {errors.pincode && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.pincode}</p>
                      )}
                    </div>
                  </div>

                  {/* ─── Delivery vs Service Visit Options ─── */}
                  <div className="pt-4 border-t border-[#F2ECE1]">
                    <span className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-2.5">
                      Service & Delivery Preference
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div
                        onClick={() => setDeliveryOption('standard')}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          deliveryOption === 'standard'
                            ? 'border-[#2C221E] bg-[#FAF7F2] ring-1 ring-[#2C221E]'
                            : 'border-[#EDE8DE] hover:border-[#D5CBB9]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-semibold text-[#1C1917]">Standard Delivery</span>
                          <span className="text-[11px] font-bold text-[#2C221E] uppercase">Complimentary</span>
                        </div>
                        <p className="text-[11.5px] text-[#78716C] leading-snug">
                          White-glove doorstep delivery dispatched in 2–4 business days with nationwide tracking.
                        </p>
                      </div>

                      <div
                        onClick={() => setDeliveryOption('service_visit')}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          deliveryOption === 'service_visit'
                            ? 'border-[#2C221E] bg-[#FAF7F2] ring-1 ring-[#2C221E]'
                            : 'border-[#EDE8DE] hover:border-[#D5CBB9]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-semibold text-[#1C1917]">Laser Measurement & Fitting</span>
                          <span className="text-[11px] font-bold text-[#9A7B56] uppercase">Showroom Service</span>
                        </div>
                        <p className="text-[11.5px] text-[#78716C] leading-snug">
                          In-home visit across Hyderabad: our master tailor verifies window drop and brings swatch books.
                        </p>
                      </div>
                    </div>

                    {/* Time slot picker if service visit chosen */}
                    {deliveryOption === 'service_visit' && (
                      <div className="p-3.5 rounded-xl bg-[#FAF0E6]/50 border border-[#E8DCCB] space-y-2 mb-3">
                        <span className="text-[11px] font-semibold text-[#866945] uppercase tracking-wider block">
                          Preferred Site Visit Time Slot
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {(['morning', 'afternoon', 'evening'] as const).map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setTimeSlot(slot)}
                              className={`py-2 px-2.5 rounded-lg text-[11.5px] font-medium border text-center transition-all cursor-pointer ${
                                timeSlot === slot
                                  ? 'border-[#2C221E] bg-white text-[#2C221E] font-semibold shadow-xs'
                                  : 'border-[#EDE8DE] bg-white/70 text-[#57534E] hover:border-[#9A7B56]'
                              }`}
                            >
                              {slot === 'morning' ? 'Morning 10am–1pm' : slot === 'afternoon' ? 'Afternoon 2pm–5pm' : 'Evening 5pm–8pm'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-3 rounded-xl border border-[#D8CFBF] text-[#78716C] hover:text-[#1C1917] text-[11.5px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 rounded-xl font-semibold text-[12px] uppercase tracking-widest bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ═══ STEP 3: PAYMENT METHOD (FRONTEND ONLY) ═══ */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F2ECE1]">
                  <CreditCard className="w-4 h-4 text-[#9A7B56]" />
                  <h2 className="font-serif text-[18px] sm:text-[20px] text-[#1C1917] font-semibold">
                    3. Payment Selection
                  </h2>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Option 1: Cash on Delivery / On-Site Inspection */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#2C221E] bg-[#FAF7F2] ring-1 ring-[#2C221E]'
                        : 'border-[#EDE8DE] hover:border-[#D5CBB9]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <Banknote className="w-4 h-4 text-[#2C221E]" />
                        <span className="text-[13.5px] font-semibold text-[#1C1917]">
                          Cash on Delivery (COD) / On-Site Inspection
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-wider bg-[#2C221E] text-white">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[12px] text-[#78716C] leading-relaxed">
                      Inspect fabric texture, drapery pleating, and stitching in person upon arrival or post-installation before completing payment.
                    </p>
                  </div>

                  {/* Option 2: Online Payment (Stage 5 Gateway) */}
                  <div
                    className="p-4 rounded-xl border border-[#EDE8DE] bg-[#FAF9F5] opacity-80 cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-[#9A7B56]" />
                        <span className="text-[13.5px] font-semibold text-[#78716C]">
                          Online Payment (UPI / Credit & Debit Cards / NetBanking)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9.5px] uppercase font-semibold tracking-wider bg-[#EDE8DE] text-[#78716C]">
                        Coming in Stage 5
                      </span>
                    </div>
                    <p className="text-[12px] text-[#8C827A] leading-relaxed">
                      Online payment gateway integration will be activated in Stage 5. Please choose Cash on Delivery (COD) for your order.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-3 rounded-xl border border-[#D8CFBF] text-[#78716C] hover:text-[#1C1917] text-[11.5px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep3}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-[12px] uppercase tracking-widest bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Proceed to Order Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ═══ STEP 4: ORDER REVIEW & PLACE ORDER ═══ */}
            {currentStep === 4 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F2ECE1]">
                  <CheckCircle2 className="w-4 h-4 text-[#9A7B56]" />
                  <h2 className="font-serif text-[18px] sm:text-[20px] text-[#1C1917] font-semibold">
                    4. Final Order Review
                  </h2>
                </div>

                {/* Review Card 1: Client & Delivery Address */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EDE8DE] space-y-2 text-[12.5px]">
                  <div className="flex justify-between items-center pb-2 border-b border-[#EDE8DE]">
                    <span className="font-semibold text-[#1C1917]">Recipient & Contact</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] font-semibold uppercase text-[#9A7B56] hover:text-[#866945] cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-[#1C1917] font-medium">{fullName} · {phone}</p>
                  {email && <p className="text-[#78716C]">{email}</p>}
                </div>

                {/* Review Card 2: Address & Service */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EDE8DE] space-y-2 text-[12.5px]">
                  <div className="flex justify-between items-center pb-2 border-b border-[#EDE8DE]">
                    <span className="font-semibold text-[#1C1917]">Delivery Address & Service</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-[11px] font-semibold uppercase text-[#9A7B56] hover:text-[#866945] cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-[#1C1917]">
                    {addressLine1}, {addressLine2}
                  </p>
                  <p className="text-[#78716C]">{city}, {state} – {pincode}</p>
                  <div className="pt-1 text-[#2C221E] font-semibold">
                    Service: {deliveryOption === 'service_visit' ? `In-Home Sizing & Installation (${getSlotLabel(timeSlot)})` : 'Standard White-Glove Delivery'}
                  </div>
                </div>

                {/* Review Card 3: Payment Method */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EDE8DE] space-y-2 text-[12.5px]">
                  <div className="flex justify-between items-center pb-2 border-b border-[#EDE8DE]">
                    <span className="font-semibold text-[#1C1917]">Payment Method</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-[11px] font-semibold uppercase text-[#9A7B56] hover:text-[#866945] cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-[#1C1917] font-medium">
                    Cash on Delivery (COD) / On-Site Inspection
                  </p>
                </div>

                {/* Custom Bespoke Advisory Banner */}
                {hasCustomProducts && (
                  <div className="p-4 rounded-xl bg-[#FAF0E6] border border-[#E8DCCB] text-[12px] text-[#866945] flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#9A7B56] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-0.5 text-[#1C1917]">Bespoke Craftsmanship Assurance:</strong>
                      This order includes made-to-measure pieces. Your preliminary width and drop specifications are recorded. Our Hyderabad showroom master tailor will verify all measurements before tailoring starts.
                    </div>
                  </div>
                )}

                {/* Customer Account Notice */}
                {!customer && (
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DCCB] text-[#78716C] text-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <strong className="block text-[#1C1917] font-semibold">Guest Ordering Enabled</strong>
                      <span>You can place your order directly. An account will automatically be created to track your order.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="px-4 py-2 bg-white border border-[#D8CFBF] hover:bg-[#FAF7F2] text-[#2C221E] text-[11px] uppercase tracking-wider font-semibold rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      Sign In If Existing
                    </button>
                  </div>
                )}

                {/* Unavailable Items Banner */}
                {hasUnavailableItems && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[12px]">
                    <span className="font-semibold block mb-0.5">Item Availability Notice:</span>
                    <span>One or more items in your cart are currently unavailable in our catalog. Please modify your bag before placing your order.</span>
                  </div>
                )}

                {/* Submission Error Banner */}
                {submitError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[12px]">
                    <span className="font-semibold block mb-0.5">Could not complete order:</span>
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-3 rounded-xl border border-[#D8CFBF] text-[#78716C] hover:text-[#1C1917] text-[11.5px] uppercase tracking-wider font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || hasUnavailableItems}
                    onClick={handlePlaceOrder}
                    className="flex-1 py-4 rounded-xl font-semibold text-[12.5px] uppercase tracking-widest bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Placing Order in D1...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          Place Order (COD · ₹{totalPayable.toLocaleString('en-IN')})
                        </span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT COLUMN: STICKY ORDER SUMMARY ─── */}
          <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F2ECE1]">
              <h3 className="font-serif text-[18px] sm:text-[20px] text-[#1C1917] font-semibold">
                {isBuyNow ? 'Selected Product (1)' : `Order Items (${activeCount})`}
              </h3>
              <Link
                href={isBuyNow && buyNowItem ? `/products/${buyNowItem.slug}` : '/cart'}
                className="text-[11px] font-semibold uppercase text-[#9A7B56] hover:text-[#866945]"
              >
                {isBuyNow ? 'Change Options' : 'Modify Bag'}
              </Link>
            </div>

            {/* Items List */}
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {activeItems.map((item) => (
                <div key={item.id} className="flex gap-3 text-[12.5px] pb-3 border-b border-[#F8F5EE] last:border-b-0">
                  <div className="relative w-14 h-16 sm:w-16 sm:h-18 rounded-lg overflow-hidden bg-gradient-to-b from-[#F7F4EE] to-[#EDE7DC] shrink-0 border border-[#EDE8DE]">
                    <Image src={item.image} alt={item.name} fill className="object-cover object-center" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[13.5px] text-[#1C1917] font-semibold truncate">
                      {item.name}
                    </p>
                    {item.variantName && (
                      <p className="text-[11px] text-[#9A7B56] font-medium">Color: {item.variantName}</p>
                    )}
                    {item.headingStyle && (
                      <p className="text-[11px] text-[#78716C]">Pleat: {item.headingStyle}</p>
                    )}
                    {item.customDimensions ? (
                      <p className="text-[10.5px] text-[#2C221E] bg-[#2C221E]/5 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        Bespoke: {item.customDimensions}
                      </p>
                    ) : item.sizeLabel ? (
                      <p className="text-[11px] text-[#8C827A]">{item.sizeLabel}</p>
                    ) : null}
                    <p className="text-[11px] text-[#8C827A] mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-serif text-[14px] font-bold text-[#1C1917]">
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-[#F2ECE1] space-y-2 text-[12.5px] sm:text-[13px]">
              <div className="flex justify-between text-[#78716C]">
                <span>Subtotal ({activeCount} {activeCount === 1 ? 'item' : 'items'})</span>
                <span className="font-medium text-[#1C1917]">₹{activeTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#78716C]">
                <span>Delivery & Sizing Visit</span>
                <span className="font-semibold text-[#2C221E]">Complimentary</span>
              </div>
              <div className="flex justify-between text-[#78716C]">
                <span>GST (Included)</span>
                <span className="font-medium text-[#1C1917]">Included in Price</span>
              </div>
              <div className="pt-3 border-t border-[#F2ECE1] flex justify-between items-baseline">
                <div>
                  <span className="font-serif text-[16px] sm:text-[17px] font-semibold text-[#1C1917] block">
                    Total Amount
                  </span>
                  <span className="text-[10.5px] text-[#8C827A]">Inclusive of all taxes</span>
                </div>
                <span className="font-serif text-[22px] sm:text-[24px] font-bold text-[#1C1917] tracking-tight">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Service & Trust Guarantees */}
            <div className="pt-4 border-t border-[#F2ECE1] space-y-2 text-[11px] sm:text-[11.5px] text-[#78716C]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B56] shrink-0" />
                <span>100% Genuine Fabrics & Custom Tailoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#9A7B56] shrink-0" />
                <span>Free In-Home Laser Measurement in Hyderabad</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#9A7B56] shrink-0" />
                <span>Cash on Delivery & On-Site Inspection Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
