import { getDatabase } from './index';
import {
  DbCategory,
  DbSubcategory,
  DbProduct,
  DbProductImage,
  DbProductVariant,
  DbProductSpecification,
  DbService,
  DbCmsContent,
} from './types';
import { Product, ProductImage, ProductVariation, ProductSpecification, Category, Service } from '@/lib/data/types';
import { normalizeCategorySlug, CATEGORIES } from '@/lib/data/categories';
import { PRODUCTS, getProductBySlug } from '@/lib/data/products';
import { SERVICES } from '@/lib/data/services';
import { CURTAIN_TYPES } from '@/lib/data/curtains';
import { BLIND_TYPES } from '@/lib/data/blinds';
import { SOFA_FABRIC_TYPES } from '@/lib/data/sofa-fabrics';
import { WALLPAPER_TYPES } from '@/lib/data/wallpapers';
import { CARPET_TYPES } from '@/lib/data/carpets';

/**
 * Maps D1 category record to frontend Category model
 */
export function mapDbCategoryToFrontend(c: DbCategory): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    tagline: c.tagline || '',
    description: c.description || '',
    image: c.image || '',
    featured: c.featured === 1,
    isCustomizable: c.is_customizable === 1,
    itemCountText: c.item_count_text || 'In Atelier',
  };
}

/**
 * Maps D1 service record to frontend Service model
 */
export function mapDbServiceToFrontend(s: DbService): Service {
  let parsedHighlights: string[] = [];
  if (s.highlights) {
    try {
      parsedHighlights = JSON.parse(s.highlights);
    } catch {
      parsedHighlights = [];
    }
  }

  return {
    id: s.id,
    slug: s.slug,
    title: s.name,
    shortDesc: s.short_desc,
    fullDesc: s.full_desc || '',
    image: s.image || '',
    iconName: s.icon_name,
    highlights: parsedHighlights,
    requiresSiteVisit: s.requires_site_visit === 1,
  };
}

/**
 * Maps D1 full product record to frontend Product model
 */
export function mapDbProductToFrontend(
  p: DbProduct & { category_slug?: string; subcategory_slug?: string; subcategory_name?: string },
  images: DbProductImage[],
  variants: DbProductVariant[],
  specs: DbProductSpecification[],
  categoryName?: string
): Product {
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
  const mainImg = sortedImages.find((img) => img.is_main === 1) || sortedImages[0];
  const gallery = sortedImages.map((img) => img.image_url);
  const mappedImages: ProductImage[] = sortedImages.map((img) => ({
    id: img.id,
    url: img.image_url,
    altText: img.alt_text || null,
    displayOrder: img.display_order,
    isMain: img.is_main === 1,
  }));

  let parsedSpaces: string[] = [];
  if (p.space_slugs) {
    try {
      parsedSpaces = JSON.parse(p.space_slugs);
    } catch {
      parsedSpaces = [];
    }
  }

  const mappedVariants: ProductVariation[] = variants.map((v) => {
    let parsedAttrs: Record<string, string> = {};
    if (v.attributes) {
      try {
        parsedAttrs = JSON.parse(v.attributes);
      } catch {
        parsedAttrs = {};
      }
    }

    return {
      id: v.id,
      name: v.name,
      type: v.variant_type as any,
      colorHex: v.color_hex || undefined,
      thumbnailImage: v.thumbnail_image || undefined,
      image: v.preview_image || undefined,
      sku: v.sku,
      price: v.price_adjustment ? p.base_price + v.price_adjustment : p.base_price,
      inStock: v.in_stock === 1,
      attributes: parsedAttrs,
    };
  });

  const mappedSpecs: ProductSpecification[] = specs.map((s) => ({
    label: s.label,
    value: s.value,
  }));

  // Resolve subcategory types for legacy route compatibility
  const resolvedCategorySlug = p.category_slug || normalizeCategorySlug(p.category_id);
  const subcategory = p.subcategory_slug || p.subcategory_id || undefined;
  const isCurtain = resolvedCategorySlug === 'curtains-drapes' || p.category_id === 'cat-1';
  const isBlind = resolvedCategorySlug === 'window-blinds-shades' || p.category_id === 'cat-2';
  const isSofa = resolvedCategorySlug === 'sofa-fabrics-upholstery' || p.category_id === 'cat-3';
  const isWallpaper = resolvedCategorySlug === 'wallpapers-wall-coverings' || p.category_id === 'cat-4';
  const isCarpet = resolvedCategorySlug === 'carpets-rugs' || p.category_id === 'cat-6';

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    displayName: p.display_name || p.name,
    categorySlug: resolvedCategorySlug,
    categoryName: categoryName || p.category_id,
    subcategorySlug: p.subcategory_slug || undefined,
    subcategoryName: p.subcategory_name || undefined,
    shortDescription: p.short_description || '',
    description: p.description,
    productType: p.product_type,
    price: p.base_price,
    startingPrice: p.starting_price === 1,
    image: mainImg?.image_url || '/images/hero/living_room.jpg',
    mainImage: mainImg?.image_url || '/images/hero/living_room.jpg',
    imageAlt: mainImg?.alt_text || p.display_name || p.name,
    additionalImages: sortedImages.filter((img) => img.image_url !== mainImg?.image_url).map((img) => img.image_url),
    galleryImages: gallery.length > 0 ? gallery : [mainImg?.image_url || '/images/hero/living_room.jpg'],
    images: mappedImages,
    variations: mappedVariants,
    specifications: mappedSpecs,
    spaceSlugs: parsedSpaces,
    featured: p.featured === 1,
    customMeasurementAvailable: p.custom_measurement_available === 1,
    curtainType: isCurtain ? subcategory : undefined,
    blindType: isBlind ? subcategory : undefined,
    sofaFabricType: isSofa ? subcategory : undefined,
    wallpaperType: isWallpaper ? subcategory : undefined,
    carpetType: isCarpet ? subcategory : undefined,
  };
}

