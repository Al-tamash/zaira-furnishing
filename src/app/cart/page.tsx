'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Ruler,
  Building2,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { buildInquiryBagWhatsAppUrl } from '@/lib/whatsapp';

export default function CartPage() {
  const {
    cart,
    cartCount,
    removeFromCart,
    updateQuantity,
    clearCart,
    openBookingModal,
    openStoreModal,
  } = useStore();

  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-8 sm:pt-10 lg:pt-12 pb-16 sm:pb-20 lg:pb-24 text-[#1C1917] selection:bg-[#9A7B56] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Breadcrumb Navigation ─── */}
        <nav className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] text-[#78716C] mb-6 sm:mb-8 font-normal">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <Link href="/categories" className="hover:text-[#1C1917] transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span className="text-[#1C1917] font-semibold">Shortlist &amp; Inquiry Bag</span>
        </nav>

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 sm:pb-6 mb-6 sm:mb-8 border-b border-[#EAE4D8] gap-3">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9A7B56]" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold">
                Shortlisted Designs
              </span>
            </div>
            <h1 className="font-serif text-[28px] sm:text-[36px] lg:text-[40px] text-[#1C1917] font-medium tracking-tight">
              Your Shortlist &amp; Inquiry Bag
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#78716C] mt-1 font-normal">
              Review your favorite fabrics and designs. Send them directly to our team on WhatsApp for custom pricing or schedule a free home visit in Hyderabad.
            </p>
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

            {/* ─── Shortlist Items List (8 cols) ─── */}
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
                          className="font-serif text-[15px] sm:text-[17px] font-semibold text-[#1C1714] hover:text-[#9A7B56] transition-colors leading-snug line-clamp-1 sm:line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#A8A29E] hover:text-[#C0392B] hover:bg-rose-50/60 p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                          aria-label="Remove item"
                          title="Remove from shortlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant & Specifications */}
                      <div className="mt-1 space-y-0.5">
                        {item.variantName && (
                          <p className="text-[11.5px] sm:text-[12px] text-[#78716C]">
                            <span className="text-[#9A7B56] font-medium">Color:</span> {item.variantName}
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

                    {/* Quantity Control & Tailoring Badge Row */}
                    <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-[#F2ECE1] gap-2 flex-wrap sm:flex-nowrap">
                      {/* Quantity Control */}
                      <div className="inline-flex items-center border border-[#E2DBD0] rounded-lg bg-[#FAF7F2] p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-[#57534E] hover:text-[#1C1714] hover:bg-white transition-all cursor-pointer"
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

                      {/* Custom Pricing on Request Badge (No Price) */}
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-[#823423] block uppercase tracking-wider">
                          Made-to-Measure
                        </span>
                        <span className="text-[11px] text-[#78716C] font-medium">
                          Price on Request
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 text-[11.5px] sm:text-[12px] uppercase tracking-wider font-semibold text-[#2C221E] hover:text-[#9A7B56] transition-colors group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                  <span>Explore More Categories</span>
                </Link>
              </div>
            </div>

            {/* ─── Inquiry Summary Card (4 cols) ─── */}
            <div className="lg:col-span-4 bg-white rounded-xl sm:rounded-2xl border border-[#EDE8DE] p-5 sm:p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] lg:sticky lg:top-24">
              <h2 className="font-serif text-[18px] sm:text-[20px] text-[#1C1917] font-semibold pb-3.5 border-b border-[#F2ECE1]">
                Inquiry Summary
              </h2>

              <div className="py-3.5 space-y-2.5 text-[12.5px] sm:text-[13px]">
                <div className="flex justify-between text-[#78716C]">
                  <span>Shortlisted Designs</span>
                  <span className="font-medium text-[#1C1917]">
                    {cartCount} {cartCount === 1 ? 'Design' : 'Designs'}
                  </span>
                </div>

                <div className="flex justify-between text-[#78716C]">
                  <span>Fabric Consultation</span>
                  <span className="font-semibold text-[#2C221E]">Complimentary</span>
                </div>

                <div className="flex justify-between text-[#78716C]">
                  <span>In-Home Laser Measurement</span>
                  <span className="text-[#2C221E] font-semibold">Free in Hyderabad</span>
                </div>

                <div className="pt-3 border-t border-[#F2ECE1] flex justify-between items-baseline">
                  <div>
                    <span className="font-serif text-[16px] sm:text-[17px] font-semibold text-[#1C1917] block">
                      Custom Pricing
                    </span>
                    <span className="text-[10.5px] text-[#8C827A]">Based on exact room drop &amp; width</span>
                  </div>
                  <span className="font-serif text-[15px] sm:text-[16px] font-semibold text-[#823423] tracking-tight">
                    On Request
                  </span>
                </div>
              </div>

              {/* Summary Actions: Send to WhatsApp + Book Measurement */}
              <div className="space-y-2.5 pt-2">
                {/* Primary Action: Send to WhatsApp */}
                <a
                  href={buildInquiryBagWhatsAppUrl(cart)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl text-center text-[12px] uppercase tracking-wider font-bold bg-[#25D366] hover:bg-[#20BA5C] text-white transition-all shadow-md cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-white" />
                  <span>Send Shortlist to WhatsApp</span>
                </a>

                {/* Secondary Action: Book In-Home Measurement */}
                <button
                  type="button"
                  onClick={() => openBookingModal(`Free Measurement for Shortlisted Designs (${cartCount} items)`)}
                  className="w-full py-3 rounded-xl text-center text-[11.5px] uppercase tracking-wider font-semibold bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Book Free In-Home Measurement</span>
                </button>

                {/* Showroom Helper Link */}
                <button
                  type="button"
                  onClick={openStoreModal}
                  className="w-full pt-1 pb-0.5 text-center text-[11.5px] font-medium text-[#78716C] hover:text-[#823423] hover:underline flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#823423]" />
                  <span>Visit Puppalguda Showroom in Person</span>
                </button>
              </div>

              {/* Reassurance banner */}
              <div className="mt-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] text-[11px] text-[#78716C] leading-relaxed">
                💡 <strong className="text-[#1C1917]">Zaira Service:</strong> No online payment required. We verify fabric stock, exact window drops, and share honest transparent pricing directly on WhatsApp or during your in-home measurement visit.
              </div>

              {/* Service Assurances */}
              <div className="pt-4 border-t border-[#F2ECE1] mt-5 space-y-2 text-[11px] sm:text-[11.5px] text-[#78716C]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B56] shrink-0" />
                  <span>100% Genuine Fabrics &amp; Custom Tailoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#9A7B56] shrink-0" />
                  <span>Free In-Home Laser Measurement in Hyderabad</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#9A7B56] shrink-0" />
                  <span>Somfy Motorization &amp; Professional Installation</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Bag State */
          <div className="max-w-md mx-auto py-16 sm:py-20 text-center bg-white rounded-2xl border border-[#EDE8DE] p-6 sm:p-10 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EDE8DE] flex items-center justify-center mx-auto mb-4 text-[#9A7B56]">
              <Heart className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-[22px] sm:text-[24px] text-[#1C1917] font-medium mb-2">
              Your Shortlist is Empty
            </h2>
            <p className="text-[13px] sm:text-[13.5px] text-[#78716C] leading-relaxed mb-6 font-normal">
              Explore our curtains, blinds, wallpapers, and sofa fabrics to save designs for your consultation.
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
    </div>
  );
}
