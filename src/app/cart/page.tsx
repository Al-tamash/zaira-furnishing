'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle2,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Ruler,
  Building2,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_NUMBER, buildInquiryBagWhatsAppUrl } from '@/lib/whatsapp';

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    openBookingModal,
    openStoreModal,
  } = useStore();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('Hyderabad');
  const [orderId, setOrderId] = useState('');

  const shippingCost = 0; // Complimentary nationwide delivery & site visit
  const totalPayable = cartTotal + shippingCost;

  const handleProceedToCheckout = () => {
    setCheckoutStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `ZF-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setCheckoutStep('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    clearCart();
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-8 sm:pt-10 lg:pt-12 pb-16 sm:pb-20 lg:pb-24 text-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Breadcrumb Navigation with Clear Top Clearance ─── */}
        <nav className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] text-[#78716C] mb-6 sm:mb-8 font-normal">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <Link href="/categories" className="hover:text-[#1C1917] transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span className="text-[#1C1917] font-semibold">Inquiry Bag</span>
        </nav>

        {/* ─── SUCCESS SCREEN ─── */}
        {checkoutStep === 'success' ? (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#EDE8DE] p-6 sm:p-10 text-center shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#2C221E]/10 text-[#2C221E] flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2]" />
            </div>
            <span className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block mb-1.5">
              Order Confirmed
            </span>
            <h1 className="font-serif text-[26px] sm:text-[34px] text-[#1C1917] font-medium mb-2.5">
              Thank You For Your Order!
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#78716C] leading-relaxed mb-6 max-w-md mx-auto">
              Your order <strong className="text-[#1C1917]">#{orderId}</strong> has been received with{' '}
              <strong className="text-[#1C1917]">Cash on Delivery (COD)</strong>. Our showroom concierge will contact you at{' '}
              <strong className="text-[#1C1917]">{customerPhone || 'your contact number'}</strong> to coordinate tailoring dimensions and delivery schedule.
            </p>

            <div className="bg-[#FAF7F2] rounded-xl p-4 sm:p-5 border border-[#EDE8DE] mb-6 sm:mb-8 text-left space-y-2 text-[12.5px] sm:text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#78716C]">Order Reference:</span>
                <span className="font-semibold text-[#1C1917]">#{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716C]">Recipient Name:</span>
                <span className="font-semibold text-[#1C1917]">{customerName || 'Client'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716C]">Payment Method:</span>
                <span className="font-semibold text-[#2C221E]">Cash on Delivery / On-Site Inspection</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716C]">Delivery & Fitting:</span>
                <span className="font-semibold text-[#1C1917]">Complimentary In-Home Service</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hello Zaira Furnishing, I just placed order #${orderId} for Cash on Delivery. Please confirm delivery/tailoring details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11.5px] uppercase tracking-wider font-semibold shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Track on WhatsApp</span>
              </a>
              <Link
                href="/categories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1C1917] hover:bg-[#9A7B56] text-white text-[11.5px] uppercase tracking-wider font-semibold transition-colors"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : checkoutStep === 'checkout' ? (
          /* ─── CHECKOUT FORM SCREEN ─── */
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                className="inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12px] uppercase tracking-wider font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Shopping Bag</span>
              </button>
              <h1 className="font-serif text-[26px] sm:text-[32px] text-[#1C1917] font-medium">
                Checkout & Delivery Details
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-[#78716C] mt-1">
                Confirm your contact details and delivery address. Payment is handled via Cash on Delivery or Showroom Visit.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Checkout Form (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-7 shadow-[0_2px_10px_rgba(28,25,23,0.03)]">
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <h3 className="font-serif text-[17px] sm:text-[18px] text-[#1C1917] font-medium pb-2 border-b border-[#F2ECE1]">
                    1. Client Information
                  </h3>
                  <div>
                    <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CFBF] bg-[#FAF7F2] text-[13px] sm:text-[13.5px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2C221E]/20 focus:border-[#9A7B56] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CFBF] bg-[#FAF7F2] text-[13px] sm:text-[13.5px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2C221E]/20 focus:border-[#9A7B56] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="e.g. radhika@example.com"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CFBF] bg-[#FAF7F2] text-[13px] sm:text-[13.5px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2C221E]/20 focus:border-[#9A7B56] transition-all"
                      />
                    </div>
                  </div>

                  <h3 className="font-serif text-[17px] sm:text-[18px] text-[#1C1917] font-medium pt-3 pb-2 border-b border-[#F2ECE1]">
                    2. Delivery & Fitting Address
                  </h3>
                  <div>
                    <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                      Street Address / Apartment / Villa *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="e.g. Villa 14, Rainbow Meadows, Alkapur Twp"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CFBF] bg-[#FAF7F2] text-[13px] sm:text-[13.5px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2C221E]/20 focus:border-[#9A7B56] transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-[11.5px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                      City / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CFBF] bg-[#FAF7F2] text-[13px] sm:text-[13.5px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2C221E]/20 focus:border-[#9A7B56] transition-all"
                    />
                  </div>

                  <h3 className="font-serif text-[17px] sm:text-[18px] text-[#1C1917] font-medium pt-3 pb-2 border-b border-[#F2ECE1]">
                    3. Payment Method
                  </h3>
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF7F2] border border-[#2C221E]/30 flex items-center justify-between">
                    <div>
                      <span className="text-[13px] sm:text-[13.5px] font-semibold text-[#2C221E] block">
                        Cash on Delivery (COD) / On-Site Inspection
                      </span>
                      <span className="text-[11px] sm:text-[11.5px] text-[#78716C]">
                        Inspect fabrics and stitching in person before final payment.
                      </span>
                    </div>
                    <span className="px-2 py-0.5 text-[9.5px] uppercase font-bold tracking-wider bg-[#2C221E] text-white rounded-md shrink-0 ml-2">
                      Selected
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl text-center text-[11.5px] sm:text-[12px] uppercase tracking-widest font-semibold bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all shadow-xs mt-4 cursor-pointer active:scale-[0.99]"
                  >
                    Confirm & Place Order (₹{totalPayable.toLocaleString('en-IN')})
                  </button>
                </form>
              </div>

              {/* Mini Order Summary (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-[0_2px_10px_rgba(28,25,23,0.03)] space-y-3.5">
                <h3 className="font-serif text-[17px] sm:text-[18px] text-[#1C1917] font-medium pb-2.5 border-b border-[#F2ECE1]">
                  Order Items ({cartCount})
                </h3>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 text-[12.5px]">
                      <div className="relative w-12 h-14 sm:w-14 sm:h-16 rounded-lg overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EDE8DE]">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-[13px] sm:text-[13.5px] text-[#1C1917] font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#78716C]">Qty: {item.quantity}</p>
                        {item.sizeLabel && <p className="text-[10.5px] text-[#9A7B56]">{item.sizeLabel}</p>}
                      </div>
                      <span className="font-semibold text-[#1C1917] shrink-0">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#F2ECE1] space-y-2 text-[12.5px] sm:text-[13px]">
                  <div className="flex justify-between text-[#78716C]">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#78716C]">
                    <span>Delivery & Measurement</span>
                    <span className="text-[#2C221E] font-semibold">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-[15px] sm:text-[16px] font-serif font-semibold text-[#1C1917] pt-2 border-t border-[#F2ECE1]">
                    <span>Total Amount</span>
                    <span>₹{totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── STANDARD CART VIEW ─── */
          <div>
            {/* ─── Header with Proper Spacing Below Sticky Navbar ─── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 sm:pb-6 mb-6 sm:mb-8 border-b border-[#EAE4D8] gap-3">
              <div>
                <div className="inline-flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9A7B56]" />
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold">
                    Review Selections
                  </span>
                </div>
                <h1 className="font-serif text-[28px] sm:text-[36px] lg:text-[40px] text-[#1C1917] font-medium tracking-tight">
                  Your Inquiry Bag
                </h1>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11.5px] sm:text-[12px] text-[#8C827A] hover:text-[#C0392B] transition-colors font-medium self-start sm:self-auto cursor-pointer underline-offset-4 hover:underline"
                >
                  Clear All Items
                </button>
              )}
            </div>

            {cart.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
                {/* ─── Cart Items List (8 cols) ─── */}
                <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] shadow-[0_2px_10px_rgba(28,25,23,0.03)] hover:shadow-[0_8px_24px_rgba(28,25,23,0.06)] hover:border-[#D5CBB9] transition-all flex flex-col sm:flex-row gap-3.5 sm:gap-5"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-b from-[#F7F4EE] to-[#EDE7DC] shrink-0 border border-[#EDE8DE]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 80px, 112px"
                          className="object-cover object-center"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              href={`/products/${item.slug}`}
                              className="font-serif text-[15px] sm:text-[17px] font-semibold text-[#1C1917] hover:text-[#9A7B56] transition-colors leading-snug line-clamp-1 sm:line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-[#A8A29E] hover:text-[#C0392B] hover:bg-rose-50/60 p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                              aria-label="Remove item"
                              title="Remove from bag"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Variant & Specifications */}
                          <div className="mt-1 space-y-0.5">
                            {item.variantName && (
                              <p className="text-[11.5px] sm:text-[12px] text-[#78716C]">
                                <span className="text-[#9A7B56] font-medium">Variant:</span> {item.variantName}
                              </p>
                            )}

                            {item.sizeLabel && (
                              <p className="text-[11px] sm:text-[11.5px] text-[#78716C]">
                                <span className="text-[#8C827A]">Dimension:</span> {item.sizeLabel}
                              </p>
                            )}

                            {item.headingStyle && (
                              <p className="text-[11px] sm:text-[11.5px] text-[#78716C]">
                                <span className="text-[#8C827A]">Heading:</span> {item.headingStyle}
                              </p>
                            )}

                            {item.customDimensions && (
                              <p className="text-[10.5px] sm:text-[11px] text-[#2C221E] bg-[#2C221E]/5 border border-[#2C221E]/10 px-2 py-0.5 rounded-md inline-block mt-1 font-medium">
                                Bespoke Specs: {item.customDimensions}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity and Price Row */}
                        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-[#F2ECE1] gap-2 flex-wrap sm:flex-nowrap">
                          {/* Quantity Control */}
                          <div className="inline-flex items-center border border-[#E2DBD0] rounded-lg bg-[#FAF7F2] p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md text-[#57534E] hover:text-[#1C1917] hover:bg-white transition-all cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 sm:w-9 text-center text-[12.5px] sm:text-[13px] font-semibold text-[#1C1917]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md text-[#57534E] hover:text-[#1C1917] hover:bg-white transition-all cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-[10.5px] sm:text-[11px] text-[#8C827A]">
                              ₹{item.unitPrice.toLocaleString('en-IN')} each
                            </p>
                            <p className="font-serif text-[16px] sm:text-[18px] font-bold text-[#1C1917] tracking-tight">
                              ₹{item.totalPrice.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Refined Continue Shopping Link */}
                  <div className="pt-2">
                    <Link
                      href="/categories"
                      className="inline-flex items-center gap-2 text-[11.5px] sm:text-[12px] uppercase tracking-wider font-semibold text-[#2C221E] hover:text-[#9A7B56] transition-colors group"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                      <span>Continue Shopping</span>
                    </Link>
                  </div>
                </div>

                {/* ─── Order Summary Card (4 cols) ─── */}
                <div className="lg:col-span-4 bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] lg:sticky lg:top-24">
                  <h2 className="font-serif text-[18px] sm:text-[20px] text-[#1C1917] font-semibold pb-3.5 border-b border-[#F2ECE1]">
                    Order Summary
                  </h2>

                  <div className="py-3.5 space-y-2.5 text-[12.5px] sm:text-[13px]">
                    <div className="flex justify-between text-[#78716C]">
                      <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                      <span className="font-medium text-[#1C1917]">
                        ₹{cartTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#78716C]">
                      <span>Delivery & Site Visit</span>
                      <span className="font-semibold text-[#2C221E]">Complimentary</span>
                    </div>

                    <div className="flex justify-between text-[#78716C]">
                      <span>GST (Included)</span>
                      <span className="font-medium text-[#1C1917]">Included in Price</span>
                    </div>

                    <div className="pt-3 border-t border-[#F2ECE1] flex justify-between items-baseline">
                      <div>
                        <span className="font-serif text-[16px] sm:text-[17px] font-semibold text-[#1C1917] block">
                          Estimated Total
                        </span>
                        <span className="text-[10.5px] text-[#8C827A]">Includes all taxes</span>
                      </div>
                      <span className="font-serif text-[22px] sm:text-[24px] font-bold text-[#1C1917] tracking-tight">
                        ₹{totalPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Order Summary Actions: 1 Primary + 1 Secondary + Helper Link */}
                  <div className="space-y-2.5 pt-2">
                    {/* Primary Action: Order / Inquire via WhatsApp */}
                    <a
                      href={buildInquiryBagWhatsAppUrl(cart, cartTotal)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-xl text-center text-[12px] uppercase tracking-wider font-bold bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all shadow-md cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                      <span>Send Bag to WhatsApp</span>
                    </a>

                    {/* Secondary Action: Book In-Home Measurement */}
                    <button
                      type="button"
                      onClick={() => openBookingModal('In-Home Consultation for Shortlisted Bag Items')}
                      className="w-full py-3 rounded-xl text-center text-[11.5px] uppercase tracking-wider font-semibold border border-[#D5CCBA] text-[#1C1714] bg-transparent hover:bg-[#FAF7F2] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Ruler className="w-3.5 h-3.5 text-[#823423]" />
                      <span>Book Free In-Home Measurement</span>
                    </button>

                    {/* Tertiary Showroom Helper Link */}
                    <button
                      type="button"
                      onClick={openStoreModal}
                      className="w-full pt-1 pb-0.5 text-center text-[11.5px] font-medium text-[#78716C] hover:text-[#823423] hover:underline flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#823423]" />
                      <span>Or Visit Hyderabad Showroom in Person</span>
                    </button>
                  </div>

                  {/* Clarification banner */}
                  <div className="mt-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] text-[11px] text-[#78716C] leading-relaxed">
                    💡 <strong className="text-[#1C1917]">Atelier Guarantee:</strong> No online payment needed. Your bespoke sizes, fabrics, and availability are verified directly on WhatsApp or during your free in-home measurement visit.
                  </div>

                  {/* Compact Service Assurances */}
                  <div className="pt-4 border-t border-[#F2ECE1] mt-5 space-y-2 text-[11px] sm:text-[11.5px] text-[#78716C]">
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
            ) : (
              /* Empty Bag State */
              <div className="max-w-md mx-auto py-16 sm:py-20 text-center bg-white rounded-2xl border border-[#EDE8DE] p-6 sm:p-10 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EDE8DE] flex items-center justify-center mx-auto mb-4 text-[#9A7B56]">
                  <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h2 className="font-serif text-[22px] sm:text-[24px] text-[#1C1917] font-medium mb-2">
                  Your Shopping Bag is Empty
                </h2>
                <p className="text-[13px] sm:text-[13.5px] text-[#78716C] leading-relaxed mb-6 font-light">
                  Explore our luxury drapery, blinds, wallpapers, and sofa fabrics to begin creating your dream space.
                </p>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11.5px] uppercase tracking-wider font-semibold transition-all shadow-sm"
                >
                  <span>Explore Categories</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