/**
 * Fetch all categories from Cloudflare D1 (with bulletproof fallback to static catalog)
 */
export async function getDynamicCategories(): Promise<Category[]> {
  try {
    const db = getDatabase();
    const rows = await db.query<DbCategory>(
      'SELECT * FROM categories WHERE active = 1 ORDER BY display_order ASC'
    );
    if (rows && rows.length > 0) {
      return rows.map(mapDbCategoryToFrontend);
    }
    return CATEGORIES;
  } catch (err) {
    console.error('Error fetching categories from D1:', err);
    return CATEGORIES;
  }
}

/**
 * Fetch a single category by slug from Cloudflare D1
 */
export async function getDynamicCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const db = getDatabase();
    const row = await db.queryOne<DbCategory>(
      'SELECT * FROM categories WHERE (slug = ? OR slug = ?) AND active = 1',
      [slug, normalizeCategorySlug(slug)]
    );
    if (!row) {
      const fallback = CATEGORIES.find((c) => c.slug === slug || c.slug === normalizeCategorySlug(slug));
      return fallback || null;
    }
    return mapDbCategoryToFrontend(row);
  } catch (err) {
    console.error(`Error fetching category ${slug} from D1:`, err);
    const fallback = CATEGORIES.find((c) => c.slug === slug || c.slug === normalizeCategorySlug(slug));
    return fallback || null;
  }
}

function getStaticSubcategories(categoryId?: string): DbSubcategory[] {
  const normId = categoryId ? normalizeCategorySlug(categoryId) : undefined;
  const list: DbSubcategory[] = [];
  const now = new Date().toISOString();

  if (!normId || normId === 'curtains-drapes' || categoryId === 'cat-1') {
    CURTAIN_TYPES.forEach((c, idx) => {
      list.push({
        id: `subcat-${c.slug}`,
        category_id: 'cat-1',
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        display_order: idx,
        active: 1,
        created_at: now,
        updated_at: now,
      });
    });
  }

  if (!normId || normId === 'window-blinds-shades' || categoryId === 'cat-2') {
    BLIND_TYPES.forEach((b, idx) => {
      list.push({
        id: `subcat-${b.slug}`,
        category_id: 'cat-2',
        name: b.name,
        slug: b.slug,
        description: b.description,
        image: b.image,
        display_order: idx,
        active: 1,
        created_at: now,
        updated_at: now,
      });
    });
  }

  if (!normId || normId === 'sofa-fabrics-upholstery' || categoryId === 'cat-3') {
    SOFA_FABRIC_TYPES.forEach((s, idx) => {
      list.push({
        id: `subcat-${s.slug}`,
        category_id: 'cat-3',
        name: s.name,
        slug: s.slug,
        description: s.description,
        image: s.image,
        display_order: idx,
        active: 1,
        created_at: now,
        updated_at: now,
      });
    });
  }

  if (!normId || normId === 'wallpapers-wall-coverings' || categoryId === 'cat-4') {
    WALLPAPER_TYPES.forEach((w, idx) => {
      list.push({
        id: `subcat-${w.slug}`,
        category_id: 'cat-4',
        name: w.name,
        slug: w.slug,
        description: w.description,
        image: w.image,
        display_order: idx,
        active: 1,
        created_at: now,
        updated_at: now,
      });
    });
  }

  if (!normId || normId === 'carpets-rugs' || categoryId === 'cat-6') {
    CARPET_TYPES.forEach((c, idx) => {
      list.push({
        id: `subcat-${c.slug}`,
        category_id: 'cat-6',
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        display_order: idx,
        active: 1,
        created_at: now,
        updated_at: now,
      });
    });
  }

  return list;
}

