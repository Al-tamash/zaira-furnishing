/**
 * Wallpapers & Wall Coverings Structured Data
 * Architectural reference model matching Curtains, Window Blinds, and Sofa Fabrics.
 */

export interface WallpaperType {
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

// ─── THE 5 OFFICIAL WALLPAPER TYPES ───
export const WALLPAPER_TYPES: WallpaperType[] = [
  {
    id: 'type-wall-botanical-floral',
    slug: 'botanical-floral',
    productSlug: 'botanical-textured-wallcovering',
    name: 'Botanical & Floral Wallpapers',
    subtitle: 'Lush Foliage, Biophilic Reliefs & Elegant Florals',
    description: 'Bespoke nature-inspired wallcoverings featuring sculpted botanical motifs, lush tropical canopies, and classic florals printed on tactile non-woven substrates.',
    image: '/images/hero/wallpapers.jpg',
    badge: 'Biophilic Relief',
    highlights: ['Subtle relief embossing', 'Seamless pattern alignment', 'FSC-certified non-woven'],
  },
  {
    id: 'type-wall-textured-grasscloth',
    slug: 'textured-grasscloth',
    name: 'Textured & Grasscloth Wallpapers',
    subtitle: 'Hand-Woven Natural Fibres & Dimensional Reliefs',
    description: 'Authentic hand-woven sisal, raffia, and grasscloth wallcoverings bringing organic texture, tonal variation, and acoustic warmth to architectural living spaces.',
    image: '/images/wallpapers/textured-grasscloth.jpg',
    badge: 'Natural Fibre',
    highlights: ['Hand-harvested grasses', 'Acoustic absorption', 'Rich tactile depth'],
  },
  {
    id: 'type-wall-panoramic-murals',
    slug: 'panoramic-murals',
    name: 'Custom Panoramic Murals',
    subtitle: 'Tailored Floor-to-Ceiling Scenic Landscape Murals',
    description: 'Scale-calibrated panoramic wall murals depicting misty mountain valleys, classical heritage frescos, and modern abstract architecture scaled to your exact wall dimensions.',
    image: '/images/wallpapers/panoramic-murals.jpg',
    badge: 'Scale-to-Fit',
    highlights: ['Custom wall dimensions', 'Zero visible seams', 'High-definition pigmentation'],
  },
  {
    id: 'type-wall-silk-organic',
    slug: 'silk-organic',
    name: 'Natural Silk & Organic Panels',
    subtitle: 'Hand-Spun Raw Silk, Linen & Cork Wallcoverings',
    description: 'Ultra-refined natural silk textiles and sustainable organic cork wall panels backed with acoustic paper, offering quiet opulence and subtle ambient light sheen.',
    image: '/images/wallpapers/silk-organic.jpg',
    badge: 'Lustrous Silk',
    highlights: ['Pure wild silk threads', 'Breathable backing', 'Quiet luxury sheen'],
  },
  {
    id: 'type-wall-metallic-foil',
    slug: 'metallic-foil',
    name: 'Metallic Leaf & Foil Finishes',
    subtitle: 'Gold Leaf, Brushed Champagne & Specular Reflections',
    description: 'Opulent wallcoverings crafted with hand-gilded metallic leaf, reflective foils, and oxidised patina accents designed to softly catch and reflect ambient chandelier lighting.',
    image: '/images/wallpapers/metallic-foil.jpg',
    badge: 'Specular Lustre',
    highlights: ['Hand-applied foil accents', 'Specular light play', 'Luxury focal walls'],
  },
];

/**
 * Resolves a wallpaper type by its canonical slug or recognized alias.
 */
export function getWallpaperTypeBySlug(slug: string): WallpaperType | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  const aliasMap: Record<string, string> = {
    'botanical': 'botanical-floral',
    'floral': 'botanical-floral',
    'botanical-wallpapers': 'botanical-floral',
    'floral-wallpapers': 'botanical-floral',
    'grasscloth': 'textured-grasscloth',
    'textured': 'textured-grasscloth',
    'textured-wallpapers': 'textured-grasscloth',
    'murals': 'panoramic-murals',
    'panoramic': 'panoramic-murals',
    'scenic-murals': 'panoramic-murals',
    'silk': 'silk-organic',
    'organic': 'silk-organic',
    'silk-wallpapers': 'silk-organic',
    'metallic': 'metallic-foil',
    'foil': 'metallic-foil',
    'gold-leaf': 'metallic-foil',
  };
  const target = aliasMap[normalized] || normalized;
  return WALLPAPER_TYPES.find((t) => t.slug === target);
}
