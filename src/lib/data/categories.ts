import { Category } from './types';

/**
 * Official Zaira Furnishing Product Categories (All 9 active catalog sections)
 * Slugs match the official 9 categories exactly.
 */
export const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'curtains-drapes',
    name: 'Curtains & Drapes',
    tagline: 'Bespoke tailoring, sheer elegance & acoustic drapery',
    description: 'Find curtains and drapes for different rooms and window styles.',
    image: '/images/hero/curtains.jpg',
    featured: true,
    isCustomizable: true,
    itemCountText: 'Curtains & Drapery',
  },
  {
    id: 'cat-2',
    slug: 'window-blinds-shades',
    name: 'Window Blinds & Shades',
    tagline: 'Precision motorized & manual light control systems',
    description: 'Architectural roller blinds, wooden venetians, cellular shades, and automated motorized systems.',
    image: '/images/hero/blinds.jpg',
    featured: true,
    isCustomizable: true,
    itemCountText: 'Blinds & Shades',
  },
  {
    id: 'cat-3',
    slug: 'sofa-fabrics-upholstery',
    name: 'Sofa Fabrics & Upholstery',
    tagline: 'High-durability velvets, performance linens & Italian bouclés',
    description: 'Premium upholstery textiles, stain-resistant performance fabrics, textured weaves, and tailored solutions.',
    image: '/images/hero/sofa_fabrics.jpg',
    featured: true,
    isCustomizable: true,
    itemCountText: 'Fabrics & Upholstery',
  },
  {
    id: 'cat-4',
    slug: 'wallpapers-wall-coverings',
    name: 'Wallpapers & Wall Coverings',
    tagline: 'Textured grasscloth, metallic leaf & custom panoramic murals',
    description: 'Luxury embossed wallcoverings, natural silk and grasscloth panels, and bespoke textured murals.',
    image: '/images/hero/wallpapers.jpg',
    featured: true,
    isCustomizable: true,
    itemCountText: 'Wallpapers & Murals',
  },
  {
    id: 'cat-5',
    slug: 'mattresses-sleep-systems',
    name: 'Mattresses & Sleep Systems',
    tagline: 'Orthopedic comfort, natural latex & zero-motion pocket springs',
    description: 'Engineered ergonomic mattresses, contouring natural latex, hybrid pocket springs, and custom bases.',
    image: '/images/categories/mattress.jpg',
    featured: true,
    isCustomizable: true,
    itemCountText: 'Mattresses & Bases',
  },
  {
    id: 'cat-6',
    slug: 'carpets-rugs',
    name: 'Carpets & Rugs',
    tagline: 'Hand-tufted wool, silk blends & seamless wall-to-wall carpets',
    description: 'Artisanal hand-knotted area rugs, subtle textured wools, and acoustic carpets for living spaces.',
    image: '/images/hero/rugs.jpg',
    featured: true,
    isCustomizable: true,
    itemCountText: 'Carpets & Rugs',
  },
  {
    id: 'cat-7',
    slug: 'wooden-flooring-sports-floor',
    name: 'Wooden Flooring & Sports Floor',
    tagline: 'Engineered European oak, herringbone & athletic performance surfaces',
    description: 'Authentic engineered hardwood planks, herringbone parquet, and high-performance athletic flooring.',
    image: '/images/hero/flooring.jpg',
    featured: true,
    isCustomizable: true,
    itemCountText: 'Flooring & Parquet',
  },
  {
    id: 'cat-9',
    slug: 'bed-linen-bath',
    name: 'Bed Linen & Bath',
    tagline: 'Egyptian cotton 800TC sateen & plush combed towels',
    description: 'Silky smooth duvet sets, breathable percale sheets, and spa-grade Turkish cotton bath linens.',
    image: '/images/categories/bed-linen.jpg',
    featured: true,
    isCustomizable: false,
    itemCountText: 'Linen & Bath',
  },
  {
    id: 'cat-10',
    slug: 'cushions-pillows',
    name: 'Cushions & Pillows',
    tagline: 'Embroidered accents, microfibre inserts & tactile textures',
    description: 'Curated decorative cushion covers, hand-embroidered bolster pillows, and tactile textured accents.',
    image: '/images/categories/cushions.jpg',
    featured: true,
    isCustomizable: false,
    itemCountText: 'Cushions & Pillows',
  },
];

/**
 * Normalizes any category slug (including legacy '-and-' variants) to the canonical slug.
 */