/**
 * Fetch all subcategories from Cloudflare D1 (with bulletproof static fallback)
 */
export async function getDynamicSubcategories(categoryId?: string): Promise<DbSubcategory[]> {
  try {
    const db = getDatabase();
    let sql = 'SELECT * FROM subcategories WHERE active = 1';
    const params: unknown[] = [];
    if (categoryId) {
      sql += ' AND (category_id = ? OR category_id = (SELECT id FROM categories WHERE slug = ?))';
      params.push(categoryId, categoryId);
    }
    sql += ' ORDER BY display_order ASC';
    const rows = await db.query<DbSubcategory>(sql, params);
    if (rows && rows.length > 0) return rows;
    return getStaticSubcategories(categoryId);
  } catch (err) {
    console.error('Error fetching subcategories from D1:', err);
    return getStaticSubcategories(categoryId);
  }
}

/**
 * Fetch a single subcategory by category identifier (ID or slug) and subcategory slug from Cloudflare D1
 */
export async function getDynamicSubcategoryBySlug(
  categoryIdentifier: string,
  subcategorySlug: string
): Promise<DbSubcategory | null> {
  try {
    const db = getDatabase();
    const row = await db.queryOne<DbSubcategory>(
      `SELECT s.* FROM subcategories s
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE (s.category_id = ? OR c.slug = ?) AND s.slug = ? AND s.active = 1`,
      [categoryIdentifier, categoryIdentifier, subcategorySlug]
    );
    if (row) return row;
    const staticList = getStaticSubcategories(categoryIdentifier);
    return staticList.find((s) => s.slug === subcategorySlug) || null;
  } catch (err) {
    console.error(`Error fetching subcategory ${subcategorySlug} from D1:`, err);
    const staticList = getStaticSubcategories(categoryIdentifier);
    return staticList.find((s) => s.slug === subcategorySlug) || null;
  }
}

function filterStaticProducts(filters?: {
  categorySlug?: string;
  subcategorySlug?: string;
  featured?: boolean;
  search?: string;
}): Product[] {
  let result = [...PRODUCTS];
  if (filters?.categorySlug) {
    const norm = normalizeCategorySlug(filters.categorySlug);
    result = result.filter(
      (p) => p.categorySlug === norm || p.categorySlug === filters.categorySlug
    );
  }
  if (filters?.subcategorySlug) {
    result = result.filter(
      (p) =>
        p.subcategorySlug === filters.subcategorySlug ||
        p.curtainType === filters.subcategorySlug ||
        p.blindType === filters.subcategorySlug ||
        p.sofaFabricType === filters.subcategorySlug ||
        p.wallpaperType === filters.subcategorySlug ||
        p.carpetType === filters.subcategorySlug
    );
  }
  if (filters?.featured !== undefined) {
    result = result.filter((p) => p.featured === filters.featured);
  }
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }
  return result;
}

/**
 * Fetch all products from Cloudflare D1 with relational joins (with bulletproof static fallback)
 */
