import { Product, ProductVariation } from './types';
import { normalizeCategorySlug } from './categories';
import { OFFICIAL_CATALOG } from './officialCatalog';

/**
 * Subcategory slug mappings to ensure seamless navigation across specialized routes
 */
const SUBCATEGORY_SLUG_MAP: Record<string, string> = {
  // Curtains
  'blackout-curtains': 'blackout',
  'sheer-day-curtains': 'sheer',
  'velvet-curtains': 'velvet',
  'satin-plain-curtains': 'satin',
  'jacquard-curtains': 'jacquard',
  'linen-textured-curtains': 'linen',
  'digitally-printed-curtains': 'printed',
  'embroidered-curtains': 'embroidered',
  'kids-room-curtains': 'kids',
  'customized-made-to-measure-curtains': 'custom',

  // Blinds
  'roller-blinds': 'roller',
  'zebra-blinds-day-night': 'zebra',
  'roman-blinds-shades': 'roman',
  'wooden-blinds': 'wooden',
  'venetian-blinds': 'venetian',
  'vertical-blinds': 'vertical',
  'honeycomb-cellular-shades': 'cellular',
  'balcony-monsoon-pvc-blinds': 'balcony-pvc',
  'motorized-smart-blinds': 'motorized-smart',

  // Sofa Fabrics
  'velvet-fabric': 'velvet-chenille',
  'chenille-fabric': 'velvet-chenille',
  'cotton-cotton-blends': 'linen-cotton',
  'linen-textured-blends': 'linen-cotton',
  'suede-microfiber': 'textured-weave',
  'artificial-leatherette-faux-leather': 'leatherette',
  'pure-genuine-leather': 'leatherette',
  'stain-resistant-pet-friendly-fabrics': 'performance',
  'sofa-recliner-covers': 'boucle',

  // Wallpapers
  'botanical-floral-wallpapers': 'botanical-floral',
  'textured-grasscloth-wallpapers': 'textured-grasscloth',
  'custom-panoramic-murals': 'panoramic-murals',
  'natural-silk-organic-panels': 'silk-organic',
  'metallic-leaf-foil-finishes': 'metallic-foil',

  // Carpets & Rugs
  'modern-contemporary-abstract-rugs': 'hand-tufted',
  'hand-tufted-hand-knotted-rugs': 'hand-knotted',
  'traditional-kilim-dhurrie-flatweaves': 'flatweave',
  'antique-vintage-distressed-rugs': 'silk-blend',
  'shag-high-pile-fluffy-rugs': 'hand-tufted',
  'bedside-hallway-runners': 'flatweave',
  'wall-to-wall-carpeting': 'wall-to-wall',
};

/**
 * OFFICIAL PRODUCT CATALOG (Strictly matching Zaira Furnishing verified specification)
 * 62 verified products across all 10 official categories.
 */
export const PRODUCTS: Product[] = OFFICIAL_CATALOG.flatMap((cat) => {
  return cat.products.map((prod): Product => {
    const subcatSlug = SUBCATEGORY_SLUG_MAP[prod.slug];
    const isCurtain = cat.slug === 'curtains-drapes';
    const isBlind = cat.slug === 'window-blinds-shades';
    const isSofa = cat.slug === 'sofa-fabrics-upholstery';
    const isWallpaper = cat.slug === 'wallpapers-wall-coverings';
    const isCarpet = cat.slug === 'carpets-rugs';

    const variations: ProductVariation[] = prod.swatches.map((sw, sIdx) => ({
      id: `var-${prod.slug}-${sIdx}`,
      name: sw.name,
      type: 'color',
      colorHex: sw.hex,
      image: sw.image || prod.image,
      thumbnailImage: sw.image || prod.image,
      sku: `ZA-${prod.slug.slice(0, 4).toUpperCase()}-${sIdx + 1}`,
      inStock: true,
      attributes: {
        Finish: sw.name,
        Varieties: prod.varietiesNotes,
      },
    }));

    return {
      id: `prod-off-${prod.slug}`,
      slug: prod.slug,
      name: prod.name,
      displayName: prod.name,
      categorySlug: cat.slug,
      categoryName: cat.name,
      subcategorySlug: subcatSlug,
      shortDescription: prod.description,
      description: `${prod.description} — ${prod.varietiesNotes}`,
      productType: 'custom_made',
      price: prod.price,
      startingPrice: prod.startingPrice,
      currency: '₹',
      image: prod.image,
      mainImage: prod.image,
      imageAlt: prod.name,
      additionalImages: prod.galleryImages.filter((img) => img !== prod.image),
      galleryImages: prod.galleryImages.length > 0 ? prod.galleryImages : [prod.image],
      variations,
      specifications: prod.specifications,
      spaceSlugs: ['living-room', 'bedroom'],
      featured: true,
      customMeasurementAvailable: true,
      curtainType: isCurtain ? subcatSlug : undefined,
      blindType: isBlind ? subcatSlug : undefined,
      sofaFabricType: isSofa ? subcatSlug : undefined,
      wallpaperType: isWallpaper ? subcatSlug : undefined,
      carpetType: isCarpet ? subcatSlug : undefined,
    };
  });
});

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  if (!slug) return undefined;
  // Direct match
  const direct = PRODUCTS.find((p) => p.slug === slug);
  if (direct) return direct;

  // Legacy slug mappings
  const legacyMap: Record<string, string> = {
    'belgian-linen-custom-drapery': 'linen-textured-curtains',
    'motorized-architectural-roller-blinds': 'roller-blinds',
    'sand-beige-blackout-curtains': 'blackout-curtains',
    'charcoal-blackout-curtains': 'blackout-curtains',
    'white-linen-sheer-curtains': 'sheer-day-curtains',
    'champagne-crushed-sheer-curtains': 'sheer-day-curtains',
  };

  const mappedSlug = legacyMap[slug];
  if (mappedSlug) {
    return PRODUCTS.find((p) => p.slug === mappedSlug);
  }

  return undefined;
}

export function getProductsByCategory(categorySlug: string): Product[] {
  if (!categorySlug) return [];
  const normalized = normalizeCategorySlug(categorySlug);
  return PRODUCTS.filter(
    (p) => p.categorySlug === normalized || p.categorySlug === categorySlug
  );
}
