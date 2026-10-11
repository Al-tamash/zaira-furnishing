import { getProduct, listProducts, Product } from '@/lib/catalog';
import {
  DbProduct,
  DbProductImage,
  DbProductVariant,
  DbProductSpecification,
} from '../types';

export interface FullProductRecord extends DbProduct {
  images: DbProductImage[];
  variants: DbProductVariant[];
  specifications: DbProductSpecification[];
}

export interface DbProductWithCategory extends DbProduct {
  category_name?: string | null;
  category_slug?: string | null;
}

function mapProductToDbProductWithCategory(p: Product): DbProductWithCategory {
  const now = new Date().toISOString();
  return {
    ...p,
    id: p.id,
    category_id: p.categorySlug,
    subcategory_id: p.subcategorySlug || null,
    name: p.name,
    display_name: p.displayName || p.name,
    slug: p.slug,
    description: p.description,
    short_description: p.shortDescription || '',
    product_type: p.productType,
    pricing_type: p.productType === 'custom_made' ? 'custom_estimate' : 'fixed',
    base_price: p.price,
    starting_price: p.startingPrice ? 1 : 0,
    unit: p.unit || null,
    custom_made: p.productType === 'custom_made' ? 1 : 0,
    featured: p.featured ? 1 : 0,
    custom_measurement_available: p.customMeasurementAvailable ? 1 : 0,
    active: p.active !== false ? 1 : 0,
    display_order: p.displayOrder || 0,
    currency: p.currency || 'INR',
    space_slugs: p.spaceSlugs ? JSON.stringify(p.spaceSlugs) : null,
    created_at: now,
    updated_at: now,
    category_name: p.categoryName || null,
    category_slug: p.categorySlug || null,
  };
}

function mapProductToFullRecord(p: Product): FullProductRecord {
  const now = new Date().toISOString();
  const images: DbProductImage[] = (p.images || []).map((img, idx) => ({
    id: img.id || `${p.id}-img-${idx}`,
    product_id: p.id,
    image_url: img.url,
    alt_text: img.altText || null,
    display_order: img.displayOrder ?? idx,
    is_main: img.isMain ? 1 : idx === 0 ? 1 : 0,
    active: 1,
    created_at: now,
  }));

  const variants: DbProductVariant[] = (p.variations || []).map((v, idx) => ({
    id: v.id,
    product_id: p.id,
    name: v.name,
    variant_type: v.type,
    sku: v.sku,
    color_hex: v.colorHex || null,
    thumbnail_image: v.thumbnailImage || null,
    preview_image: v.image || null,
    price_adjustment: v.price ? v.price - p.price : 0,
    in_stock: v.inStock ? 1 : 0,
    attributes: JSON.stringify(v.attributes || {}),
    display_order: idx,
    active: 1,
    created_at: now,
  }));

  const specifications: DbProductSpecification[] = (p.specifications || []).map((s, idx) => ({
    id: `${p.id}-spec-${idx}`,
    product_id: p.id,
    label: s.label,
    value: s.value,
    display_order: idx,
  }));

  return {
    ...p,
    id: p.id,
    category_id: p.categorySlug,
    subcategory_id: p.subcategorySlug || null,
    name: p.name,
    display_name: p.displayName || p.name,
    slug: p.slug,
    description: p.description,
    short_description: p.shortDescription || '',
    product_type: p.productType,
    pricing_type: p.productType === 'custom_made' ? 'custom_estimate' : 'fixed',
    base_price: p.price,
    starting_price: p.startingPrice ? 1 : 0,
    unit: p.unit || null,
    custom_made: p.productType === 'custom_made' ? 1 : 0,
    featured: p.featured ? 1 : 0,
    custom_measurement_available: p.customMeasurementAvailable ? 1 : 0,
    active: p.active !== false ? 1 : 0,
    display_order: p.displayOrder || 0,
    currency: p.currency || 'INR',
    space_slugs: p.spaceSlugs ? JSON.stringify(p.spaceSlugs) : null,
    created_at: now,
    updated_at: now,
    images,
    variants,
    specifications,
  };
}

/**
 * Fetch products from database with relational category info — delegates to @/lib/catalog
 */
export async function getDbProducts(filters?: {
  categorySlug?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}): Promise<DbProductWithCategory[]> {
  try {
    const products = await listProducts(filters);
    return products.map(mapProductToDbProductWithCategory);
  } catch (error) {
    console.error('Database query error in getDbProducts forwarder:', error);
    return [];
  }
}

/**
 * Fetch a single product by slug with complete relations — delegates to @/lib/catalog
 */
export async function getDbProductBySlug(slug: string): Promise<FullProductRecord | null> {
  try {
    const product = await getProduct(slug);
    if (!product) {
      return null;
    }
    return mapProductToFullRecord(product);
  } catch (error) {
    console.error(`Database query error in getDbProductBySlug forwarder for ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch featured products with complete relations — delegates to @/lib/catalog
 */
export async function getDbFeaturedProducts(limit = 6): Promise<FullProductRecord[]> {
  try {
    const products = await listProducts({ featured: true, limit });
    return products.map(mapProductToFullRecord);
  } catch (error) {
    console.error('Database query error in getDbFeaturedProducts forwarder:', error);
    return [];
  }
}
