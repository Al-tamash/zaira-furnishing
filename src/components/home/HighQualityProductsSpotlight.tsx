'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';

interface PopularProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  link: string;
}

const POPULAR_PRODUCTS: PopularProductItem[] = [
  {
    id: 'pop-velvet-curtains',
    name: 'Royal Velvet Curtains',
    price: 4950,
    image: '/images/products/curtains/velvet-curtains/main.jpg',
    link: '/categories/curtains/velvet',
  },
  {
    id: 'pop-boucle-sofa',
    name: 'Italian Bouclé Sofa Fabric',
    price: 2450,
    image: '/images/sofa-fabrics/velvet-chenille.jpg',
    link: '/categories/sofa-fabrics/velvet-chenille',
  },
  {
    id: 'pop-motorized-blinds',
    name: 'Somfy Motorized Blinds',
    price: 6800,
    image: '/images/blinds/motorized-smart.jpg',
    link: '/categories/blinds/motorized-smart',
  },
  {
    id: 'pop-zebra-blinds',
    name: 'Zebra Day & Night Blinds',
    price: 2450,
    image: '/images/blinds/zebra.jpg',
    link: '/categories/blinds/zebra',
  },
];

export function HighQualityProductsSpotlight() {
  const { isWishlisted, toggleWishlist } = useStore();

  return (
    <section className="relative w-full py-14 sm:py-18 lg:py-20 bg-[#FAF7F2] text-[#2C221E] overflow-hidden">
      {/* Decorative Dot Grid Pattern in Top-Right Corner (as in reference image) */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-12 w-24 h-24 sm:w-32 sm:h-32 opacity-35 bg-[radial-gradient(#A66038_1.5px,transparent_1.5px)] [background-size:12px_12px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── Centered Title with Decorative Left & Right Accents ─── */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-[#C5A059] font-bold block mb-1.5">
            Signature Selection
          </span>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="w-6 sm:w-10 h-[1.5px] bg-[#C5A059] rounded-full" />
            <h2 className="font-serif text-[22px] sm:text-[30px] lg:text-[34px] font-bold text-[#2C221E] tracking-tight">
              High Quality Products
            </h2>
            <span className="w-6 sm:w-10 h-[1.5px] bg-[#C5A059] rounded-full" />
          </div>
        </div>

        {/* ─── 4 Clean Minimalist Cards Grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {POPULAR_PRODUCTS.map((product) => {
            const isFav = isWishlisted(product.id);

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between bg-white rounded-2xl sm:rounded-[22px] p-2.5 sm:p-3.5 shadow-[0_2px_12px_rgba(44,34,30,0.04)] hover:shadow-[0_12px_28px_rgba(44,34,30,0.08)] transition-all duration-300 border border-[#F0EAE1] hover:border-[#D4AF37]/60 h-full"
              >
                <div>
                  {/* Clickable Image Box */}
                  <Link
                    href={product.link}
                    className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F7F4EE] mb-2 sm:mb-3 block cursor-pointer"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 240px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </Link>

                  {/* Product Title (2-line clamped with min-height for uniform rows) */}
                  <Link
                    href={product.link}
                    className="font-medium text-[13px] sm:text-[14.5px] text-[#2C221E] hover:text-[#823423] transition-colors line-clamp-2 min-h-[2.4rem] leading-snug cursor-pointer block"
                  >
                    {product.name}
                  </Link>
                </div>

                {/* Price & Heart Row */}
                <div className="mt-2 pt-2 border-t border-[#F7F3EC] flex items-center justify-between">
                  <span className="font-bold text-[13.5px] sm:text-[15px] text-[#823423]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#78716C] hover:text-rose-600 transition-colors cursor-pointer active:scale-90 bg-[#FAF7F2] hover:bg-rose-50"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                        isFav ? 'fill-rose-600 text-rose-600' : ''
                      }`}
                    />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* ─── Centered Pill Button ─── */}
        <div className="mt-8 sm:mt-12 flex justify-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#2C221E] hover:bg-[#1C1714] text-white font-medium text-[12.5px] sm:text-[14px] shadow-md transition-all active:scale-95 group cursor-pointer border border-[#C5A059]/30"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
