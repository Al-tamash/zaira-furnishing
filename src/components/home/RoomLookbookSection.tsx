'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ShoppingBag, Ruler, ArrowRight, Calendar, Check, Star } from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';

interface LookbookItem {
  id: string;
  name: string;
  category: string;
  price: number;
  priceText: string;
  image: string;
  href: string;
  topPercent: number;
  leftPercent: number;
  specs: string;
}

interface RoomLookbook {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  items: LookbookItem[];
}

const LOOKBOOKS: RoomLookbook[] = [
  {
    id: 'living-room',
    title: 'The Modern Luxury Living Room',
    subtitle: 'Ripple Fold Curtains, Bouclé Sofas & Hand-Tufted Rugs',
    description: 'A harmonious blend of ceiling-recessed ripple fold blackout drapes, high-durability bouclé sectional upholstery, and an artisanal hand-tufted bamboo silk rug.',
    image: '/images/hero/living_room.jpg',
    items: [
      {
        id: 'lb-curt-1',
        name: 'Ripple Fold Linen Drapes',
        category: 'Curtains & Drapes',
        price: 3850,
        priceText: '₹3,850/m',
        image: '/images/products/curtains/blackout-curtains/main.jpg',
        href: '/categories/curtains/linen',
        topPercent: 32,
        leftPercent: 78,
        specs: '100% Belgian Flax Linen with Zinc Weighted Hem',
      },
      {
        id: 'lb-sofa-1',
        name: 'Italian Bouclé Sectional Upholstery',
        category: 'Sofa Fabrics',
        price: 2450,
        priceText: '₹2,450/m',
        image: '/images/sofa-fabrics/boucle.jpg',
        href: '/categories/sofa-fabrics/boucle',
        topPercent: 65,
        leftPercent: 42,
        specs: '50,000+ Martindale Rubs • Stain Repellent',
      },
      {
        id: 'lb-rug-1',
        name: 'Hand-Tufted Bamboo Silk Rug',
        category: 'Carpets & Rugs',
        price: 18500,
        priceText: '₹18,500',
        image: '/images/carpets/hand-tufted.jpg',
        href: '/categories/carpets/hand-tufted',
        topPercent: 82,
        leftPercent: 55,
        specs: 'New Zealand Wool & Botanical Silk Blend',
      },
      {
        id: 'lb-wall-1',
        name: 'Textured Grasscloth Wallcovering',
        category: 'Wallpapers',
        price: 145,
        priceText: '₹145/sq.ft',
        image: '/images/hero/wallpapers.jpg',
        href: '/categories/wallpapers/textured-grasscloth',
        topPercent: 25,
        leftPercent: 22,
        specs: 'Handwoven Natural Sea Grass Fibers',
      },
    ],
  },
  {
    id: 'master-bedroom',
    title: 'The Master Suite Oasis',
    subtitle: 'Quiet Opulence, 100% Blackout Drapes & Spine-Care Rest',
    description: 'Designed for total restorative rest: 100% blackout thermal drapery, 1000TC Egyptian cotton sateen sheets, and zero-motion pocket spring mattress support.',
    image: '/images/hero/bedroom.jpg',
    items: [
      {
        id: 'lb-curt-2',
        name: '100% Thermal Blackout Curtains',
        category: 'Curtains & Drapes',
        price: 3850,
        priceText: '₹3,850/m',
        image: '/images/products/curtains/blackout-curtains/main.jpg',
        href: '/categories/curtains/blackout',
        topPercent: 28,
        leftPercent: 85,
        specs: 'Triple-Weave Total Room Darkening',
      },
      {
        id: 'lb-matt-1',
        name: 'Natural Latex Pocket Spring Mattress',
        category: 'Mattresses',
        price: 28000,
        priceText: '₹28,000',
        image: '/images/categories/mattress.jpg',
        href: '/categories/mattresses-sleep-systems',
        topPercent: 75,
        leftPercent: 72,
        specs: '5-Zone Zero-Motion Coil System + Organic Latex',
      },
      {
        id: 'lb-bed-1',
        name: '1000 TC Egyptian Cotton Bedding',
        category: 'Bed Linen',
        price: 6500,
        priceText: '₹6,500/set',
        image: '/images/categories/bed-linen.jpg',
        href: '/categories/bed-linen-bath',
        topPercent: 68,
        leftPercent: 48,
        specs: 'Long-Staple Sateen Weave • Silky Finish',
      },
      {
        id: 'lb-cush-1',
        name: 'Embroidered Velvet Cushion Accents',
        category: 'Cushions',
        price: 1250,
        priceText: '₹1,250',
        image: '/images/categories/cushions.jpg',
        href: '/categories/cushions-pillows',
        topPercent: 52,
        leftPercent: 35,
        specs: 'Metallic Zari Embroidery on Rich Velvet',
      },
    ],
  },
  {
    id: 'sunlit-dining',
    title: 'Dining & Formal Lounge',
    subtitle: 'Daylight Diffusion, Parquet Oak & Performance Velvet',
    description: 'Airy linen sheers filtering Hyderabad sunshine across authentic European engineered oak flooring and tailored dining chair upholstery.',
    image: '/images/hero/curtains.jpg',
    items: [
      {
        id: 'lb-sheer-1',
        name: 'French Sheer Day Drapes',
        category: 'Curtains',
        price: 1850,
        priceText: '₹1,850/m',
        image: '/images/products/curtains/sheer-day-curtains/main.jpg',
        href: '/categories/curtains/sheer',
        topPercent: 40,
        leftPercent: 62,
        specs: 'Airy Daylight Diffusion with Weighted Hem',
      },
      {
        id: 'lb-floor-1',
        name: 'European Engineered Oak Parquet',
        category: 'Wooden Flooring',
        price: 380,
        priceText: '₹380/sq.ft',
        image: '/images/hero/flooring.jpg',
        href: '/categories/wooden-flooring-sports-floor',
        topPercent: 85,
        leftPercent: 32,
        specs: 'UV Matt Lacquered 14mm Hardwood Plank',
      },
      {
        id: 'lb-sofa-2',
        name: 'Stain-Resistant Performance Velvet',
        category: 'Sofa Fabrics',
        price: 2800,
        priceText: '₹2,800/m',
        image: '/images/sofa-fabrics/performance.jpg',
        href: '/categories/sofa-fabrics/velvet-chenille',
        topPercent: 55,
        leftPercent: 25,
        specs: 'Aqua-Repellent Barrier • 50k Rubs',
      },
    ],
  },
];