export function normalizeCategorySlug(rawSlug: string): string {
  if (!rawSlug) return '';
  const trimmed = rawSlug.trim().toLowerCase();

  const slugMap: Record<string, string> = {
    'curtains': 'curtains-drapes',
    'drapes': 'curtains-drapes',
    'curtains-and-drapes': 'curtains-drapes',
    'curtains-drapes': 'curtains-drapes',
    'window-blinds-and-shades': 'window-blinds-shades',
    'window-blinds-shades': 'window-blinds-shades',
    'sofa-fabrics-and-upholstery': 'sofa-fabrics-upholstery',
    'sofa-fabrics-upholstery': 'sofa-fabrics-upholstery',
    'wallpapers-and-wall-coverings': 'wallpapers-wall-coverings',
    'wallpapers-wall-coverings': 'wallpapers-wall-coverings',
    'mattresses-and-sleep-systems': 'mattresses-sleep-systems',
    'mattresses-sleep-systems': 'mattresses-sleep-systems',
    'carpets-and-rugs': 'carpets-rugs',
    'carpets-rugs': 'carpets-rugs',
    'wooden-flooring-and-sports-floor': 'wooden-flooring-sports-floor',
    'wooden-flooring-sports-floor': 'wooden-flooring-sports-floor',
    'bed-linen-and-bath': 'bed-linen-bath',
    'bed-linen-bath': 'bed-linen-bath',
    'cushions-and-pillows': 'cushions-pillows',
    'cushions-pillows': 'cushions-pillows',
    'cat-1': 'curtains-drapes',
    'cat-2': 'window-blinds-shades',
    'cat-3': 'sofa-fabrics-upholstery',
    'cat-4': 'wallpapers-wall-coverings',
    'cat-5': 'mattresses-sleep-systems',
    'cat-6': 'carpets-rugs',
    'cat-7': 'wooden-flooring-sports-floor',
    'cat-9': 'bed-linen-bath',
    'cat-10': 'cushions-pillows',
  };

  if (slugMap[trimmed]) {
    return slugMap[trimmed];
  }

  return trimmed.replace(/-and-/g, '-');
}

export function getFeaturedCategories(): Category[] {
  return CATEGORIES.filter((c) => c.featured);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  if (!slug) return undefined;
  const normalized = normalizeCategorySlug(slug);
  return CATEGORIES.find((c) => c.slug === normalized || c.slug === slug);
}

/**
 * Returns the canonical clean route URL for any category.
 */
export function getCategoryHref(slug: string): string {
  const normalized = normalizeCategorySlug(slug);
  switch (normalized) {
    case 'curtains-drapes':
      return '/categories/curtains';
    case 'window-blinds-shades':
      return '/categories/blinds';
    case 'sofa-fabrics-upholstery':
      return '/categories/sofa-fabrics';
    case 'wallpapers-wall-coverings':
      return '/categories/wallpapers';
    case 'carpets-rugs':
      return '/categories/carpets';
    default:
      return `/categories/${normalized}`;
  }
}

/**
 * Returns the canonical clean route URL for any subcategory.
 */
export function getSubcategoryHref(categorySlug: string, subcategorySlug: string): string {
  const normCat = normalizeCategorySlug(categorySlug);
  switch (normCat) {
    case 'curtains-drapes':
      return `/categories/curtains/${subcategorySlug}`;
    case 'window-blinds-shades':
      return `/categories/blinds/${subcategorySlug}`;
    case 'sofa-fabrics-upholstery':
      return `/categories/sofa-fabrics/${subcategorySlug}`;
    case 'wallpapers-wall-coverings':
      return `/categories/wallpapers/${subcategorySlug}`;
    case 'carpets-rugs':
      return `/categories/carpets/${subcategorySlug}`;
    default:
      return `/categories/${normCat}?type=${subcategorySlug}`;
  }
}

/**
 * Returns the short, e-commerce action callout text for any category card.
 */
export function getCategoryActionText(slug: string): string {
  const normalized = normalizeCategorySlug(slug);
  const actionMap: Record<string, string> = {
    'curtains-drapes': 'Explore Curtains',
    'window-blinds-shades': 'Explore Blinds',
    'sofa-fabrics-upholstery': 'Explore Fabrics',
    'wallpapers-wall-coverings': 'Explore Wallpapers',
    'mattresses-sleep-systems': 'Explore Mattresses',
    'carpets-rugs': 'Explore Rugs',
    'wooden-flooring-sports-floor': 'Explore Flooring',
    'bed-linen-bath': 'Explore Bed Linen',
    'cushions-pillows': 'Explore Cushions',
  };
  return actionMap[normalized] || 'Explore Collection';
}