export async function getDynamicProducts(filters?: {
  categorySlug?: string;
  subcategorySlug?: string;
  featured?: boolean;
  search?: string;
}): Promise<Product[]> {
  try {
    const db = getDatabase();
    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, s.slug as subcategory_slug, s.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.active = 1
    `;
    const params: unknown[] = [];

    if (filters?.categorySlug) {
      sql += ' AND (p.category_id = ? OR c.slug = ?)';
      params.push(filters.categorySlug, filters.categorySlug);
    }

    if (filters?.subcategorySlug) {
      sql += ' AND (p.subcategory_id = ? OR s.slug = ?)';
      params.push(filters.subcategorySlug, filters.subcategorySlug);
    }

    if (filters?.featured !== undefined) {
      sql += ' AND p.featured = ?';
      params.push(filters.featured ? 1 : 0);
    }

    if (filters?.search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY p.display_order ASC';

    const products = await db.query<DbProduct & { category_name?: string; category_slug?: string; subcategory_slug?: string; subcategory_name?: string }>(sql, params);
    if (!products || products.length === 0) {
      return filterStaticProducts(filters);
    }

    // Fetch images, variants, and specifications in batch
    const productIds = products.map((p) => p.id);
    const placeholders = productIds.map(() => '?').join(',');

    const [allImages, allVariants, allSpecs] = await Promise.all([
      db.query<DbProductImage>(
        `SELECT * FROM product_images WHERE product_id IN (${placeholders}) AND active = 1 ORDER BY display_order ASC`,
        productIds
      ),
      db.query<DbProductVariant>(
        `SELECT * FROM product_variants WHERE product_id IN (${placeholders}) AND active = 1 ORDER BY display_order ASC`,
        productIds
      ),
      db.query<DbProductSpecification>(
        `SELECT * FROM product_specifications WHERE product_id IN (${placeholders}) ORDER BY display_order ASC`,
        productIds
      ),
    ]);

    const imagesByProduct: Record<string, DbProductImage[]> = {};
    for (const img of allImages) {
      if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
      imagesByProduct[img.product_id].push(img);
    }

    const variantsByProduct: Record<string, DbProductVariant[]> = {};
    for (const v of allVariants) {
      if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
      variantsByProduct[v.product_id].push(v);
    }

    const specsByProduct: Record<string, DbProductSpecification[]> = {};
    for (const s of allSpecs) {
      if (!specsByProduct[s.product_id]) specsByProduct[s.product_id] = [];
      specsByProduct[s.product_id].push(s);
    }

    return products.map((p) =>
      mapDbProductToFrontend(
        p,
        imagesByProduct[p.id] || [],
        variantsByProduct[p.id] || [],
        specsByProduct[p.id] || [],
        p.category_name
      )
    );
  } catch (err) {
    console.error('Error fetching dynamic products from D1:', err);
    return filterStaticProducts(filters);
  }
}

/**
 * Fetch a single product by slug from Cloudflare D1 (with bulletproof static fallback)
 */
export async function getDynamicProductBySlug(slug: string): Promise<Product | null> {
  try {
    const db = getDatabase();
    const product = await db.queryOne<DbProduct & { category_name?: string; category_slug?: string; subcategory_slug?: string; subcategory_name?: string }>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug, s.slug as subcategory_slug, s.name as subcategory_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories s ON p.subcategory_id = s.id
       WHERE p.slug = ? AND p.active = 1`,
      [slug]
    );

    if (!product) {
      return getProductBySlug(slug) || null;
    }

    const [images, variants, specs] = await Promise.all([
      db.query<DbProductImage>(
        'SELECT * FROM product_images WHERE product_id = ? AND active = 1 ORDER BY display_order ASC',
        [product.id]
      ),
      db.query<DbProductVariant>(
        'SELECT * FROM product_variants WHERE product_id = ? AND active = 1 ORDER BY display_order ASC',
        [product.id]
      ),
      db.query<DbProductSpecification>(
        'SELECT * FROM product_specifications WHERE product_id = ? ORDER BY display_order ASC',
        [product.id]
      ),
    ]);

    return mapDbProductToFrontend(product, images, variants, specs, product.category_name);
  } catch (err) {
    console.error(`Error fetching dynamic product by slug ${slug} from D1:`, err);
    return getProductBySlug(slug) || null;
  }
}

/**
 * Fetch services from Cloudflare D1 (with bulletproof static fallback)
 */
export async function getDynamicServices(): Promise<Service[]> {
  try {
    const db = getDatabase();
    const rows = await db.query<DbService>(
      'SELECT * FROM services WHERE active = 1 ORDER BY display_order ASC'
    );
    if (rows && rows.length > 0) {
      return rows.map(mapDbServiceToFrontend);
    }
    return SERVICES;
  } catch (err) {
    console.error('Error fetching services from D1:', err);
    return SERVICES;
  }
}

