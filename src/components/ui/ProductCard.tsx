'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/data/types';
import { useStore } from '@/lib/context/StoreContext';

interface ProductCardProps {
  product: Product;
  aspectRatio?: '4/5' | '1/1' | '3/4';
  className?: string;
  showCategory?: boolean;
}

// Unified Zaira Atelier Luxury Theme Token (consistent across all categories & pages)
const UNIFIED_ATELIER_CARD_THEME = {
  bgGradient: 'from-[#FAF8F5] via-[#FAF6F0] to-[#F5EFE6]',
  borderColor: 'border-[#EDE8DE]',
  glowColor: 'rgba(154, 123, 86, 0.12)',
  tagBg: 'bg-white/95',
  tagText: 'text-[#9A7B56]',
  btnBg: 'bg-[#1C1714] hover:bg-[#9A7B56]',
  btnText: 'text-white',
};

export function ProductCard({
  product,
  aspectRatio = '4/5',
  className = '',
  showCategory = true,
}: ProductCardProps) {
  const { isWishlisted, toggleWishlist, addToCart } = useStore();
  const [added, setAdded] = useState(false);

  const isFav = isWishlisted(product.id);
  const activeImage = product.mainImage;
  const isCustom = product.productType === 'custom_made';

  // Unified Zaira Atelier luxury theme for all cards
  const theme = UNIFIED_ATELIER_CARD_THEME;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product.id,
      variantId: product.variations?.[0]?.id,
      name: product.displayName || product.name,
      slug: product.slug,
      image: activeImage,
      variantName: product.variations?.[0]?.name,
      sku: product.variations?.[0]?.sku || product.id,
      sizeLabel: 'Standard',
      quantity: 1,
      unitPrice: product.price,
      productType: product.productType,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div
      className={`group relative flex flex-col h-full rounded-[22px] sm:rounded-[32px] border ${theme.borderColor} bg-gradient-to-b ${theme.bgGradient} p-3 sm:p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 overflow-hidden hover:-translate-y-2 ${className}`}
    >
      {/* ─── 1. Staged Product Visual with Ambient Halo ─── */}
      <div className="relative aspect-[4/4.3] w-full rounded-[18px] sm:rounded-[24px] overflow-hidden bg-white/70 backdrop-blur-xs shadow-[0_6px_20px_rgba(0,0,0,0.04)] mb-2.5 sm:mb-3">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 block w-full h-full"
          tabIndex={-1}
        >
          <Image
            src={activeImage}
            alt={product.images?.find((img) => img.url === activeImage)?.altText || product.imageAlt || product.displayName || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
          />
        </Link>

        {/* Ambient Halo */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/10 pointer-events-none" />

        {/* Category Pill Tag */}
        {showCategory && product.categoryName && (
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
            <span className={`px-2 py-0.5 rounded-full ${theme.tagBg} backdrop-blur-md text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider shadow-xs ${theme.tagText} border border-white/60`}>
              {product.categoryName.split('&')[0]}
            </span>
          </div>
        )}

        {/* Wishlist Heart — top-right */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${isFav
              ? 'bg-white shadow-xs border border-white text-rose-600 scale-105'
              : 'bg-white/85 backdrop-blur-md border border-white/80 shadow-2xs hover:bg-white hover:scale-110 active:scale-95 text-[#70645A] hover:text-rose-600'
            }`}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isFav ? 'fill-current text-rose-600' : ''
              }`}
          />
        </button>
      </div>

      {/* ─── 2. Centered Typography & Details (Mirroring User Reference) ─── */}
      <div className="flex-1 flex flex-col justify-between text-center space-y-1.5 sm:space-y-2 px-0.5 sm:px-1 pb-0.5">
        <div>
          {/* Product Name */}
          <Link href={`/products/${product.slug}`} className="block group/title">
            <h3 className="font-serif text-[14px] sm:text-[17px] font-medium text-[#1C1714] leading-snug tracking-tight line-clamp-1 group-hover/title:text-[#C5A059] transition-colors">
              {product.displayName || product.name}
            </h3>
          </Link>

          {/* Subtitle / Custom Made note */}
          <p className="text-[10px] sm:text-[11px] text-[#70645A] line-clamp-1 mt-0.5 font-sans">
            {isCustom ? 'Bespoke Made-to-Measure Atelier Drop' : 'Direct Designer Textile Curation'}
          </p>
        </div>

        {/* ─── 3. Bottom: Price & Clean Action ─── */}
        <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Price */}
          <div className="text-left">
            <span className="text-[9px] sm:text-[9.5px] text-[#7C7167] uppercase font-bold tracking-wider block leading-none">
              {isCustom || product.startingPrice ? 'From' : 'Price'}
            </span>
            <span className="font-serif font-bold text-[14px] sm:text-[16.5px] text-[#1C1714] leading-tight">
              {product.currency || '₹'}{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Quick Action Pill Button */}
          {isCustom ? (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#1C1714] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider transition-all shadow-2xs border border-black/5 cursor-pointer hover:scale-105 shrink-0"
            >
              <span>Explore</span>
              <ArrowRight className="w-3 h-3 text-[#C5A059]" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer hover:scale-105 shrink-0 ${added
                  ? 'bg-[#2C221E] text-white ring-2 ring-[#D4AF37]'
                  : `${theme.btnBg} ${theme.btnText}`
                }`}
            >
              {added ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  <span>Bag</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