export function RoomLookbookSection() {
  const { openBookingModal, addToCart, setIsCartOpen } = useStore();
  const [activeTab, setActiveTab] = useState<string>('living-room');
  const [activeHotspot, setActiveHotspot] = useState<number>(0);

  const currentRoom = LOOKBOOKS.find((r) => r.id === activeTab) || LOOKBOOKS[0];
  const activeItem = currentRoom.items[activeHotspot] || currentRoom.items[0];

  const handleAddToCart = (item: LookbookItem) => {
    addToCart({
      productId: item.id,
      name: item.name,
      slug: item.id,
      image: item.image,
      sku: `${item.id.toUpperCase()}-STD`,
      quantity: 1,
      unitPrice: item.price,
      isAvailable: true,
    });
    setIsCartOpen(true);
  };

  return (
    <section className="py-14 sm:py-20 bg-[#FDFBF7] border-b border-[#EAE4D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-8 border-b border-[#EAE4D9] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E7] border border-[#E8D5A0] text-[#B38E46] text-[11px] uppercase tracking-wider font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>INTERACTIVE ROOM LOOKBOOK</span>
            </div>
            <h2 className="font-serif text-[28px] sm:text-[36px] font-bold text-[#1C1714] tracking-tight">
              Furnish by Room &amp; Click to Shop
            </h2>
            <p className="mt-1 text-[14px] sm:text-[15px] text-[#7C7167] max-w-2xl">
              Tap any pulsing pin on the room to explore the exact curtains, wallpapers, rugs, and upholstery used in these luxury Hyderabad homes.
            </p>
          </div>

          {/* Room Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-[#EAE4D9] shadow-2xs overflow-x-auto shrink-0 self-start md:self-end">
            {LOOKBOOKS.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  setActiveTab(room.id);
                  setActiveHotspot(0);
                }}
                className={`px-4 py-2 rounded-full text-[12px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${activeTab === room.id
                    ? 'bg-[#1C1714] text-[#C5A059] shadow-sm'
                    : 'text-[#7C7167] hover:text-[#1C1714]'
                  }`}
              >
                {room.title.split(' ')[1] || room.title}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Interactive Room Display Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Big Interactive Scene with Pulsing Hotspots (8 cols) */}
          <div className="lg:col-span-8 relative">
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-atelier border border-[#EAE4D9] bg-[#F7F4EE] group">
              <Image
                src={currentRoom.image}
                alt={currentRoom.title}
                fill
                priority
                className="object-cover object-center"
              />

              {/* Pulsing Hotspot Pins */}
              {currentRoom.items.map((item, idx) => {
                const isActive = activeHotspot === idx;
                return (
                  <div
                    key={idx}
                    style={{ top: `${item.topPercent}%`, left: `${item.leftPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveHotspot(idx)}
                      aria-label={`View ${item.name}`}
                      className={`relative flex items-center justify-center cursor-pointer transition-transform ${isActive ? 'scale-125' : 'hover:scale-115'
                        }`}
                    >
                      {/* Animated Ping Radar */}
                      <span className="absolute w-9 h-9 rounded-full bg-[#C5A059]/50 animate-ping" />

                      {/* Core Number Pin */}
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[12px] shadow-lg transition-all ${isActive
                            ? 'bg-[#1C1714] text-[#C5A059] ring-4 ring-[#FAF4E7]'
                            : 'bg-white text-[#1C1714] hover:bg-[#1C1714] hover:text-[#C5A059]'
                          }`}
                      >
                        {idx + 1}
                      </span>
                    </button>

                    {/* Popover Preview Card on Active Pin */}
                    {isActive && (
                      <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 rounded-2xl bg-white shadow-atelier border border-[#EAE4D9] text-left z-30 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#B38E46] block">
                          {item.category}
                        </span>
                        <h4 className="text-[12.5px] font-bold text-[#1C1714] truncate">
                          {item.name}
                        </h4>
                        <span className="text-[13px] font-black text-[#1C1714] block mt-0.5">
                          {item.priceText}
                        </span>
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                            className="flex-1 py-1 px-2 rounded-lg bg-[#1C1714] hover:bg-[#C5A059] text-white text-[10.5px] font-bold uppercase tracking-wider text-center transition-colors"
                          >
                            Add Bag
                          </button>
                          <Link
                            href={item.href}
                            onClick={(e) => e.stopPropagation()}
                            className="py-1 px-2 rounded-lg bg-[#FAF4E7] text-[#1C1714] hover:bg-[#EAE4D9] text-[10.5px] font-bold text-center"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Product Card & Room Actions (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-[#EAE4D9] shadow-atelier">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D9] mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B38E46] block">
                    Active Room
                  </span>
                  <h3 className="font-serif text-[18px] font-bold text-[#1C1714] leading-tight">
                    {currentRoom.title}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FAF4E7] border border-[#E8D5A0] text-[11px] font-bold text-[#B38E46]">
                  {currentRoom.items.length} Products
                </span>
              </div>

              {/* Selected Product Spotlight Card */}
              {activeItem && (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#C5A059] shadow-sm mb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C7167]">
                        Spotlight Product #{activeHotspot + 1}
                      </span>
                      <h4 className="font-serif text-[15px] font-bold text-[#1C1714] leading-snug">
                        {activeItem.name}
                      </h4>
                    </div>
                    <span className="text-[15px] font-black text-[#1C1714] shrink-0">
                      {activeItem.priceText}
                    </span>
                  </div>

                  <p className="text-[12px] text-[#7C7167] mb-3 bg-white p-2 rounded-lg border border-[#EAE4D9]">
                    {activeItem.specs}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(activeItem)}
                      className="py-2.5 px-2 rounded-xl bg-[#1C1714] hover:bg-[#C5A059] text-white font-bold text-[11.5px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Add to Bag</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openBookingModal(`Free Measurement for ${activeItem.name}`)}
                      className="py-2.5 px-2 rounded-xl border border-[#EAE4D9] hover:border-[#C5A059] text-[#1C1714] font-bold text-[11.5px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Free Visit</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Items List in this Room */}
              <div className="space-y-2 mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C7167] block">
                  All Items in this Concept:
                </span>

                {currentRoom.items.map((item, idx) => {
                  const isActive = activeHotspot === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveHotspot(idx)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${isActive
                          ? 'bg-[#FAF4E7] border-[#C5A059] ring-1 ring-[#C5A059]'
                          : 'bg-white border-[#EAE4D9] hover:border-[#C5A059] text-[#382F2A]'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive
                              ? 'bg-[#1C1714] text-[#C5A059]'
                              : 'bg-[#F7F4EE] text-[#7C7167]'
                            }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <span className="block font-bold text-[12.5px] text-[#1C1714]">
                            {item.name}
                          </span>
                          <span className="block text-[11px] text-[#7C7167]">
                            {item.priceText}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A059]' : 'text-[#B8ADA3]'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Recreate Look CTA */}
              <button
                type="button"
                onClick={() => openBookingModal(`Recreate Entire Room: ${currentRoom.title}`)}
                className="w-full py-3.5 rounded-xl bg-[#1C1714] hover:bg-[#C5A059] text-white font-bold text-[12.5px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-[#C5A059]/40"
              >
                <Calendar className="w-4 h-4 text-[#C5A059]" />
                <span>Book In-Home Demo for this Look</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
