'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Product } from '@/lib/data/types';
import { useStore } from '@/lib/context/StoreContext';

interface FeaturedProductCardProps {
  product: Product;
}

// Unified Zaira Atelier Luxury Theme Token (consistent across all categories & pages)
const UNIFIED_ATELIER_MOOD_THEME = {
  bgGradient: 'from-[#FAF8F5] via-[#FAF6F0] to-[#F5EFE6]',
  borderColor: 'border-[#EDE8DE]',
  tagBg: 'bg-white/95',
  tagText: 'text-[#9A7B56]',
};

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const { isWishlisted, toggleWishlist } = useStore();
  const isFav = isWishlisted(product.id);
  const isCustom = product.productType === 'custom_made';

  // Unified Zaira Atelier luxury theme for all featured cards
  const theme = UNIFIED_ATELIER_MOOD_THEME;

  return (
    <div className="group flex flex-col shrink-0 w-[68vw] sm:w-[45vw] md:w-[32vw] lg:w-[calc(25%-15px)] snap-start">
      <Link
        href={`/products/${product.slug}`}
        className={`block flex flex-col justify-between h-full rounded-[24px] sm:rounded-[32px] border ${theme.borderColor} bg-gradient-to-b ${theme.bgGradient} p-3 sm:p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out group-hover:-translate-y-2 overflow-hidden`}
        aria-label={`View ${product.displayName || product.name}`}
      >
        <div>
          {/* ─── 1. Staged Product Visual with Ambient Glow ─── */}
          <div className="relative aspect-[4/4.2] w-full overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white/70 backdrop-blur-xs shadow-[0_4px_16px_rgba(0,0,0,0.04)] mb-2.5 sm:mb-3">
            <Image
              src={product.mainImage}
              alt={product.images?.find((img) => img.isMain || img.url === product.mainImage)?.altText || product.imageAlt || product.displayName || product.name}
              fill
              sizes="(max-width: 640px) 68vw, (max-width: 1024px) 32vw, 25vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
            />

            {/* Ambient Studio Lighting Glow */}
            <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/10 pointer-events-none" />

            {/* Minimal Wishlist Heart Button (Top-Right) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              aria-label={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isFav
                  ? 'bg-white shadow-xs border border-white text-rose-600 scale-105'
                  : 'bg-white/90 backdrop-blur-md border border-white/80 shadow-2xs hover:bg-white hover:scale-110 active:scale-95 text-[#70645A] hover:text-rose-600'
              }`}
            >
              <Heart
                className={`w-[13.5px] h-[13.5px] transition-colors duration-200 ${
                  isFav ? 'fill-current text-rose-600' : ''
                }`}
              />
            </button>
          </div>

          {/* ─── 2. Centered Typography ─── */}
          <div className="pt-0.5 px-1 flex flex-col text-center">
            {/* Product Name */}
            <h3 className="font-serif text-[14px] sm:text-[16px] font-medium text-[#1C1714] leading-snug line-clamp-1 group-hover:text-[#823423] transition-colors duration-200">
              {product.displayName || product.name}
            </h3>

            {/* Price & Custom indicator */}
            <div className="mt-1 flex items-center justify-center gap-1.5 text-center">
              <span className="font-sans text-[13px] sm:text-[14px] font-bold text-[#823423] tracking-tight">
                {isCustom || product.startingPrice ? 'From ' : ''}
                {product.currency || '₹'}{product.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
