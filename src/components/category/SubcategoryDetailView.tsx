'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, ArrowUpDown, Ruler, MessageCircle } from 'lucide-react';
import { Category, Subcategory, Product } from '@/lib/catalog';
import { ProductCard } from '@/components/ui/ProductCard';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_NUMBER } from '@/lib/whatsapp';

interface SubcategoryDetailViewProps {
  category: Category;
  subcategory: Subcategory;
  subcategories?: Subcategory[];
  products: Product[];
  canonicalSlug: string;
}

export function SubcategoryDetailView({
  category,
  subcategory,
  subcategories = [],
  products,
  canonicalSlug,
}: SubcategoryDetailViewProps) {
  const { openBookingModal } = useStore();
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'name-desc'>('featured');

  // Products are pre-filtered at database level by categorySlug & subcategorySlug
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'name-asc') return (a.displayName || a.name).localeCompare(b.displayName || b.name);
    if (sortBy === 'name-desc') return (b.displayName || b.name).localeCompare(a.displayName || a.name);
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
              <Link href={`/categories/${canonicalSlug}`} className="hover:text-[#1C1917] transition-colors">
                {category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
              <span className="text-[#1C1917] font-medium">{subcategory.name}</span>
            </nav>

            <Link
              href={`/categories/${canonicalSlug}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {category.name}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. SUBCATEGORY HEADER & SIBLING FILTER PILLS ─── */}
      <section className="pt-8 sm:pt-12 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-6">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#9A7B56] font-semibold block mb-2">
            {category.name} Collection
          </span>
          <h1 className="font-serif text-[28px] sm:text-[36px] text-[#1C1917] font-medium tracking-tight mb-2.5">
            {subcategory.name}
          </h1>
          {subcategory.description && (
            <p className="text-[14px] sm:text-[14.5px] text-[#78716C] leading-relaxed">
              {subcategory.description}
            </p>
          )}
        </div>

        {/* Sibling Subcategory Filter Pills */}
        {subcategories && subcategories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 mb-6">
            <Link
              href={`/categories/${canonicalSlug}`}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-medium bg-white text-[#57534E] hover:text-[#1C1917] border border-[#E2DBD0] hover:border-[#1C1917] shrink-0 transition-colors shadow-2xs"
            >
              All {category.name}
            </Link>
            {subcategories.map((sub) => {
              const isActive = sub.slug === subcategory.slug;
              return (
                <Link
                  key={sub.id || sub.slug}
                  href={`/categories/${canonicalSlug}/${sub.slug}`}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#1C1714] text-white font-semibold shadow-xs'
                      : 'bg-white text-[#57534E] hover:text-[#1C1917] border border-[#E2DBD0] hover:border-[#1C1917] font-medium shadow-2xs'
                  }`}
                >
                  {sub.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* ─── 3. PRODUCT CONTROLS BAR (Count + Trust Badge + Sort By) ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE4D8]">
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#78716C] font-medium">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'Design' : 'Designs'}
            </span>
            <span className="text-[#D8D2C4]" aria-hidden="true">•</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FAF3E6] border border-[#D4AF37]/40 text-[#823423] text-[10.5px] font-semibold uppercase tracking-wider">
              Bespoke Made-to-Measure
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label
              htmlFor="subcategory-sort"
              className="text-[11.5px] uppercase tracking-wider text-[#78716C] font-medium flex items-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort by:</span>
            </label>
            <select
              id="subcategory-sort"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'featured' | 'name-asc' | 'name-desc')
              }
              className="text-[12px] bg-white border border-[#E2DBD0] rounded-lg py-1.5 px-3 text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56] cursor-pointer shadow-2xs"
            >
              <option value="featured">Featured</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </section>

      {/* ─── 4. CLEAN PRODUCT GRID ─── */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-[#EAE4D8] p-8 max-w-md mx-auto shadow-2xs">
              <p className="font-serif text-[18px] text-[#1C1917] mb-2">
                No products currently listed in {subcategory.name}.
              </p>
              <p className="text-[13px] text-[#78716C] mb-4 leading-relaxed">
                We craft made-to-measure orders in this category. Connect with our styling team on WhatsApp for custom sizing and fabric swatches.
              </p>
              <Link
                href={`/categories/${canonicalSlug}`}
                className="inline-block px-5 py-2.5 rounded-full text-[11px] uppercase tracking-wider font-semibold bg-[#1C1714] text-white hover:bg-[#9A7B56] transition-colors shadow-2xs"
              >
                Browse All {category.name}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── 5. IN-HOME MEASUREMENT & CONSULTATION BANNER ─── */}
      <section className="border-t border-[#EAE4D8] bg-[#F7F4EE] py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE4D8] text-[11px] uppercase tracking-wider text-[#9A7B56] font-semibold mb-3 shadow-2xs">
            <Ruler className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Hyderabad In-Home Measurement</span>
          </div>
          <h2 className="font-serif text-[24px] sm:text-[30px] text-[#1C1917] font-medium mb-2.5">
            Custom Sizing &amp; Fabric Curation for {subcategory.name}
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#78716C] max-w-xl mx-auto leading-relaxed mb-6 font-normal">
            Our specialists bring authentic fabric books, heading style swatches, and laser measuring tools directly to your home anywhere in Hyderabad.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openBookingModal(`Free Measurement — ${subcategory.name}`)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12px] uppercase tracking-wider font-semibold transition-all duration-200 shadow-xs cursor-pointer"
            >
              <Ruler className="w-4 h-4 text-[#D4AF37]" />
              <span>Book Free Home Visit</span>
            </button>
            <a
              href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hello Zaira Furnishing,\n\nI am browsing ${subcategory.name} (${category.name}) on your website. Please share fabric options and consultation details.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20BA5C] text-white text-[12px] uppercase tracking-wider font-semibold transition-all duration-200 shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white text-white" />
              <span>Inquire on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
