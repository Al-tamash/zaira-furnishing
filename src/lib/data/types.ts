/**
 * Core Data Models for Zaira Furnishing
 */

export type ProductType = 'standard' | 'custom_made';

export type VariationType =
  | 'color'
  | 'pattern'
  | 'material'
  | 'finish'
  | 'thickness'
  | 'opacity'
  | 'firmness'
  | 'design';

export interface ProductVariation {
  id: string;
  name: string;
  type: VariationType;
  /**
   * Actual image thumbnail for this variation (e.g. fabric weave, wood grain, stone surface).
   * Not a plain color circle.
   */
  thumbnailImage?: string;
  colorHex?: string;
  /** Full preview image corresponding to this specific variant */
  image?: string;
  /** Full preview images corresponding to this specific variant */
  images?: string[];
  sku: string;
  price?: number;
  inStock: boolean;
  availableSizes?: string[];
  /** Additional category-specific attributes (e.g. Opacity: Blackout, Material: 100% Belgian Linen) */
  attributes: Record<string, string>;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  altText?: string | null;
  displayOrder?: number;
  isMain?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  displayName?: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  subcategoryName?: string;
  shortDescription: string;
  description: string;
  productType: ProductType;
  price: number;
  startingPrice?: boolean;
  unit?: string;
  currency?: string;
  image?: string;
  mainImage: string;
  imageAlt?: string;
  additionalImages?: string[];
  galleryImages: string[];
  images?: ProductImage[];
  variations: ProductVariation[];
  specifications: ProductSpecification[];
  spaceSlugs: string[];
  featured?: boolean;
  customMeasurementAvailable?: boolean;
  curtainType?: string;
  blindType?: string;
  sofaFabricType?: string;
  wallpaperType?: string;
  carpetType?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  featured: boolean;
  isCustomizable: boolean;
  itemCountText: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  image?: string;
  iconName: string;
  highlights: string[];
  requiresSiteVisit?: boolean;
}

export interface Space {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image: string;
}
