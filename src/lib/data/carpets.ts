/**
 * Carpets & Rugs Structured Data
 * Architectural reference model matching Curtains, Window Blinds, Sofa Fabrics, and Wallpapers.
 */

export interface CarpetType {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  badge?: string;
  productSlug?: string;
  highlights?: string[];
  image?: string;
}

// ─── THE 5 OFFICIAL CARPET & RUG TYPES ───
export const CARPET_TYPES: CarpetType[] = [
  {
    id: 'type-carpet-hand-tufted',
    slug: 'hand-tufted',
    productSlug: 'solis-hand-tufted-wool-silk-rug',
    name: 'Hand-Tufted Rugs',
    subtitle: 'High-Low Sculpted Pile with New Zealand Wool & Bamboo Silk',
    description: 'Artisanal area rugs hand-tufted by master craftspeople using semi-worsted wool and botanical bamboo silk highlights, delivering rich underfoot comfort and carved textural topography.',
    image: '/images/hero/rugs.jpg',
    badge: 'Carved Pile',
    highlights: ['70% New Zealand wool', 'Dual-level carved pile', 'High acoustic dampening'],
  },
  {
    id: 'type-carpet-hand-knotted',
    slug: 'hand-knotted',
    productSlug: 'isfahan-heirloom-hand-knotted-wool-rug',
    name: 'Hand-Knotted Rugs',
    subtitle: 'High-KPSI Heirloom Weaves & Traditional Persian Knots',
    description: 'Masterpiece heirloom rugs hand-knotted over months on traditional vertical looms, boasting tight knot density, exquisite oriental detailing, and generational longevity.',
    image: '/images/carpets/hand-knotted.jpg',
    badge: 'Heirloom Knot',
    highlights: ['High knot density (KPSI)', 'Individual hand-tied knots', 'Generational durability'],
  },
  {
    id: 'type-carpet-silk-blend',
    slug: 'silk-blend',
    productSlug: 'celeste-bamboo-silk-lustre-rug',
    name: 'Silk-Blend Rugs',
    subtitle: 'Lustrous Botanical Bamboo Silk & Fine Wool Sheen',
    description: 'Couture floor statement pieces woven with shimmering pure silk or bamboo viscose blends that subtly shift in lustre depending on ambient room lighting and viewing angles.',
    image: '/images/carpets/silk-blend.jpg',
    badge: 'Lustrous Sheen',
    highlights: ['Specular light reflection', 'Ultra-dense velvet touch', 'Sophisticated modern hues'],
  },
  {
    id: 'type-carpet-wall-to-wall',
    slug: 'wall-to-wall',
    productSlug: 'mayfair-broadloom-acoustic-carpet',
    name: 'Wall-to-Wall Carpets',
    subtitle: 'Seamless Broadloom Acoustic Carpeting for Living & Executive Suites',
    description: 'Precision broadloom tufted carpets engineered for seamless full-room acoustic dampening, continuous thermal insulation, and uniform luxury aesthetic across entire spaces.',
    image: '/images/carpets/wall-to-wall.jpg',
    badge: 'Seamless Broadloom',
    highlights: ['Total acoustic insulation', 'Heavy domestic & contract grade', 'Plush underlay cushioning'],
  },
  {
    id: 'type-carpet-flatweave',
    slug: 'flatweave',
    productSlug: 'kasbah-reversible-geometric-flatweave-dhurrie',
    name: 'Flatweave Rugs',
    subtitle: 'Reversible Geometric Dhurries & Low-Profile Kelims',
    description: 'Lightweight, reversible artisanal dhurries and kelims flat-woven from pure organic wool and cotton, offering crisp graphic patterns and practical low-clearance placement.',
    image: '/images/carpets/flatweave.jpg',
    badge: 'Reversible Flat',
    highlights: ['100% reversible design', 'Zero pile snagging', 'Effortless door clearance'],
  },
];

/**
 * Resolves a carpet/rug type by its canonical slug or recognized alias.
 */
export function getCarpetTypeBySlug(slug: string): CarpetType | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  const aliasMap: Record<string, string> = {
    'tufted': 'hand-tufted',
    'hand-tufted-rugs': 'hand-tufted',
    'tufted-rugs': 'hand-tufted',
    'knotted': 'hand-knotted',
    'hand-knotted-rugs': 'hand-knotted',
    'silk': 'silk-blend',
    'silk-rugs': 'silk-blend',
    'silk-blend-rugs': 'silk-blend',
    'broadloom': 'wall-to-wall',
    'wall-to-wall-carpets': 'wall-to-wall',
    'carpets': 'wall-to-wall',
    'flat-weave': 'flatweave',
    'flatweave-rugs': 'flatweave',
    'dhurries': 'flatweave',
    'kilims': 'flatweave',
  };
  const target = aliasMap[normalized] || normalized;
  return CARPET_TYPES.find((t) => t.slug === target);
}
