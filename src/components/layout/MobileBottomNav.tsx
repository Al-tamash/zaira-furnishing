'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Heart, ShoppingBag, Calendar } from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, wishlistCount, setIsCartOpen, openBookingModal } = useStore();

  // On individual product detail pages, hide generic bottom nav to let the product purchase bar shine cleanly
  if (pathname.startsWith('/products/') && pathname !== '/products') {
    return null;
  }

  const isHome = pathname === '/';
  const isCategories = pathname.startsWith('/categories');
  const isWishlist = pathname === '/account' || pathname === '/wishlist';

  return (
    <nav
      aria-label="Mobile Navigation"
      style={{ paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom, 0px))' }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C1714]/95 backdrop-blur-xl border-t border-[#3D302A] lg:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.35)]"
    >
      <div className="grid grid-cols-5 items-center h-14 px-2 max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            isHome ? 'text-[#D4AF37] font-bold scale-105' : 'text-[#A8A29E] hover:text-[#FAF7F2]'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
          {isHome && <span className="w-1 h-1 rounded-full bg-[#D4AF37] mt-0.5" />}
        </Link>

        {/* 2. Categories */}
        <Link
          href="/categories"
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            isCategories ? 'text-[#D4AF37] font-bold scale-105' : 'text-[#A8A29E] hover:text-[#FAF7F2]'
          }`}
        >
          <LayoutGrid className={`w-5 h-5 ${isCategories ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Catalog</span>
          {isCategories && <span className="w-1 h-1 rounded-full bg-[#D4AF37] mt-0.5" />}
        </Link>

        {/* 3. Center Jewel Action: Book Free In-Home Visit */}
        <button
          type="button"
          onClick={() => openBookingModal('Free Doorstep In-Home Measurement')}
          className="flex flex-col items-center justify-center py-0 text-[#FAF7F2] transition-transform active:scale-90 cursor-pointer -mt-2 group"
          aria-label="Book Free Doorstep In-Home Measurement"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#C5A059] to-[#9A7B56] text-[#1C1714] flex items-center justify-center shadow-[0_4px_16px_rgba(212,175,55,0.4)] border border-[#FFF3D1] group-hover:scale-105 transition-all">
            <Calendar className="w-5 h-5 text-[#1C1714] stroke-[2.2]" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37] mt-0.5">
            Book Visit
          </span>
        </button>

        {/* 4. Wishlist */}
        <Link
          href="/account"
          className={`relative flex flex-col items-center justify-center py-1 transition-all ${
            isWishlist ? 'text-[#D4AF37] font-bold scale-105' : 'text-[#A8A29E] hover:text-[#FAF7F2]'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${isWishlist ? 'stroke-[2.5] fill-[#D4AF37]/30' : 'stroke-[1.8]'}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 text-[8.5px] font-bold text-[#1C1714] bg-[#D4AF37] rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Wishlist</span>
          {isWishlist && <span className="w-1 h-1 rounded-full bg-[#D4AF37] mt-0.5" />}
        </Link>

        {/* 5. Bag */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 text-[#A8A29E] hover:text-[#FAF7F2] transition-all cursor-pointer active:scale-95"
          aria-label={`Shopping bag with ${cartCount} items`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 text-[9px] font-black text-[#1C1714] bg-[#D4AF37] rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Bag</span>
        </button>
      </div>
    </nav>
  );
}
