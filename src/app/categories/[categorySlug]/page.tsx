import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft, ChevronRight, Sparkles, Calendar } from 'lucide-react';
import { normalizeCategorySlug } from '@/lib/data/categories';
import { getDynamicCategories, getDynamicCategoryBySlug, getDynamicProducts } from '@/lib/db/catalog';
import { ProductCard } from '@/components/ui/ProductCard';

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateStaticParams() {
  const categories = await getDynamicCategories();
  const dedicated = new Set([
    'curtains-drapes',
    'window-blinds-shades',
    'sofa-fabrics-upholstery',
    'wallpapers-wall-coverings',
    'carpets-rugs',
  ]);

  return categories
    .filter((c) => !dedicated.has(c.slug))
    .map((c) => ({
      categorySlug: c.slug,
    }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const normalized = normalizeCategorySlug(categorySlug);
  const category = await getDynamicCategoryBySlug(normalized);

  if (!category) {
    return {
      title: 'Category Not Found | Zaira Furnishing',
    };
  }

  return {
    title: `${category.name} | Zaira Furnishing`,
    description: category.description,
  };
}

export default async function CategoryDetailPage({
  params,
}: CategoryPageProps) {
  const { categorySlug } = await params;
  const normalized = normalizeCategorySlug(categorySlug);

  // Redirect dedicated categories to their specialized primary routes
  if (normalized === 'curtains-drapes') {
    redirect('/categories/curtains');
  }
  if (normalized === 'window-blinds-shades') {
    redirect('/categories/blinds');
  }
  if (normalized === 'sofa-fabrics-upholstery') {
    redirect('/categories/sofa-fabrics');
  }
  if (normalized === 'wallpapers-wall-coverings') {
    redirect('/categories/wallpapers');
  }
  if (normalized === 'carpets-rugs') {
    redirect('/categories/carpets');
  }

  // Canonical slug redirect if user visited alias URL
  if (categorySlug !== normalized) {
    redirect(`/categories/${normalized}`);
  }

  const category = await getDynamicCategoryBySlug(normalized);
  if (!category) {
    notFound();
  }

  // Fetch genuine products belonging to this category from Cloudflare D1
  const categoryProducts = await getDynamicProducts({ categorySlug: category.slug });

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1C1917] selection:bg-[#9A7B56] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* ─── 1. BREADCRUMB & BACK LINK ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-5 sm:mb-8 pb-3 border-b border-[#EAE4D8]">
          <nav className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] text-[#78716C] flex-wrap">
            <Link href="/" className="hover:text-[#1C1917] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
            <Link href="/categories" className="hover:text-[#1C1917] transition-colors">
              Categories
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
            <span className="text-[#1C1917] font-medium">
              {category.name}
            </span>
          </nav>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12px] font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Categories</span>
          </Link>
        </div>

        {/* ─── 2. CATEGORY HEADER ─── */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE4D8] text-[10.5px] uppercase tracking-[0.2em] text-[#9A7B56] font-semibold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{category.tagline}</span>
          </div>
          <h1 className="font-serif text-[30px] sm:text-[42px] text-[#1C1917] font-medium tracking-tight mb-3">
            {category.name}
          </h1>
          <p className="text-[13.5px] sm:text-[15px] text-[#78716C] leading-relaxed max-w-2xl font-light">
            {category.description}
          </p>
        </div>

        {/* ─── 3. PRODUCT GRID ─── */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6 mb-16">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-[#EDE8DE] p-8 max-w-md mx-auto shadow-2xs mb-16">
            <h3 className="font-serif text-[18px] text-[#1C1917] font-medium mb-2">
              Catalog items updating
            </h3>
            <p className="text-[13px] text-[#78716C] leading-relaxed">
              We are currently curating more atelier pieces for {category.name}. Check back soon or visit our showroom.
            </p>
          </div>
        )}

        {/* ─── 4. SHOWROOM & VISIT BANNER ─── */}
        <div className="p-6 sm:p-8 bg-[#1C1714] border border-[#9A7B56]/30 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#C4B9A1] font-semibold block mb-1.5">
              HYDERABAD SHOWROOM & IN-HOME VISITS
            </span>
            <h3 className="font-serif text-[20px] sm:text-[24px] font-medium mb-1">
              Experience {category.name} in Person
            </h3>
            <p className="text-[13px] text-[#EDE7DC]/80 max-w-xl font-light">
              Visit our Puppalguda studio to touch and feel material finishes, or schedule a free site consultation at your home.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-medium bg-[#FAF7F2] text-[#1C1917] hover:bg-[#EAE4D8] rounded-full transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#9A7B56]" />
              <span>Book Site Visit</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