/**
 * Fetch single service by slug from Cloudflare D1 (with bulletproof static fallback)
 */
export async function getDynamicServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const db = getDatabase();
    const row = await db.queryOne<DbService>(
      'SELECT * FROM services WHERE slug = ? AND active = 1',
      [slug]
    );
    if (!row) {
      return SERVICES.find((s) => s.slug === slug) || null;
    }
    return mapDbServiceToFrontend(row);
  } catch (err) {
    console.error(`Error fetching service ${slug} from D1:`, err);
    return SERVICES.find((s) => s.slug === slug) || null;
  }
}

/**
 * Fetch CMS section from Cloudflare D1
 */
export async function getDynamicCmsSection(sectionKey: string): Promise<DbCmsContent | null> {
  try {
    const db = getDatabase();
    const row = await db.queryOne<DbCmsContent>(
      'SELECT * FROM cms_content WHERE section_key = ?',
      [sectionKey]
    );
    return row || null;
  } catch (err) {
    console.error(`Error fetching CMS section ${sectionKey} from D1:`, err);
    return null;
  }
}

/**
 * Fetch all CMS sections from Cloudflare D1
 */
export async function getDynamicAllCmsSections(): Promise<Record<string, DbCmsContent>> {
  try {
    const db = getDatabase();
    const rows = await db.query<DbCmsContent>('SELECT * FROM cms_content');
    const dict: Record<string, DbCmsContent> = {};
    for (const r of rows) {
      dict[r.section_key] = r;
    }
    return dict;
  } catch (err) {
    console.error('Error fetching all CMS sections from D1:', err);
    return {};
  }
}

export interface CategoryDiscoveryItem {
  id: string;
  name: string;
  image: string;
  href: string;
}

export interface DiscoveryCategory {
  id: string;
  slug: string;
  tabLabel: string;
  items: CategoryDiscoveryItem[];
}

function getCategoryTabLabel(cat: { name: string; slug: string }): string {
  if (cat.slug === 'curtains-drapes') return 'Curtains';
  if (cat.slug === 'window-blinds-shades') return 'Window Blinds';
  if (cat.slug === 'sofa-fabrics-upholstery') return 'Sofa Fabrics';
  if (cat.slug === 'wallpapers-wall-coverings') return 'Wallpapers';
  if (cat.slug === 'mattresses-sleep-systems') return 'Mattresses';
  if (cat.slug === 'carpets-rugs') return 'Carpets & Rugs';
  if (cat.slug === 'wooden-flooring-sports-floor') return 'Flooring';
  if (cat.slug === 'bed-linen-bath') return 'Bed Linen';
  if (cat.slug === 'cushions-pillows') return 'Cushions';
  return cat.name.split('&')[0].trim();
}

function getCategoryBasePath(slug: string): string {
  if (slug === 'curtains-drapes') return '/categories/curtains';
  if (slug === 'window-blinds-shades') return '/categories/blinds';
  if (slug === 'sofa-fabrics-upholstery') return '/categories/sofa-fabrics';
  if (slug === 'wallpapers-wall-coverings') return '/categories/wallpapers';
  if (slug === 'carpets-rugs') return '/categories/carpets';
  return `/categories/${slug}`;
}

