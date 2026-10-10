import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { getDynamicCategories, getDynamicCategoryBySlug, getDynamicCategoryDiscovery } from '@/lib/db/catalog';
import { CATEGORIES, getCategoryHref } from '@/lib/data/categories';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { BrowseByCategories } from '@/components/home/BrowseByCategories';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CategoriesPageProps {
  searchParams: Promise<{ slug?: string | string[]; type?: string }>;
}

export async function generateMetadata({
  searchParams,
}: CategoriesPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const rawSlug = typeof resolved.slug === 'string'
    ? resolved.slug
    : Array.isArray(resolved.slug)
    ? resolved.slug[0]
    : undefined;

  if (rawSlug) {
    const category = await getDynamicCategoryBySlug(rawSlug);
    if (category) {
      return {
        title: `${category.name} | Zaira Furnishing`,
        description: category.description,
      };
    }
  }

  return {
    title: 'Browse By Categories | Zaira Furnishing',
    description:
      'Explore all 9 luxury interior and furnishing categories from custom drapery to wooden flooring, carpets, and curated living accents.',
  };
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const resolved = await searchParams;
  const rawSlug = typeof resolved.slug === 'string'
    ? resolved.slug
    : Array.isArray(resolved.slug)
    ? resolved.slug[0]
    : undefined;

  // If a category slug query parameter is provided, redirect to the canonical clean category route
  if (rawSlug) {
    const targetHref = getCategoryHref(rawSlug);
    if (resolved?.type && resolved.type !== 'all') {
      redirect(`${targetHref}?type=${resolved.type}`);
    }
    redirect(targetHref);
  }

  const [categoriesData, discoveryCategories] = await Promise.all([
    getDynamicCategories(),
    getDynamicCategoryDiscovery(),
  ]);

  const categories = categoriesData && categoriesData.length > 0 ? categoriesData : CATEGORIES;

  // ─── MAIN CATEGORIES BROWSING PAGE ───
  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1C1917] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-[12px] text-[#78716C] mb-6">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span className="text-[#1C1917] font-medium">Categories</span>
        </nav>

        {/* ─── 1. Subcategory Visual Carousel (Interactive Discovery) ─── */}
        {discoveryCategories && discoveryCategories.length > 0 && (
          <BrowseByCategories
            id="category-explorer"
            className="bg-transparent border-0 py-0 pb-16 sm:pb-20"
            showExploreAllLink={false}
            categories={discoveryCategories}
          />
        )}

        {/* ─── 2. All 9 Disciplines Directory ─── */}
        <section className="pt-10 border-t border-[#EAE4D8] pb-16 sm:pb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE4D8] text-[10.5px] uppercase tracking-[0.22em] text-[#9A7B56] font-semibold mb-2 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Complete Directory</span>
              </div>
              <h2 className="font-serif text-[26px] sm:text-[32px] text-[#1C1917] font-medium tracking-tight">
                All 9 Catalog Disciplines
              </h2>
            </div>
            <p className="text-[13px] text-[#78716C] max-w-md font-light">
              Explore our full directory of handcrafted furnishings, architectural window systems, and tactile textures.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
            {categories.map((category, idx) => (
              <CategoryCard
                key={category.id || category.slug}
                category={category}
                priority={idx < 4}
              />
            ))}
          </div>
        </section>

        {/* ─── 3. In-Home Consultation Callout Banner ─── */}
        <section className="mb-12 p-6 sm:p-8 bg-white rounded-2xl border border-[#EAE4D8] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div>
            <h3 className="font-serif text-[20px] sm:text-[22px] text-[#1C1917] font-medium mb-1.5">
              Looking for bespoke in-home measurements?
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#78716C] leading-relaxed">
              Our specialists bring curated fabric books, wooden slat samples, and laser measurement directly to your door in Hyderabad.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 text-[11.5px] uppercase tracking-wider font-semibold bg-[#1C1917] text-white hover:bg-[#9A7B56] transition-colors rounded-full shadow-xs text-center"
            >
              <Calendar className="w-4 h-4 text-[#C5A880]" />
              <span>Book In-Home Consultation</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
