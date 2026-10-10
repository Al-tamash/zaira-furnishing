'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, ArrowUpDown } from 'lucide-react';
import { Product } from '@/lib/data/types';
import { DbSubcategory } from '@/lib/db/types';
import { ProductCard } from '@/components/ui/ProductCard';

interface CurtainTypePageProps {
  curtainType: DbSubcategory;
  products: Product[];
}

export function CurtainTypePage({ curtainType, products }: CurtainTypePageProps) {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Strict, reliable filter: must belong to curtains-drapes category and match this exact curtain type
  const typeProducts = products.filter(
    (p) =>
      (p.categorySlug === 'curtains-drapes' || p.categorySlug === 'curtains') &&
      (!curtainType.slug ||
        p.curtainType === curtainType.slug ||
        (p.curtainType && p.curtainType.toLowerCase() === curtainType.slug.toLowerCase()))
  );

  // Apply sorting
  const sortedProducts = [...typeProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1C1917] selection:bg-[#9A7B56] selection:text-white">
      {/* ─── 1. BREADCRUMB ─── */}
      <div className="border-b border-[#EAE4D8] bg-[#F7F4EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <nav className="flex items-center gap-1.5 text-[12px] text-[#78716C] flex-wrap">
              <Link href="/" className="hover:text-[#1C1917] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
              <Link href="/categories/curtains" className="hover:text-[#1C1917] transition-colors">
                Curtains & Drapes
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
              <span className="text-[#1C1917] font-medium">{curtainType.name}</span>
            </nav>

            <Link
              href="/categories/curtains"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Curtains</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. SUBCATEGORY HEADER ─── */}
      <section className="pt-8 sm:pt-12 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-6">
          <h1 className="font-serif text-[28px] sm:text-[36px] text-[#1C1917] font-medium tracking-tight mb-2">
            {curtainType.name}
          </h1>
          <p className="text-[14px] text-[#78716C] leading-relaxed">
            {curtainType.description}
          </p>
        </div>

        {/* ─── 3. PRODUCT CONTROLS BAR (Count + Sort By) ─── */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EAE4D8]">
          <span className="text-[13px] text-[#78716C] font-medium">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'}
          </span>

          <div className="flex items-center gap-2">
            <label
              htmlFor="curtain-sort"
              className="text-[11.5px] uppercase tracking-wider text-[#78716C] font-medium flex items-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort by:</span>
            </label>
            <select
              id="curtain-sort"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
              }
              className="text-[12px] bg-white border border-[#E2DBD0] rounded-sm py-1.5 px-3 text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56] cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* ─── 4. CLEAN PRODUCT GRID ─── */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-[#EAE4D8] p-8 max-w-md mx-auto">
              <p className="font-serif text-[18px] text-[#1C1917] mb-2">
                No products found in {curtainType.name}.
              </p>
              <Link
                href="/categories/curtains"
                className="inline-block mt-3 px-5 py-2 rounded-full text-[11px] uppercase tracking-wider font-semibold bg-[#1C1917] text-white hover:bg-[#9A7B56] transition-colors"
              >
                Browse All Curtain Styles
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