function getStaticCategoryDiscovery(): DiscoveryCategory[] {
  const result: DiscoveryCategory[] = [];

  // 1. Curtains
  result.push({
    id: 'disc-curtains-drapes',
    slug: 'curtains-drapes',
    tabLabel: 'Curtains',
    items: CURTAIN_TYPES.map((c) => ({
      id: `subcat-${c.slug}`,
      name: c.name,
      image: c.image,
      href: `/categories/curtains/${c.slug}`,
    })),
  });

  // 2. Window Blinds
  result.push({
    id: 'disc-window-blinds-shades',
    slug: 'window-blinds-shades',
    tabLabel: 'Window Blinds',
    items: BLIND_TYPES.map((b) => ({
      id: `subcat-${b.slug}`,
      name: b.name,
      image: b.image || '/images/hero/blinds.jpg',
      href: `/categories/blinds/${b.slug}`,
    })),
  });

  // 3. Sofa Fabrics
  result.push({
    id: 'disc-sofa-fabrics-upholstery',
    slug: 'sofa-fabrics-upholstery',
    tabLabel: 'Sofa Fabrics',
    items: SOFA_FABRIC_TYPES.map((s) => ({
      id: `subcat-${s.slug}`,
      name: s.name,
      image: s.image || '/images/hero/sofa_fabrics.jpg',
      href: `/categories/sofa-fabrics/${s.slug}`,
    })),
  });

  // 4. Wallpapers
  result.push({
    id: 'disc-wallpapers-wall-coverings',
    slug: 'wallpapers-wall-coverings',
    tabLabel: 'Wallpapers',
    items: WALLPAPER_TYPES.map((w) => ({
      id: `subcat-${w.slug}`,
      name: w.name,
      image: w.image || '/images/hero/wallpapers.jpg',
      href: `/categories/wallpapers/${w.slug}`,
    })),
  });

  // 5. Carpets
  result.push({
    id: 'disc-carpets-rugs',
    slug: 'carpets-rugs',
    tabLabel: 'Carpets & Rugs',
    items: CARPET_TYPES.map((c) => ({
      id: `subcat-${c.slug}`,
      name: c.name,
      image: c.image || '/images/hero/rugs.jpg',
      href: `/categories/carpets/${c.slug}`,
    })),
  });

  // Remaining categories from PRODUCTS
  const remainingCategories = CATEGORIES.filter(
    (c) => !['curtains-drapes', 'window-blinds-shades', 'sofa-fabrics-upholstery', 'wallpapers-wall-coverings', 'carpets-rugs'].includes(c.slug)
  );

  for (const cat of remainingCategories) {
    const catProds = PRODUCTS.filter((p) => p.categorySlug === cat.slug);
    if (catProds.length > 0) {
      result.push({
        id: `disc-${cat.slug}`,
        slug: cat.slug,
        tabLabel: getCategoryTabLabel(cat),
        items: catProds.map((p) => ({
          id: p.id,
          name: p.displayName || p.name,
          image: p.image || cat.image || '/images/hero/living_room.jpg',
          href: `/products/${p.slug}`,
        })),
      });
    }
  }

  return result;
}

/**
 * Fetch dynamic category discovery list for homepage BrowseByCategories
 */
export async function getDynamicCategoryDiscovery(): Promise<DiscoveryCategory[]> {
  try {
    const db = getDatabase();
    const categories = await db.query<DbCategory>(
      'SELECT * FROM categories WHERE active = 1 ORDER BY display_order ASC'
    );
    if (!categories || categories.length === 0) return getStaticCategoryDiscovery();

    const subcategories = await db.query<DbSubcategory>(
      'SELECT * FROM subcategories WHERE active = 1 ORDER BY display_order ASC'
    );

    // Fetch active products to display for categories that don't have subcategories
    const products = await db.query<DbProduct & { main_image?: string }>(
      `SELECT p.*, pi.image_url as main_image FROM products p
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_main = 1
       WHERE p.active = 1 ORDER BY p.display_order ASC`
    );

    const result: DiscoveryCategory[] = [];

    for (const cat of categories) {
      const catSubcats = subcategories.filter((s) => s.category_id === cat.id);
      let items: CategoryDiscoveryItem[] = [];

      if (catSubcats.length > 0) {
        items = catSubcats.map((s) => ({
          id: s.id,
          name: s.name,
          image: s.image || cat.image || '/images/hero/curtains.jpg',
          href: `${getCategoryBasePath(cat.slug)}/${s.slug}`,
        }));
      } else {
        const catProds = products.filter((p) => p.category_id === cat.id);
        if (catProds.length > 0) {
          items = catProds.map((p) => ({
            id: p.id,
            name: p.display_name || p.name,
            image: p.main_image || cat.image || '/images/hero/living_room.jpg',
            href: `/products/${p.slug}`,
          }));
        }
      }

      if (items.length > 0) {
        result.push({
          id: `disc-${cat.slug}`,
          slug: cat.slug,
          tabLabel: getCategoryTabLabel(cat),
          items,
        });
      }
    }

    if (result.length > 0) return result;
    return getStaticCategoryDiscovery();
  } catch (err) {
    console.error('Error fetching dynamic category discovery from D1:', err);
    return getStaticCategoryDiscovery();
  }
}
