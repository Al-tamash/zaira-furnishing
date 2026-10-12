# Dynamic Category Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse 10 shallow dedicated category route modules (`curtains`, `blinds`, `carpets`, `sofa-fabrics`, `wallpapers`) into deep dynamic routes at `src/app/categories/[categorySlug]/page.tsx` and `src/app/categories/[categorySlug]/[subcategorySlug]/page.tsx`, powered directly by the unified `@/lib/catalog` interface.

**Architecture:** A deep two-tier parameterized route system under `src/app/categories/` where `[categorySlug]/page.tsx` handles all 9 categories (rendering landing subcategory grids when subcategories exist, and direct product collections when they do not) and `[categorySlug]/[subcategorySlug]/page.tsx` handles all subcategories across all disciplines. Reusable, strictly-typed view components (`CategoryLandingView` and `SubcategoryDetailView`) replace 10 duplicated component files with zero type-casting hacks.

**Tech Stack:** Next.js 16 (App Router with Promise params), React 19, TypeScript 5, Tailwind CSS, Lucide icons, `@/lib/catalog`.

**Spec:** Candidate 2 selected from architectural review; builds upon ADR [`docs/adr/0001-unified-catalog-source-of-truth.md`](file:///c:/Users/Mohd%20Azimullah/Downloads/zaira-furnishing%20%282%29/zaira-furnishing/docs/adr/0001-unified-catalog-source-of-truth.md).

## Global Constraints

- Database-backed `@/lib/catalog` is the sole source of truth; no raw queries or static fallback branching.
- All existing URLs (`/categories/curtains`, `/categories/blinds`, `/categories/curtains/sheer`, `/categories/blinds/roller`, etc.) MUST remain valid and return 200 OK.
- Database slug aliases (`/categories/curtains-drapes`, `/categories/window-blinds-shades`, etc.) MUST cleanly redirect (308) to their canonical short URLs.
- Next.js 16 requirements: `params` and `searchParams` are Promises and MUST be awaited.
- Strict TypeScript: no `any` types or `as unknown as Parameters<...>` casting hacks.
- Deleting the 10 dedicated route files must not break any other route in the application.

---

### Task 1: Unified Reusable Category UI Views

**Files:**
- Create: `src/components/category/CategoryLandingView.tsx`
- Create: `src/components/category/SubcategoryDetailView.tsx`
- Create: `src/components/category/category-banners.ts`
- Test: `scripts/test_category_views.ts`

**Interfaces:**
- Consumes: `Category`, `Subcategory`, `Product` from `@/lib/catalog`
- Produces: `CategoryLandingView`, `SubcategoryDetailView`

- [ ] **Step 1: Create category highlight & banner configuration helper**

Create `src/components/category/category-banners.ts` providing bespoke copy, kickers, and WhatsApp consultation prompts for each discipline:

```typescript
export interface CategoryBannerConfig {
  kicker: string;
  shopByTypeTagline: string;
  description: string;
  bannerKicker: string;
  bannerTitle: string;
  bannerDescription: string;
  whatsappPrompt: string;
}

const DEFAULT_BANNER: CategoryBannerConfig = {
  kicker: 'Atelier Furnishings',
  shopByTypeTagline: 'Shop by Collection',
  description: 'Explore our tailored collections, architectural finishes, and bespoke installations.',
  bannerKicker: 'Hyderabad Showroom & In-Home Visits',
  bannerTitle: 'Experience Our Collections in Person',
  bannerDescription: 'Visit our studio to experience materials firsthand, or schedule a complimentary site measurement.',
  whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about your furnishings.',
};

const CATEGORY_BANNERS: Record<string, CategoryBannerConfig> = {
  'curtains-drapes': {
    kicker: 'Window Treatments',
    shopByTypeTagline: 'Shop by Type',
    description: 'Choose a curtain style below to explore our tailored collections, light-filtering fabrics, and bespoke heading options.',
    bannerKicker: 'Bespoke Drapery Tailoring',
    bannerTitle: 'Custom Headings & Motorized Tracks',
    bannerDescription: 'We measure, stitch, and install custom motorized ripplefold and pinch pleat curtains tailored to your ceiling height.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about bespoke curtains and drapes.',
  },
  'window-blinds-shades': {
    kicker: 'Architectural Shading',
    shopByTypeTagline: 'Shop by Type',
    description: 'Choose a blind style below to explore our precision solar screens, day & night shades, and natural wooden louvers.',
    bannerKicker: 'Smart Shading Automation',
    bannerTitle: 'Motorized Somfy & Tuya Solutions',
    bannerDescription: 'Automate your window blinds with whisper-quiet motors, smartphone app scheduling, and smart home integration.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about window blinds and automated shades.',
  },
  'sofa-fabrics-upholstery': {
    kicker: 'Upholstery Textiles',
    shopByTypeTagline: 'Shop by Type',
    description: 'Choose a textile below to explore our tactile Italian bouclés, washed linens, performance velvets, and textured weaves.',
    bannerKicker: 'Re-Upholstery Atelier',
    bannerTitle: 'Bespoke Re-Upholstery & Cut-Length Orders',
    bannerDescription: 'We supply high-performance fabrics by the meter and provide full sofa refurbishment, foam upgrading, and custom piping in Hyderabad.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about sofa fabrics and re-upholstery.',
  },
  'wallpapers-wall-coverings': {
    kicker: 'Artisanal Wall Finishes',
    shopByTypeTagline: 'Shop by Type',
    description: 'Choose a wall covering below to explore botanical illustrations, handwoven grasscloth, scenic panoramic murals, and silk panels.',
    bannerKicker: 'Scale-Calibrated Murals',
    bannerTitle: 'Custom Wall Dimensions & Professional Hanging',
    bannerDescription: 'We crop and calibrate scenic murals to match your exact room architecture, with seamless joins and expert installation.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about wallpapers and wall murals.',
  },
  'carpets-rugs': {
    kicker: 'Fine Floorcoverings',
    shopByTypeTagline: 'Shop by Type',
    description: 'Choose a carpet or rug style below to explore our hand-tufted wool blends, heirloom hand-knotted pieces, and seamless broadlooms.',
    bannerKicker: 'Custom Weaving Commissions',
    bannerTitle: 'Custom Dimensions & Color Matching',
    bannerDescription: 'We weave area rugs and broadlooms to match your living room proportions, with bespoke New Zealand wool and bamboo silk yarn dyeing.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about custom carpets and rugs.',
  },
};

export function getCategoryBannerConfig(categorySlug: string): CategoryBannerConfig {
  return CATEGORY_BANNERS[categorySlug] || DEFAULT_BANNER;
}
```

- [ ] **Step 2: Create `CategoryLandingView.tsx`**

Create `src/components/category/CategoryLandingView.tsx`:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { Category, Subcategory } from '@/lib/catalog';
import { getCategoryBannerConfig } from './category-banners';

interface CategoryLandingViewProps {
  category: Category;
  subcategories: Subcategory[];
  canonicalSlug: string;
}

export function CategoryLandingView({
  category,
  subcategories,
  canonicalSlug,
}: CategoryLandingViewProps) {
  const banner = getCategoryBannerConfig(category.slug);

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1C1917] selection:bg-[#9A7B56] selection:text-white">
      {/* ─── 1. BREADCRUMB ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-[12px] text-[#78716C]">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <Link href="/categories" className="hover:text-[#1C1917] transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span className="text-[#1C1917] font-medium">{category.name}</span>
        </nav>
      </div>

      {/* ─── 2. CATEGORY HEADER ─── */}
      <section className="pt-6 sm:pt-10 pb-8 sm:pb-12 text-center max-w-3xl mx-auto px-4 sm:px-6">
        <span className="text-[11.5px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold block mb-2">
          {banner.kicker}
        </span>
        <h1 className="font-serif text-[32px] sm:text-[42px] text-[#1C1917] font-medium tracking-tight mb-3">
          {category.name}
        </h1>
        <p className="text-[13px] uppercase tracking-widest font-semibold text-[#8C827A] mb-2">
          {banner.shopByTypeTagline}
        </p>
        <p className="text-[14px] sm:text-[15px] text-[#78716C] leading-relaxed max-w-xl mx-auto">
          {category.description || banner.description}
        </p>
      </section>

      {/* ─── 3. SUBCATEGORY IMAGE CARDS ─── */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
            {subcategories.map((type) => (
              <Link
                key={type.id}
                href={`/categories/${canonicalSlug}/${type.slug}`}
                className="group flex flex-col bg-white rounded-xl border border-[#EAE4D8] hover:border-[#1C1917] transition-all duration-300 overflow-hidden text-left shadow-2xs hover:shadow-md hover:-translate-y-1"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F2EDE2]">
                  <Image
                    src={type.image || category.image || '/images/hero/curtains.jpg'}
                    alt={type.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                <div className="p-3.5 sm:p-4 bg-white border-t border-[#F2ECE1]">
                  <h2 className="font-serif text-[14.5px] sm:text-[15.5px] font-medium leading-snug line-clamp-1 text-[#1C1917] group-hover:text-[#9A7B56] transition-colors mb-1">
                    {type.name}
                  </h2>
                  <div className="flex items-center justify-between text-[11.5px] text-[#8C827A] group-hover:text-[#1C1917] transition-colors font-medium">
                    <span>Shop Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. BESPOKE SERVICE BANNER ─── */}
      <section className="border-t border-[#EAE4D8] bg-[#F7F4EE] py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE4D8] text-[11px] uppercase tracking-wider text-[#9A7B56] font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{banner.bannerKicker}</span>
          </div>
          <h2 className="font-serif text-[24px] sm:text-[30px] text-[#1C1917] font-medium mb-3">
            {banner.bannerTitle}
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#78716C] max-w-xl mx-auto leading-relaxed mb-6">
            {banner.bannerDescription}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/917947415666?text=${encodeURIComponent(banner.whatsappPrompt)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1917] hover:bg-[#9A7B56] text-white text-[12px] uppercase tracking-wider font-semibold transition-all duration-200 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consult on WhatsApp</span>
            </a>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#D8CFBF] text-[12px] uppercase tracking-wider font-semibold transition-all duration-200"
            >
              <span>Our Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Create `SubcategoryDetailView.tsx`**

Create `src/components/category/SubcategoryDetailView.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, ArrowUpDown } from 'lucide-react';
import { Category, Subcategory, Product } from '@/lib/catalog';
import { ProductCard } from '@/components/ui/ProductCard';

interface SubcategoryDetailViewProps {
  category: Category;
  subcategory: Subcategory;
  products: Product[];
  canonicalSlug: string;
}

export function SubcategoryDetailView({
  category,
  subcategory,
  products,
  canonicalSlug,
}: SubcategoryDetailViewProps) {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Products are pre-filtered at database level by categorySlug & subcategorySlug
  const sortedProducts = [...products].sort((a, b) => {
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

      {/* ─── 2. SUBCATEGORY HEADER ─── */}
      <section className="pt-8 sm:pt-12 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-6">
          <h1 className="font-serif text-[28px] sm:text-[36px] text-[#1C1917] font-medium tracking-tight mb-2">
            {subcategory.name}
          </h1>
          {subcategory.description && (
            <p className="text-[14px] text-[#78716C] leading-relaxed">
              {subcategory.description}
            </p>
          )}
        </div>

        {/* ─── 3. PRODUCT CONTROLS BAR (Count + Sort By) ─── */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EAE4D8]">
          <span className="text-[13px] text-[#78716C] font-medium">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'}
          </span>

          <div className="flex items-center gap-2">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-[#EAE4D8] p-8 max-w-md mx-auto">
              <p className="font-serif text-[18px] text-[#1C1917] mb-2">
                No products currently listed in {subcategory.name}.
              </p>
              <p className="text-[13px] text-[#78716C] mb-4">
                We craft custom atelier orders in this style. Connect with our atelier on WhatsApp for bespoke sizing and fabric swatches.
              </p>
              <Link
                href={`/categories/${canonicalSlug}`}
                className="inline-block px-5 py-2 rounded-full text-[11px] uppercase tracking-wider font-semibold bg-[#1C1917] text-white hover:bg-[#9A7B56] transition-colors"
              >
                Browse All {category.name}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Write test verifying component types compile**

Create `scripts/test_category_views.ts` to verify strict type alignment with domain contracts.

- [ ] **Step 5: Run test and commit**

```bash
npx tsx scripts/test_category_views.ts
git add src/components/category/ scripts/test_category_views.ts
git commit -m "feat(category): add unified CategoryLandingView and SubcategoryDetailView components"
```

---

### Task 2: Implement Deep Dynamic Subcategory Route (`[categorySlug]/[subcategorySlug]/page.tsx`)

**Files:**
- Create: `src/app/categories/[categorySlug]/[subcategorySlug]/page.tsx`
- Test: `scripts/test_subcategory_route.ts`

**Interfaces:**
- Consumes: `listCategories`, `listSubcategories`, `getCategory`, `getSubcategory`, `listProducts` from `@/lib/catalog`
- Produces: Route handler for `/categories/:categorySlug/:subcategorySlug`

- [ ] **Step 1: Write `src/app/categories/[categorySlug]/[subcategorySlug]/page.tsx`**

Implement parameterized subcategory page with static param pregeneration, metadata generation, canonical alias redirection, and catalog data fetching:

```tsx
import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { listCategories, listSubcategories, getCategory, getSubcategory, listProducts } from '@/lib/catalog';
import { getCategoryHref } from '@/lib/data/categories';
import { SubcategoryDetailView } from '@/components/category/SubcategoryDetailView';

interface SubcategoryPageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await listCategories();
  const params: { categorySlug: string; subcategorySlug: string }[] = [];

  for (const cat of categories) {
    const subcategories = await listSubcategories(cat.slug);
    const href = getCategoryHref(cat.slug);
    const shortSlug = href.replace('/categories/', '');

    for (const sub of subcategories) {
      params.push({ categorySlug: shortSlug, subcategorySlug: sub.slug });
      if (shortSlug !== cat.slug) {
        params.push({ categorySlug: cat.slug, subcategorySlug: sub.slug });
      }
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const category = await getCategory(categorySlug);
  if (!category) {
    return { title: 'Category Not Found | Zaira Furnishing' };
  }

  const subcategory = await getSubcategory(category.slug, subcategorySlug);
  if (!subcategory) {
    return { title: `${category.name} | Zaira Furnishing` };
  }

  return {
    title: `${subcategory.name} | ${category.name} | Zaira Furnishing`,
    description: subcategory.description || category.description,
  };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { categorySlug, subcategorySlug } = await params;

  const category = await getCategory(categorySlug);
  if (!category) {
    notFound();
  }

  // Canonicalize category slug URL (e.g., /categories/curtains-drapes/sheer -> /categories/curtains/sheer)
  const canonicalHref = getCategoryHref(category.slug);
  const canonicalShortSlug = canonicalHref.replace('/categories/', '');

  if (categorySlug !== canonicalShortSlug) {
    redirect(`/categories/${canonicalShortSlug}/${subcategorySlug}`);
  }

  const subcategory = await getSubcategory(category.slug, subcategorySlug);
  if (!subcategory) {
    notFound();
  }

  // Fetch products matching category and subcategory from SQLite / Cloudflare D1
  const products = await listProducts({
    categorySlug: category.slug,
    subcategorySlug: subcategory.slug,
  });

  return (
    <SubcategoryDetailView
      category={category}
      subcategory={subcategory}
      products={products}
      canonicalSlug={canonicalShortSlug}
    />
  );
}
```

- [ ] **Step 2: Verify route logic via test script**

Create and run `scripts/test_subcategory_route.ts` testing subcategory resolution, product filtering, and canonical redirect expectations.

- [ ] **Step 3: Commit**

```bash
git add src/app/categories/\[categorySlug\]/\[subcategorySlug\]/page.tsx scripts/test_subcategory_route.ts
git commit -m "feat(routes): implement deep dynamic subcategory route [categorySlug]/[subcategorySlug]"
```

---

### Task 3: Deepen Dynamic Category Landing Route (`[categorySlug]/page.tsx`)

**Files:**
- Modify: `src/app/categories/[categorySlug]/page.tsx`
- Test: `scripts/test_category_landing_route.ts`

**Interfaces:**
- Consumes: `listCategories`, `listSubcategories`, `getCategory`, `listProducts` from `@/lib/catalog`
- Produces: Universal route handler for `/categories/:categorySlug`

- [ ] **Step 1: Rewrite `src/app/categories/[categorySlug]/page.tsx`**

Remove the hardcoded redirect blocks (`if (normalized === 'curtains-drapes') redirect(...)`).
Implement:
1. `generateStaticParams()` yielding all 9 categories and their canonical short aliases.
2. Canonical URL redirection: if `categorySlug !== canonicalShortSlug`, redirect to `/categories/${canonicalShortSlug}`.
3. Query param support: if `searchParams.type` is present and != 'all', redirect to `/categories/${canonicalShortSlug}/${resolved.type}`.
4. If subcategories exist: render `<CategoryLandingView />`.
5. If subcategories do not exist: fetch category products and render clean direct product catalog view with showroom banner.

- [ ] **Step 2: Run verification test**

Run: `npx tsx scripts/test_category_landing_route.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/categories/\[categorySlug\]/page.tsx scripts/test_category_landing_route.ts
git commit -m "feat(routes): deepen dynamic category route to serve all disciplines and subcategories"
```

---

### Task 4: Delete the 10 Dedicated Category Route Modules and Redundant Components

**Files:**
- Delete: `src/app/categories/curtains/` (page.tsx and [type]/page.tsx)
- Delete: `src/app/categories/blinds/` (page.tsx and [type]/page.tsx)
- Delete: `src/app/categories/carpets/` (page.tsx and [type]/page.tsx)
- Delete: `src/app/categories/sofa-fabrics/` (page.tsx and [type]/page.tsx)
- Delete: `src/app/categories/wallpapers/` (page.tsx and [type]/page.tsx)
- Delete: `src/components/curtains/`
- Delete: `src/components/blinds/`
- Delete: `src/components/carpets/`
- Delete: `src/components/sofa-fabrics/`
- Delete: `src/components/wallpapers/`

- [ ] **Step 1: Remove dedicated route directories**

Remove the 5 folders under `src/app/categories/`. Now all category and subcategory routes are routed purely dynamically by Next.js!

- [ ] **Step 2: Remove redundant component directories**

Remove the 5 component folders whose functionality was collapsed into `CategoryLandingView` and `SubcategoryDetailView`.

- [ ] **Step 3: Run TypeScript check to verify zero broken imports**

Run: `npx tsc --noEmit`
Expected: 0 type errors.

- [ ] **Step 4: Commit**

```bash
git rm -r src/app/categories/curtains src/app/categories/blinds src/app/categories/carpets src/app/categories/sofa-fabrics src/app/categories/wallpapers
git rm -r src/components/curtains src/components/blinds src/components/carpets src/components/sofa-fabrics src/components/wallpapers
git commit -m "refactor(routes): collapse 10 dedicated category route modules into deep dynamic routes"
```

---

### Task 5: Clean Up Route Callers, Helpers, and Sitemap

**Files:**
- Modify: `src/app/categories/page.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/lib/data/categories.ts`

- [ ] **Step 1: Update `src/app/categories/page.tsx`**

Migrate from legacy `getDynamicCategories` in `src/lib/db/catalog.ts` to `listCategories` from `@/lib/catalog`.

- [ ] **Step 2: Streamline `src/app/sitemap.ts`**

Replace 5 separate hardcoded `listSubcategories('curtains-drapes')` calls with an automated dynamic loop over all categories:

```typescript
for (const cat of categories) {
  const subs = await listSubcategories(cat.slug);
  const href = getCategoryHref(cat.slug);
  for (const s of subs) {
    subcategoryRoutes.push({
      url: `${BASE_URL}${href}/${s.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    });
  }
}
```

- [ ] **Step 3: Update `src/lib/data/categories.ts`**

Ensure `getSubcategoryHref` always returns `/categories/${shortSlug}/${subcategorySlug}`.

- [ ] **Step 4: Commit**

```bash
git add src/app/categories/page.tsx src/app/sitemap.ts src/lib/data/categories.ts
git commit -m "refactor(catalog): streamline category callers and sitemap to use dynamic routes"
```

---

### Task 6: End-to-End Verification & Production Build Audit

**Files:**
- Create: `scripts/verify_dynamic_category_routes.ts`

- [ ] **Step 1: Write comprehensive verification script**

Create `scripts/verify_dynamic_category_routes.ts` testing:
1. Static params generation covers all 9 categories and all 37 subcategories.
2. Canonical slug resolution and alias redirects.
3. Zero missing subcategories or broken routes.
4. Type safety across all rendered views.

- [ ] **Step 2: Run verification script**

Run: `npx tsx scripts/verify_dynamic_category_routes.ts`
Expected: PASS.

- [ ] **Step 3: Run production Next.js build**

Run: `npm run build`
Expected: Build succeeds with all static pages compiled.

- [ ] **Step 4: Final commit**

```bash
git add scripts/verify_dynamic_category_routes.ts
git commit -m "test(routes): add end-to-end audit suite for dynamic category routing"
```
